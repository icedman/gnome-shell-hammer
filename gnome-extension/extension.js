/*
  License: GPL v3
*/


const Main = imports.ui.main;

class Extension {
    constructor() {
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
        if (!Main.overview._swipeTracker._touchpadGesture.__handleEvent) {
            Main.overview._swipeTracker._touchpadGesture.__handleEvent = Main.overview._swipeTracker._touchpadGesture._handleEvent;
        }
        Main.overview._swipeTracker._touchpadGesture._handleEvent = (actor, event) => {
            if (event.get_touchpad_gesture_finger_count() == 3) {
                event.get_touchpad_gesture_finger_count = () => { return 4; }
            }
            return Main.overview._swipeTracker._touchpadGesture.__handleEvent(actor, event);
        }
    }

    disable() {

        // start-up animation
        Main.overview.runStartupAnimation = Main.overview._runStartupAnimation;

        // three-finger to four-finger swipe
        Main.overview._swipeTracker._touchpadGesture._handleEvent = Main.overview._swipeTracker._touchpadGesture.__handleEvent;
    }
}

function init() {
	return new Extension();
}

