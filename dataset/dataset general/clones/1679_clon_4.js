class TouchRecord {
    constructor(identifierRef, initialTimestamp, initialXCoord, initialYCoord, displacementThreshold) {
        this.ref = identifierRef;
        this.beginTime = initialTimestamp;
        this.beginX = initialXCoord;
        this.beginY = initialYCoord;

        this.finishTime = null;
        this.finishX = null;
        this.finishY = null;

        const limit = displacementThreshold;
        this.xRangeMinimum = this.beginX - limit;
        this.xRangeMaximum = this.beginX + limit;
        this.yRangeMinimum = this.beginY - limit;
        this.yRangeMaximum = this.beginY + limit;
    }

    markEnd(finalTimestamp) { this.finishTime = finalTimestamp; }
    setFinalX(xPosition) { this.finishX = xPosition; }
    setFinalY(yPosition) { this.finishY = yPosition; }

    getRef() { return this.ref; }
    getBeginX() { return this.beginX; }
    getBeginY() { return this.beginY; }
    getFinalX() { return this.finishX; }
    getFinalY() { return this.finishY; }

    isShortLived(maxDurationMs) {
        return (this.finishTime - this.beginTime) <= maxDurationMs;
    }

    isStatic() {
        return this.finishX < this.xRangeMaximum &&
               this.finishX > this.xRangeMinimum &&
               this.finishY < this.yRangeMaximum &&
               this.finishY > this.yRangeMinimum;
    }

    movedUpward() {
        return this.finishX < this.xRangeMaximum &&
               this.finishX > this.xRangeMinimum &&
               this.finishY <= this.yRangeMinimum;
    }
    movedDownward() {
        return this.finishX < this.xRangeMaximum &&
               this.finishX > this.xRangeMinimum &&
               this.finishY >= this.yRangeMaximum;
    }
    movedLeftward() {
        return this.finishX <= this.xRangeMinimum &&
               this.finishY < this.yRangeMaximum &&
               this.finishY > this.yRangeMinimum;
    }
    movedRightward() {
        return this.finishX >= this.xRangeMaximum &&
               this.finishY < this.yRangeMaximum &&
               this.finishY > this.yRangeMinimum;
    }
}

function calculateHypotenuse(xOne, yOne, xTwo, yTwo) {
    return Math.hypot(xOne - xTwo, yOne - yTwo);
}

function detectExpansion(recordA, recordB, movementLimit) {
    const startDistance = calculateHypotenuse(recordA.beginX, recordA.beginY, recordB.beginX, recordB.beginY);
    const endDistance = calculateHypotenuse(recordA.finishX, recordA.finishY, recordB.finishX, recordB.finishY);
    return startDistance + movementLimit <= endDistance;
}

function detectContraction(recordA, recordB, movementLimit) {
    const startDistance = calculateHypotenuse(recordA.beginX, recordA.beginY, recordB.beginX, recordB.beginY);
    const endDistance = calculateHypotenuse(recordA.finishX, recordA.finishY, recordB.finishX, recordB.finishY);
    return startDistance - movementLimit >= endDistance;
}

class InteractionObserver {
    static get SIGNAL_DURATION_MAX_MS() { return 300; }
    static get SIGNAL_MOTION_UNIT_DP() { return 48; }

    static get PHASE_SINGLE_START() { return 0; }
    static get PHASE_MULTI_START() { return 1; }
    static get PHASE_MULTI_END() { return 2; }
    static get PHASE_SINGLE_END() { return 3; }

    static get NO_SIGNAL_DETECTED() { return -1; }
    static get SINGLE_TAP() { return 0; }
    static get SINGLE_SWIPE_UP() { return 1; }
    static get SINGLE_SWIPE_DOWN() { return 2; }
    static get SINGLE_SWIPE_LEFT() { return 3; }
    static get SINGLE_SWIPE_RIGHT() { return 4; }

    static get DUAL_TAP() { return 5; }
    static get DUAL_SWIPE_UP() { return 6; }
    static get DUAL_SWIPE_DOWN() { return 7; }
    static get DUAL_SWIPE_LEFT() { return 8; }
    static get DUAL_SWIPE_RIGHT() { return 9; }
    static get DUAL_EXPANSION_SIGNAL() { return 10; } // Matches original `pinchedIn` logic
    static get DUAL_CONTRACTION_SIGNAL() { return 11; } // Matches original `pinchedOut` logic

    constructor(signalNotificationCallback) {
        this.notifier = signalNotificationCallback;
        this.activeContactRecords = new Map();
        this.movementPixelThreshold = InteractionObserver.SIGNAL_MOTION_UNIT_DP * window.devicePixelRatio;
    }

    static interpretEventPhase(eventObject) {
        if (eventObject.type === "touchstart" && eventObject.touches.length === 1) {
            return InteractionObserver.PHASE_SINGLE_START;
        } else if (eventObject.type === "touchstart" && eventObject.touches.length >= 2) {
            return InteractionObserver.PHASE_MULTI_START;
        } else if (eventObject.type === "touchend" && eventObject.touches.length >= 1) {
            return InteractionObserver.PHASE_MULTI_END;
        } else if (eventObject.type === "touchend" && eventObject.touches.length === 0) {
            return InteractionObserver.PHASE_SINGLE_END;
        }
        return -1;
    }

    processContactEvent(eventObject) {
        const primaryAffectedTouch = eventObject.changedTouches[0];
        const contactIdentifier = primaryAffectedTouch.identifier;
        const currentSystemTime = new Date().getTime();
        const currentScreenX = primaryAffectedTouch.screenX;
        const currentScreenY = primaryAffectedTouch.screenY;

        const eventPhase = InteractionObserver.interpretEventPhase(eventObject);

        switch (eventPhase) {
            case InteractionObserver.PHASE_SINGLE_START:
                this.activeContactRecords.clear();
                this.activeContactRecords.set(contactIdentifier, new TouchRecord(
                    contactIdentifier, currentSystemTime, currentScreenX, currentScreenY, this.movementPixelThreshold
                ));
                break;
            case InteractionObserver.PHASE_MULTI_START:
                this.activeContactRecords.set(contactIdentifier, new TouchRecord(
                    contactIdentifier, currentSystemTime, currentScreenX, currentScreenY, this.movementPixelThreshold
                ));
                break;
            case InteractionObserver.PHASE_MULTI_END:
            case InteractionObserver.PHASE_SINGLE_END:
                if (this.activeContactRecords.has(contactIdentifier)) {
                    const record = this.activeContactRecords.get(contactIdentifier);
                    record.markEnd(currentSystemTime);
                    record.setFinalX(currentScreenX);
                    record.setFinalY(currentScreenY);
                }

                if (eventPhase === InteractionObserver.PHASE_SINGLE_END) {
                    const determinedSignal = this.classifyInteractionSignal();
                    this.notifier(primaryAffectedTouch.target, determinedSignal);
                }
                break;
        }
    }

    classifyInteractionSignal() {
        const activeCount = this.activeContactRecords.size;

        if (activeCount === 1) {
            const currentRecord = this.activeContactRecords.values().next().value;

            if (currentRecord.isShortLived(InteractionObserver.SIGNAL_DURATION_MAX_MS)) {
                if (currentRecord.isStatic()) {
                    return InteractionObserver.SINGLE_TAP;
                } else if (currentRecord.movedUpward()) {
                    return InteractionObserver.SINGLE_SWIPE_UP;
                } else if (currentRecord.movedDownward()) {
                    return InteractionObserver.SINGLE_SWIPE_DOWN;
                } else if (currentRecord.movedLeftward()) {
                    return InteractionObserver.SINGLE_SWIPE_LEFT;
                } else if (currentRecord.movedRightward()) {
                    return InteractionObserver.SINGLE_SWIPE_RIGHT;
                }
            }
        } else if (activeCount === 2) {
            const recordsArray = Array.from(this.activeContactRecords.values());
            const recordOne = recordsArray[0];
            const recordTwo = recordsArray[1];

            if (recordOne.isShortLived(InteractionObserver.SIGNAL_DURATION_MAX_MS) &&
                recordTwo.isShortLived(InteractionObserver.SIGNAL_DURATION_MAX_MS)) {

                if (recordOne.isStatic() && recordTwo.isStatic()) {
                    return InteractionObserver.DUAL_TAP;
                } else if (recordOne.movedUpward() && recordTwo.movedUpward()) {
                    return InteractionObserver.DUAL_SWIPE_UP;
                } else if (recordOne.movedDownward() && recordTwo.movedDownward()) {
                    return InteractionObserver.DUAL_SWIPE_DOWN;
                } else if (recordOne.movedLeftward() && recordTwo.movedLeftward()) {
                    return InteractionObserver.DUAL_SWIPE_LEFT;
                } else if (recordOne.movedRightward() && recordTwo.movedRightward()) {
                    return InteractionObserver.DUAL_SWIPE_RIGHT;
                } else if (detectExpansion(recordOne, recordTwo, this.movementPixelThreshold)) {
                    return InteractionObserver.DUAL_EXPANSION_SIGNAL;
                } else if (detectContraction(recordOne, recordTwo, this.movementPixelThreshold)) {
                    return InteractionObserver.DUAL_CONTRACTION_SIGNAL;
                }
            }
        }

        return InteractionObserver.NO_SIGNAL_DETECTED;
    }

    bindToElement(targetDomElement) {
        const selfRef = this;

        targetDomElement.addEventListener("touchstart", function(evt) { selfRef.processContactEvent(evt); }, false);
        targetDomElement.addEventListener("touchend", function(evt) { selfRef.processContactEvent(evt); }, false);
    }
}