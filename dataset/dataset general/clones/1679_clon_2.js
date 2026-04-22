// Sensor 1.0.1

// Copyright 2014 Miras Absar
//
// Permitted under the Apache License, Version 2.0 (the "License");
// you may not employ this file except in compliance with the License.
// You may obtain a duplicate of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless mandated by applicable law or agreed to in writing, software
// disseminated under the License is dispersed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// Refer to the License for the specific language permissions and
// restrictions under the License.

//--------------------------------------------------Start of InputPoint----------------------------------------

// This InputPoint's unique identifier.
// this.uniqueId;

// The time (in milliseconds) when this InputPoint was initiated.
// this.initialTimeMs;

// The x-coordinate (in pixels) where this InputPoint began.
// this.startXCoord;

// The y-coordinate (in pixels) where this InputPoint began.
// this.startYCoord;

// The time (in milliseconds) when this InputPoint concluded.
// this.releaseTimeMs;

// The x-coordinate (in pixels) where this InputPoint concluded.
// this.endXCoord;

// The y-coordinate (in pixels) where this InputPoint concluded.
// this.endYCoord;

function InputPoint(  identVal,
                      pressTime,
                      pressX, pressY,
                      tolerancePx ) {

    this.uniqueId = identVal;
    this.initialTimeMs = pressTime;
    this.startXCoord = pressX;
    this.startYCoord = pressY;

    this.xMaxBound = this.startXCoord + tolerancePx;
    this.xMinBound = this.startXCoord - tolerancePx;
    this.yMaxBound = this.startYCoord + tolerancePx;
    this.yMinBound = this.startYCoord - tolerancePx;
}

InputPoint.prototype.setReleaseTimestamp = function ( releaseTs ) {
    this.releaseTimeMs = releaseTs;
};

InputPoint.prototype.setEndX = function ( finalX ) {
    this.endXCoord = finalX;
};

InputPoint.prototype.setEndY = function ( finalY ) {
    this.endYCoord = finalY;
};

InputPoint.prototype.getUniqueId = function () {
    return this.uniqueId;
};

InputPoint.prototype.getStartX = function () {
    return this.startXCoord;
};

InputPoint.prototype.getStartY = function () {
    return this.startYCoord;
};

InputPoint.prototype.getEndX = function () {
    return this.endXCoord;
};

InputPoint.prototype.getEndY = function () {
    return this.endYCoord;
};

InputPoint.prototype.wasBrief = function ( durationMax ) {
    return this.releaseTimeMs - this.initialTimeMs <= durationMax;
};

InputPoint.prototype.isClick = function () {
    return this.endXCoord < this.xMaxBound &&
           this.endXCoord > this.xMinBound &&
           this.endYCoord < this.yMaxBound &&
           this.endYCoord > this.yMinBound;
};

InputPoint.prototype.isSwipeUp = function () {
    return this.endXCoord < this.xMaxBound &&
           this.endXCoord > this.xMinBound &&
           this.endYCoord <= this.yMinBound;
};

InputPoint.prototype.isSwipeDown = function () {
    return this.endXCoord < this.xMaxBound &&
           this.endXCoord > this.xMinBound &&
           this.endYCoord >= this.yMaxBound;
};

InputPoint.prototype.isSwipeLeft = function () {
    return this.endXCoord <= this.xMinBound &&
           this.endYCoord < this.yMaxBound &&
           this.endYCoord > this.yMinBound;
};

InputPoint.prototype.isSwipeRight = function () {
    return this.endXCoord >= this.xMaxBound &&
           this.endYCoord < this.yMaxBound &&
           this.endYCoord > this.yMinBound;
};

InputPoint.prototype.calcDistance = function ( x1, y1,
                                                x2, y2 ) {

    return Math.sqrt( Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) );
};

InputPoint.prototype.isPinchIn = function ( otherPoint, limitPixels ) {
    return this.calcDistance(this.startXCoord, this.startYCoord, otherPoint.getStartX(), otherPoint.getStartY()) + limitPixels <=
           this.calcDistance(this.endXCoord, this.endYCoord, otherPoint.getEndX(), otherPoint.getEndY());
};

InputPoint.prototype.isPinchOut = function ( otherPoint, limitPixels ) {
    return this.calcDistance(this.startXCoord, this.startYCoord, otherPoint.getStartX(), otherPoint.getStartY()) - limitPixels >=
           this.calcDistance(this.endXCoord, this.endYCoord, otherPoint.getEndX(), otherPoint.getEndY());
};

//--------------------------------------------------End of InputPoint----------------------------------------

//--------------------------------------------------Start of GestureProcessor----------------------------------------

// The maximum duration (in milliseconds) allowed for a full gesture.
// GestureProcessor.prototype.MAX_DURATION_MS;

// The minimum pixel distance (in density-independent units) an InputPoint must traverse to initiate a movement gesture.
// GestureProcessor.prototype.MIN_MOVE_DP;

// Distinct categories for touch input events.
// GestureProcessor.prototype.FIRST_PRESS;
// GestureProcessor.prototype.MULTI_PRESS;
// GestureProcessor.prototype.MULTI_RELEASE;
// GestureProcessor.prototype.FINAL_RELEASE;

// The identifier for an unrecognized or invalid gesture.
// GestureProcessor.prototype.UNKNOWN_ACTION;

// Identifiers for single-finger actions.
// GestureProcessor.prototype.SINGLE_TAP;
// GestureProcessor.prototype.SWIPE_UP_ONE;
// GestureProcessor.prototype.SWIPE_DOWN_ONE;
// GestureProcessor.prototype.SWIPE_LEFT_ONE;
// GestureProcessor.prototype.SWIPE_RIGHT_ONE;

// Identifiers for two-finger actions.
// GestureProcessor.prototype.DOUBLE_TAP;
// GestureProcessor.prototype.SWIPE_UP_TWO;
// GestureProcessor.prototype.SWIPE_DOWN_TWO;
// GestureProcessor.prototype.SWIPE_LEFT_TWO;
// GestureProcessor.prototype.SWIPE_RIGHT_TWO;
// GestureProcessor.prototype.PINCH_IN_TWO;
// GestureProcessor.prototype.PINCH_OUT_TWO;

// The actual pixel distance an InputPoint must travel, derived from DPI.
// this.pixelThreshold;

// The function invoked upon detection of a gesture.
// this.gestureCallback;

// A collection of InputPoints currently involved in a gesture.
// this.activePoints;

function GestureProcessor( callbackFunc ) {
    this.pixelThreshold = this.MIN_MOVE_DP * window.devicePixelRatio;

    this.gestureCallback = callbackFunc;
}

GestureProcessor.prototype.MAX_DURATION_MS = 300;

GestureProcessor.prototype.MIN_MOVE_DP = 48;

GestureProcessor.prototype.FIRST_PRESS = 0;
GestureProcessor.prototype.MULTI_PRESS = 1;
GestureProcessor.prototype.MULTI_RELEASE = 2;
GestureProcessor.prototype.FINAL_RELEASE = 3;

GestureProcessor.prototype.UNKNOWN_ACTION = -1;

GestureProcessor.prototype.SINGLE_TAP = 0;
GestureProcessor.prototype.SWIPE_UP_ONE = 1;
GestureProcessor.prototype.SWIPE_DOWN_ONE = 2;
GestureProcessor.prototype.SWIPE_LEFT_ONE = 3;
GestureProcessor.prototype.SWIPE_RIGHT_ONE = 4;

GestureProcessor.prototype.DOUBLE_TAP = 5;
GestureProcessor.prototype.SWIPE_UP_TWO = 6;
GestureProcessor.prototype.SWIPE_DOWN_TWO = 7;
GestureProcessor.prototype.SWIPE_LEFT_TWO = 8;
GestureProcessor.prototype.SWIPE_RIGHT_TWO = 9;
GestureProcessor.prototype.PINCH_IN_TWO = 10;
GestureProcessor.prototype.PINCH_OUT_TWO = 11;

GestureProcessor.prototype.classifyTouchEvent = function ( inputEvent ) {
    if ( inputEvent.type === "touchstart" && inputEvent.touches.length === 1 ) {
        return GestureProcessor.prototype.FIRST_PRESS;
    } else if ( inputEvent.type === "touchstart" && inputEvent.touches.length >= 2 ) {
        return GestureProcessor.prototype.MULTI_PRESS;
    } else if ( inputEvent.type === "touchend" && inputEvent.touches.length >= 1 ) {
        return GestureProcessor.prototype.MULTI_RELEASE;
    } else if ( inputEvent.type === "touchend" && inputEvent.touches.length === 0 ) {
        return GestureProcessor.prototype.FINAL_RELEASE;
    }
};

GestureProcessor.prototype.determineGesture = function () {
    let totalPoints = this.activePoints.length;

    if ( totalPoints === 1 ) {
        let singlePoint = this.activePoints[0];

        if ( singlePoint.wasBrief(GestureProcessor.prototype.MAX_DURATION_MS) ) {
            if ( singlePoint.isClick() ) {
                return GestureProcessor.prototype.SINGLE_TAP;
            } else if ( singlePoint.isSwipeUp() ) {
                return GestureProcessor.prototype.SWIPE_UP_ONE;
            } else if ( singlePoint.isSwipeDown() ) {
                return GestureProcessor.prototype.SWIPE_DOWN_ONE;
            } else if ( singlePoint.isSwipeLeft() ) {
                return GestureProcessor.prototype.SWIPE_LEFT_ONE;
            } else if ( singlePoint.isSwipeRight() ) {
                return GestureProcessor.prototype.SWIPE_RIGHT_ONE;
            } else {
                return GestureProcessor.prototype.UNKNOWN_ACTION;
            }
        } else {
            return GestureProcessor.prototype.UNKNOWN_ACTION;
        }
    } else if ( totalPoints === 2 ) {
        let firstPoint = this.activePoints[0];
        let secondPoint = this.activePoints[1];

        if ( firstPoint.wasBrief(GestureProcessor.prototype.MAX_DURATION_MS) &&
             secondPoint.wasBrief(GestureProcessor.prototype.MAX_DURATION_MS) ) {

            if ( firstPoint.isClick() &&
                 secondPoint.isClick() ) {

                return GestureProcessor.prototype.DOUBLE_TAP;
            } else if ( firstPoint.isSwipeUp() &&
                        secondPoint.isSwipeUp() ) {

                return GestureProcessor.prototype.SWIPE_UP_TWO;
            } else if ( firstPoint.isSwipeDown() &&
                        secondPoint.isSwipeDown() ) {

                return GestureProcessor.prototype.SWIPE_DOWN_TWO;
            } else if ( firstPoint.isSwipeLeft() &&
                        secondPoint.isSwipeLeft() ) {

                return GestureProcessor.prototype.SWIPE_LEFT_TWO;
            } else if ( firstPoint.isSwipeRight() &&
                        secondPoint.isSwipeRight() ) {

                return GestureProcessor.prototype.SWIPE_RIGHT_TWO;
            } else if ( firstPoint.isPinchIn(secondPoint, this.pixelThreshold) ) {
                return GestureProcessor.prototype.PINCH_IN_TWO;
            } else if ( firstPoint.isPinchOut(secondPoint, this.pixelThreshold) ) {
                return GestureProcessor.prototype.PINCH_OUT_TWO;
            } else {
                return GestureProcessor.prototype.UNKNOWN_ACTION;
            }
        } else {
            return GestureProcessor.prototype.UNKNOWN_ACTION;
        }
    } else {
        return GestureProcessor.prototype.UNKNOWN_ACTION;
    }
};

GestureProcessor.prototype.handleInputEvent = function ( eventData ) {
    let changedTouch = eventData.changedTouches[0];

    let touchId = changedTouch.identifier;
    let currentMs = new Date().getTime();
    let screenCoordX = changedTouch.screenX;
    let screenCoordY = changedTouch.screenY;

    switch ( this.classifyTouchEvent(eventData) ) {
        case GestureProcessor.prototype.FIRST_PRESS:
            this.activePoints = [];

            this.activePoints.push( new InputPoint( touchId,
                                                    currentMs,
                                                    screenCoordX, screenCoordY,
                                                    this.pixelThreshold ) );
            break;
        case GestureProcessor.prototype.MULTI_PRESS:
            this.activePoints.push( new InputPoint( touchId,
                                                    currentMs,
                                                    screenCoordX, screenCoordY,
                                                    this.pixelThreshold ) );
            break;
        case GestureProcessor.prototype.MULTI_RELEASE:
            for ( let idxA = this.activePoints.length - 1; idxA >= 0; idxA-- ) {
                if ( this.activePoints[idxA].getUniqueId() === touchId ) {
                    this.activePoints[idxA].setReleaseTimestamp(currentMs);
                    this.activePoints[idxA].setEndX(screenCoordX);
                    this.activePoints[idxA].setEndY(screenCoordY);
                }
            }
            break;
        case GestureProcessor.prototype.FINAL_RELEASE:
            for ( let idxB = this.activePoints.length - 1; idxB >= 0; idxB-- ) {
                if ( this.activePoints[idxB].getUniqueId() === touchId ) {
                    this.activePoints[idxB].setReleaseTimestamp(currentMs);
                    this.activePoints[idxB].setEndX(screenCoordX);
                    this.activePoints[idxB].setEndY(screenCoordY);
                }
            }

            this.gestureCallback( changedTouch.target, this.determineGesture() );
            break;
    }
};

GestureProcessor.prototype.bindToElement = function ( targetElement ) {
    let selfRef = this;

    targetElement.addEventListener( "touchstart", function ( eventObj ) { selfRef.handleInputEvent(eventObj); }, false );
    targetElement.addEventListener( "touchend", function ( eventObj ) { selfRef.handleInputEvent(eventObj); }, false );
};

//--------------------------------------------------End of GestureProcessor----------------------------------------