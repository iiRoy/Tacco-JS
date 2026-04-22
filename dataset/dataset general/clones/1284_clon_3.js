/*!
 * Advanced Sprite Animation Utility
 * Version: 2.1.0
 * Project Home: https://example.com/spriteplayer-repo
 * Author: [Your Name/Company Here]
 * License: Apache 2.0 (or a different permissive license)
 *
 * This module enables smooth frame-by-frame animation of DOM elements
 * using CSS background positioning. It supports sprite sheets,
 * custom frame sequences, looping, and directional playback.
 */
(function() {
    "use strict";

    /**
     * Default configuration options for the SpritePlayer.
     * These can be overridden during instantiation.
     * @type {object}
     */
    const DEFAULT_PLAYER_OPTIONS = {
        framesPerSecond: 30,           // Playback speed in frames per second
        onPlaybackFinished: null,      // Callback function when animation stops naturally
        initialFrame: 1,               // Starting frame index (1-based)
        frameLayoutDirection: null,    // 'h' for horizontal, 'v' for vertical sprite sheets
        frameWidth: 0,                 // Width of a single frame if horizontal layout
        frameHeight: 0,                // Height of a single frame if vertical layout
        totalFramesInSheet: 0          // Total number of frames if using layout direction
    };

    /**
     * Represents an animated sprite player that manages frame-by-frame
     * animation of one or more DOM elements using background-position.
     * @class SpritePlayer
     * @param {HTMLElement|NodeList|HTMLCollection|Array<HTMLElement>} domElements - The DOM elements to animate.
     * @param {object} [playerOptions] - Configuration options for the player.
     */
    function SpritePlayer(domElements, playerOptions) {
        // --- Input Validation and Initialization ---
        if (!domElements) {
            console.warn("SpritePlayer: No DOM elements provided for animation. Instance created but not functional.");
            return this; // Return an inert instance
        }

        const self = this; // Use 'self' for consistent instance reference
        const config = { ...DEFAULT_PLAYER_OPTIONS, ...playerOptions }; // Merge defaults with provided options

        // Determine and normalize the target elements for animation
        let targetElementsArray;
        if (Array.isArray(domElements) || domElements instanceof NodeList || domElements instanceof HTMLCollection) {
            targetElementsArray = Array.from(domElements); // Convert to actual Array for consistency
        } else if (domElements instanceof HTMLElement) {
            targetElementsArray = [domElements];
        } else {
            console.error("SpritePlayer: Invalid type for DOM elements. Expected HTMLElement, NodeList, HTMLCollection, or Array.");
            return this;
        }

        if (targetElementsArray.length === 0) {
            console.warn("SpritePlayer: No valid DOM elements found in the provided input. Instance created but not functional.");
            return this;
        }

        // --- Instance Properties ---
        self.animatedTargets = targetElementsArray;
        self.numAnimatedTargets = targetElementsArray.length;
        self.animationActive = false; // True when animation loop is running
        self.framesPerSecond = Math.max(1, config.framesPerSecond); // Ensure positive FPS
        self.spriteFrameData = []; // Stores objects like {x: 0, y: 0} or formatted strings
        self.continuousPlayback = false; // Corresponds to 'loop'
        self.playbackFinishedHandler = config.onPlaybackFinished;

        // Internal state for animation control
        self._currentFrameIndex = 0; // 0-based index of the currently displayed frame
        self._animationTimerId = null; // ID for the setTimeout timer
        self._playbackDirection = 1; // 1 for forward, -1 for reverse
        self._totalFramesCount = 0; // Total number of frames available
        self._renderableFramePositions = []; // Stores pre-formatted CSS background-position strings

        // Playback range (1-based frame numbers)
        self._playbackStartFrame = 1;
        self._playbackEndFrame = 1;

        // --- Initial Setup ---
        // If initial frame data is provided directly
        if (playerOptions && playerOptions.frameCoordinates) {
            self.setupSpriteSheet(playerOptions.frameCoordinates);
        } else {
            // Otherwise, set up based on direction/width/height (sprite sheet calculation)
            self.setupSpriteSheet(
                null, // No direct frame coordinates
                config.frameLayoutDirection,
                config.frameWidth,
                config.frameHeight,
                config.totalFramesInSheet
            );
        }

        // Set initial frame if specified and within bounds
        if (config.initialFrame > 0 && config.initialFrame <= self._totalFramesCount) {
             self._currentFrameIndex = config.initialFrame - 1;
        } else if (self._totalFramesCount > 0) {
            // If initialFrame is invalid, default to the first frame
            self._currentFrameIndex = 0;
        }

        // Ensure the initial frame is rendered immediately if animation isn't started yet
        self._applyFrameToElements();
    }

    /**
     * Prototype methods for the SpritePlayer class.
     * These methods define the behavior and functionality of the animation.
     */
    SpritePlayer.prototype = {
        /**
         * Applies the current frame's background position to all target elements.
         * This is a "protected" method, meant for internal use.
         * @private
         */
        _applyFrameToElements: function() {
            if (this._totalFramesCount === 0 || !this._renderableFramePositions[this._currentFrameIndex]) {
                // No frames loaded or current index is out of bounds
                console.warn(`SpritePlayer: Cannot render frame. No data for index ${this._currentFrameIndex} or no frames loaded.`);
                return;
            }

            const currentPositionString = this._renderableFramePositions[this._currentFrameIndex];
            for (let i = 0; i < this.numAnimatedTargets; i++) {
                this.animatedTargets[i].style.backgroundPosition = currentPositionString;
            }
            // Optional: A custom event could be dispatched here for external listeners
        },

        /**
         * Manages the animation loop, advancing frames and scheduling the next render.
         * This is a "protected" method, called recursively by setTimeout.
         * @private
         */
        _advanceAnimationCycle: function() {
            const self = this;
            self._applyFrameToElements(); // Render the current frame before advancing

            if (self.animationActive) {
                const lastFrameOfRange = self._playbackEndFrame - 1; // 0-based
                const firstFrameOfRange = self._playbackStartFrame - 1; // 0-based

                if (self._playbackDirection === 1) { // Forward playback
                    if (self._currentFrameIndex >= lastFrameOfRange) {
                        if (self.continuousPlayback) {
                            self._currentFrameIndex = firstFrameOfRange; // Loop back to start of range
                        } else {
                            self.haltAnimation(); // Stop if not looping
                            return; // Prevent further scheduling
                        }
                    } else {
                        self._currentFrameIndex++;
                    }
                } else { // Reverse playback
                    if (self._currentFrameIndex <= firstFrameOfRange) {
                        if (self.continuousPlayback) {
                            self._currentFrameIndex = lastFrameOfRange; // Loop back to end of range
                        } else {
                            self.haltAnimation(); // Stop if not looping
                            return; // Prevent further scheduling
                        }
                    } else {
                        self._currentFrameIndex--;
                    }
                }

                // Schedule the next frame render
                self._animationTimerId = setTimeout(() => {
                    self._advanceAnimationCycle.call(self);
                }, 1000 / self.framesPerSecond);
            }
        },

        /**
         * Prepares the array of frame position strings based on the current playback direction.
         * This method ensures frames are ordered correctly for rendering.
         * @private
         * @returns {SpritePlayer} The current instance for chaining.
         */
        _prepareRenderableFrames: function() {
            if (!Array.isArray(this.spriteFrameData) || this.spriteFrameData.length === 0) {
                this._renderableFramePositions = [];
                this._totalFramesCount = 0;
                console.warn("SpritePlayer: No sprite frame data available to prepare for rendering.");
                return this;
            }

            this._totalFramesCount = this.spriteFrameData.length;
            if (this._playbackDirection === 1) { // Normal forward playback
                this._renderableFramePositions = this.spriteFrameData;
            } else { // Inverted/reverse playback
                // Create a reversed copy of the frame data using spread syntax
                this._renderableFramePositions = [...this.spriteFrameData].reverse();
            }
            return this.resetPlaybackRange(); // Reset loop range to cover all frames after frame changes
        },

        /**
         * Converts raw frame coordinate objects ({x, y}) into CSS background-position strings
         * and stores them for efficient rendering. This method modifies `spriteFrameData` in place.
         * @private
         * @returns {SpritePlayer} The current instance for chaining.
         */
        _formatFrameCoordinates: function() {
            if (!Array.isArray(this.spriteFrameData) || this.spriteFrameData.length === 0) {
                console.warn("SpritePlayer: No raw frame data to format.");
                return this;
            }

            // Map the raw {x, y} objects to CSS string format using template literals
            this.spriteFrameData = this.spriteFrameData.map(coord => {
                return `-${coord.x}px -${coord.y}px`;
            });
            return this;
        },

        // --- Public Methods ---

        /**
         * Configures the sprite sheet and prepares frame data for animation.
         * Can accept an array of pre-defined frame coordinates or generate them
         * from a sprite sheet layout (horizontal/vertical).
         * @param {Array<object>} [frameCoordinates] - An array of {x, y} objects for each frame.
         * @param {string} [layoutDirection] - 'h' for horizontal, 'v' for vertical sprite sheet.
         * @param {number} [frameWidth] - The width of a single frame (required for 'h' layout).
         * @param {number} [frameHeight] - The height of a single frame (required for 'v' layout).
         * @param {number} [totalFramesInSheet] - The total number of frames in the sprite sheet.
         * @returns {SpritePlayer} The current instance for chaining.
         * @throws {Error} If required parameters for sprite sheet generation are missing.
         */
        setupSpriteSheet: function(frameCoordinates, layoutDirection, frameWidth, frameHeight, totalFramesInSheet) {
            // Clear any existing frame data and reset state
            this.spriteFrameData = [];
            this._renderableFramePositions = [];
            this._totalFramesCount = 0;
            this._currentFrameIndex = 0; // Reset current frame on new sheet setup
            this.haltAnimation(); // Stop any ongoing animation

            if (frameCoordinates && Array.isArray(frameCoordinates) && frameCoordinates.length > 0) {
                // If direct coordinates are provided, use them
                this.spriteFrameData = frameCoordinates;
                return this._formatFrameCoordinates()._prepareRenderableFrames();
            }

            // If frameCoordinates are not provided, attempt to generate them from layout info
            if (!layoutDirection || !totalFramesInSheet) {
                throw new Error("SpritePlayer: 'layoutDirection' and 'totalFramesInSheet' are required for automatic frame generation.");
            }

            if (layoutDirection === 'v' && (!frameHeight || frameHeight <= 0)) {
                throw new Error("SpritePlayer: 'frameHeight' (must be > 0) is required for a vertical sprite sheet layout.");
            }
            if (layoutDirection === 'h' && (!frameWidth || frameWidth <= 0)) {
                throw new Error("SpritePlayer: 'frameWidth' (must be > 0) is required for a horizontal sprite sheet layout.");
            }

            // Generate frame coordinates based on sprite sheet layout
            for (let i = 0; i < totalFramesInSheet; i++) {
                this.spriteFrameData.push({
                    x: (layoutDirection === 'h' ? i * frameWidth : 0),
                    y: (layoutDirection === 'v' ? i * frameHeight : 0)
                });
            }

            // After generating, format and prepare them for rendering
            return this._formatFrameCoordinates()._prepareRenderableFrames();
        },

        /**
         * Retrieves the current playback direction.
         * @returns {number} 1 for forward, -1 for reverse.
         */
        getCurrentDirection: function() {
            return this._playbackDirection;
        },

        /**
         * Changes the playback direction of the animation.
         * @param {number} newDirection - 1 for normal (forward), -1 for inverted (reverse).
         * @param {boolean} [maintainCurrentFrame=false] - If true, attempts to keep the visual frame
         *                                                the same when reversing (e.g., if on frame 3 of 5,
         *                                                reversing will go to frame 3 from end).
         * @returns {SpritePlayer} The current instance for chaining.
         */
        setPlaybackDirection: function(newDirection, maintainCurrentFrame = false) {
            if (newDirection !== 1 && newDirection !== -1) {
                console.warn("SpritePlayer: Invalid playback direction. Must be 1 (forward) or -1 (reverse). Direction unchanged.");
                return this;
            }
            if (newDirection === this._playbackDirection) {
                return this; // No change needed
            }

            if (maintainCurrentFrame && this._totalFramesCount > 0) {
                // Adjust _currentFrameIndex to roughly maintain visual position
                // This swaps the 0-based index from start to end, or vice-versa
                this._currentFrameIndex = (this._totalFramesCount - 1) - this._currentFrameIndex;
            }

            this._playbackDirection = newDirection;
            // Re-prepare frames in the new order and update the displayed frame
            return this._prepareRenderableFrames()._applyFrameToElements();
        },

        /**
         * Resets the playback range to cover all available frames.
         * @returns {SpritePlayer} The current instance for chaining.
         */
        resetPlaybackRange: function() {
            this._playbackStartFrame = 1;
            this._playbackEndFrame = this._totalFramesCount;
            // Ensure current frame is within the new full range
            this._currentFrameIndex = Math.min(
                Math.max(this._currentFrameIndex, this._playbackStartFrame - 1),
                this._playbackEndFrame - 1
            );
            return this;
        },

        /**
         * Defines a specific range of frames for playback.
         * @param {number} rangeStart - The 1-based index of the first frame in the loop.
         * @param {number} rangeEnd - The 1-based index of the last frame in the loop.
         * @returns {SpritePlayer} The current instance for chaining.
         * @throws {Error} If `rangeStart` is greater than or equal to `rangeEnd`.
         */
        definePlaybackRange: function(rangeStart, rangeEnd) {
            if (rangeStart >= rangeEnd) {
                throw new Error("SpritePlayer: Playback range start frame must be less than end frame.");
            }
            if (rangeStart < 1 || rangeEnd > this._totalFramesCount) {
                console.warn(`SpritePlayer: Playback range [${rangeStart}, ${rangeEnd}] is outside available frames [1, ${this._totalFramesCount}]. Clamping values.`);
            }

            this._playbackStartFrame = Math.max(1, rangeStart);
            this._playbackEndFrame = Math.min(rangeEnd, this._totalFramesCount);

            // Adjust current frame if it falls outside the new range
            if (this._currentFrameIndex < this._playbackStartFrame - 1 || this._currentFrameIndex > this._playbackEndFrame - 1) {
                this._currentFrameIndex = this._playbackStartFrame - 1;
                this._applyFrameToElements(); // Update visual if frame changed
            }
            return this;
        },

        /**
         * Returns the 1-based index of the currently displayed frame.
         * @returns {number} The current frame number.
         */
        getDisplayedFrameIndex: function() {
            return this._currentFrameIndex + 1;
        },

        /**
         * Steps the animation one frame backward and immediately stops.
         * If at the first frame of the range, it jumps to the last frame of the range.
         * @returns {SpritePlayer} The current instance for chaining.
         */
        stepBackward: function() {
            const currentFrameNum = this.getDisplayedFrameIndex();
            const targetFrame = (currentFrameNum <= this._playbackStartFrame)
                ? this._playbackEndFrame
                : currentFrameNum - 1;
            return this.jumpToFrameAndStop(targetFrame);
        },

        /**
         * Steps the animation one frame forward and immediately stops.
         * If at the last frame of the range, it jumps to the first frame of the range.
         * @returns {SpritePlayer} The current instance for chaining.
         */
        stepForward: function() {
            const currentFrameNum = this.getDisplayedFrameIndex();
            const targetFrame = (currentFrameNum >= this._playbackEndFrame)
                ? this._playbackStartFrame
                : currentFrameNum + 1;
            return this.jumpToFrameAndStop(targetFrame);
        },

        /**
         * Toggles the animation's playing state (play if stopped, stop if playing).
         * @param {boolean} [shouldLoop=false] - If playing, whether to enable looping.
         * @returns {SpritePlayer} The current instance for chaining.
         */
        toggleAnimation: function(shouldLoop = false) {
            return this.animationActive ? this.haltAnimation() : this.startAnimation(shouldLoop);
        },

        /**
         * Starts the animation playback.
         * If already playing, it does nothing.
         * @param {boolean} [enableLooping=false] - Whether the animation should loop continuously.
         * @returns {SpritePlayer} The current instance for chaining.
         */
        startAnimation: function(enableLooping = false) {
            if (this.animationActive) {
                return this; // Already playing
            }
            if (this._totalFramesCount === 0) {
                console.warn("SpritePlayer: Cannot start animation, no frames are loaded.");
                return this;
            }

            // If at the end of the range (or start for reverse) and playing, reset to start of range for a fresh play cycle
            if (this._playbackDirection === 1 && this._currentFrameIndex >= this._playbackEndFrame - 1) {
                this._currentFrameIndex = this._playbackStartFrame - 1;
            } else if (this._playbackDirection === -1 && this._currentFrameIndex <= this._playbackStartFrame - 1) {
                this._currentFrameIndex = this._playbackEndFrame - 1;
            }

            this.animationActive = true;
            this.continuousPlayback = !!enableLooping; // Ensure boolean
            this._advanceAnimationCycle(); // Initiate the animation loop
            return this;
        },

        /**
         * Halts the animation playback.
         * Clears any pending animation timers and calls the `onPlaybackFinished` callback.
         * @returns {SpritePlayer} The current instance for chaining.
         */
        haltAnimation: function() {
            if (!this.animationActive) {
                return this; // Already stopped
            }
            this.animationActive = false;
            if (this._animationTimerId) {
                clearTimeout(this._animationTimerId);
                this._animationTimerId = null;
            }
            console.log("SpritePlayer: Animation playback halted."); // Added logging for state change
            if (typeof this.playbackFinishedHandler === 'function') {
                this.playbackFinishedHandler();
            }
            return this;
        },

        /**
         * Jumps to a specific frame and starts playing from there.
         * @param {number} targetFrameNumber - The 1-based index of the frame to jump to.
         * @param {boolean} [enableLooping=false] - Whether the animation should loop.
         * @returns {SpritePlayer} The current instance for chaining.
         */
        jumpToFrameAndPlay: function(targetFrameNumber, enableLooping = false) {
            if (this._totalFramesCount === 0) {
                console.warn("SpritePlayer: Cannot jump to frame and play, no frames are loaded.");
                return this;
            }
            // Clamp targetFrameNumber within the defined playback range
            const clampedFrame = Math.min(
                Math.max(targetFrameNumber, this._playbackStartFrame),
                this._playbackEndFrame
            );
            this._currentFrameIndex = clampedFrame - 1; // Convert to 0-based index
            return this.startAnimation(enableLooping);
        },

        /**
         * Jumps to a specific frame and immediately stops the animation.
         * @param {number} targetFrameNumber - The 1-based index of the frame to jump to.
         * @returns {SpritePlayer} The current instance for chaining.
         */
        jumpToFrameAndStop: function(targetFrameNumber) {
            if (this._totalFramesCount === 0) {
                console.warn("SpritePlayer: Cannot jump to frame and stop, no frames are loaded.");
                return this;
            }
            this.haltAnimation(); // Stop any ongoing animation first
            // Clamp targetFrameNumber within the defined playback range
            const clampedFrame = Math.min(
                Math.max(targetFrameNumber, this._playbackStartFrame),
                this._playbackEndFrame
            );
            this._currentFrameIndex = clampedFrame - 1; // Convert to 0-based index
            this._applyFrameToElements(); // Render the target frame immediately
            return this;
        },

        /**
         * Checks if the animation is currently active.
         * @returns {boolean} True if animating, false otherwise.
         */
        isPlaying: function() {
            return this.animationActive;
        },

        /**
         * Returns the total number of frames in the sprite sheet.
         * @returns {number} Total frames.
         */
        getTotalFrames: function() {
            return this._totalFramesCount;
        },

        /**
         * Cleans up the player instance, stopping animation and clearing references.
         * This can help prevent memory leaks if elements are removed from the DOM.
         * After calling this, the instance should not be reused.
         */
        destroy: function() {
            this.haltAnimation();
            this.animatedTargets = []; // Clear references to DOM elements
            this.spriteFrameData = [];
            this._renderableFramePositions = [];
            this.playbackFinishedHandler = null;
            // Optionally, remove the instance from any global registry if one existed
            console.log("SpritePlayer: Instance destroyed and resources released.");
        }
    };

    // Expose the SpritePlayer class globally to the window object
    window.SpritePlayer = SpritePlayer;
})();