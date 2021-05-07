/*
  License: GPL v3
*/


const Main = imports.ui.main;

class Extension {
    constructor() {
    }

    _swipeMods() {
        return [
            Main.overview._swipeTracker._touchpadGesture,
            Main.wm._workspaceAnimation._swipeTracker._touchpadGesture,
            Main.overview._overview._controls._workspacesDisplay._swipeTracker._touchpadGesture
        ];
    }

    enable() {

        // start-up animation
        if (!Main.overview._runStartupAnimation) {
            Main.overview._runStartupAnimation = Main.overview.runStartupAnimation;
        }
        Main.overview.runStartupAnimation = (callback) => {
            callback();
        }

        // three-finger to four-finger swipe
        let gestureMods = this._swipeMods();
        gestureMods.forEach(g => {
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

    disable() {
        let gestureMods = this._swipeMods();
        gestureMods.forEach(g => {
            global.stage.disconnect(g._stageCaptureEvent);
            delete g._stageCaptureEvent;       
            g._stageCaptureEvent = global.stage.connect('captured-event::touchpad', g._handleEvent.bind(g));
        })
    }
}

function init() {
	return new Extension();
}

