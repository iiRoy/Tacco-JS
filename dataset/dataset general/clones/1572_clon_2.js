/*
    Original code copyright Manuel Stofer 2013 - rtp.ch - RTP.PinchZoom.js

    This modified version is provided under the same terms and conditions as the original.
    Permission is granted, free of charge, to any individual obtaining a copy
    of this software and associated documentation files (the "Utility"), to deal
    in the Utility without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Utility, and to permit persons to whom the Utility is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Utility.

    THE UTILITY IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE UTILITY OR THE USE OR OTHER DEALINGS IN
    THE UTILITY.
*/
/*global jQuery, console, define, setTimeout, window*/
(function () {
    'use strict';
    var initializeMagnifier = function ($) {

        /**
         * Image magnification component using jQuery
         * @version 0.0.2 (renamed version)
         * @author Manuel Stofer <mst@rtp.ch> (original author)
         * @param targetElement The DOM element to apply magnification to
         * @param componentSettings Configuration options for the magnifier
         * @constructor
         */
        var ImageMagnifier = function (targetElement, componentSettings) {
                this.targetElement = $(targetElement);
                this.magnificationLevel = 1;
                this.previousScale = 1;
                this.currentShift = {
                    x: 0,
                    y: 0
                };
                this.settings = $.extend({}, this.standardSettings, componentSettings);
                this.prepareDomStructure();
                this.attachEventHandlers();
                this.refreshDisplay();
                // Activate the functionality by default.
                this.activateFeature();

            },
            addNumbers = function (n1, n2) {
                return n1 + n2;
            },
            isApproximate = function (valToCheck, expectedVal) {
                return valToCheck > expectedVal - 0.005 && valToCheck < expectedVal + 0.005;
            };

        ImageMagnifier.prototype = {

            standardSettings: {
                tapMagnifyMultiplier: 2,
                shrinkFactor: 1.3,
                transitionDurationMs: 280,
                transitionIntervalMs: 4,
                maximumMagnification: 4,
                minimumMagnification: 0.5,
                constrainMovementAxis: false,
                employ2dTransforms: true, // This setting is currently unused in the logic
                magnifyStartEvent: 'im_start_magnify',
                magnifyEndEvent: 'im_end_magnify',
                panStartEvent: 'im_start_pan',
                panEndEvent: 'im_end_pan',
                doubleTapTrigger: 'im_double_tap'
            },

            /**
             * Handler for the 'pan start' action
             * @param evtObj The event object
             */
            onPanStart: function (evtObj) {
                this.targetElement.trigger(this.settings.panStartEvent);
                this.haltTransitions();
                this.prevPanPosition = false;
                this.isUserInteracting = true;
                this.onPanMove(evtObj);
            },

            /**
             * Handler for the 'pan move' action
             * @param evtObj The event object
             */
            onPanMove: function (evtObj) {

                if (this.magnificationLevel > 1.0) {
                    var contactPoint = this.getRelativeContactPoints(evtObj)[0];
                    this.performPan(contactPoint, this.prevPanPosition);
                    this.currentShift = this.normalizeShift(this.currentShift);
                    this.prevPanPosition = contactPoint;
                }
            },

            /**
             * Handler for the 'pan end' action
             */
            onPanEnd: function () {
                this.targetElement.trigger(this.settings.panEndEvent);
                this.finalizeInteraction();
            },

            /**
             * Handler for the 'magnify start' action
             * @param evtObj The event object
             */
            onMagnifyStart: function (evtObj) {
                this.targetElement.trigger(this.settings.magnifyStartEvent);
                this.haltTransitions();
                this.previousScale = 1;
                this.zoomStepCount = 0;
                this.prevMagnifyCenter = false;
                this.isUserInteracting = true;
            },

            /**
             * Handler for the 'magnify move' action
             * @param evtObj The event object
             * @param incomingScale The new relative scale value
             */
            onMagnifyMove: function (evtObj, incomingScale) {

                // A relative scale factor is utilized here
                var contactCenter = this.calculateContactMidpoint(this.getRelativeContactPoints(evtObj)),
                    scaleValue = incomingScale / this.previousScale;
                this.previousScale = incomingScale;

                // The initial few touch events are often imprecise and are discarded
                this.zoomStepCount += 1;
                if (this.zoomStepCount > 3) {

                    this.adjustMagnification(scaleValue, contactCenter);
                    this.performPan(contactCenter, this.prevMagnifyCenter);
                }
                this.prevMagnifyCenter = contactCenter;
            },

            /**
             * Handler for the 'magnify end' action
             */
            onMagnifyEnd: function () {
                this.targetElement.trigger(this.settings.magnifyEndEvent);
                this.finalizeInteraction();
            },

            /**
             * Handler for the 'double tap' action
             * @param evtObj The event object
             */
            onDoubleTap: function (evtObj) {
                var tapPoint = this.getRelativeContactPoints(evtObj)[0],
                    targetMagnification = this.magnificationLevel > 1 ? 1 : this.settings.tapMagnifyMultiplier,
                    initialMagnification = this.magnificationLevel,
                    updateCallback = (function (animationProgress) {
                        this.adjustMagnificationTo(initialMagnification + animationProgress * (targetMagnification - initialMagnification), tapPoint);
                    }).bind(this);

                if (this.isUserInteracting) {
                    return;
                }
                if (initialMagnification > targetMagnification) {
                    tapPoint = this.getCurrentMagnifyCenter();
                }

                this.runTransition(this.settings.transitionDurationMs, this.settings.transitionIntervalMs, updateCallback, this.easeOutCubic);
                this.targetElement.trigger(this.settings.doubleTapTrigger);
            },

            /**
             * Restricts the offset values to stay within bounds
             * @param inputShift The current offset to sanitize
             * @return {Object} The normalized offset
             */
            normalizeShift: function (inputShift) {
                var maxHorizontalShift = (this.magnificationLevel - 1) * this.getHostWidth(),
                    maxVerticalShift = (this.magnificationLevel - 1) * this.getHostHeight(),
                    boundedMaxX = Math.max(maxHorizontalShift, 0),
                    boundedMaxY = Math.max(maxVerticalShift, 0),
                    boundedMinX = Math.min(maxHorizontalShift, 0),
                    boundedMinY = Math.min(maxVerticalShift, 0);

                return {
                    x: Math.min(Math.max(inputShift.x, boundedMinX), boundedMaxX),
                    y: Math.min(Math.max(inputShift.y, boundedMinY), boundedMaxY)
                };
            },

            /**
             * Adjusts the magnification level to a specific factor (not relative)
             * @param targetMagLevel The desired magnification factor
             * @param centerPoint The point around which to magnify
             */
            adjustMagnificationTo: function (targetMagLevel, centerPoint) {
                this.adjustMagnification(targetMagLevel / this.magnificationLevel, centerPoint);
            },

            /**
             * Adjusts the element's scale from a specified center point
             * @param magnificationRatio The scaling ratio
             * @param centerPoint The center of the scaling operation
             */
            adjustMagnification: function (magnificationRatio, centerPoint) {
                magnificationRatio = this.constrainMagnificationFactor(magnificationRatio);
                this.applyShift({
                    x: (magnificationRatio - 1) * (centerPoint.x + this.currentShift.x),
                    y: (magnificationRatio - 1) * (centerPoint.y + this.currentShift.y)
                });
            },

            /**
             * Scales the magnification level relative to its current state
             * @param newRatio The proposed scaling ratio
             * @return The actual scaling ratio applied (can differ due to max/min magnification limits)
             */
            constrainMagnificationFactor: function (newRatio) {
                var initialMagLevel = this.magnificationLevel;
                this.magnificationLevel *= newRatio;
                this.magnificationLevel = Math.min(this.settings.maximumMagnification, Math.max(this.magnificationLevel, this.settings.minimumMagnification));
                return this.magnificationLevel / initialMagLevel;
            },

            /**
             * Moves the element by panning
             * @param currentCenter Current contact point center
             * @param previousCenter Previous contact point center
             */
            performPan: function (currentCenter, previousCenter) {
                if (previousCenter) {
                  if(this.settings.constrainMovementAxis) {
                    // Lock movement to the axis with the largest change
                    if(Math.abs(currentCenter.x - previousCenter.x) > Math.abs(currentCenter.y - previousCenter.y)) {
                      this.applyShift({
                        x: -(currentCenter.x - previousCenter.x),
                        y: 0
                      });
                    }
                    else {
                      this.applyShift({
                        y: -(currentCenter.y - previousCenter.y),
                        x: 0
                      });
                    }
                  }
                  else {
                    this.applyShift({
                      y: -(currentCenter.y - previousCenter.y),
                      x: -(currentCenter.x - previousCenter.x)
                    });
                  }
                }
            },

            /**
             * Computes the central point of multiple touch contacts
             * @param contactPoints An array of touch points
             * @return {Object} The calculated center coordinates
             */
            calculateContactMidpoint: function (contactPoints) {
                return this.averageVectors(contactPoints);
            },

            /**
             * Computes the average of multiple vector coordinates (x, y values)
             * @param vectorList An array of vector objects
             * @return {Object} The averaged vector
             */
            averageVectors: function (vectorList) {
                return {
                    x: vectorList.map(function (vec) { return vec.x; }).reduce(addNumbers) / vectorList.length,
                    y: vectorList.map(function (vec) { return vec.y; }).reduce(addNumbers) / vectorList.length
                };
            },

            /**
             * Applies an additional shift to the current offset
             * @param shiftDelta The offset to add
             * @return {boolean} True if the offset change was accepted
             */
            applyShift: function (shiftDelta) {
                this.currentShift = {
                    x: this.currentShift.x + shiftDelta.x,
                    y: this.currentShift.y + shiftDelta.y
                };
            },

            /**
             * Corrects the element's position if it's out of bounds or too small
             */
            correctPosition: function () {
                if (this.magnificationLevel < this.settings.shrinkFactor) {
                    this.shrinkToFitAnimation();
                } else if (this.isShiftOutOfBounds(this.currentShift)) {
                    this.correctShiftAnimation();
                }
            },

            /**
             * Determines if the current offset is invalid for the current magnification level
             * @param currentShift The offset to check
             * @return {boolean} True if the offset is out of bounds
             */
            isShiftOutOfBounds: function (currentShift) {
                var normalizedShift = this.normalizeShift(currentShift);
                return normalizedShift.x !== currentShift.x ||
                    normalizedShift.y !== currentShift.y;
            },

            /**
             * Initiates an animation to move to a valid offset
             */
            correctShiftAnimation: function () {
                var desiredShift = this.normalizeShift(this.currentShift),
                    beginningShift = {
                        x: this.currentShift.x,
                        y: this.currentShift.y
                    },
                    updateCallback = (function (animationProgress) {
                        this.currentShift.x = beginningShift.x + animationProgress * (desiredShift.x - beginningShift.x);
                        this.currentShift.y = beginningShift.y + animationProgress * (desiredShift.y - beginningShift.y);
                        this.refreshDisplay();
                    }).bind(this);

                this.runTransition(
                    this.settings.transitionDurationMs,
                    this.settings.transitionIntervalMs,
                    updateCallback,
                    this.easeOutCubic
                );
            },

            /**
             * Animates the element back to its original position (no offset, magnification level 1)
             */
            shrinkToFitAnimation: function () {
                var initialMagnification = this.magnificationLevel,
                    targetMagnification = 1,
                    centerPoint = this.getCurrentMagnifyCenter(),
                    updateCallback = (function (animationProgress) {
                        this.adjustMagnificationTo(initialMagnification + animationProgress * (targetMagnification - initialMagnification), centerPoint);
                    }).bind(this);

                this.runTransition(
                    this.settings.transitionDurationMs,
                    this.settings.transitionIntervalMs,
                    updateCallback,
                    this.easeOutCubic
                );
            },

            /**
             * Recalculates and updates the aspect ratio of the container
             */
            recalculateProportions: function () {
                this.setHostHeight(this.getHostWidth() / this.getImageProportion());
            },

            /**
             * Computes the initial magnification factor required for the element to fit within its container
             * @return The initial magnification factor
             */
            getInitialMagnification: function () {
                // Using .offsetWidth instead of width() because jQuery-width() returns original width
                // while Zepto-width() computes width including transforms. Similar for height().
                return this.hostContainer[0].offsetWidth / this.targetElement[0].offsetWidth;
            },

            /**
             * Computes the aspect ratio of the target element
             * @return The aspect ratio (width / height)
             */
            getImageProportion: function () {
                return this.targetElement[0].offsetWidth / this.targetElement[0].offsetHeight;
            },

            /**
             * Computes the virtual center for magnification based on current offset and level
             * (useful for reverse magnification calculations)
             * @return {Object} The current magnification center coordinates
             */
            getCurrentMagnifyCenter: function () {

                // Calculates the magnify center X-value using the formula:
                // shift_left / shift_right = center_x / (container_width - center_x)
                var contentWidth = this.hostContainer[0].offsetWidth * this.magnificationLevel,
                    leftShiftAmount  = this.currentShift.x,
                    rightShiftAmount = contentWidth - leftShiftAmount - this.hostContainer[0].offsetWidth,
                    horizontalRatio = leftShiftAmount / rightShiftAmount,
                    centerPosX = horizontalRatio * this.hostContainer[0].offsetWidth / (horizontalRatio + 1),

                // The same logic applies for the Y-axis
                    contentHeight = this.hostContainer[0].offsetHeight * this.magnificationLevel,
                    topShiftAmount  = this.currentShift.y,
                    bottomShiftAmount = contentHeight - topShiftAmount - this.hostContainer[0].offsetHeight,
                    verticalRatio = topShiftAmount / bottomShiftAmount,
                    centerPosY = verticalRatio * this.hostContainer[0].offsetHeight / (verticalRatio + 1);

                // Prevents division by zero errors
                if (rightShiftAmount === 0) { centerPosX = this.hostContainer[0].offsetWidth; }
                if (bottomShiftAmount === 0) { centerPosY = this.hostContainer[0].offsetHeight; }

                return {
                    x: centerPosX,
                    y: centerPosY
                };
            },

            /**
             * Checks if the element can currently be panned
             * @return {boolean} True if panning is possible
             */
            isPannable: function () {
                return !isApproximate(this.magnificationLevel, 1);
            },

            /**
             * Retrieves touch points from an event, relative to the container's offset
             * @param evtObj The event object
             * @return An array of touch point objects
             */
            getRelativeContactPoints: function (evtObj) {
                var containerPosition = this.hostContainer.offset();
                return Array.prototype.slice.call(evtObj.touches).map(function (rawTouch) {
                    return {
                        x: rawTouch.pageX - containerPosition.left,
                        y: rawTouch.pageY - containerPosition.top
                    };
                });
            },

            /**
             * Manages an animation loop
             * Note: This implementation does not support concurrent animations
             * @param animationDurationMs Total duration of the animation in milliseconds
             * @param frameIntervalMs Interval between frames in milliseconds
             * @param frameUpdateFunction Function to call for each frame update
             * @param timingFunction Optional easing function for progress calculation
             * @param onCompleteCallback Optional callback to execute upon animation completion
             */
            runTransition: function (animationDurationMs, frameIntervalMs, frameUpdateFunction, timingFunction, onCompleteCallback) {
                var animationStartTime = new Date().getTime(),
                    renderNextFrame = (function () {
                        if (!this.isAnimating) { return; } // Stop if animation flag is off
                        var elapsedTime = new Date().getTime() - animationStartTime,
                            animationProgress = elapsedTime / animationDurationMs;
                        if (elapsedTime >= animationDurationMs) {
                            frameUpdateFunction(1); // Ensure final state is reached
                            if (onCompleteCallback) {
                                onCompleteCallback();
                            }
                            this.refreshDisplay();
                            this.endCurrentTransition();
                            this.refreshDisplay(); // Final display refresh
                        } else {
                            if (timingFunction) {
                                animationProgress = timingFunction(animationProgress);
                            }
                            frameUpdateFunction(animationProgress);
                            this.refreshDisplay();
                            setTimeout(renderNextFrame, frameIntervalMs);
                        }
                    }).bind(this);
                this.isAnimating = true;
                renderNextFrame();
            },

            /**
             * Halts any ongoing animation
             */
            endCurrentTransition: function () {
                this.isAnimating = false;
            },

            /**
             * Cubic easing function for animations (swing equivalent)
             * @param progressValue Normalized progress (0 to 1)
             * @return {Number} Eased progress value
             */
            easeOutCubic: function (progressValue) {
                return -Math.cos(progressValue * Math.PI) / 2  + 0.5;
            },

            /**
             * Retrieves the width of the host container
             * @return {number} Container width
             */
            getHostWidth: function () {
                return this.hostContainer[0].offsetWidth;
            },

            /**
             * Retrieves the height of the host container
             * @return {number} Container height
             */
            getHostHeight: function () {
                return this.hostContainer[0].offsetHeight;
            },

            /**
             * Sets the height of the host container
             * @param newHeight The desired height
             * @return The updated container object
             */
            setHostHeight: function (newHeight) {
                return this.hostContainer.height(newHeight);
            },

            /**
             * Creates the necessary HTML structure for the magnifier
             */
            constructDomElements: function () {
                this.hostContainer = $('<div class="magnifier-wrapper-div"></div>');
                this.targetElement.before(this.hostContainer);
                this.hostContainer.append(this.targetElement);

                this.hostContainer.css({
                    'overflow': 'hidden',
                    'position': 'relative'
                });
                this.targetElement.css({
                    'webkit-transform-origin': '0 0',
                    'moz-transform-origin': '0 0',
                    'ms-transform-origin': '0 0',
                    'o-transform-origin': '0 0',
                    'transform-origin': '0 0',
                    'position': 'absolute'
                });
            },

            /**
             * Attaches necessary event listeners
             */
            attachEventHandlers: function () {
                var selfRef = this,
                    startX = 0,
                    startY = 0,
                    lastTapTime = 0,
                    multipleTouchDelay = 200, // Time in ms to differentiate single tap from double tap
                    lastTouchEnd = null,
                    isTwoFingerGesture = false,
                    isDragging = false,
                    isZooming = false;

                this.targetElement.on('touchstart', function (evtObj) {
                    var touchesCount = evtObj.touches.length;
                    if (touchesCount === 2) {
                        isTwoFingerGesture = true;
                        selfRef.onMagnifyStart(evtObj);
                    } else if (touchesCount === 1) {
                        isDragging = true;
                        selfRef.onPanStart(evtObj);
                    }
                });

                this.targetElement.on('touchmove', function (evtObj) {
                    var touchesCount = evtObj.touches.length;
                    if (touchesCount === 2 && isTwoFingerGesture) {
                        isZooming = true;
                        selfRef.onMagnifyMove(evtObj, selfRef.getTouchesDistance(evtObj));
                    } else if (touchesCount === 1 && isDragging) {
                        selfRef.onPanMove(evtObj);
                    }
                    if (isZooming || isDragging) {
                        evtObj.preventDefault();
                    }
                });

                this.targetElement.on('touchend', function (evtObj) {
                    if (isZooming) {
                        selfRef.onMagnifyEnd(evtObj);
                    }
                    if (isDragging) {
                        selfRef.onPanEnd(evtObj);
                    }

                    if (selfRef.isUserInteracting) {
                        selfRef.isUserInteracting = false;
                        selfRef.correctPosition();
                    }

                    var currentTime = new Date().getTime();
                    if (lastTouchEnd && (currentTime - lastTouchEnd < multipleTouchDelay)) {
                        selfRef.onDoubleTap(evtObj);
                    }
                    lastTouchEnd = currentTime;

                    isTwoFingerGesture = false;
                    isDragging = false;
                    isZooming = false;
                });
            },

            /**
             * Computes the distance between two touch points
             * @param evtObj The event object containing touch data
             * @return {number} The distance
             */
            getTouchesDistance: function (evtObj) {
                var touch1 = evtObj.touches[0],
                    touch2 = evtObj.touches[1];
                return Math.sqrt(
                    Math.pow(touch2.pageX - touch1.pageX, 2) +
                    Math.pow(touch2.pageY - touch1.pageY, 2)
                );
            },

            /**
             * Finalizes an interaction, performing necessary cleanup
             */
            finalizeInteraction: function () {
                this.isUserInteracting = false;
                this.correctPosition();
            },

            /**
             * Refreshes the display by applying current transforms
             */
            refreshDisplay: function () {
                var transformStr = 'scale(' + this.magnificationLevel + ',' + this.magnificationLevel + ')' +
                    ' translate3d(' + this.currentShift.x + 'px,' + this.currentShift.y + 'px,0px)';
                this.targetElement.css({
                    '-webkit-transform': transformStr,
                    '-moz-transform': transformStr,
                    '-ms-transform': transformStr,
                    '-o-transform': transformStr,
                    'transform': transformStr
                });
            },

            /**
             * Activates the magnification feature
             */
            activateFeature: function () {
                this.magnificationLevel = this.getInitialMagnification();
                this.refreshDisplay();
            },

            /**
             * Disables the magnification feature (resets to default)
             */
            deactivateFeature: function () {
                this.magnificationLevel = 1;
                this.refreshDisplay();
            }
        };

        // If jQuery is available, register the plugin
        $.fn.imageMagnifier = function (configOptions) {
            return this.each(function () {
                new ImageMagnifier(this, configOptions);
            });
        };

        return ImageMagnifier;
    };

    // Universal Module Definition (UMD) pattern
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], initializeMagnifier); // AMD module
    } else {
        initializeMagnifier(window.jQuery); // Browser global
    }
})();