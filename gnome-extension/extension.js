/*
  License: GPL v3
*/

const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const schema_id = Me.imports.prefs.schema_id;
const SettingsKey = Me.imports.prefs.SettingsKey;

class Extension {
    constructor() {
        this._swipeMods = [];

        this._settings = ExtensionUtils.getSettings(schema_id);
        
        this._settings.connect(`changed::${SettingsKey.STARTUP_OVERVIEW}`, () => {
            if (this._settings.get_boolean(SettingsKey.STARTUP_OVERVIEW)) {
                this.enable_suppress_startup_overview();
            } else {
                this.disable_suppress_startup_overview();
            }
        });
        this._settings.connect(`changed::${SettingsKey.FOUR_FINGER_SWIPE}`, () => {
            if (this._settings.get_boolean(SettingsKey.FOUR_FINGER_SWIPE)) {
                this.enable_four_finger_swipe();
            } else {
                this.disable_four_finger_swipe();
            }
        });
    }

    enable() {
        if (this._settings.get_boolean(SettingsKey.STARTUP_OVERVIEW)) {
            this.enable_suppress_startup_overview();
        }
        if (this._settings.get_boolean(SettingsKey.FOUR_FINGER_SWIPE)) {
            this.enable_four_finger_swipe();
        }
    }

    disable() {
        this.disable_suppress_startup_overview();
        this.disable_four_finger_swipe();
    }

    enable_suppress_startup_overview() {
        this._runStartupAnimation = Main.overview.runStartupAnimation;
        Main.overview.runStartupAnimation = (callback) => {
            callback();
        }
    }

    enable_four_finger_swipe() {
        this._swipeMods = [
            Main.overview._swipeTracker._touchpadGesture,
            Main.wm._workspaceAnimation._swipeTracker._touchpadGesture,
            Main.overview._overview._controls._workspacesDisplay._swipeTracker._touchpadGesture,
            // Main.overview._overview._controls._appDisplay._swipeTracker._touchpadGesture
        ];

        this._swipeMods.forEach(g => {
            g.newEventHandler = (actor, event) => {
                let e = {
                    type: () => { return event.type() },
                    get_gesture_phase: () => { return event.get_gesture_phase() },
                    get_touchpad_gesture_finger_count: () => { 
                        return event.get_touchpad_gesture_finger_count() == 4 ? 3 : 0;
                    },
                    get_time: () => { return event.get_time() },
                    get_coords: () => { return event.get_coords() },
                    get_gesture_motion_delta: () => { return event.get_gesture_motion_delta() }
                }
                return g._handleEvent(actor, e);
            }

            global.stage.disconnect(g._stageCaptureEvent);
            delete g._stageCaptureEvent;       
            g._stageCaptureEvent = global.stage.connect('captured-event::touchpad', g.newEventHandler);
        })
    }

    disable_suppress_startup_overview() {
        if (this._runStartupAnimation) {
            Main.overview.runStartupAnimation = this._runStartupAnimation;
            this._runStartupAnimation = null;
        }
    }

    disable_four_finger_swipe() {
        this._swipeMods.forEach(g => {
            global.stage.disconnect(g._stageCaptureEvent);
            delete g._stageCaptureEvent;       
            g._stageCaptureEvent = global.stage.connect('captured-event::touchpad', g._handleEvent.bind(g));
        })
        this._swipeMods = [];
    }
}

function init() {
	return new Extension();
}

