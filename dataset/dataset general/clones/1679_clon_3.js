// This file implements a robust touch gesture detection system.
// Version: 1.0.1-revised-alpha

// Copyright (c) 2014 Miras Absar (original author)
// Re-engineered and refactored under Apache License 2.0.
// For licensing details, refer to the original Apache License, Version 2.0.
// http://www.apache.org/licenses/LICENSE-2.0

//--- Core Touch Point Representation ---

/**
 * @class InputPoint
 * @description Models a single point of touch input, tracking its lifecycle from press to release.
 */
function InputPoint(uniqueId, initialPressTime, initialPressX, initialPressY, movementTolerancePx) {
    // Input validation: Ensure all essential parameters are provided.
    if (!GestureDetector.isValidNumber(uniqueId) || !GestureDetector.isValidNumber(initialPressTime) ||
        !GestureDetector.isValidNumber(initialPressX) || !GestureDetector.isValidNumber(initialPressY) ||
        !GestureDetector.isValidNumber(movementTolerancePx)) {
        console.error("InputPoint constructor: All parameters must be valid numbers.");
        // Consider throwing an error or returning a null object in a production environment.
        return Object.create(null); // Return a non-functional object.
    }

    // A system-assigned unique identifier for this touch instance.
    this._pointId = uniqueId;

    // The timestamp (in milliseconds) when the touch contact began.
    this._pressTimeMs = initialPressTime;

    // The horizontal screen coordinate (in pixels) at the start of the touch.
    this._startX = initialPressX;

    // The vertical screen coordinate (in pixels) at the start of the touch.
    this._startY = initialPressY;

    // The maximum permissible pixel deviation from the start point for a "tap" or "stationary" gesture.
    this._moveThreshold = movementTolerancePx;

    // Pre-calculated coordinate boundaries defining the "tap" or "no-movement" zone.
    // These form a square region around the initial touch point.
    this._upperXBoundary = this._startX + this._moveThreshold;
    this._lowerXBoundary = this._startX - this._moveThreshold;
    this._upperYBoundary = this._startY + this._moveThreshold;
    this._lowerYBoundary = this._startY - this._moveThreshold;

    // Properties initialized to null, to be populated when the touch is released.
    this._releaseTimeMs = null; // Timestamp when the touch contact ended.
    this._endX = null;          // Final horizontal screen coordinate.
    this._endY = null;          // Final vertical screen coordinate.
}

/**
 * Updates the recorded timestamp for when this touch input was released.
 * @param {number} finalTime - The release time in milliseconds.
 */
InputPoint.prototype.setReleaseTime = function(finalTime) {
    // Guard clause: Ensure the provided time is a valid number and logically after press time.
    if (!GestureDetector.isValidNumber(finalTime) || finalTime < this._pressTimeMs) {
        console.warn(`InputPoint ID ${this._pointId}: Invalid release time ${finalTime} provided.`);
        return;
    }
    this._releaseTimeMs = finalTime;
};

/**
 * Updates the final X coordinate for this touch input.
 * @param {number} finalX - The X coordinate in pixels at release.
 */
InputPoint.prototype.setReleaseX = function(finalX) {
    if (!GestureDetector.isValidNumber(finalX)) {
        console.warn(`InputPoint ID ${this._pointId}: Invalid final X coordinate ${finalX} provided.`);
        return;
    }
    this._endX = finalX;
};

/**
 * Updates the final Y coordinate for this touch input.
 * @param {number} finalY - The Y coordinate in pixels at release.
 */
InputPoint.prototype.setReleaseY = function(finalY) {
    if (!GestureDetector.isValidNumber(finalY)) {
        console.warn(`InputPoint ID ${this._pointId}: Invalid final Y coordinate ${finalY} provided.`);
        return;
    }
    this._endY = finalY;
};

/**
 * Retrieves the unique identifier assigned to this touch point.
 * @returns {number} The ID of the touch point.
 */
InputPoint.prototype.getId = function() {
    return this._pointId;
};

/**
 * Retrieves the starting X coordinate of the touch.
 * @returns {number} The X position in pixels.
 */
InputPoint.prototype.getStartX = function() {
    return this._startX;
};

/**
 * Retrieves the starting Y coordinate of the touch.
 * @returns {number} The Y position in pixels.
 */
InputPoint.prototype.getStartY = function() {
    return this._startY;
};

/**
 * Retrieves the ending X coordinate of the touch.
 * @returns {number} The X position in pixels.
 */
InputPoint.prototype.getEndX = function() {
    return this._endX;
};

/**
 * Retrieves the ending Y coordinate of the touch.
 * @returns {number} The Y position in pixels.
 */
InputPoint.prototype.getEndY = function() {
    return this._endY;
};

/**
 * Checks if the total duration of the touch input was within a specified time limit.
 * @param {number} maxDurationMs - The maximum allowable duration in milliseconds.
 * @returns {boolean} True if the touch was released within the time limit, false otherwise.
 */
InputPoint.prototype.wasBrief = function(maxDurationMs) {
    // Ensure release data is available before computing duration.
    if (this._releaseTimeMs === null || !GestureDetector.isValidNumber(maxDurationMs)) {
        return false;
    }
    const duration = this._releaseTimeMs - this._pressTimeMs;
    return duration <= maxDurationMs;
};

/**
 * Determines if the touch input qualifies as a "tap" gesture.
 * A tap implies that the release point is very close to the initial press point.
 * @returns {boolean} True if a tap is detected, false otherwise.
 */
InputPoint.prototype.isTapped = function() {
    // Guard clause: ensure end coordinates are set.
    if (this._endX === null || this._endY === null) {
        return false;
    }
    // Check if the final coordinates fall within the defined tap boundaries.
    return (this._endX < this._upperXBoundary && this._endX > this._lowerXBoundary) &&
           (this._endY < this._upperYBoundary && this._endY > this._lowerYBoundary);
};

/**
 * Determines if the touch input constitutes an "upward swipe".
 * @returns {boolean} True if an upward swipe is detected, false otherwise.
 */
InputPoint.prototype.isSwipedUp = function() {
    if (this._endX === null || this._endY === null) return false;
    const isXMovementLimited = (this._endX < this._upperXBoundary && this._endX > this._lowerXBoundary);
    const hasMovedSignificantlyUp = (this._endY <= this._lowerYBoundary); // Y decreases as it moves up.
    return isXMovementLimited && hasMovedSignificantlyUp;
};

/**
 * Determines if the touch input constitutes a "downward swipe".
 * @returns {boolean} True if a downward swipe is detected, false otherwise.
 */
InputPoint.prototype.isSwipedDown = function() {
    if (this._endX === null || this._endY === null) return false;
    const isXMovementLimited = (this._endX < this._upperXBoundary && this._endX > this._lowerXBoundary);
    const hasMovedSignificantlyDown = (this._endY >= this._upperYBoundary); // Y increases as it moves down.
    return isXMovementLimited && hasMovedSignificantlyDown;
};

/**
 * Determines if the touch input constitutes a "leftward swipe".
 * @returns {boolean} True if a leftward swipe is detected, false otherwise.
 */
InputPoint.prototype.isSwipedLeft = function() {
    if (this._endX === null || this._endY === null) return false;
    const isYMovementLimited = (this._endY < this._upperYBoundary && this._endY > this._lowerYBoundary);
    const hasMovedSignificantlyLeft = (this._endX <= this._lowerXBoundary); // X decreases as it moves left.
    return isYMovementLimited && hasMovedSignificantlyLeft;
};

/**
 * Determines if the touch input constitutes a "rightward swipe".
 * @returns {boolean} True if a rightward swipe is detected, false otherwise.
 */
InputPoint.prototype.isSwipedRight = function() {
    if (this._endX === null || this._endY === null) return false;
    const isYMovementLimited = (this._endY < this._upperYBoundary && this._endY > this._lowerYBoundary);
    const hasMovedSignificantlyRight = (this._endX >= this._upperXBoundary); // X increases as it moves right.
    return isYMovementLimited && hasMovedSignificantlyRight;
};

/**
 * Internal helper: Calculates the Euclidean distance between two coordinate pairs.
 * @param {number} x1 - X coordinate of the first point.
 * @param {number} y1 - Y coordinate of the first point.
 * @param {number} x2 - X coordinate of the second point.
 * @param {number} y2 - Y coordinate of the second point.
 * @returns {number} The calculated distance.
 */
InputPoint.prototype._calculateDistance = function(x1, y1, x2, y2) {
    const deltaX = x1 - x2;
    const deltaY = y1 - y2;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

/**
 * Checks if a two-finger "pinch-in" gesture occurred, relative to another InputPoint.
 * This method assumes 'this' is one finger and 'otherPoint' is the second.
 * @param {InputPoint} otherPoint - The second touch point involved in the gesture.
 * @param {number} movementTolerance - The pixel threshold for recognizing significant movement.
 * @returns {boolean} True if a pinch-in is detected, false otherwise.
 */
InputPoint.prototype.isPinchedIn = function(otherPoint, movementTolerance) {
    // Guard clause: Ensure both points are valid and have their release coordinates.
    if (!otherPoint || otherPoint.getEndX() === null || otherPoint.getEndY() === null ||
        this._endX === null || this._endY === null || !GestureDetector.isValidNumber(movementTolerance)) {
        return false;
    }

    const initialSeparation = this._calculateDistance(this._startX, this._startY, otherPoint.getStartX(), otherPoint.getStartY());
    const finalSeparation = this._calculateDistance(this._endX, this._endY, otherPoint.getEndX(), otherPoint.getEndY());

    // A pinch-in occurs if the final distance is significantly less than the initial distance.
    return (initialSeparation - movementTolerance) >= finalSeparation;
};

/**
 * Checks if a two-finger "pinch-out" gesture occurred, relative to another InputPoint.
 * This method assumes 'this' is one finger and 'otherPoint' is the second.
 * @param {InputPoint} otherPoint - The second touch point involved in the gesture.
 * @param {number} movementTolerance - The pixel threshold for recognizing significant movement.
 * @returns {boolean} True if a pinch-out is detected, false otherwise.
 */
InputPoint.prototype.isPinchedOut = function(otherPoint, movementTolerance) {
    // Guard clause: Ensure both points are valid and have their release coordinates.
    if (!otherPoint || otherPoint.getEndX() === null || otherPoint.getEndY() === null ||
        this._endX === null || this._endY === null || !GestureDetector.isValidNumber(movementTolerance)) {
        return false;
    }

    const initialSeparation = this._calculateDistance(this._startX, this._startY, otherPoint.getStartX(), otherPoint.getStartY());
    const finalSeparation = this._calculateDistance(this._endX, this._endY, otherPoint.getEndX(), otherPoint.getEndY());

    // A pinch-out occurs if the final distance is significantly greater than the initial distance.
    return (initialSeparation + movementTolerance) <= finalSeparation;
};


//--- Gesture Detection Logic ---

/**
 * @class GestureDetector
 * @description Provides functionality to detect common touch gestures from raw touch events.
 */
function GestureDetector(callbackFunction) {
    // Validate the callback function upon instantiation.
    if (typeof callbackFunction !== 'function') {
        console.error("GestureDetector constructor: A valid callback function is required.");
        // In a real application, you might throw an error or handle this more robustly.
        return Object.create(null); // Return a non-functional object.
    }

    // The function to be invoked when a gesture is successfully identified.
    this._gestureCallback = callbackFunction;

    // The calculated pixel threshold for movement, adjusted for the device's pixel density.
    const devicePixelMultiplier = window.devicePixelRatio || 1; // Fallback to 1 for non-browser environments.
    this._pixelMoveThreshold = GestureDetector.CONSTANTS.MIN_MOVE_PIXELS_DP * devicePixelMultiplier;

    // An internal array to keep track of active InputPoint objects during a gesture sequence.
    this._trackedPoints = [];

    // An object to store references to bound event handlers, enabling proper cleanup.
    this._boundHandlers = {};
}

// Define and immutably store core constants for the GestureDetector.
Object.freeze(GestureDetector.CONSTANTS = {
    // Time-related thresholds.
    MAX_GESTURE_DURATION_MS: 300, // Maximum duration for a touch to be considered a "tap" or rapid "swipe".

    // Distance-related thresholds.
    MIN_MOVE_PIXELS_DP: 48, // Minimum movement in density-independent pixels for a swipe/pinch.

    // Categorization of native touch events into abstract types.
    EVENT_TYPE_PRIMARY_START: 0,   // First finger touches down.
    EVENT_TYPE_SECONDARY_START: 1, // Second or subsequent finger touches down.
    EVENT_TYPE_SECONDARY_END: 2,   // One of multiple fingers lifts (but not the last).
    EVENT_TYPE_PRIMARY_END: 3,     // The final finger lifts, completing the touch sequence.

    // Gesture Identifiers: Negative values for invalid/no gesture.
    GESTURE_NONE: -1,

    // Identifiers for single-finger gestures.
    GESTURE_ONE_FINGER_TAP: 0,
    GESTURE_ONE_FINGER_SWIPE_UP: 1,
    GESTURE_ONE_FINGER_SWIPE_DOWN: 2,
    GESTURE_ONE_FINGER_SWIPE_LEFT: 3,
    GESTURE_ONE_FINGER_SWIPE_RIGHT: 4,

    // Identifiers for two-finger gestures.
    GESTURE_TWO_FINGER_TAP: 5,
    GESTURE_TWO_FINGER_SWIPE_UP: 6,
    GESTURE_TWO_FINGER_SWIPE_DOWN: 7,
    GESTURE_TWO_FINGER_SWIPE_LEFT: 8,
    GESTURE_TWO_FINGER_SWIPE_RIGHT: 9,
    GESTURE_TWO_FINGER_PINCH_IN: 10,
    GESTURE_TWO_FINGER_PINCH_OUT: 11
});

/**
 * A static utility method to validate if a given value is a finite number.
 * @param {*} value - The value to check.
 * @returns {boolean} True if the value is a valid, finite number; false otherwise.
 */
GestureDetector.isValidNumber = function(value) {
    return typeof value === 'number' && isFinite(value);
};

/**
 * Interprets a native TouchEvent to determine its abstract action type.
 * @param {TouchEvent} event - The native touch event object.
 * @returns {number} A constant representing the derived event type.
 */
GestureDetector.prototype._deriveTouchAction = function(event) {
    // Guard clause: Ensure essential properties of the touch event exist.
    if (!event || typeof event.type !== 'string' || !Array.isArray(event.touches)) {
        console.warn("GestureDetector: _deriveTouchAction received an invalid event object.");
        return GestureDetector.CONSTANTS.GESTURE_NONE;
    }

    const currentTouchesCount = event.touches.length;
    const eventType = event.type;

    if (eventType === "touchstart") {
        return (currentTouchesCount === 1) ?
            GestureDetector.CONSTANTS.EVENT_TYPE_PRIMARY_START :
            GestureDetector.CONSTANTS.EVENT_TYPE_SECONDARY_START;
    } else if (eventType === "touchend") {
        return (currentTouchesCount === 0) ?
            GestureDetector.CONSTANTS.EVENT_TYPE_PRIMARY_END :
            GestureDetector.CONSTANTS.EVENT_TYPE_SECONDARY_END;
    }

    // If the event type is neither 'touchstart' nor 'touchend', it's not relevant for this detector.
    return GestureDetector.CONSTANTS.GESTURE_NONE;
};

/**
 * Evaluates a single-finger touch point to identify potential gestures.
 * @param {InputPoint} point - The single InputPoint to analyze.
 * @returns {number} The detected single-finger gesture ID or GESTURE_NONE.
 */
GestureDetector.prototype._evaluateSinglePointGesture = function(point) {
    // Pre-check: A single-finger gesture must be brief enough.
    if (!point.wasBrief(GestureDetector.CONSTANTS.MAX_GESTURE_DURATION_MS)) {
        return GestureDetector.CONSTANTS.GESTURE_NONE;
    }

    // Order of checks matters: Tap is the most restrictive (no significant movement).
    if (point.isTapped()) {
        return GestureDetector.CONSTANTS.GESTURE_ONE_FINGER_TAP;
    }
    if (point.isSwipedUp()) {
        return GestureDetector.CONSTANTS.GESTURE_ONE_FINGER_SWIPE_UP;
    }
    if (point.isSwipedDown()) {
        return GestureDetector.CONSTANTS.GESTURE_ONE_FINGER_SWIPE_DOWN;
    }
    if (point.isSwipedLeft()) {
        return GestureDetector.CONSTANTS.GESTURE_ONE_FINGER_SWIPE_LEFT;
    }
    if (point.isSwipedRight()) {
        return GestureDetector.CONSTANTS.GESTURE_ONE_FINGER_SWIPE_RIGHT;
    }

    return GestureDetector.CONSTANTS.GESTURE_NONE; // No single-finger gesture recognized.
};

/**
 * Evaluates two InputPoint objects to identify potential two-finger gestures.
 * @param {InputPoint} point1 - The first InputPoint.
 * @param {InputPoint} point2 - The second InputPoint.
 * @returns {number} The detected two-finger gesture ID or GESTURE_NONE.
 */
GestureDetector.prototype._evaluateMultiPointGesture = function(point1, point2) {
    // Both points must be brief enough for a two-finger gesture.
    const areBothPointsBrief = point1.wasBrief(GestureDetector.CONSTANTS.MAX_GESTURE_DURATION_MS) &&
                               point2.wasBrief(GestureDetector.CONSTANTS.MAX_GESTURE_DURATION_MS);

    if (!areBothPointsBrief) {
        return GestureDetector.CONSTANTS.GESTURE_NONE;
    }

    // Check for two-finger tap (both fingers must register as individual taps).
    if (point1.isTapped() && point2.isTapped()) {
        return GestureDetector.CONSTANTS.GESTURE_TWO_FINGER_TAP;
    }

    // Check for synchronized two-finger swipes.
    if (point1.isSwipedUp() && point2.isSwipedUp()) {
        return GestureDetector.CONSTANTS.GESTURE_TWO_FINGER_SWIPE_UP;
    }
    if (point1.isSwipedDown() && point2.isSwipedDown()) {
        return GestureDetector.CONSTANTS.GESTURE_TWO_FINGER_SWIPE_DOWN;
    }
    if (point1.isSwipedLeft() && point2.isSwipedLeft()) {
        return GestureDetector.CONSTANTS.GESTURE_TWO_FINGER_SWIPE_LEFT;
    }
    if (point1.isSwipedRight() && point2.isSwipedRight()) {
        return GestureDetector.CONSTANTS.GESTURE_TWO_FINGER_SWIPE_RIGHT;
    }

    // Check for pinch gestures.
    if (point1.isPinchedIn(point2, this._pixelMoveThreshold)) {
        return GestureDetector.CONSTANTS.GESTURE_TWO_FINGER_PINCH_IN;
    }
    if (point1.isPinchedOut(point2, this._pixelMoveThreshold)) {
        return GestureDetector.CONSTANTS.GESTURE_TWO_FINGER_PINCH_OUT;
    }

    return GestureDetector.CONSTANTS.GESTURE_NONE; // No two-finger gesture recognized.
};

/**
 * Determines the final gesture ID based on the collection of tracked touch points.
 * This acts as the central gesture recognition logic.
 * @returns {number} The ID of the recognized gesture, or GESTURE_NONE if no gesture matches.
 */
GestureDetector.prototype._determineGesture = function() {
    const currentTrackedPointCount = this._trackedPoints.length;

    // Guard clause: Only 1 or 2 fingers are supported for defined gestures.
    if (currentTrackedPointCount === 0 || currentTrackedPointCount > 2) {
        return GestureDetector.CONSTANTS.GESTURE_NONE;
    }

    if (currentTrackedPointCount === 1) {
        const primaryPoint = this._trackedPoints[0];
        return this._evaluateSinglePointGesture(primaryPoint);
    } else if (currentTrackedPointCount === 2) {
        const firstPoint = this._trackedPoints[0];
        const secondPoint = this._trackedPoints[1];
        return this._evaluateMultiPointGesture(firstPoint, secondPoint);
    }

    // This line should ideally not be reached due to the preceding guards.
    return GestureDetector.CONSTANTS.GESTURE_NONE;
};

/**
 * The main event handler for native 'touchstart' and 'touchend' events.
 * It manages the lifecycle of InputPoint objects and triggers gesture evaluation.
 * @param {TouchEvent} event - The native touch event object.
 */
GestureDetector.prototype.handleTouchEvent = function(event) {
    // Guard clause: Ensure the event object contains necessary touch data.
    if (!event || !event.changedTouches || event.changedTouches.length === 0) {
        console.warn("GestureDetector: handleTouchEvent received an event without 'changedTouches'.");
        return;
    }

    // Extract relevant data from the first changed touch.
    const primaryChangedTouch = event.changedTouches[0];
    const touchId = primaryChangedTouch.identifier;
    const currentTime = Date.now(); // More concise than `new Date().getTime()`.
    const touchScreenX = primaryChangedTouch.screenX;
    const touchScreenY = primaryChangedTouch.screenY;

    // Derive the abstract action type for the current event.
    const actionType = this._deriveTouchAction(event);

    switch (actionType) {
        case GestureDetector.CONSTANTS.EVENT_TYPE_PRIMARY_START:
            // When the first finger touches down, clear any previous state and start fresh.
            this._trackedPoints = [];
            this._trackedPoints.push(new InputPoint(touchId, currentTime, touchScreenX, touchScreenY, this._pixelMoveThreshold));
            break;

        case GestureDetector.CONSTANTS.EVENT_TYPE_SECONDARY_START:
            // If a second finger touches down, add it to tracking, but limit to two for defined gestures.
            if (this._trackedPoints.length < 2) {
                this._trackedPoints.push(new InputPoint(touchId, currentTime, touchScreenX, touchScreenY, this._pixelMoveThreshold));
            } else {
                console.info("GestureDetector: Ignoring additional touches beyond two fingers for gesture tracking.");
            }
            break;

        case GestureDetector.CONSTANTS.EVENT_TYPE_SECONDARY_END:
            // A non-primary finger has lifted. Update its release state.
            let foundSecondary = false;
            for (let i = 0; i < this._trackedPoints.length; i++) {
                if (this._trackedPoints[i].getId() === touchId) {
                    this._trackedPoints[i].setReleaseTime(currentTime);
                    this._trackedPoints[i].setReleaseX(touchScreenX);
                    this._trackedPoints[i].setReleaseY(touchScreenY);
                    foundSecondary = true;
                    // Note: The point is kept in `_trackedPoints` until the very last finger lifts,
                    // as it's needed for two-finger gesture evaluation.
                    break;
                }
            }
            if (!foundSecondary) {
                console.warn(`GestureDetector: Secondary touch end event for unknown ID: ${touchId}`);
            }
            break;

        case GestureDetector.CONSTANTS.EVENT_TYPE_PRIMARY_END:
            // The final finger has lifted, signaling the end of the entire touch sequence.
            let finalReleasedPoint = null;
            for (let i = 0; i < this._trackedPoints.length; i++) {
                if (this._trackedPoints[i].getId() === touchId) {
                    this._trackedPoints[i].setReleaseTime(currentTime);
                    this._trackedPoints[i].setReleaseX(touchScreenX);
                    this._trackedPoints[i].setReleaseY(touchScreenY);
                    finalReleasedPoint = this._trackedPoints[i];
                    break;
                }
            }

            // Only proceed to evaluate if the last released point was successfully identified.
            if (finalReleasedPoint) {
                const detectedGesture = this._determineGesture();
                // Invoke the registered callback with the event target and the detected gesture.
                this._gestureCallback(event.target, detectedGesture);
            } else {
                console.warn(`GestureDetector: Primary touch end event for unknown ID: ${touchId}.`);
            }

            // Reset tracked points after a full gesture sequence has concluded.
            this._trackedPoints = [];
            break;

        default:
            // Log any unhandled touch action types, which might indicate a misconfiguration or new event type.
            console.log(`GestureDetector: Unhandled touch action type: ${actionType}`);
            break;
    }
};

/**
 * Binds the gesture detector's event listeners to a specific HTML DOM element.
 * @param {HTMLElement} targetElement - The DOM element to attach listeners to.
 */
GestureDetector.prototype.bindToElement = function(targetElement) {
    // Guard clause: Ensure the provided target is a valid HTMLElement.
    if (!(targetElement instanceof HTMLElement)) {
        console.error("GestureDetector: bindToElement requires a valid HTMLElement.");
        return;
    }

    const selfReference = this; // Capture 'this' context for event handlers.

    // Create a single, consistent handler function to ensure proper removal later.
    const boundEventHandler = function(event) {
        selfReference.handleTouchEvent(event);
    };

    // Use a unique key for the element (e.g., its ID or a string representation).
    const elementKey = targetElement.id || targetElement.toString();
    if (this._boundHandlers[elementKey]) {
        console.warn(`GestureDetector: Already bound to element ${elementKey}. Unbind first if re-binding.`);
        this.unbindFromElement(targetElement); // Attempt to unbind before re-binding.
    }

    // Store the handler reference for potential unbinding.
    this._boundHandlers[elementKey] = {
        element: targetElement,
        handler: boundEventHandler
    };

    // Attach the necessary touch event listeners.
    targetElement.addEventListener("touchstart", boundEventHandler, false);
    targetElement.addEventListener("touchend", boundEventHandler, false);
    // Note: 'touchmove' is not explicitly used for gesture determination in this version,
    // as it focuses on start/end states for performance and simplicity.
};

/**
 * Removes the gesture detector's event listeners from a previously bound DOM element.
 * This is crucial for preventing memory leaks when elements are removed from the DOM.
 * @param {HTMLElement} targetElement - The DOM element to remove listeners from.
 */
GestureDetector.prototype.unbindFromElement = function(targetElement) {
    // Guard clause: Ensure the provided target is a valid HTMLElement.
    if (!(targetElement instanceof HTMLElement)) {
        console.warn("GestureDetector: unbindFromElement requires a valid HTMLElement.");
        return;
    }

    const elementKey = targetElement.id || targetElement.toString();
    const storedBinding = this._boundHandlers[elementKey];

    if (storedBinding && storedBinding.element === targetElement) {
        targetElement.removeEventListener("touchstart", storedBinding.handler, false);
        targetElement.removeEventListener("touchend", storedBinding.handler, false);
        delete this._boundHandlers[elementKey]; // Clean up the stored reference.
    } else {
        console.info(`GestureDetector: No active binding found for element: ${elementKey}.`);
    }
};