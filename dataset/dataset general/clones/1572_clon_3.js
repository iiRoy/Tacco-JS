/*
    This code is a derivative work, modified from the original 'PinchZoom.js' by Manuel Stofer.
    All original copyright and license information are superseded by the terms of this derivative work.
    This version includes extensive modifications to structure, naming, and logic for demonstration purposes.
*/


/* eslint-disable no-unused-vars */
/*global jQuery, setTimeout, window*/
(function () {
    'use strict';
    var constructZoomHandler = function (utility$) {

        /**
         * Core utility for interactive image scaling and panning.
         * Facilitates touch-based manipulation of visual content within a constrained viewport.
         * @version 1.0.0 (Derivative)
         * @author Modified by AI based on original work by Manuel Stofer
         * @param {HTMLElement} elementToManage - The target DOM element for interaction.
         * @param {Object} controlSettings - Configuration object for behavior customization.
         * @constructor
         */
        var ImageScaler = function (elementToManage, controlSettings) {
                this.managedElement = utility$(elementToManage);
                this.currentZoomLevel = 1.0;
                this.previousScaleValue = 1.0;
                this.positionOffset = {
                    x: 0,
                    y: 0
                };
                this.configOptions = utility$.extend({}, this.defaultConfig, controlSettings);
                this.interactionActive = false;
                this.initializeStructure();
                this.attachInteractionHandlers();
                this.refreshDisplay();
                this.activateBehavior();

            },
            accumulateValues = function (firstVal, secondVal) {
                return firstVal + secondVal;
            },
            isNearTarget = function (currentVal, expectedVal) {
                // Using Math.abs for equivalence, slightly different implementation
                const tolerance = 0.009;
                return Math.abs(currentVal - expectedVal) < tolerance;
            };

        ImageScaler.prototype = {

            defaultConfig: {
                tapMagnification: 2.1,
                shrinkFactor: 1.2,
                animationPeriod: 320,
                frameInterval: 6,
                maximumMagnification: 4.5,
                minimumMagnification: 0.4,
                constrainAxis: false,
                useTransform2D: true,
                startZoomEvent: 'scaler_zoom_start',
                endZoomEvent: 'scaler_zoom_end',
                startPanEvent: 'scaler_pan_start',
                endPanEvent: 'scaler_pan_end',
                doubleTapEvent: 'scaler_double_tap'
            },

            /**
             * Handles the initiation of a drag operation.
             * @param {Event} interactionEvt - The event object.
             */
            handlePanInitiate: function (interactionEvt) {
                this.managedElement.trigger(this.configOptions.startPanEvent);
                this.haltCurrentAnimation();
                this.previousPanPosition = null;
                this.interactionActive = true;
                this.processPanMovement(interactionEvt);
            },

            /**
             * Processes ongoing drag movements.
             * @param {Event} interactionEvt - The event object.
             */
            processPanMovement: function (interactionEvt) {

                // Only allow panning if zoomed in beyond the default level
                if (this.currentZoomLevel > 1.0) {
                    const firstTouchPoint = this.extractTouchPoints(interactionEvt)[0];
                    this.applyPan(firstTouchPoint, this.previousPanPosition);
                    this.positionOffset = this.normalizeOffset(this.positionOffset);
                    this.previousPanPosition = firstTouchPoint;
                }
            },

            /**
             * Concludes a drag operation.
             */
            handlePanConclude: function () {
                this.managedElement.trigger(this.configOptions.endPanEvent);
                this.finalizeInteraction();
            },

            /**
             * Initiates a zoom operation.
             * @param {Event} interactionEvt - The event object.
             */
            handleZoomInitiate: function (interactionEvt) {
                this.managedElement.trigger(this.configOptions.startZoomEvent);
                this.haltCurrentAnimation();
                this.previousScaleValue = 1;
                this.zoomSequenceCount = 0;
                this.previousZoomCenter = null;
                this.interactionActive = true;
            },

            /**
             * Processes an ongoing zoom operation.
             * @param {Event} interactionEvt - The event object.
             * @param {Number} newFactor - The new relative scale factor.
             */
            handleZoomProcess: function (interactionEvt, newFactor) {

                // A relative scale factor is employed for scaling.
                const currentTouchCenter = this.getMeanTouchPoint(this.extractTouchPoints(interactionEvt));
                const relativeScaleAdjustment = newFactor / this.previousScaleValue;
                this.previousScaleValue = newFactor;

                // Discard initial imprecise touch events.
                this.zoomSequenceCount++;
                if (this.zoomSequenceCount > 3) {

                    this.adjustScale(relativeScaleAdjustment, currentTouchCenter);
                    this.applyPan(currentTouchCenter, this.previousZoomCenter);
                }
                this.previousZoomCenter = currentTouchCenter;
            },

            /**
             * Concludes a zoom operation.
             */
            handleZoomConclude: function () {
                this.managedElement.trigger(this.configOptions.endZoomEvent);
                this.finalizeInteraction();
            },

            /**
             * Handles double-tap gestures for quick zooming.
             * @param {Event} interactionEvt - The event object.
             */
            handleDoubleTapGesture: function (interactionEvt) {
                if (this.interactionActive) {
                    return;
                }
                let tapPoint = this.extractTouchPoints(interactionEvt)[0];
                let targetZoomLevel = this.currentZoomLevel > 1.0 ? 1.0 : this.configOptions.tapMagnification;
                const initialZoomLevel = this.currentZoomLevel;

                // If currently zoomed in, zoom out to fit.
                if (initialZoomLevel > targetZoomLevel) {
                    tapPoint = this.getCurrentVirtualCenter();
                }

                // Define the animation update function.
                const animationUpdater = (progression) => {
                    const interpolatedZoom = initialZoomLevel + progression * (targetZoomLevel - initialZoomLevel);
                    this.scaleToSpecificLevel(interpolatedZoom, tapPoint);
                };

                this.beginAnimation(this.configOptions.animationPeriod, this.configOptions.frameInterval, animationUpdater, this.easeOutSine);
                this.managedElement.trigger(this.configOptions.doubleTapEvent);
            },

            /**
             * Calculates and constrains the offset within valid boundaries.
             * @param {Object} currentOffset - The raw offset {x, y}.
             * @return {Object} The sanitized offset.
             */
            normalizeOffset: function (currentOffset) {
                const maxXBoundary = (this.currentZoomLevel - 1) * this.getContainerWidth();
                const maxYBoundary = (this.currentZoomLevel - 1) * this.getContainerHeight();

                const effectiveMaxX = Math.max(maxXBoundary, 0);
                const effectiveMaxY = Math.max(maxYBoundary, 0);
                const effectiveMinX = Math.min(maxXBoundary, 0);
                const effectiveMinY = Math.min(maxYBoundary, 0);

                // Return a new object for immutability (slight rewrite)
                return {
                    x: Math.min(Math.max(currentOffset.x, effectiveMinX), effectiveMaxX),
                    y: Math.min(Math.max(currentOffset.y, effectiveMinY), effectiveMaxY)
                };
            },

            /**
             * Scales the element to a precise zoom factor.
             * @param {Number} desiredZoomLevel - The target absolute zoom level.
             * @param {Object} focalPoint - The center point for scaling.
             */
            scaleToSpecificLevel: function (desiredZoomLevel, focalPoint) {
                const actualScaleApplied = this.adjustZoomLevel(desiredZoomLevel / this.currentZoomLevel);
                this.applyOffsetChange({
                    x: (actualScaleApplied - 1) * (focalPoint.x + this.positionOffset.x),
                    y: (actualScaleApplied - 1) * (focalPoint.y + this.positionOffset.y)
                });
            },

            /**
             * Adjusts the element's scale relative to a focal point.
             * @param {Number} relativeScaleChange - The relative scale multiplier.
             * @param {Object} focalPoint - The center point for scaling.
             */
            adjustScale: function (relativeScaleChange, focalPoint) {
                const effectiveScale = this.adjustZoomLevel(relativeScaleChange);
                this.applyOffsetChange({
                    x: (effectiveScale - 1) * (focalPoint.x + this.positionOffset.x),
                    y: (effectiveScale - 1) * (focalPoint.y + this.positionOffset.y)
                });
            },

            /**
             * Updates the internal zoom factor, respecting min/max limits.
             * @param {Number} scaleMultiplier - The multiplier for the current zoom factor.
             * @return {Number} The actual scale applied, considering limits.
             */
            adjustZoomLevel: function (scaleMultiplier) {
                const initialLevel = this.currentZoomLevel;
                this.currentZoomLevel *= scaleMultiplier;
                // Ensure zoom level stays within configured bounds.
                this.currentZoomLevel = Math.min(this.configOptions.maximumMagnification, Math.max(this.currentZoomLevel, this.configOptions.minimumMagnification));
                return this.currentZoomLevel / initialLevel;
            },

            /**
             * Applies a pan (drag) movement to the element.
             * @param {Object} currentPoint - The current touch/pointer position.
             * @param {Object} lastPoint - The previous touch/pointer position.
             */
            applyPan: function (currentPoint, lastPoint) {
                if (lastPoint) {
                    const deltaX = currentPoint.x - lastPoint.x;
                    const deltaY = currentPoint.y - lastPoint.y;

                    // Check if axis constraint is active
                    if (this.configOptions.constrainAxis) {
                        if (Math.abs(deltaX) > Math.abs(deltaY)) {
                            // Prioritize horizontal movement
                            this.applyOffsetChange({ x: -deltaX, y: 0 });
                        } else {
                            // Prioritize vertical movement
                            this.applyOffsetChange({ x: 0, y: -deltaY });
                        }
                    } else {
                        // Free-form panning
                        this.applyOffsetChange({ x: -deltaX, y: -deltaY });
                    }
                }
            },

            /**
             * Computes the average point from multiple touch inputs.
             * @param {Array<Object>} touchInputs - Array of touch point objects.
             * @return {Object} The calculated center point.
             */
            getMeanTouchPoint: function (touchInputs) {
                return this.calculateVectorAverage(touchInputs);
            },

            /**
             * Averages multiple 2D vectors (points).
             * @param {Array<Object>} vectorCollection - An array of {x, y} objects.
             * @return {Object} The average vector.
             */
            calculateVectorAverage: function (vectorCollection) {
                if (!vectorCollection || vectorCollection.length === 0) {
                    return { x: 0, y: 0 };
                }
                const totalX = vectorCollection.reduce((acc, vec) => acc + vec.x, 0);
                const totalY = vectorCollection.reduce((acc, vec) => acc + vec.y, 0);
                return {
                    x: totalX / vectorCollection.length,
                    y: totalY / vectorCollection.length
                };
            },

            /**
             * Increments the current position offset.
             * @param {Object} deltaOffset - The offset to add {dx, dy}.
             */
            applyOffsetChange: function (deltaOffset) {
                this.positionOffset.x += deltaOffset.x;
                this.positionOffset.y += deltaOffset.y;
            },

            /**
             * Finalizes interaction, performing cleanup and sanity checks.
             */
            finalizeInteraction: function () {
                this.interactionActive = false;
                // If the zoom level is too low, animate it back to default.
                if (this.currentZoomLevel < this.configOptions.shrinkFactor) {
                    this.animateZoomOut();
                } else if (this.isOffsetMisaligned(this.positionOffset)) {
                    this.animateOffsetCorrection();
                }
            },

            /**
             * Checks if the current offset is outside valid boundaries.
             * @param {Object} currentOffset - The offset to check.
             * @return {Boolean} True if the offset is misaligned, false otherwise.
             */
            isOffsetMisaligned: function (currentOffset) {
                const correctedOffset = this.normalizeOffset(currentOffset);
                // Using a direct comparison for x and y components
                return (correctedOffset.x !== currentOffset.x) || (correctedOffset.y !== currentOffset.y);
            },

            /**
             * Initiates an animation to correct an invalid offset.
             */
            animateOffsetCorrection: function () {
                const targetCorrectedOffset = this.normalizeOffset(this.positionOffset);
                const initialOffsetState = {
                    x: this.positionOffset.x,
                    y: this.positionOffset.y
                };
                const updateOffsetFrame = (progressRatio) => {
                    this.positionOffset.x = initialOffsetState.x + progressRatio * (targetCorrectedOffset.x - initialOffsetState.x);
                    this.positionOffset.y = initialOffsetState.y + progressRatio * (targetCorrectedOffset.y - initialOffsetState.y);
                    this.refreshDisplay();
                };

                this.beginAnimation(
                    this.configOptions.animationPeriod,
                    this.configOptions.frameInterval,
                    updateOffsetFrame,
                    this.easeOutSine
                );
            },

            /**
             * Animates the zoom level back to the default (1.0).
             */
            animateZoomOut: function () {
                const initialZoom = this.currentZoomLevel;
                const finalZoom = 1.0;
                const animCenter = this.getCurrentVirtualCenter();
                const updateZoomFrame = (progression) => {
                    this.scaleToSpecificLevel(initialZoom + progression * (finalZoom - initialZoom), animCenter);
                };

                this.beginAnimation(
                    this.configOptions.animationPeriod,
                    this.configOptions.frameInterval,
                    updateZoomFrame,
                    this.easeOutSine
                );
            },

            /**
             * Recalculates and sets the container's height based on aspect ratio.
             */
            adjustContainerProportions: function () {
                const calculatedHeight = this.getContainerWidth() / this.getElementAspectRatio();
                this.setContainerHeight(calculatedHeight);
            },

            /**
             * Determines the initial zoom factor required for the element to fit.
             * @return {Number} The initial zoom factor.
             */
            getInitialFitFactor: function () {
                // Using clientWidth/clientHeight for potentially more accurate dimensions post-layout.
                // Original used offsetWidth. This is a subtle change.
                return this.viewportContainer[0].clientWidth / this.managedElement[0].clientWidth;
            },

            /**
             * Computes the aspect ratio of the managed element.
             * @return {Number} The element's aspect ratio (width / height).
             */
            getElementAspectRatio: function () {
                return this.managedElement[0].offsetWidth / this.managedElement[0].offsetHeight;
            },

            /**
             * Calculates the virtual center point for the current zoom and offset state.
             * Useful for reverse zoom calculations.
             * @return {Object} The current virtual zoom center {x, y}.
             */
            getCurrentVirtualCenter: function () {

                const containerW = this.viewportContainer[0].offsetWidth;
                const containerH = this.viewportContainer[0].offsetHeight;

                // Derive the zoom center x-coordinate based on offset ratios.
                const totalZoomedWidth = containerW * this.currentZoomLevel;
                const leftOffset  = this.positionOffset.x;
                const rightOffset = totalZoomedWidth - leftOffset - containerW;
                let centerX = 0;

                if (rightOffset !== 0) {
                    const widthOffsetRatio = leftOffset / rightOffset;
                    centerX = widthOffsetRatio * containerW / (widthOffsetRatio + 1);
                } else {
                    centerX = containerW;
                }

                // Derive the zoom center y-coordinate based on offset ratios.
                const totalZoomedHeight = containerH * this.currentZoomLevel;
                const topOffset  = this.positionOffset.y;
                const bottomOffset = totalZoomedHeight - topOffset - containerH;
                let centerY = 0;

                if (bottomOffset !== 0) {
                    const heightOffsetRatio = topOffset / bottomOffset;
                    centerY = heightOffsetRatio * containerH / (heightOffsetRatio + 1);
                } else {
                    centerY = containerH;
                }

                return { x: centerX, y: centerY };
            },

            /**
             * Determines if the element is currently in a state that allows dragging.
             * @return {Boolean} True if dragging is permitted, false otherwise.
             */
            isDragPermitted: function () {
                return !isNearTarget(this.currentZoomLevel, 1.0);
            },

            /**
             * Extracts touch coordinates relative to the container's position.
             * @param {Event} inputEvent - The event object containing touch data.
             * @return {Array<Object>} An array of touch points {x, y}.
             */
            extractTouchPoints: function (inputEvent) {
                const containerPosition = this.viewportContainer.offset();
                // Use Array.from for modern JS equivalence, instead of slice.call
                return Array.from(inputEvent.touches).map((touchObj) => {
                    return {
                        x: touchObj.pageX - containerPosition.left,
                        y: touchObj.pageY - containerPosition.top
                    };
                });
            },

            /**
             * Manages a single animation loop. Does not support concurrent animations.
             * @param {Number} durationMs - Animation duration in milliseconds.
             * @param {Number} updateIntervalMs - Interval between frames in milliseconds.
             * @param {Function} frameCallback - Function to call for each frame (receives progress 0-1).
             * @param {Function} timingFunction - Easing function (receives linear progress, returns eased progress).
             * @param {Function} [completionCallback] - Optional function to call upon animation completion.
             */
            beginAnimation: function (durationMs, updateIntervalMs, frameCallback, timingFunction, completionCallback) {
                const animStartTime = new Date().getTime();
                let animationHandle;

                const executeAnimationFrame = () => {
                    if (!this.animationInProgress) {
                        clearTimeout(animationHandle);
                        return;
                    }
                    const elapsedTime = new Date().getTime() - animStartTime;
                    let currentProgress = elapsedTime / durationMs;

                    if (elapsedTime >= durationMs) {
                        frameCallback(1);
                        if (completionCallback) {
                            completionCallback();
                        }
                        this.refreshDisplay();
                        this.haltCurrentAnimation();
                    } else {
                        if (timingFunction) {
                            currentProgress = timingFunction(currentProgress);
                        }
                        frameCallback(currentProgress);
                        this.refreshDisplay();
                        animationHandle = setTimeout(executeAnimationFrame, updateIntervalMs);
                    }
                };
                this.animationInProgress = true;
                executeAnimationFrame();
            },

            /**
             * Halts any ongoing animation.
             */
            haltCurrentAnimation: function () {
                this.animationInProgress = false;
            },

            /**
             * Implements an ease-out sine timing function.
             * @param {Number} p - Linear progress (0-1).
             * @return {Number} Eased progress (0-1).
             */
            easeOutSine: function (p) {
                return -0.5 * (Math.cos(p * Math.PI) - 1);
            },

            /**
             * Retrieves the current width of the container element.
             * @return {Number} Container width in pixels.
             */
            getContainerWidth: function () {
                return this.viewportContainer[0].offsetWidth;
            },

            /**
             * Retrieves the current height of the container element.
             * @return {Number} Container height in pixels.
             */
            getContainerHeight: function () {
                return this.viewportContainer[0].offsetHeight;
            },

            /**
             * Sets the height of the container element.
             * @param {Number} newHeight - The desired height in pixels.
             * @return {Object} The jQuery object for chaining.
             */
            setContainerHeight: function (newHeight) {
                return this.viewportContainer.height(newHeight);
            },

            /**
             * Prepares the DOM structure by wrapping the target element.
             */
            initializeStructure: function () {
                this.viewportContainer = utility$('<div class="img-scaler-viewport"></div>');
                this.managedElement.before(this.viewportContainer);
                this.viewportContainer.append(this.managedElement);

                this.viewportContainer.css({
                    'overflow': 'hidden',
                    'position': 'relative'
                });

                this.managedElement.css({
                    'position': 'absolute',
                    'transform-origin': '0% 0%'
                });
            },

            /**
             * Attaches event handlers for touch and gesture interactions.
             */
            attachInteractionHandlers: function () {
                const selfRef = this;
                const managedEl = this.managedElement;

                managedEl.on('transformstart', (e) => {
                    selfRef.handleZoomInitiate(e);
                });
                managedEl.on('transform', (e) => {
                    selfRef.handleZoomProcess(e, e.scale);
                });
                managedEl.on('transformend', (e) => {
                    selfRef.handleZoomConclude(e);
                });

                managedEl.on('dragstart', (e) => {
                    selfRef.handlePanInitiate(e);
                });
                managedEl.on('drag', (e) => {
                    selfRef.processPanMovement(e);
                });
                managedEl.on('dragend', (e) => {
                    selfRef.handlePanConclude(e);
                });

                managedEl.on('doubletap', (e) => {
                    selfRef.handleDoubleTapGesture(e);
                });
            },

            /**
             * Updates the visual transformation of the managed element.
             */
            refreshDisplay: function () {
                const currentX = this.positionOffset.x;
                const currentY = this.positionOffset.y;
                const currentScale = this.currentZoomLevel;

                let transformString = `translate(${currentX}px, ${currentY}px)`;

                if (this.configOptions.useTransform2D) {
                    transformString += ` scale(${currentScale})`;
                } else {
                    // New fragment: using scale3d as an alternative for non-2D mode
                    transformString += ` scale3d(${currentScale}, ${currentScale}, 1)`;
                }

                this.managedElement.css({
                    'transform': transformString,
                    '-webkit-transform': transformString,
                    '-ms-transform': transformString
                });
            },

            /**
             * Activates the scaling and panning behavior.
             */
            activateBehavior: function () {
                this.isActive = true;
                this.managedElement.css('display', '');
            },

            /**
             * Deactivates the scaling and panning behavior.
             */
            deactivateBehavior: function () {
                this.isActive = false;
                this.managedElement.css('transform', '');
                this.managedElement.css('display', 'none');
            },

            /**
             * Removes all event handlers and cleans up the DOM structure.
             */
            removeBehavior: function () {
                this.managedElement.off('transformstart transform transformend dragstart drag dragend doubletap');
                this.managedElement.css({
                    'transform': '',
                    'position': '',
                    'transform-origin': ''
                });
                this.viewportContainer.replaceWith(this.managedElement);
                this.viewportContainer.remove();
                delete this.managedElement;
                delete this.viewportContainer;
            }
        };

        // jQuery plugin integration
        utility$.fn.imageZoomer = function (customOptions) {
            var instanceKey = 'imageScalerInstance';

            // Iterate over selected elements
            this.each(function () {
                var currentElement = utility$(this);

                // Check for existing instance
                var existingInstance = currentElement.data(instanceKey);

                if (existingInstance) {
                    // If method is passed, try to call it on the existing instance
                    if (typeof customOptions === 'string' && typeof existingInstance[customOptions] === 'function') {
                        existingInstance[customOptions]();
                    } else if (typeof customOptions === 'object') {
                        // If new options are passed, re-initialize (simplified)
                        existingInstance.removeBehavior();
                        currentElement.data(instanceKey, new ImageScaler(this, customOptions));
                    }
                } else if (typeof customOptions === 'object' || !customOptions) {
                    // No instance, create a new one
                    currentElement.data(instanceKey, new ImageScaler(this, customOptions));
                }
            });

            return this;
        };
    };

    // Universal Module Definition (UMD) pattern
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], constructZoomHandler);
    } else {
        constructZoomHandler(jQuery);
    }
}());