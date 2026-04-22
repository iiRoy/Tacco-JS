(function () {
    // Ensure jQuery is available before proceeding. If not, log a warning and exit.
    if (typeof jQuery === 'undefined') {
        console.warn('jQuery library not detected. MediaProgressDisplay will not function.');
        return;
    }

    /**
     * @class MediaProgressDisplay
     * @description Manages the visual representation of media buffering and playback progress.
     *              This utility integrates with a media player's status updates to dynamically
     *              adjust UI elements, typically a buffer bar and seek bar.
     * @param {string} targetElementId - The ID of the primary HTML element associated with the media player.
     * @param {string} [bufferDisplaySelector='.jp-buffer-bar'] - CSS selector for the buffer progress display element.
     * @param {string} [seekDisplaySelector='.jp-seek-bar'] - CSS selector for the seek progress display element.
     */
    var MediaProgressDisplay = function (targetElementId, bufferDisplaySelector, seekDisplaySelector) {
        // Store the unique identifier for the associated media player instance.
        this.playerLinkedId = targetElementId;
        // Initialize selectors for UI components, using defaults if not provided.
        this.bufferIndicatorSelector = bufferDisplaySelector || '.jp-buffer-bar';
        this.seekIndicatorSelector = seekDisplaySelector || '.jp-seek-bar';

        // Optional: Add a debug flag or initial logging.
        // console.log(`MediaProgressDisplay instance created for ID: ${targetElementId}`);
    };

    /**
     * @property {number} OVERFLOW_ADJUSTMENT_VALUE - A small constant used to prevent visual overflow
     *                                                  when the buffer reaches 100% and to handle
     *                                                  floating-point inaccuracies in UI rendering.
     */
    MediaProgressDisplay.prototype.OVERFLOW_ADJUSTMENT_VALUE = 0.2;

    /**
     * @method setLoadProgressWidth
     * @description Updates the width of the buffer display element to reflect a given percentage.
     * @param {number} progressPercentage - The percentage value (0-100) to set the buffer bar's width.
     *                                      Values outside this range will be clamped.
     */
    MediaProgressDisplay.prototype.setLoadProgressWidth = function (progressPercentage) {
        // Validate and clamp the input percentage to ensure it's within a valid range.
        const clampedPercentage = Math.max(0, Math.min(100, progressPercentage));
        // Apply the calculated width using jQuery's .css() method for style manipulation.
        jQuery(this.bufferIndicatorSelector).css('width', clampedPercentage + '%');
    };

    /**
     * @method generateProgressUpdateCallback
     * @description Creates and returns an event handler function suitable for media player
     *              progress events. This handler calculates and updates the buffer bar's width.
     * @returns {function(Object): void} An event handler function that takes a playback event object.
     */
    MediaProgressDisplay.prototype.generateProgressUpdateCallback = function () {
        // Capture the 'this' context of the MediaProgressDisplay instance for use within the returned closure.
        const instanceContext = this;

        // Return the actual event handler function.
        return function (playbackEventData) {
            // Attempt to retrieve the underlying HTML5 audio/video element using the stored player ID.
            const currentAudioElement = jQuery('#' + instanceContext.playerLinkedId + ' audio')[0];

            // Guard clause: If the media element or its buffered property is not available,
            // log a warning and exit early to prevent errors.
            if (!currentAudioElement || !currentAudioElement.buffered) {
                // console.warn('Media element or buffered property missing for ID:', instanceContext.playerLinkedId);
                return;
            }

            // Extract the player status object for easier access to playback data.
            const playerCurrentStatus = playbackEventData.jPlayer.status;

            // Scenario 1: No buffered data available. Reset buffer display to zero.
            if (!currentAudioElement.buffered.length) {
                instanceContext.setLoadProgressWidth(0);
                return; // No further calculations needed if nothing is buffered.
            }

            // Retrieve key playback metrics from the player status.
            const totalMediaDuration = playerCurrentStatus.duration;
            const currentPlaybackTime = playerCurrentStatus.currentTime;
            // Get the end time of the first buffered time range.
            const firstBufferedSegmentEnd = currentAudioElement.buffered.end(0);

            // Guard clause: Prevent division by zero if the media duration is reported as zero.
            if (totalMediaDuration === 0) {
                instanceContext.setLoadProgressWidth(0);
                // console.warn('Media duration is zero, cannot calculate buffer percentage.');
                return;
            }

            // Scenario 2: Media is fully buffered.
            // Compare floor values to account for potential floating-point discrepancies.
            if (Math.floor(totalMediaDuration) === Math.floor(firstBufferedSegmentEnd)) {
                // When fully buffered, set the buffer width close to 100%,
                // subtracting a small value to avoid visual overflow and CSS rendering quirks.
                const finalBufferDisplayPercentage = 100 - playerCurrentStatus.currentPercentRelative - instanceContext.OVERFLOW_ADJUSTMENT_VALUE;
                instanceContext.setLoadProgressWidth(finalBufferDisplayPercentage);

                // Note: The original code contained a specific fix for a bootstrap stack gap
                //       by adjusting the seek bar width. This specific UI workaround has been
                //       intentionally omitted here as a Type III deletion of non-essential UI logic.
            } else {
                // Scenario 3: Media is partially buffered.
                // Calculate the percentage of the remaining media that is buffered ahead of the current play position.
                const dynamicBufferRatio = (firstBufferedSegmentEnd - currentPlaybackTime) / totalMediaDuration;
                const dynamicBufferDisplayPercentage = dynamicBufferRatio * 100;
                instanceContext.setLoadProgressWidth(dynamicBufferDisplayPercentage);
            }
        };
    };

    // Expose the MediaProgressDisplay constructor globally under a new, distinct name.
    window.MediaProgressDisplay = MediaProgressDisplay;

})(); // End of the module scope.