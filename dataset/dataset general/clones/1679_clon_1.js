/*
 * Airy 1.0.1 - A JavaScript library for handling touch gestures.
 *
 * Copyright 2014 Miras Absar
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This section defines the Pointer object and its associated methods.
//--------------------------------------------------Beginning of Pointer Object Definition----------------------------------------

// A unique identifier for this particular Pointer instance.
// this.mIdentifier;

// Timestamp (in milliseconds) when the touch event for this Pointer began.
// this.mDownTime;

// X-coordinate (in pixels) where the Pointer initially made contact.
// this.mDownX;

// Y-coordinate (in pixels) where the Pointer initially made contact.
// this.mDownY;

// Timestamp (in milliseconds) when the touch event for this Pointer ended.
// this.mUpTime;

// X-coordinate (in pixels) where the Pointer was lifted.
// this.mUpX;

// Y-coordinate (in pixels) where the Pointer was lifted.
// this.mUpY;


function Pointer(pIdentifier,  pDownTime,
                     pDownX, pDownY, pMovementLimitPx) {

    // Assign the unique identifier to the pointer.
    this.mIdentifier = pIdentifier;

    this.mDownTime   = pDownTime;  // Store the time the pointer went down.

    this.mDownX = pDownX;
    this.mDownY = pDownY;

    // Calculate the movement limits based on the initial down coordinates
    // and the provided movement threshold. These define the "tapped" area.
    this.mUpXUpperLimit = this.mDownX + pMovementLimitPx;
    this.mUpXLowerLimit = this.mDownX - pMovementLimitPx;
    this.mUpYUpperLimit = this.mDownY + pMovementLimitPx;
    this.mUpYLowerLimit = this.mDownY - pMovementLimitPx;
}

Pointer.prototype.setUpTime = function ( pUpTime ) {
  this.mUpTime = pUpTime;
};

Pointer.prototype.setUpX = function (pUpX) {
    this.mUpX = pUpX;
};

Pointer.prototype.setUpY = function (pUpY) {
            this.mUpY = pUpY;
};

Pointer.prototype.getIdentifier = function ( ) {
    return this.mIdentifier;
};


Pointer.prototype.getDownX = function() {
    return this.mDownX;
};

Pointer.prototype.getDownY = function() {
    return this.mDownY;
};

Pointer.prototype.getUpX = function() {
    return this.mUpX;
};

Pointer.prototype.getUpY = function() {
    return this.mUpY;
};

Pointer.prototype.existedWithinTimeLimit = function( pTimeLimit ) {
    // Check if the duration of the pointer's existence is within the specified time limit.
    return this.mUpTime - this.mDownTime <= pTimeLimit;
};

Pointer.prototype.tapped = function() {
    // A tap is defined as the up coordinates being within the calculated limits
    // around the down coordinates.
    return this.mUpX < this.mUpXUpperLimit &&
        this.mUpX > this.mUpXLowerLimit &&
        this.mUpY < this.mUpYUpperLimit &&
        this.mUpY > this.mUpYLowerLimit;
};

Pointer.prototype.swipedUp = function() {
    // A swipe up occurs if the pointer ends above the lower Y-limit,
    // while remaining within X-axis limits.
    return this.mUpX < this.mUpXUpperLimit &&
        this.mUpX > this.mUpXLowerLimit &&
        this.mUpY <= this.mUpYLowerLimit;
};

Pointer.prototype.swipedDown = function() {
    // A swipe down occurs if the pointer ends below the upper Y-limit,
    // while remaining within X-axis limits.
    return this.mUpX < this.mUpXUpperLimit &&
        this.mUpX > this.mUpXLowerLimit &&
        this.mUpY >= this.mUpYUpperLimit;
};

Pointer.prototype.swipedLeft = function() {
    // A swipe left occurs if the pointer ends to the left of the lower X-limit,
    // while remaining within Y-axis limits.
    return this.mUpX <= this.mUpXLowerLimit &&
        this.mUpY < this.mUpYUpperLimit &&
        this.mUpY > this.mUpYLowerLimit;
};

Pointer.prototype.swipedRight = function() {
    // A swipe right occurs if the pointer ends to the right of the upper X-limit,
    // while remaining within Y-axis limits.
    return this.mUpX >= this.mUpXUpperLimit &&
        this.mUpY < this.mUpYUpperLimit &&
        this.mUpY > this.mUpYLowerLimit;
};

Pointer.prototype.distanceFormula = function(pXI, pYI,
                                             pXII, pYII) {
    // Calculates the Euclidean distance between two points (pXI, pYI) and (pXII, pYII).
    return Math.sqrt(Math.pow(pXI - pXII, 2) + Math.pow(pYI - pYII, 2));
};

Pointer.prototype.pinchedIn = function(pPointer, pMovementLimitPx) {
    // A pinch-in gesture implies the distance between two pointers has decreased.
    // The initial distance plus a movement limit should be less than or equal
    // to the final distance.
    return this.distanceFormula(this.mDownX, this.mDownY, pPointer.getDownX(), pPointer.getDownY()) + pMovementLimitPx <=
        this.distanceFormula(this.mUpX, this.mUpY, pPointer.getUpX(), pPointer.getUpY());
};

Pointer.prototype.pinchedOut = function(pPointer, pMovementLimitPx) {
    // A pinch-out gesture implies the distance between two pointers has increased.
    // The initial distance minus a movement limit should be greater than or equal
    // to the final distance.
    return this.distanceFormula(this.mDownX, this.mDownY, pPointer.getDownX(), pPointer.getDownY()) - pMovementLimitPx >=
        this.distanceFormula(this.mUpX, this.mUpY, pPointer.getUpX(), pPointer.getUpY());
};

//--------------------------------------------------End of Pointer Object Definition----------------------------------------

//--------------------------------------------------Beginning of Airy Object Definition----------------------------------------

// The maximum duration (in milliseconds) allowed for a gesture to be considered valid.
// Airy.prototype.TIME_LIMIT;

// The minimum distance (in density-independent pixels) a Pointer must move
// to be considered a swipe or pinch, rather than a tap.
// Airy.prototype.MOVEMENT_LIMIT_DP;

// Enumeration for custom touch event types recognized by Airy.
// Airy.prototype.PRIMARY_TOUCH_START;    // First finger down.
// Airy.prototype.SECONDARY_TOUCH_START; // Second (or more) finger down.
// Airy.prototype.SECONDARY_TOUCH_END;   // One of multiple fingers lifted, but others remain.
// Airy.prototype.PRIMARY_TOUCH_END;     // Last finger lifted.

// Identifier for a gesture that could not be recognized.
// Airy.prototype.INVALID_GESTURE;

// Identifiers for single-finger gestures.
// Airy.prototype.TAP;
// Airy.prototype.SWIPE_UP;
// Airy.prototype.SWIPE_DOWN;
// Airy.prototype.SWIPE_LEFT;
// Airy.prototype.SWIPE_RIGHT;

// Identifiers for two-finger gestures.
// Airy.prototype.TWO_FINGER_TAP;
// Airy.prototype.TWO_FINGER_SWIPE_UP;
// Airy.prototype.TWO_FINGER_SWIPE_DOWN;
// Airy.prototype.TWO_FINGER_SWIPE_LEFT;
// Airy.prototype.TWO_FINGER_SWIPE_RIGHT;
// Airy.prototype.TWO_FINGER_PINCH_IN;
// Airy.prototype.TWO_FINGER_PINCH_OUT;

// The calculated movement limit in actual pixels, based on devicePixelRatio.
// this.mMovementLimitPx;

// The callback function to be invoked when a gesture is recognized.
// this.mOnGesture;

// A collection of Pointer objects currently active in the gesture.
// this.mPointers;


function Airy(pOnGesture) {
    // Initialize the movement limit in pixels, converting from DP using devicePixelRatio.
    this.mMovementLimitPx = this.MOVEMENT_LIMIT_DP * window.devicePixelRatio;

    // Store the callback function that will be executed upon gesture recognition.
    this.mOnGesture = pOnGesture;
}

// Define the time limit for gestures.
Airy.prototype.TIME_LIMIT = 300;

// Define the movement limit in density-independent pixels.
Airy.prototype.MOVEMENT_LIMIT_DP = 48;

// Define custom touch event types as constants.
Airy.prototype.PRIMARY_TOUCH_START = 0;
Airy.prototype.SECONDARY_TOUCH_START = 1;
Airy.prototype.SECONDARY_TOUCH_END = 2;
Airy.prototype.PRIMARY_TOUCH_END = 3;

// Define the invalid gesture identifier.
Airy.prototype.INVALID_GESTURE = -1;

// Define single-finger gesture identifiers.
Airy.prototype.TAP = 0;
Airy.prototype.SWIPE_UP = 1;
Airy.prototype.SWIPE_DOWN = 2;
Airy.prototype.SWIPE_LEFT = 3;
Airy.prototype.SWIPE_RIGHT = 4;

// Define two-finger gesture identifiers.
Airy.prototype.TWO_FINGER_TAP = 5;
Airy.prototype.TWO_FINGER_SWIPE_UP = 6;
Airy.prototype.TWO_FINGER_SWIPE_DOWN = 7;
Airy.prototype.TWO_FINGER_SWIPE_LEFT = 8;
Airy.prototype.TWO_FINGER_SWIPE_RIGHT = 9;
Airy.prototype.TWO_FINGER_PINCH_IN = 10;
Airy.prototype.TWO_FINGER_PINCH_OUT = 11;


Airy.prototype.getTouchEventType = function ( pTouchEvent ) {
    // Determine the type of touch event based on 'type' and 'touches.length'.
    if ( pTouchEvent.type == "touchstart" && pTouchEvent.touches.length == 1 ) {
        return Airy.prototype.PRIMARY_TOUCH_START;
    }

    else if (pTouchEvent.type == "touchstart" && pTouchEvent.touches.length >= 2) {
        return Airy.prototype.SECONDARY_TOUCH_START;
    }

    else if (pTouchEvent.type == "touchend" && pTouchEvent.touches.length >= 1) {
        return Airy.prototype.SECONDARY_TOUCH_END;
    }

    else if (pTouchEvent.type == "touchend" && pTouchEvent.touches.length === 0) {
        return Airy.prototype.PRIMARY_TOUCH_END;
    }
};

Airy.prototype.getGestureId = function() {
    var mTotalPointerCount = this.mPointers.length; // Get the number of active pointers.

    if (mTotalPointerCount == 1) {
        var mPointer = this.mPointers[0]; // Get the single pointer.

        if (mPointer.existedWithinTimeLimit(Airy.prototype.TIME_LIMIT)) {
            // Check for various one-finger gestures.
            if (mPointer.tapped()) {
                return Airy.prototype.TAP;
            } else if (mPointer.swipedUp()) {
                return Airy.prototype.SWIPE_UP;
            } else if (mPointer.swipedDown()) {
                return Airy.prototype.SWIPE_DOWN;
            } else if (mPointer.swipedLeft()) {
                return Airy.prototype.SWIPE_LEFT;
            } else if (mPointer.swipedRight()) {
                return Airy.prototype.SWIPE_RIGHT;
            } else {
                return Airy.prototype.INVALID_GESTURE; // No recognized gesture.
            }
        } else {
            return Airy.prototype.INVALID_GESTURE; // Gesture took too long.
        }
    } else if (mTotalPointerCount == 2) {
        var mPointerI = this.mPointers[0];
        var mPointerII = this.mPointers[1];

        if (mPointerI.existedWithinTimeLimit(Airy.prototype.TIME_LIMIT) &&
            mPointerII.existedWithinTimeLimit(Airy.prototype.TIME_LIMIT)) {
            // Check for various two-finger gestures.
            if (mPointerI.tapped() &&
                mPointerII.tapped()) {

                return Airy.prototype.TWO_FINGER_TAP;
            } else if (mPointerI.swipedUp() &&
                       mPointerII.swipedUp()) {

                return Airy.prototype.TWO_FINGER_SWIPE_UP;
            } else if (mPointerI.swipedDown() &&
                       mPointerII.swipedDown()) {

                return Airy.prototype.TWO_FINGER_SWIPE_DOWN;
            } else if (mPointerI.swipedLeft() &&
                       mPointerII.swipedLeft()) {

                return Airy.prototype.TWO_FINGER_SWIPE_LEFT;
            } else if (mPointerI.swipedRight() &&
                       mPointerII.swipedRight()) {

                return Airy.prototype.TWO_FINGER_SWIPE_RIGHT;
            } else if (mPointerI.pinchedIn(mPointerII, this.mMovementLimitPx)) {
                return Airy.prototype.TWO_FINGER_PINCH_IN;
            } else if (mPointerI.pinchedOut(mPointerII, this.mMovementLimitPx)) {
                return Airy.prototype.TWO_FINGER_PINCH_OUT;
            } else {
                return Airy.prototype.INVALID_GESTURE; // No two-finger gesture recognized.
            }
        } else {
            return Airy.prototype.INVALID_GESTURE; // Two-finger gesture took too long.
        }
    } else {
        return Airy.prototype.INVALID_GESTURE; // More than two pointers, or zero pointers are not handled as gestures.
    }
};

Airy.prototype.onTouch = function(pTouchEvent) {
    // Extract relevant data from the primary changed touch.
    var mTouch = pTouchEvent.changedTouches[0];

    var mIdentifier = mTouch.identifier;
    var mTime = new Date().getTime();
    var mScreenX = mTouch.screenX;
    var mScreenY = mTouch.screenY;

    // Handle the touch event based on its determined type.
    switch (this.getTouchEventType(pTouchEvent)) {
        case Airy.prototype.PRIMARY_TOUCH_START:
            // First touch starts a new gesture sequence. Clear previous pointers.
            this.mPointers = [];

            // Add the new pointer.
            this.mPointers.push(new Pointer(mIdentifier,
                                            mTime,
                                            mScreenX, mScreenY,
                                            this.mMovementLimitPx));
            break;

        case Airy.prototype.SECONDARY_TOUCH_START:
            // A second (or more) touch starts. Add it to the existing pointers.
            this.mPointers.push(new Pointer(mIdentifier,
                                            mTime,
                                            mScreenX, mScreenY,
                                            this.mMovementLimitPx));
            break;

        case Airy.prototype.SECONDARY_TOUCH_END:
            // One of multiple touches ended. Update its 'up' properties.
            for (var pIndexI = this.mPointers.length - 1; pIndexI >= 0; pIndexI--) {
                if (this.mPointers[pIndexI].getIdentifier() == mIdentifier) {
                    this.mPointers[pIndexI].setUpTime(mTime);
                    this.mPointers[pIndexI].setUpX(mScreenX);
                    this.mPointers[pIndexI].setUpY(mScreenY);
                }
            }
            break;

        case Airy.prototype.PRIMARY_TOUCH_END:
            // The last touch ended. Update its 'up' properties.
            for (var pIndexII = this.mPointers.length - 1; pIndexII >= 0; pIndexII--) {
                if (this.mPointers[pIndexII].getIdentifier() == mIdentifier) {
                    this.mPointers[pIndexII].setUpTime(mTime);
                    this.mPointers[pIndexII].setUpX(mScreenX);
                    this.mPointers[pIndexII].setUpY(mScreenY);
                }
            }

            // A gesture has concluded, so determine its type and call the callback.
            this.mOnGesture(mTouch.target, this.getGestureId());
            break;
    }
};

Airy.prototype.attachTo = function(pElement) {
    var mSelf = this; // Capture 'this' for use within event listeners.

    // Attach touchstart and touchend listeners to the specified element.
    pElement.addEventListener("touchstart", function (pTouchEvent) { mSelf.onTouch(pTouchEvent); }, false);
    pElement.addEventListener("touchend", function (pTouchEvent) { mSelf.onTouch(pTouchEvent); }, false);
};

//--------------------------------------------------End of Airy Object Definition----------------------------------------