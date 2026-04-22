(function() {
    "use strict";

    // Helper function to normalize DOM elements input
    function obtainDisplayTargets(inputElements) {
        if (!inputElements) {
            return [];
        }
        const elementType = Object.prototype.toString.call(inputElements);
        if (elementType === '[object Array]' ||
            elementType === '[object NodeList]' ||
            elementType === '[object HTMLCollection]' ||
            elementType === '[object Object]') { // Original also treated generic objects as collections
            return Array.from(inputElements);
        }
        // Assuming single element if not an array/list
        return [inputElements];
    }

    // Helper function for CSS background-position string conversion
    function generateBackgroundStyle(coordinateObject) {
        return `-${coordinateObject.coordX}px -${coordinateObject.coordY}px`;
    }

    // Main class for animation management
    class VisualSequencePlayer {
        #displayTargets; // Array of DOM elements
        #isActive = false; // boolean, playing state
        #refreshRate; // frames per second
        #baseCoordinates = []; // Array of {coordX, coordY} frame definitions
        #shouldLoop = false; // boolean, global loop
        #targetCount; // length of displayTargets
        #completionHandler = null; // callback on stop
        #sequenceStart = 0; // 0-based index for loop range start
        #sequenceEnd = 0; // 0-based index for loop range end
        #currentSequenceIndex = 0; // 0-based current frame index
        #animationFrameIdentifier = null; // For requestAnimationFrame ID
        #effectiveFrameStyles = []; // Array of CSS background-position strings
        #playbackDirection = 1; // 1 for forward, -1 for backward
        #totalFrameCount = 0; // Total number of frames in baseCoordinates
        #lastFrameRenderTime = null; // Timestamp for controlling FPS with rAF

        constructor(targets, initialSettings = {}) {
            this.#displayTargets = obtainDisplayTargets(targets);
            this.#targetCount = this.#displayTargets.length;

            if (this.#targetCount === 0) {
                return this; // Return early if no elements
            }

            this.#refreshRate = initialSettings.refreshRate || 25;
            this.#shouldLoop = !!initialSettings.shouldLoop;
            this.#completionHandler = initialSettings.completionHandler || null;

            this.#currentSequenceIndex = 0;
            this.#playbackDirection = 1;

            this.configureFrameData(
                initialSettings.frames,
                initialSettings.orientation,
                initialSettings.elementWidth,
                initialSettings.elementHeight,
                initialSettings.frameQuantity
            );
        }

        // --- Internal/Private Methods ---

        // Transforms raw coordinate objects into CSS style strings
        #mapCoordinatesToStyles(coordinateArray) {
            return coordinateArray.map(generateBackgroundStyle);
        }

        // Rebuilds the array of effective frame styles based on base coordinates and playback direction
        #rebuildEffectiveFrames() {
            if (this.#playbackDirection === 1) {
                this.#effectiveFrameStyles = this.#mapCoordinatesToStyles(this.#baseCoordinates);
            } else {
                // Clone and reverse for backward playback
                this.#effectiveFrameStyles = this.#mapCoordinatesToStyles(this.#baseCoordinates).slice().reverse();
            }
            this.#totalFrameCount = this.#baseCoordinates.length;
            this.resetPlaybackRange(); // Ensure loop range is within new frame count
            // Adjust current index if it falls outside the new range
            this.#currentSequenceIndex = Math.min(
                Math.max(this.#currentSequenceIndex, this.#sequenceStart),
                this.#sequenceEnd
            );
            return this;
        }

        // Applies the current frame's style to all target elements
        #applyFrameStyle() {
            if (this.#targetCount === 0 || this.#effectiveFrameStyles.length === 0) {
                return;
            }
            const styleString = this.#effectiveFrameStyles[this.#currentSequenceIndex];
            for (let i = 0; i < this.#targetCount; i++) {
                this.#displayTargets[i].style.backgroundPosition = styleString;
            }
        }

        // The core animation loop driven by requestAnimationFrame
        #advanceFrame(timestamp) {
            if (!this.#isActive) {
                return;
            }

            if (this.#lastFrameRenderTime === null) {
                this.#lastFrameRenderTime = timestamp;
            }

            const frameInterval = 1000 / this.#refreshRate;
            const elapsed = timestamp - this.#lastFrameRenderTime;

            if (elapsed >= frameInterval) {
                // Adjust lastFrameRenderTime to maintain precise FPS
                this.#lastFrameRenderTime = timestamp - (elapsed % frameInterval);

                this.#applyFrameStyle(); // Render current frame

                let nextIndex = this.#currentSequenceIndex + this.#playbackDirection;

                const actualSequenceStart = this.#sequenceStart;
                const actualSequenceEnd = this.#sequenceEnd;

                // Handle loop boundaries and direction
                if (this.#playbackDirection === 1) { // Forward
                    if (nextIndex > actualSequenceEnd) {
                        if (this.#shouldLoop) {
                            nextIndex = actualSequenceStart;
                        } else {
                            this.haltPlayback(); // Stop at the end
                            nextIndex = actualSequenceEnd; // Keep showing the last frame
                        }
                    }
                } else { // Backward
                    if (nextIndex < actualSequenceStart) {
                        if (this.#shouldLoop) {
                            nextIndex = actualSequenceEnd;
                        } else {
                            this.haltPlayback(); // Stop at the beginning
                            nextIndex = actualSequenceStart; // Keep showing the first frame
                        }
                    }
                }
                this.#currentSequenceIndex = nextIndex;
            }

            // Continue animation if still active
            if (this.#isActive) {
                this.#animationFrameIdentifier = requestAnimationFrame(this.#advanceFrame.bind(this));
            }
        }

        // Schedules the next animation frame
        #initiateFrameScheduling() {
            if (this.#animationFrameIdentifier !== null) {
                cancelAnimationFrame(this.#animationFrameIdentifier);
            }
            this.#lastFrameRenderTime = performance.now(); // Reset timer for new animation start
            this.#animationFrameIdentifier = requestAnimationFrame(this.#advanceFrame.bind(this));
        }

        // --- Public Methods ---

        /**
         * Configures the animation frames.
         * @param {Array<Object>} frameSource - Optional array of {x, y} objects.
         * @param {string} orientation - 'h' for horizontal, 'v' for vertical (if generating frames).
         * @param {number} elementWidth - Width of a single frame (for horizontal sprite).
         * @param {number} elementHeight - Height of a single frame (for vertical sprite).
         * @param {number} frameQuantity - Total number of frames (if generating frames).
         * @returns {VisualSequencePlayer} This instance.
         */
        configureFrameData(frameSource, orientation, elementWidth, elementHeight, frameQuantity) {
            if (frameSource && Array.isArray(frameSource)) {
                this.#baseCoordinates = frameSource.map(f => ({
                    coordX: f.x || 0,
                    coordY: f.y || 0
                }));
                return this.#rebuildEffectiveFrames();
            }

            // Error reporting if frames are to be generated but parameters are missing
            if (!frameSource && !orientation) {
                throw new Error("VisualSequencePlayer requires either an array of frames or an orientation to generate them.");
            }
            if (orientation === 'v' && !elementHeight) {
                throw new Error("For a vertical sprite, VisualSequencePlayer needs 'elementHeight'.");
            }
            if (orientation === 'h' && !elementWidth) {
                throw new Error("For a horizontal sprite, VisualSequencePlayer needs 'elementWidth'.");
            }
            if (!frameQuantity) {
                throw new Error("When generating frames, VisualSequencePlayer needs 'frameQuantity'.");
            }

            // Generate frames
            this.#baseCoordinates = [];
            for (let i = 0; i < frameQuantity; i++) {
                this.#baseCoordinates.push({
                    coordX: (orientation === 'h' ? i * elementWidth : 0),
                    coordY: (orientation === 'v' ? i * elementHeight : 0)
                });
            }
            return this.#rebuildEffectiveFrames();
        }

        /**
         * @returns {number} The current playback direction (1 for forward, -1 for backward).
         */
        getPlaybackDirection() {
            return this.#playbackDirection;
        }

        /**
         * Changes the playback direction.
         * @param {number} direction - 1 for normal, -1 for inverted.
         * @param {boolean} preservePosition - If true, tries to keep the visually same frame.
         * @returns {VisualSequencePlayer} This instance.
         */
        setPlaybackDirection(direction, preservePosition) {
            if (direction !== 1 && direction !== -1) {
                throw new Error("Playback direction must be 1 (forward) or -1 (backward).");
            }
            if (direction === this.#playbackDirection) {
                return this;
            }

            if (!!preservePosition === true && this.#totalFrameCount > 0) {
                // Adjust current index to maintain visual frame position after reversal.
                // If we were at frame N (0-indexed) in forward sequence [f0, f1, ..., fN, ...],
                // and the sequence becomes reversed [..., fN, ..., f1, f0],
                // frame fN will now be at (total_frames - 1 - N) index.
                this.#currentSequenceIndex = (this.#totalFrameCount - 1) - this.#currentSequenceIndex;
            }

            this.#playbackDirection = direction;
            this.#rebuildEffectiveFrames(); // Rebuilds #effectiveFrameStyles based on new direction
            this.#applyFrameStyle(); // Update display immediately
            return this;
        }

        /**
         * Resets the playback range to cover all available frames.
         * @returns {VisualSequencePlayer} This instance.
         */
        resetPlaybackRange() {
            this.#sequenceStart = 0;
            this.#sequenceEnd = Math.max(0, this.#totalFrameCount - 1); // 0-based
            return this;
        }

        /**
         * Defines a specific range of frames for playback looping.
         * @param {number} startFrame - The 1-based start frame number.
         * @param {number} endFrame - The 1-based end frame number.
         * @returns {VisualSequencePlayer} This instance.
         */
        setPlaybackRange(startFrame, endFrame) {
            // Convert to 0-based indices
            const actualStart = Math.max(0, startFrame - 1);
            const actualEnd = Math.min(this.#totalFrameCount - 1, endFrame - 1);

            if (startFrame >= endFrame) {
                throw new Error('Start frame must be less than end frame for playback range.');
            }

            this.#sequenceStart = actualStart;
            this.#sequenceEnd = actualEnd;

            // Ensure current frame is within the new range
            this.#currentSequenceIndex = Math.min(
                Math.max(this.#currentSequenceIndex, this.#sequenceStart),
                this.#sequenceEnd
            );
            return this;
        }

        /**
         * @returns {number} The current frame number (1-based).
         */
        getCurrentFrameNumber() {
            return this.#currentSequenceIndex + 1;
        }

        /**
         * Jumps to the previous frame and halts playback.
         * @returns {VisualSequencePlayer} This instance.
         */
        stepBackward() {
            const current = this.getCurrentFrameNumber(); // 1-based
            const targetFrame = (current <= (this.#sequenceStart + 1)) ? (this.#sequenceEnd + 1) : (current - 1);
            return this.jumpToAndHalt(targetFrame);
        }

        /**
         * Jumps to the next frame and halts playback.
         * @returns {VisualSequencePlayer} This instance.
         */
        stepForward() {
            const current = this.getCurrentFrameNumber(); // 1-based
            const targetFrame = (current >= (this.#sequenceEnd + 1)) ? (this.#sequenceStart + 1) : (current + 1);
            return this.jumpToAndHalt(targetFrame);
        }

        /**
         * Toggles playback between playing and stopped states.
         * @param {boolean} [loopOverride] - If provided, overrides the instance's loop setting.
         * @returns {VisualSequencePlayer} This instance.
         */
        togglePlayback(loopOverride) {
            return !this.#isActive ? this.startPlayback(loopOverride) : this.haltPlayback();
        }

        /**
         * Starts the animation playback.
         * @param {boolean} [loopOverride] - If provided, overrides the instance's loop setting for this playback session.
         * @returns {VisualSequencePlayer} This instance.
         */
        startPlayback(loopOverride) {
            if (this.#isActive) {
                return this;
            }

            // If at the end of the sequence (and playing forward) or beginning (playing backward),
            // reset to the start of the sequence range before playing.
            if ((this.#playbackDirection === 1 && this.#currentSequenceIndex === this.#sequenceEnd) ||
                (this.#playbackDirection === -1 && this.#currentSequenceIndex === this.#sequenceStart)) {
                this.#currentSequenceIndex = this.#sequenceStart;
            }

            this.#isActive = true;
            this.#shouldLoop = (typeof loopOverride === 'boolean') ? loopOverride : this.#shouldLoop;
            this.#initiateFrameScheduling();
            return this;
        }

        /**
         * Halts the animation playback.
         * @returns {VisualSequencePlayer} This instance.
         */
        haltPlayback() {
            this.#isActive = false;
            if (this.#animationFrameIdentifier !== null) {
                cancelAnimationFrame(this.#animationFrameIdentifier);
                this.#animationFrameIdentifier = null;
            }
            this.#lastFrameRenderTime = null; // Reset timer
            if (this.#completionHandler) {
                this.#completionHandler();
            }
            return this;
        }

        /**
         * Jumps to a specific frame and starts playing from there.
         * @param {number} frameNumber - The 1-based frame number to jump to.
         * @param {boolean} [loopOverride] - If provided, overrides the instance's loop setting.
         * @returns {VisualSequencePlayer} This instance.
         */
        jumpToAndStart(frameNumber, loopOverride) {
            // Convert to 0-based index, clamped within the current sequence range
            this.#currentSequenceIndex = Math.min(
                Math.max(frameNumber - 1, this.#sequenceStart),
                this.#sequenceEnd
            );
            return this.startPlayback(loopOverride);
        }

        /**
         * Jumps to a specific frame and halts playback.
         * @param {number} frameNumber - The 1-based frame number to jump to.
         * @returns {VisualSequencePlayer} This instance.
         */
        jumpToAndHalt(frameNumber) {
            // Convert to 0-based index, clamped within the current sequence range
            this.#currentSequenceIndex = Math.min(
                Math.max(frameNumber - 1, this.#sequenceStart),
                this.#sequenceEnd
            );
            this.haltPlayback(); // Ensure it's stopped
            this.#applyFrameStyle(); // Render the target frame immediately
            return this;
        }
    }

    // Expose the class globally
    window.VisualSequencePlayer = VisualSequencePlayer;
})();