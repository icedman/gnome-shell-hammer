// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
/* exported Indicator */

const { Clutter, Gio, GLib, GObject, Shell, St } = imports.gi;

const Dialog = imports.ui.dialog;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ModalDialog = imports.ui.modalDialog;
const PermissionStore = imports.misc.permissionStore;

const { loadInterfaceXML } = imports.misc.fileUtils;

const LOCATION_SCHEMA = 'org.gnome.system.location';
const MAX_ACCURACY_LEVEL = 'max-accuracy-level';
const ENABLED = 'enabled';

const APP_PERMISSIONS_TABLE = 'location';
const APP_PERMISSIONS_ID = 'location';

var GeoclueAccuracyLevel = {
    NONE: 0,
    COUNTRY: 1,
    CITY: 4,
    NEIGHBORHOOD: 5,
    STREET: 6,
    EXACT: 8,
};

function accuracyLevelToString(accuracyLevel) {
    for (let key in GeoclueAccuracyLevel) {
        if (GeoclueAccuracyLevel[key] == accuracyLevel)
            return key;
    }

    return 'NONE';
}

var GeoclueIface = loadInterfaceXML('org.freedesktop.GeoClue2.Manager');
const GeoclueManager = Gio.DBusProxy.makeProxyWrapper(GeoclueIface);

var AgentIface = loadInterfaceXML('org.freedesktop.GeoClue2.Agent');

let _geoclueAgent = null;
function _getGeoclueAgent() {
    if (_geoclueAgent === null)
        _geoclueAgent = new GeoclueAgent();
    return _geoclueAgent;
}

var GeoclueAgent = GObject.registerClass({
    Properties: {
        'enabled': GObject.ParamSpec.boolean(
            'enabled', 'Enabled', 'Enabled',
            GObject.ParamFlags.READWRITE,
            false),
        'in-use': GObject.ParamSpec.boolean(
            'in-use', 'In use', 'In use',
            GObject.ParamFlags.READABLE,
            false),
        'max-accuracy-level': GObject.ParamSpec.int(
            'max-accuracy-level', 'Max accuracy level', 'Max accuracy level',
            GObject.ParamFlags.READABLE,
            0, 8, 0),
    },
}, class GeoclueAgent extends GObject.Object {
    _init() {
        super._init();

        this._settings = new Gio.Settings({ schema_id: LOCATION_SCHEMA });
        this._settings.connect('changed::%s'.format(ENABLED),
            () => this.notify('enabled'));
        this._settings.connect('changed::%s'.format(MAX_ACCURACY_LEVEL),
            this._onMaxAccuracyLevelChanged.bind(this));

        this._agent = Gio.DBusExportedObject.wrapJSObject(AgentIface, this);
        this._agent.export(Gio.DBus.system, '/org/freedesktop/GeoClue2/Agent');

        this.connect('notify::enabled', this._onMaxAccuracyLevelChanged.bind(this));

        this._watchId = Gio.bus_watch_name(Gio.BusType.SYSTEM,
                                           'org.freedesktop.GeoClue2',
                                           0,
                                           this._connectToGeoclue.bind(this),
                                           this._onGeoclueVanished.bind(this));
        this._onMaxAccuracyLevelChanged();
        this._connectToGeoclue();
        this._connectToPermissionStore();
    }

    get enabled() {
        return this._settings.get_boolean(ENABLED);
    }

    set enabled(value) {
        this._settings.set_boolean(ENABLED, value);
    }

    get inUse() {
        return this._managerProxy?.InUse ?? false;
    }

    get maxAccuracyLevel() {
        if (this.enabled) {
            let level = this._settings.get_string(MAX_ACCURACY_LEVEL);

            return GeoclueAccuracyLevel[level.toUpperCase()] ||
                   GeoclueAccuracyLevel.NONE;
        } else {
            return GeoclueAccuracyLevel.NONE;
        }
    }

    AuthorizeAppAsync(params, invocation) {
        let [desktopId, reqAccuracyLevel] = params;

        let authorizer = new AppAuthorizer(desktopId,
            reqAccuracyLevel, this._permStoreProxy, this.maxAccuracyLevel);

        authorizer.authorize(accuracyLevel => {
            let ret = accuracyLevel != GeoclueAccuracyLevel.NONE;
            invocation.return_value(GLib.Variant.new('(bu)',
                                                     [ret, accuracyLevel]));
        });
    }

    get MaxAccuracyLevel() {
        return this.maxAccuracyLevel;
    }

    _connectToGeoclue() {
        if (this._managerProxy != null || this._connecting)
            return false;

        this._connecting = true;
        new GeoclueManager(Gio.DBus.system,
                           'org.freedesktop.GeoClue2',
                           '/org/freedesktop/GeoClue2/Manager',
                           this._onManagerProxyReady.bind(this));
        return true;
    }

    _onManagerProxyReady(proxy, error) {
        if (error != null) {
            log(error.message);
            this._connecting = false;
            return;
        }

        this._managerProxy = proxy;
        this._propertiesChangedId = this._managerProxy.connect('g-properties-changed',
                                                               this._onGeocluePropsChanged.bind(this));

        this.notify('in-use');

        this._managerProxy.AddAgentRemote('gnome-shell', this._onAgentRegistered.bind(this));
    }

    _onAgentRegistered(result, error) {
        this._connecting = false;
        this._notifyMaxAccuracyLevel();

        if (error != null)
            log(error.message);
    }

    _onGeoclueVanished() {
        if (this._propertiesChangedId) {
            this._managerProxy.disconnect(this._propertiesChangedId);
            this._propertiesChangedId = 0;
        }
        this._managerProxy = null;

        this.notify('in-use');
    }

    _onMaxAccuracyLevelChanged() {
        this.notify('max-accuracy-level');

        // Gotta ensure geoclue is up and we are registered as agent to it
        // before we emit the notify for this property change.
        if (!this._connectToGeoclue())
            this._notifyMaxAccuracyLevel();
    }

    _notifyMaxAccuracyLevel() {
        let variant = new GLib.Variant('u', this.maxAccuracyLevel);
        this._agent.emit_property_changed('MaxAccuracyLevel', variant);
    }

    _onGeocluePropsChanged(proxy, properties) {
        let unpacked = properties.deep_unpack();
        if ("InUse" in unpacked)
            this.notify('in-use');
    }

    _connectToPermissionStore() {
        this._permStoreProxy = null;
        new PermissionStore.PermissionStore(this._onPermStoreProxyReady.bind(this));
    }

    _onPermStoreProxyReady(proxy, error) {
        if (error != null) {
            log(error.message);
            return;
        }

        this._permStoreProxy = proxy;
    }
});

var Indicator = GObject.registerClass(
class Indicator extends PanelMenu.SystemIndicator {
    _init() {
        super._init();

        this._agent = _getGeoclueAgent();

        this._indicator = this._addIndicator();
        this._indicator.icon_name = 'find-location-symbolic';
        this._agent.bind_property('in-use',
            this._indicator,
            'visible',
            GObject.BindingFlags.SYNC_CREATE);

        this._item = new PopupMenu.PopupSubMenuMenuItem('', true);
        this._item.icon.icon_name = 'find-location-symbolic';
        this._agent.bind_property('in-use',
            this._item,
            'visible',
            GObject.BindingFlags.SYNC_CREATE);

        this._item.label.text = _('Location Enabled');
        this._onOffAction = this._item.menu.addAction(_('Disable'),
            () => (this._agent.enabled = !this._agent.enabled));
        this._item.menu.addSettingsAction(_('Privacy Settings'), 'gnome-location-panel.desktop');

        this.menu.addMenuItem(this._item);

        this._agentSignals = [
            this._agent.connect('notify::enabled', () => this._sync()),
            this._agent.connect('notify::in-use', () => this._sync()),
        ];

        this.connect('destroy', this._onDestroy.bind(this));

        Main.sessionMode.connect('updated', this._onSessionUpdated.bind(this));
        this._onSessionUpdated();
    }

    _onDestroy() {
        this._agentSignals.forEach(id => this._agent.disconnect(id));
        this._agentSignals = [];
    }

    _onSessionUpdated() {
        let sensitive = !Main.sessionMode.isLocked && !Main.sessionMode.isGreeter;
        this.menu.setSensitive(sensitive);
    }

    _sync() {
        if (this._agent.enabled) {
            this._item.label.text = this._indicator.visible
                ? _('Location In Use')
                : _('Location Enabled');
            this._onOffAction.label.text = _('Disable');
        } else {
            this._item.label.text = _('Location Disabled');
            this._onOffAction.label.text = _('Enable');
        }
    }
});

var AppAuthorizer = class {
    constructor(desktopId, reqAccuracyLevel, permStoreProxy, maxAccuracyLevel) {
        this.desktopId = desktopId;
        this.reqAccuracyLevel = reqAccuracyLevel;
        this._permStoreProxy = permStoreProxy;
        this._maxAccuracyLevel = maxAccuracyLevel;
        this._permissions = {};

        this._accuracyLevel = GeoclueAccuracyLevel.NONE;
    }

    authorize(onAuthDone) {
        this._onAuthDone = onAuthDone;

        let appSystem = Shell.AppSystem.get_default();
        this._app = appSystem.lookup_app('%s.desktop'.format(this.desktopId));
        if (this._app == null || this._permStoreProxy == null) {
            this._completeAuth();

            return;
        }

        this._permStoreProxy.LookupRemote(APP_PERMISSIONS_TABLE,
                                          APP_PERMISSIONS_ID,
                                          this._onPermLookupDone.bind(this));
    }

    _onPermLookupDone(result, error) {
        if (error != null) {
            if (error.domain == Gio.DBusError) {
                // Likely no xdg-app installed, just authorize the app
                this._accuracyLevel = this.reqAccuracyLevel;
                this._permStoreProxy = null;
                this._completeAuth();
            } else {
                // Currently xdg-app throws an error if we lookup for
                // unknown ID (which would be the case first time this code
                // runs) so we continue with user authorization as normal
                // and ID is added to the store if user says "yes".
                log(error.message);
                this._permissions = {};
                this._userAuthorizeApp();
            }

            return;
        }

        [this._permissions] = result;
        let permission = this._permissions[this.desktopId];

        if (permission == null) {
            this._userAuthorizeApp();
        } else {
            let [levelStr] = permission || ['NONE'];
            this._accuracyLevel = GeoclueAccuracyLevel[levelStr] ||
                                  GeoclueAccuracyLevel.NONE;
            this._completeAuth();
        }
    }

    _userAuthorizeApp() {
        let name = this._app.get_name();
        let appInfo = this._app.get_app_info();
        let reason = appInfo.get_locale_string("X-Geoclue-Reason");

        this._showAppAuthDialog(name, reason);
    }

    _showAppAuthDialog(name, reason) {
        this._dialog = new GeolocationDialog(name,
                                             reason,
                                             this.reqAccuracyLevel);

        let responseId = this._dialog.connect('response', (dialog, level) => {
            this._dialog.disconnect(responseId);
            this._accuracyLevel = level;
            this._completeAuth();
        });

        this._dialog.open();
    }

    _completeAuth() {
        if (this._accuracyLevel != GeoclueAccuracyLevel.NONE) {
            this._accuracyLevel = Math.clamp(this._accuracyLevel,
                0, this._maxAccuracyLevel);
        }
        this._saveToPermissionStore();

        this._onAuthDone(this._accuracyLevel);
    }

    _saveToPermissionStore() {
        if (this._permStoreProxy == null)
            return;

        let levelStr = accuracyLevelToString(this._accuracyLevel);
        let dateStr = Math.round(Date.now() / 1000).toString();
        this._permissions[this.desktopId] = [levelStr, dateStr];

        let data = GLib.Variant.new('av', {});

        this._permStoreProxy.SetRemote(APP_PERMISSIONS_TABLE,
                                       true,
                                       APP_PERMISSIONS_ID,
                                       this._permissions,
                                       data,
            (result, error) => {
                if (error != null)
                    log(error.message);
            });
    }
};

var GeolocationDialog = GObject.registerClass({
    Signals: { 'response': { param_types: [GObject.TYPE_UINT] } },
}, class GeolocationDialog extends ModalDialog.ModalDialog {
    _init(name, reason, reqAccuracyLevel) {
        super._init({ styleClass: 'geolocation-dialog' });
        this.reqAccuracyLevel = reqAccuracyLevel;

        let content = new Dialog.MessageDialogContent({
            title: _('Allow location access'),
            /* Translators: %s is an application name */
            description: _('The app %s wants to access your location').format(name),
        });

        let reasonLabel = new St.Label({
            text: reason,
            style_class: 'message-dialog-description',
        });
        content.add_child(reasonLabel);

        let infoLabel = new St.Label({
            text: _('Location access can be changed at any time from the privacy settings.'),
            style_class: 'message-dialog-description',
        });
        content.add_child(infoLabel);

        this.contentLayout.add_child(content);

        let button = this.addButton({ label: _("Deny Access"),
                                      action: this._onDenyClicked.bind(this),
                                      key: Clutter.KEY_Escape });
        this.addButton({ label: _("Grant Access"),
                         action: this._onGrantClicked.bind(this) });

        this.setInitialKeyFocus(button);
    }

    _onGrantClicked() {
        this.emit('response', this.reqAccuracyLevel);
        this.close();
    }

    _onDenyClicked() {
        this.emit('response', GeoclueAccuracyLevel.NONE);
        this.close();
    }
});
