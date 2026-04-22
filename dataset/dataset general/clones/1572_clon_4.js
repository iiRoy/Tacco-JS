/* This code implements a content magnification and panning utility.
   It provides similar functionality to the original PinchZoom.js,
   but uses entirely different syntax, variable names, and implementation strategies.
   It avoids jQuery and relies purely on native DOM APIs and modern JavaScript features. */

(function () {
    'use strict';

    // --- Helper Constants and Utilities ---
    const DEFAULTS_FOR_MAGNIFIER = {
        tapScaleMultiplier: 2,
        scaleDownThreshold: 1.3,
        animationSmoothness: 300, // Milliseconds for animation duration
        maxPossibleScale: 4,
        minPossibleScale: 0.5,
        restrictDragToMainAxis: false,
        // Event names for custom DOM events
        scaleStartEvent: 'mc_scale_start',
        scaleEndEvent: 'mc_scale_end',
        panStartEvent: 'mc_pan_start',
        panEndEvent: 'mc_pan_end',
        doubleTapEvent: 'mc_double_tap_detected'
    };

    // Accumulates numbers in an array (e.g., for sum)
    const sumAllNumbers = (previousValue, currentValue) => previousValue + currentValue;

    // Checks if two numeric values are approximately equal within a small tolerance
    const checkApproximateEquality = (valueA, valueB, tolerance = 0.01) => Math.abs(valueA - valueB) < tolerance;

    // Standard 'swing' easing function for animations
    const animationEaseFunction = (progressRatio) => -Math.cos(progressRatio * Math.PI) / 2 + 0.5;

    /**
     * Controls magnification and panning for a given HTML element.
     */
    class ViewportManipulator {
        constructor(mainContentElement, userConfiguration) {
            if (!(mainContentElement instanceof HTMLElement)) {
                console.error('ViewportManipulator: Provided element is not a valid HTMLElement.');
                return; // Or throw an error
            }

            this._contentNode = mainContentElement;
            this._viewportWrapper = null; // This will be the parent container
            this._operationalSettings = Object.assign({}, DEFAULTS_FOR_MAGNIFIER, userConfiguration);

            this._currentMagnification = 1;
            this._currentOffset = { x: 0, y: 0 }; // Corresponds to translateX/Y values

            this._lastDistanceBetweenPointers = 1; // Used for relative scaling
            this._lastSinglePointerPosition = null; // Used for dragging
            this._multiPointerGestureOrigin = null; // Center point for scaling
            this._pointerInteractionCount = 0; // Number of touch/pointer events processed in current gesture
            this._isInteracting = false; // Flag to indicate active gesture
            this._activeAnimationFrameHandle = null; // For requestAnimationFrame management
            this._animationStartTimestamp = null; // For tracking animation progress

            this._setupDOMStructure();
            this._attachInteractionHandlers();
            this._updateContentVisuals();
        }

        /**
         * Prepares the DOM by wrapping the content element and applying initial styles.
         */
        _setupDOMStructure() {
            const tempWrapper = document.createElement('div');
            tempWrapper.className = 'viewport-manipulator-container';
            tempWrapper.style.overflow = 'hidden';
            tempWrapper.style.position = 'relative'; // Important for positioning context

            this._contentNode.parentNode.insertBefore(tempWrapper, this._contentNode);
            tempWrapper.appendChild(this._contentNode);
            this._viewportWrapper = tempWrapper;

            this._contentNode.style.transformOrigin = '0 0'; // Scale from top-left by default
            this._contentNode.style.willChange = 'transform'; // Performance hint for browsers
            this._contentNode.style.touchAction = 'none'; // Prevent default browser touch actions
        }

        /**
         * Binds touch/pointer event listeners to the wrapper element.
         */
        _attachInteractionHandlers() {
            // Store bound functions to allow easy removal later if a disable method were needed
            this._boundOnGestureStart = this._onGestureStart.bind(this);
            this._boundOnGestureMove = this._onGestureMove.bind(this);
            this._boundOnGestureEnd = this._onGestureEnd.bind(this);
            this._boundOnDoubleTap = this._onDoubleTap.bind(this);

            this._viewportWrapper.addEventListener('touchstart', this._boundOnGestureStart, { passive: false });
            this._viewportWrapper.addEventListener('touchmove', this._boundOnGestureMove, { passive: false });
            this._viewportWrapper.addEventListener('touchend', this._boundOnGestureEnd);
            this._viewportWrapper.addEventListener('touchcancel', this._boundOnGestureEnd);
            this._viewportWrapper.addEventListener('dblclick', this._boundOnDoubleTap);
        }

        /**
         * Handler for the start of a touch/pointer gesture.
         * @param {TouchEvent} evt
         */
        _onGestureStart(evt) {
            evt.preventDefault(); // Prevent default browser actions like scrolling/zooming
            this._dispatchInternalEvent(this._operationalSettings.panStartEvent);
            this._dispatchInternalEvent(this._operationalSettings.scaleStartEvent);

            this._haltCurrentAnimation();
            this._lastDistanceBetweenPointers = 1;
            this._pointerInteractionCount = 0;
            this._multiPointerGestureOrigin = null;
            this._lastSinglePointerPosition = null;
            this._isInteracting = true; // Mark interaction as active
            this._processPointerInput(evt);
        }

        /**
         * Handler for touch/pointer movement during a gesture.
         * @param {TouchEvent} evt
         */
        _onGestureMove(evt) {
            evt.preventDefault();
            if (!this._isInteracting) return;
            this._processPointerInput(evt);
        }

        /**
         * Handler for the end of a touch/pointer gesture.
         */
        _onGestureEnd() {
            this._dispatchInternalEvent(this._operationalSettings.panEndEvent);
            this._dispatchInternalEvent(this._operationalSettings.scaleEndEvent);
            this._isInteracting = false; // Mark interaction as inactive

            this._normalizeContentPosition(); // Snap to valid position if out of bounds
            this._resetMagnificationIfTooSmall(); // Zoom out if below threshold
        }

        /**
         * Handler for a double-tap event.
         * @param {MouseEvent} evt
         */
        _onDoubleTap(evt) {
            if (this._isInteracting) return;
            this._dispatchInternalEvent(this._operationalSettings.doubleTapEvent);

            const tapCoordinates = this._getRelativePointerCoordinates(evt)[0];
            // Toggle between default scale (1) and tap scale multiplier
            const targetMagnification = checkApproximateEquality(this._currentMagnification, 1)
                ? this._operationalSettings.tapScaleMultiplier
                : 1;

            let effectiveScaleOrigin = tapCoordinates;

            // If scaling out, determine the center of the current view as the origin
            if (this._currentMagnification > targetMagnification) {
                effectiveScaleOrigin = this._calculateCurrentViewCenter();
            }

            const initialMagnification = this._currentMagnification;
            const magnificationDelta = targetMagnification - initialMagnification;

            this._startAnimation(
                this._operationalSettings.animationSmoothness,
                (progress) => {
                    this._applyScaleTransformation(initialMagnification + progress * magnificationDelta, effectiveScaleOrigin);
                },
                animationEaseFunction
            );
        }

        /**
         * Processes the current touch/pointer input to determine if it's a drag or zoom.
         * @param {TouchEvent} evt
         */
        _processPointerInput(evt) {
            const pointerPoints = this._getRelativePointerCoordinates(evt);

            if (pointerPoints.length >= 2) { // Multi-touch: likely a zoom gesture
                const currentDistance = this._calculatePointDistance(pointerPoints[0], pointerPoints[1]);
                const currentCentroid = this._calculatePointCentroid(pointerPoints);

                this._pointerInteractionCount++;
                // Ignore initial imprecise touch events
                if (this._pointerInteractionCount > 3) {
                    const scaleRatio = currentDistance / this._lastDistanceBetweenPointers;
                    this._applyScaleTransformation(this._currentMagnification * scaleRatio, currentCentroid);
                    this._applyTranslationShift(currentCentroid, this._multiPointerGestureOrigin);
                }
                this._lastDistanceBetweenPointers = currentDistance;
                this._multiPointerGestureOrigin = currentCentroid;
            } else if (pointerPoints.length === 1 && this._currentMagnification > 1) { // Single touch: likely a drag gesture (only if content is magnified)
                this._applyTranslationShift(pointerPoints[0], this._lastSinglePointerPosition);
                this._lastSinglePointerPosition = pointerPoints[0];
            }
        }

        /**
         * Converts touch/pointer coordinates to be relative to the viewport wrapper.
         * @param {Event} evt
         * @returns {Array<Object>} Array of {x, y} coordinates.
         */
        _getRelativePointerCoordinates(evt) {
            const wrapperRect = this._viewportWrapper.getBoundingClientRect();
            const rawPointers = evt.touches ? Array.from(evt.touches) : [evt]; // Handle both TouchEvent and MouseEvent/PointerEvent

            return rawPointers.map(p => ({
                x: p.clientX - wrapperRect.left,
                y: p.clientY - wrapperRect.top
            }));
        }

        /**
         * Calculates the Euclidean distance between two points.
         * @param {Object} p1 - First point {x, y}.
         * @param {Object} p2 - Second point {x, y}.
         * @returns {Number} Distance.
         */
        _calculatePointDistance(p1, p2) {
            return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        }

        /**
         * Calculates the centroid (average) of multiple points.
         * @param {Array<Object>} points - Array of {x, y} points.
         * @returns {Object} Centroid point {x, y}.
         */
        _calculatePointCentroid(points) {
            if (points.length === 0) return { x: 0, y: 0 };
            const totalX = points.map(p => p.x).reduce(sumAllNumbers, 0);
            const totalY = points.map(p => p.y).reduce(sumAllNumbers, 0);
            return {
                x: totalX / points.length,
                y: totalY / points.length
            };
        }

        /**
         * Applies a new scale factor to the content, adjusting its position to keep the `originPoint` stable.
         * @param {Number} newDesiredMagnification - The target magnification level.
         * @param {Object} originPoint - The point {x, y} in viewport coordinates that should remain fixed during scaling.
         */
        _applyScaleTransformation(newDesiredMagnification, originPoint) {
            const oldMagnification = this._currentMagnification;
            // Clamp the new magnification within min/max bounds
            this._currentMagnification = Math.min(
                this._operationalSettings.maxPossibleScale,
                Math.max(newDesiredMagnification, this._operationalSettings.minPossibleScale)
            );

            const actualScaleChange = this._currentMagnification / oldMagnification;

            // Adjust offset to keep the origin point fixed relative to the viewport
            this._currentOffset.x += (actualScaleChange - 1) * (originPoint.x + this._currentOffset.x);
            this._currentOffset.y += (actualScaleChange - 1) * (originPoint.y + this._currentOffset.y);

            this._updateContentVisuals();
        }

        /**
         * Shifts the content based on pointer movement.
         * @param {Object} currentPoint - Current pointer position {x, y}.
         * @param {Object} previousPoint - Previous pointer position {x, y}.
         */
        _applyTranslationShift(currentPoint, previousPoint) {
            if (!previousPoint) return;

            let deltaX = currentPoint.x - previousPoint.x;
            let deltaY = currentPoint.y - previousPoint.y;

            if (this._operationalSettings.restrictDragToMainAxis) {
                // If axis restriction is enabled, move only along the axis with larger displacement
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    this._currentOffset.x -= deltaX;
                } else {
                    this._currentOffset.y -= deltaY;
                }
            } else {
                this._currentOffset.x -= deltaX;
                this._currentOffset.y -= deltaY;
            }
            this._updateContentVisuals();
        }

        /**
         * Constrains the given translation vector to keep the content within viewport bounds.
         * @param {Object} proposedOffset - The translation vector {x, y} to constrain.
         * @returns {Object} The constrained translation vector.
         */
        _constrainTranslation(proposedOffset) {
            const viewportWidth = this._viewportWrapper.offsetWidth;
            const viewportHeight = this._viewportWrapper.offsetHeight;

            // Calculate the maximum negative shift (how far left/up the content can go)
            // (currentScale - 1) * viewportDimension gives the total extra visible content space.
            // A shift of -X means the content has moved X pixels to the left.
            const maxNegativeShiftX = Math.max(0, (this._currentMagnification - 1) * viewportWidth);
            const maxNegativeShiftY = Math.max(0, (this._currentMagnification - 1) * viewportHeight);

            const minAllowedX = -maxNegativeShiftX;
            const maxAllowedX = 0; // Content cannot be shifted positively (to the right) beyond its original position
            const minAllowedY = -maxNegativeShiftY;
            const maxAllowedY = 0; // Content cannot be shifted positively (down) beyond its original position

            return {
                x: Math.min(maxAllowedX, Math.max(minAllowedX, proposedOffset.x)),
                y: Math.min(maxAllowedY, Math.max(minAllowedY, proposedOffset.y))
            };
        }

        /**
         * Checks if the current offset is outside the allowed bounds.
         * @returns {Boolean} True if the offset is unconstrained, false otherwise.
         */
        _isOffsetUnconstrained() {
            const constrainedOffset = this._constrainTranslation(this._currentOffset);
            return constrainedOffset.x !== this._currentOffset.x || constrainedOffset.y !== this._currentOffset.y;
        }

        /**
         * Animates the content back to a valid position if it's currently out of bounds.
         */
        _normalizeContentPosition() {
            if (this._isOffsetUnconstrained()) {
                const targetOffset = this._constrainTranslation(this._currentOffset);
                const startingOffset = Object.assign({}, this._currentOffset); // Create a copy

                this._startAnimation(
                    this._operationalSettings.animationSmoothness,
                    (progress) => {
                        this._currentOffset.x = startingOffset.x + progress * (targetOffset.x - startingOffset.x);
                        this._currentOffset.y = startingOffset.y + progress * (targetOffset.y - startingOffset.y);
                        this._updateContentVisuals();
                    },
                    animationEaseFunction
                );
            }
        }

        /**
         * Animates the content back to a scale of 1 if the current magnification is below the threshold.
         */
        _resetMagnificationIfTooSmall() {
            if (this._currentMagnification < this._operationalSettings.scaleDownThreshold) {
                const initialMagnification = this._currentMagnification;
                const targetMagnification = 1;
                // For scaling back to 1, we typically want the center of the viewport to be the effective origin
                const origin = this._calculateCurrentViewCenter();

                this._startAnimation(
                    this._operationalSettings.animationSmoothness,
                    (progress) => {
                        this._applyScaleTransformation(initialMagnification + progress * (targetMagnification - initialMagnification), origin);
                    },
                    animationEaseFunction
                );
            }
        }

        /**
         * Calculates the current center of the viewport relative to the content,
         * used as an effective origin for scaling operations (e.g., zoom out).
         * This calculation ensures that when scaling back to 1, the content appears centered or in a natural position.
         * @returns {Object} The calculated center point {x, y} in viewport coordinates.
         */
        _calculateCurrentViewCenter() {
            const viewportWidth = this._viewportWrapper.offsetWidth;
            const viewportHeight = this._viewportWrapper.offsetHeight;

            // The content's virtual width/height at current scale
            const contentEffectiveWidth = viewportWidth * this._currentMagnification;
            const contentEffectiveHeight = viewportHeight * this._currentMagnification;

            // `_currentOffset.x` is `translateX`. If negative, content is shifted left.
            // `offsetLeft` is the distance from the left edge of the content to the left edge of the viewport.
            // So, `offsetLeft = -_currentOffset.x`.
            const offsetLeft = -this._currentOffset.x;
            const offsetRight = contentEffectiveWidth - offsetLeft - viewportWidth;

            const offsetTop = -this._currentOffset.y;
            const offsetBottom = contentEffectiveHeight - offsetTop - viewportHeight;

            let centerX = 0;
            if (offsetLeft === 0 && offsetRight === 0) { // Content perfectly fits horizontally
                centerX = viewportWidth / 2;
            } else if (offsetRight === 0) { // Content is all the way to the right
                centerX = viewportWidth;
            } else {
                const widthOffsetRatio = offsetLeft / offsetRight;
                centerX = (widthOffsetRatio * viewportWidth) / (widthOffsetRatio + 1);
            }

            let centerY = 0;
            if (offsetTop === 0 && offsetBottom === 0) { // Content perfectly fits vertically
                centerY = viewportHeight / 2;
            } else if (offsetBottom === 0) { // Content is all the way to the bottom
                centerY = viewportHeight;
            } else {
                const heightOffsetRatio = offsetTop / offsetBottom;
                centerY = (heightOffsetRatio * viewportHeight) / (heightOffsetRatio + 1);
            }

            return { x: centerX, y: centerY };
        }


        /**
         * Applies the current magnification and offset values as a CSS transform to the content element.
         */
        _updateContentVisuals() {
            const xVal = this._currentOffset.x;
            const yVal = this._currentOffset.y;
            const scaleVal = this._currentMagnification;

            // The original uses translate3d/scale3d regardless of a 'use2d' option.
            // So, we stick to 3D transforms for consistency and potential performance benefits.
            this._contentNode.style.transform = `translate3d(${xVal}px, ${yVal}px, 0) scale3d(${scaleVal}, ${scaleVal}, 1)`;
        }

        /**
         * Initiates a smooth animation using requestAnimationFrame.
         * @param {Number} duration - Total animation duration in milliseconds.
         * @param {Function} frameUpdateCallback - Function called on each animation frame with progress (0-1).
         * @param {Function} easingFunc - Easing function (e.g., animationEaseFunction) to apply to progress.
         */
        _startAnimation(duration, frameUpdateCallback, easingFunc = (p) => p) {
            this._haltCurrentAnimation(); // Stop any ongoing animation
            this._animationStartTimestamp = performance.now();
            let isActive = true; // Internal flag for this specific animation instance

            const animateFrame = (currentTime) => {
                if (!isActive) return; // If this animation instance was stopped

                const elapsedTime = currentTime - this._animationStartTimestamp;
                let progress = elapsedTime / duration;

                if (progress >= 1) {
                    frameUpdateCallback(1); // Ensure the final state is set precisely
                    isActive = false;
                    this._activeAnimationFrameHandle = null;
                    this._updateContentVisuals(); // Final visual update
                    return;
                }

                const easedProgress = easingFunc(progress);
                frameUpdateCallback(easedProgress);
                this._activeAnimationFrameHandle = requestAnimationFrame(animateFrame);
            };

            this._activeAnimationFrameHandle = requestAnimationFrame(animateFrame);
        }

        /**
         * Stops any currently running animation.
         */
        _haltCurrentAnimation() {
            if (this._activeAnimationFrameHandle) {
                cancelAnimationFrame(this._activeAnimationFrameHandle);
                this._activeAnimationFrameHandle = null;
            }
            this._animationStartTimestamp = null;
        }

        /**
         * Dispatches a custom event from the viewport wrapper.
         * @param {String} eventName - The name of the custom event.
         */
        _dispatchInternalEvent(eventName) {
            this._viewportWrapper.dispatchEvent(new CustomEvent(eventName, {
                bubbles: true,
                detail: {
                    scale: this._currentMagnification,
                    offset: Object.assign({}, this._currentOffset)
                }
            }));
        }

        // --- Public API (Example methods, not explicitly required by clone task but good practice) ---
        // These are not directly used in the provided original snippet for internal logic,
        // so their implementation is omitted to keep the clone focused on the provided code's functionality.
        // disable() { /* ... */ }
        // enable() { /* ... */ }
        // setMagnification(scale, center) { /* ... */ }
        // setOffset(x, y) { /* ... */ }
    }

    // Expose the class globally or via module pattern, similar to original's UMD-like structure
    // For raw JS output, direct assignment to window is common if not using modules.
    window.ViewportManipulator = ViewportManipulator;

})();