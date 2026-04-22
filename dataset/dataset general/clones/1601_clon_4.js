class UniversalTouchAdapter {
    constructor() {
        this.lastInteractionTarget = null;
        this.isTapSequenceActive = false;
        this.tapSequenceTimer = null;

        this.isPressAndHoldActive = false;
        this.pressAndHoldOrigin = null;
        this.pressAndHoldTimer = null;
        this.blockNextClick = false;

        this.tapWindowDuration = 600;
        this.pressAndHoldDuration = 800;

        this.initTouchInteractions();
    }

    static checkTouchSupport() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
    }

    initTouchInteractions() {
        if (UniversalTouchAdapter.checkTouchSupport()) {
            document.addEventListener("touchstart", this.handleGlobalTouchEvent.bind(this), { passive: false });
            document.addEventListener("touchmove", this.handleGlobalTouchEvent.bind(this), { passive: false });
            document.addEventListener("touchend", this.handleGlobalTouchEvent.bind(this), { passive: false });
            document.addEventListener("touchcancel", this.handleGlobalTouchEvent.bind(this), { passive: false });
        }
    }

    _dispatchSyntheticEvent(eventType, primaryContact, buttonCode = 0) {
        const syntheticInteraction = document.createEvent("MouseEvent");
        syntheticInteraction.initMouseEvent(
            eventType,
            true,
            true,
            window,
            1,
            primaryContact.screenX,
            primaryContact.screenY,
            primaryContact.clientX,
            primaryContact.clientY,
            false,
            false,
            false,
            false,
            buttonCode,
            null
        );
        primaryContact.target.dispatchEvent(syntheticInteraction);
    }

    _resetTapSequence() {
        this.isTapSequenceActive = false;
        this.lastInteractionTarget = null;
    }

    _clearPressAndHold() {
        if (this.isPressAndHoldActive) {
            window.clearTimeout(this.pressAndHoldTimer);
            this.isPressAndHoldActive = false;
            this.pressAndHoldOrigin = null;
        }
    }

    _initiatePressAndHold(inputEvent) {
        if (this.isPressAndHoldActive) return;

        this.isPressAndHoldActive = true;
        this.pressAndHoldOrigin = (inputEvent.changedTouches)[0];
        this.pressAndHoldTimer = window.setTimeout(this._activateContextMenu.bind(this), this.pressAndHoldDuration);
    }

    _activateContextMenu() {
        this.isPressAndHoldActive = false;

        const primaryContact = this.pressAndHoldOrigin;

        this._dispatchSyntheticEvent("mouseup", primaryContact, 0);

        this._dispatchSyntheticEvent("mousedown", primaryContact, 2);

        const syntheticInteraction = document.createEvent("MouseEvent");
        syntheticInteraction.initMouseEvent(
            "contextmenu",
            true, true, window, 1,
            primaryContact.screenX + 50, primaryContact.screenY + 5,
            primaryContact.clientX + 50, primaryContact.clientY + 5,
            false, false, false, false, 2, null
        );
        primaryContact.target.dispatchEvent(syntheticInteraction);

        this.blockNextClick = true;
        this.pressAndHoldOrigin = null;
    }

    _processTouchInitiation(inputEvent) {
        const primaryContact = inputEvent.changedTouches[0];

        this._dispatchSyntheticEvent("mouseover", primaryContact);
        this._dispatchSyntheticEvent("mousedown", primaryContact);

        if (!this.isTapSequenceActive) {
            this.lastInteractionTarget = primaryContact.target;
            this.isTapSequenceActive = true;
            this.tapSequenceTimer = window.setTimeout(this._resetTapSequence.bind(this), this.tapWindowDuration);
            this._initiatePressAndHold(inputEvent);
        } else {
            window.clearTimeout(this.tapSequenceTimer);
            this._clearPressAndHold();

            if (primaryContact.target === this.lastInteractionTarget) {
                this._dispatchSyntheticEvent("click", primaryContact);
                this._dispatchSyntheticEvent("dblclick", primaryContact);
                this._resetTapSequence();
            } else {
                this.lastInteractionTarget = primaryContact.target;
                this.isTapSequenceActive = true;
                this.tapSequenceTimer = window.setTimeout(this._resetTapSequence.bind(this), this.tapWindowDuration);
                this._initiatePressAndHold(inputEvent);
            }
        }
    }

    handleGlobalTouchEvent(inputEvent) {
        if (inputEvent.touches.length > 1) {
            this._clearPressAndHold();
            return;
        }

        const primaryContact = inputEvent.changedTouches[0];

        switch (inputEvent.type) {
            case "touchstart":
                if (primaryContact.target.matches("select")) {
                    return;
                }
                this._processTouchInitiation(inputEvent);
                inputEvent.preventDefault();
                break;

            case "touchmove":
                this._clearPressAndHold();
                this._dispatchSyntheticEvent("mousemove", primaryContact);
                inputEvent.preventDefault();
                break;

            case "touchend":
                if (this.blockNextClick) {
                    this.blockNextClick = false;
                    inputEvent.preventDefault();
                    return;
                }
                this._clearPressAndHold();
                this._dispatchSyntheticEvent("mouseup", primaryContact);

                if (this.isTapSequenceActive && primaryContact.target === this.lastInteractionTarget) {
                    this._dispatchSyntheticEvent("click", primaryContact);
                }
                break;

            case "touchcancel":
                this._clearPressAndHold();
                window.clearTimeout(this.tapSequenceTimer);
                this._resetTapSequence();
                break;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new UniversalTouchAdapter();
});