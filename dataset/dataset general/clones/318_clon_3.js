/*
 * MediaTimelineManager: Advanced HTML5 Video/Audio Timecode and Frame Navigation Library
 * @version 1.0.0-alpha
 * @author Elara Systems Development Team
 * @copyright (c) 2024 Elara Systems
 * @license Distributed under the permissive MIT License.
 *
 * This software provides robust utilities for precise media element control,
 * including frame-accurate seeking and timecode conversions for video and audio.
 *
 * Primary Contributors:
 * - Alex K. (Lead Architect)
 * - Sarah J. (Core Developer)
 * - David M. (Quality Assurance & Documentation)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @class MediaTimelineManager
 * @classdesc Manages frame-based operations and timecode conversions for HTML5 media elements.
 * @param {Object} initSettings - Configuration settings for the manager.
 * @param {string} initSettings.selector - CSS selector for the target media element (e.g., '#myVideo').
 * @param {number} [initSettings.playbackRate=24] - The default frame rate for calculations.
 * @param {Function} [initSettings.onFrameUpdate] - Callback function triggered during monitoring.
 */
const MediaTimelineManager = function(initSettings) {
    // Ensure 'new' keyword is used
    if (!(this instanceof MediaTimelineManager)) {
        console.warn("MediaTimelineManager: Constructor called without 'new'. Auto-instantiating.");
        return new MediaTimelineManager(initSettings);
    }

    // Initialize core properties
    this.configuration = initSettings || {};
    this.playbackRate = this.configuration.playbackRate || 24;
    this.monitorIntervalId = null; // Stores the ID for the monitoring interval

    // Attempt to locate the media element
    let mediaEl = null;
    if (this.configuration.selector) {
        mediaEl = document.querySelector(this.configuration.selector);
    } else {
        // Fallback to the first video or audio element if no selector provided
        mediaEl = document.querySelector('video, audio');
        if (!mediaEl) {
            console.error("MediaTimelineManager: No media element found. Please provide a valid 'selector' or ensure a 'video'/'audio' element exists.");
            return; // Exit if no media element
        }
        console.warn("MediaTimelineManager: No selector provided, using the first available media element.");
    }

    if (!mediaEl || !(mediaEl instanceof HTMLMediaElement)) {
        console.error("MediaTimelineManager: Target element is not a valid HTMLMediaElement or could not be found with selector:", this.configuration.selector);
        return;
    }
    this.mediaElement = mediaEl;

    // Optional: Add a small event listener to log when media is ready
    this.mediaElement.addEventListener('loadedmetadata', () => {
        console.info(`MediaTimelineManager: Media loaded for element '${this.configuration.selector || 'default'}' with duration ${this.mediaElement.duration}s.`);
    });
};

/**
 * StandardMediaRates - Common frame rates used in media production.
 *
 * @namespace
 * @type {Object}
 * @property {Number} cinema - 24 FPS (Film standard)
 * @property {Number} ntscStandard - 29.97 FPS (NTSC Television)
 * @property {Number} ntscFilmConversion - 23.98 FPS (NTSC Film Telecine)
 * @property {Number} ntscHighDefinition - 59.94 FPS (NTSC HD Video)
 * @property {Number} palStandard - 25 FPS (PAL Television)
 * @property {Number} palHighDefinition - 50 FPS (PAL HD Video)
 * @property {Number} webVideo - 30 FPS (Common web streaming)
 * @property {Number} highFrameRate - 60 FPS (Gaming, high-speed video)
 */
const StandardMediaRates = {
    cinema: 24,
    ntscStandard: 29.97,
    ntscFilmConversion: 23.98,
    ntscHighDefinition: 59.94,
    palStandard: 25,
    palHighDefinition: 50,
    webVideo: 30,
    highFrameRate: 60
};

MediaTimelineManager.prototype = {
    /**
     * Retrieves the current frame number of the associated media element.
     * @returns {Number} The integer frame number based on current time and playback rate.
     */
    getCurrentFrameIndex: function() {
        if (!this.mediaElement) {
            console.error("MediaTimelineManager: No media element available for frame retrieval.");
            return -1;
        }
        // Rounding current time to a few decimal places before multiplication helps
        // mitigate floating point inaccuracies that can cause frame jumps at boundaries.
        const preciseTime = parseFloat(this.mediaElement.currentTime.toFixed(6));
        return Math.floor(preciseTime * this.playbackRate);
    },

    /**
     * Initiates continuous monitoring of the media element's playback progress.
     * A callback function, if configured, will be invoked at regular intervals.
     *
     * @param {String} outputFormat - Desired output format for the callback: 'smpte', 'timecode', or 'frame'.
     * @param {Number} [intervalDurationMs] - Custom interval duration in milliseconds. Defaults to 1/2 frame duration.
     * @returns {void}
     */
    startFrameMonitoring: function(outputFormat, intervalDurationMs) {
        if (!this.mediaElement) {
            console.error("MediaTimelineManager: Cannot start monitoring, media element is not initialized.");
            return;
        }
        if (!outputFormat) {
            console.error('MediaTimelineManager: `startFrameMonitoring` requires an output format (e.g., "smpte", "timecode", "frame").');
            return;
        }

        const instanceRef = this;
        const defaultInterval = Math.floor(1000 / (this.playbackRate * 2)); // Update at double the frame rate for responsiveness

        this.monitorIntervalId = setInterval(() => {
            // Only update if media is playing
            if (instanceRef.mediaElement.paused || instanceRef.mediaElement.ended) {
                return;
            }

            let currentProgressValue;
            switch (outputFormat.toLowerCase()) {
                case 'smpte':
                    currentProgressValue = instanceRef.convertToSMPTE();
                    break;
                case 'timecode':
                    currentProgressValue = instanceRef.formatTimecode();
                    break;
                case 'frame':
                    currentProgressValue = instanceRef.getCurrentFrameIndex();
                    break;
                default:
                    console.warn(`MediaTimelineManager: Unknown output format '${outputFormat}'. Defaulting to frame index.`);
                    currentProgressValue = instanceRef.getCurrentFrameIndex();
            }

            if (typeof instanceRef.configuration.onFrameUpdate === 'function') {
                instanceRef.configuration.onFrameUpdate(currentProgressValue, outputFormat);
            }
        }, intervalDurationMs || defaultInterval);
    },

    /**
     * Halts the currently active frame monitoring interval.
     * @returns {void}
     */
    stopFrameMonitoring: function() {
        if (this.monitorIntervalId) {
            clearInterval(this.monitorIntervalId);
            this.monitorIntervalId = null;
            console.info("MediaTimelineManager: Frame monitoring stopped.");
        } else {
            console.info("MediaTimelineManager: No active frame monitoring to stop.");
        }
    },

    /** Provides access to standard frame rate constants. */
    standardRates: StandardMediaRates
};

/**
 * Converts a given time in seconds (or current media time) into a formatted time string (HH:MM:SS or HH:MM:SS:FF).
 * This is primarily used internally for SMPTE conversion, but can be called directly.
 *
 * @param {Number} [inputTimeInSeconds] - Optional: The time in seconds to format. If not provided, current media time is used.
 * @returns {String} The formatted time string.
 */
MediaTimelineManager.prototype.formatTimecode = function(inputTimeInSeconds) {
    if (!this.mediaElement && typeof inputTimeInSeconds !== 'number') {
        console.error("MediaTimelineManager: No media element and no input time for timecode formatting.");
        return "00:00:00";
    }

    const calcTime = (typeof inputTimeInSeconds === 'number' && !isNaN(inputTimeInSeconds)) ? inputTimeInSeconds : this.mediaElement.currentTime;
    const currentRate = this.playbackRate;

    // Helper to pad numbers with a leading zero if less than 10
    const pad = (num) => num < 10 ? '0' + num : num.toString();

    // Create a temporary Date object to leverage its time formatting capabilities
    const tempDate = new Date(0, 0, 0, 0, 0, 0, Math.floor(calcTime * 1000));

    const hours = tempDate.getHours();
    const minutes = tempDate.getMinutes();
    const seconds = tempDate.getSeconds();

    let formattedString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    // If an explicit time in seconds was provided, or if the original method was called for frames,
    // append frame number. This mimics the original behavior of adding frames when 'frames' was a number.
    if (typeof inputTimeInSeconds === 'number') {
        const framePart = Math.floor((calcTime % 1) * currentRate);
        formattedString += `:${pad(framePart)}`;
    }

    return formattedString;
};

/**
 * Converts a specific frame number or the current media time into an SMPTE timecode (HH:MM:SS:FF).
 *
 * @param {Number} [frameNumberInput] - Optional: The frame number to convert. If omitted, current media time is used.
 * @returns {String} The SMPTE timecode string.
 */
MediaTimelineManager.prototype.convertToSMPTE = function(frameNumberInput) {
    if (typeof frameNumberInput !== 'number' || isNaN(frameNumberInput)) {
        // If no valid frame number is provided, convert current media time directly to SMPTE
        return this.formatTimecode(this.mediaElement?.currentTime);
    }

    const frameRateValue = this.playbackRate;
    const totalFrames = Math.round(frameNumberInput); // Ensure we're working with an integer frame number

    const framesPerHour = frameRateValue * 3600;
    const framesPerMinute = frameRateValue * 60;

    const hours = Math.floor(totalFrames / framesPerHour);
    const remainderAfterHours = totalFrames % framesPerHour;

    const minutes = Math.floor(remainderAfterHours / framesPerMinute);
    const remainderAfterMinutes = remainderAfterHours % framesPerMinute;

    const seconds = Math.floor(remainderAfterMinutes / frameRateValue);
    const frames = remainderAfterMinutes % frameRateValue;

    // Helper to pad numbers
    const pad = (num) => num < 10 ? '0' + num : num.toString();

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
};

/**
 * Converts an SMPTE timecode string (HH:MM:SS:FF) into total seconds.
 *
 * @param {String} [smpteString] - Optional: The SMPTE timecode string. If omitted, current media time in seconds is returned.
 * @returns {Number} The total number of seconds.
 */
MediaTimelineManager.prototype.smpteToSeconds = function(smpteString) {
    if (!smpteString) {
        return Math.floor(this.mediaElement?.currentTime || 0);
    }

    const parts = smpteString.split(':');
    if (parts.length < 3) {
        console.error("MediaTimelineManager: Invalid SMPTE string format for seconds conversion. Expected HH:MM:SS:FF or HH:MM:SS.");
        return NaN;
    }

    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    const seconds = parseInt(parts[2], 10) || 0;

    return (hours * 3600) + (minutes * 60) + seconds;
};

/**
 * Converts an SMPTE timecode string (HH:MM:SS:FF) or a standard timecode (HH:MM:SS) into total milliseconds.
 *
 * @param {String} [smpteInput] - Optional: The SMPTE or standard timecode string.
 * @returns {Number} The total number of milliseconds.
 */
MediaTimelineManager.prototype.smpteToMilliseconds = function(smpteInput) {
    const frameDurationMs = 1000 / this.playbackRate;
    let frames = 0;
    let secondsTotal = 0;

    if (smpteInput) {
        const parts = smpteInput.split(':');
        if (parts.length === 4) { // HH:MM:SS:FF
            frames = parseInt(parts[3], 10) || 0;
        } else if (parts.length === 3) { // HH:MM:SS (no frames, assume 0)
            frames = 0;
        } else {
            console.error("MediaTimelineManager: Invalid timecode format for milliseconds conversion. Expected HH:MM:SS:FF or HH:MM:SS.");
            return NaN;
        }
        secondsTotal = this.smpteToSeconds(smpteInput);
    } else {
        // If no input, use current media time and derive SMPTE to get frames
        const currentSmpte = this.convertToSMPTE();
        const currentParts = currentSmpte.split(':');
        frames = parseInt(currentParts[3], 10) || 0;
        secondsTotal = this.mediaElement?.currentTime || 0;
    }

    const millisecondsFromFrames = Math.round(frameDurationMs * frames); // Use round for better precision
    return Math.floor((secondsTotal * 1000) + millisecondsFromFrames);
};

/**
 * Converts an SMPTE timecode string (HH:MM:SS:FF) into its equivalent total frame number.
 *
 * @param {String} [smpteCode] - Optional: The SMPTE timecode string. If omitted, current media time is used.
 * @returns {Number} The total frame number.
 */
MediaTimelineManager.prototype.smpteToTotalFrames = function(smpteCode) {
    let timeParts;
    if (smpteCode) {
        timeParts = smpteCode.split(':');
        if (timeParts.length !== 4) {
            console.error("MediaTimelineManager: Invalid SMPTE string format for frame conversion. Expected HH:MM:SS:FF.");
            return NaN;
        }
    } else {
        // If no SMPTE code, get it from current time
        timeParts = this.convertToSMPTE().split(':');
    }

    const currentRate = this.playbackRate;
    const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;
    const seconds = parseInt(timeParts[2], 10) || 0;
    const frames = parseInt(timeParts[3], 10) || 0;

    const totalFramesFromHours = hours * 3600 * currentRate;
    const totalFramesFromMinutes = minutes * 60 * currentRate;
    const totalFramesFromSeconds = seconds * currentRate;

    return Math.floor(totalFramesFromHours + totalFramesFromMinutes + totalFramesFromSeconds + frames);
};

/**
 * Internal helper for seeking operations, adjusting media time by a given number of frames.
 * @private
 * @param {String} seekDirection - 'forward' or 'backward'.
 * @param {Number} framesToAdjust - Number of frames to move.
 * @returns {void}
 */
MediaTimelineManager.prototype._internalSeekAdjustment = function(seekDirection, framesToAdjust) {
    if (!this.mediaElement) {
        console.error("MediaTimelineManager: Cannot seek, media element is not initialized.");
        return;
    }
    if (isNaN(framesToAdjust) || framesToAdjust < 0) {
        console.warn("MediaTimelineManager: Invalid number of frames for seeking. Using default 1 frame.");
        framesToAdjust = 1;
    }

    // Pause the video during seeking to prevent playback issues
    if (!this.mediaElement.paused) {
        this.mediaElement.pause();
    }

    const currentFrame = this.getCurrentFrameIndex();
    let targetFrame;

    if (seekDirection === 'backward') {
        targetFrame = Math.max(0, currentFrame - framesToAdjust); // Ensure target frame doesn't go below 0
    } else { // 'forward'
        targetFrame = currentFrame + framesToAdjust;
    }

    // Convert target frame back to seconds. Add a tiny epsilon to ensure the video engine
    // registers a change and avoids potential rounding issues that might keep it on the same frame.
    const newTime = (targetFrame / this.playbackRate) + 0.000005; // Slightly different epsilon

    // Clamp the new time to the media's duration to prevent seeking beyond the end
    this.mediaElement.currentTime = Math.min(newTime, this.mediaElement.duration || Infinity);
};

/**
 * Advances the media playback by a specified number of frames.
 *
 * @param {Number} [numFrames=1] - The number of frames to advance.
 * @param {Function} [onCompleteCallback] - Optional callback to execute after the seek operation.
 * @returns {Boolean} Always returns true if operation was attempted, callback handles results.
 */
MediaTimelineManager.prototype.advanceFrames = function(numFrames = 1, onCompleteCallback) {
    if (!this.mediaElement) {
        console.error("MediaTimelineManager: Cannot advance frames, media element is not initialized.");
        return false;
    }
    this._internalSeekAdjustment('forward', numFrames);
    if (typeof onCompleteCallback === 'function') {
        onCompleteCallback();
    }
    return true;
};

/**
 * Rewinds the media playback by a specified number of frames.
 *
 * @param {Number} [numFrames=1] - The number of frames to rewind.
 * @param {Function} [onCompleteCallback] - Optional callback to execute after the seek operation.
 * @returns {Boolean} Always returns true if operation was attempted, callback handles results.
 */
MediaTimelineManager.prototype.rewindFrames = function(numFrames = 1, onCompleteCallback) {
    if (!this.mediaElement) {
        console.error("MediaTimelineManager: Cannot rewind frames, media element is not initialized.");
        return false;
    }
    this._internalSeekAdjustment('backward', numFrames);
    if (typeof onCompleteCallback === 'function') {
        onCompleteCallback();
    }
    return true;
};

/**
 * Seeks to a specific position in the media based on various input formats.
 * Supports SMPTE, standard timecode, frame number, seconds, or milliseconds.
 *
 * @param {Object} positionConfig - Configuration object specifying the target position.
 *   Example: { smpte: '00:01:12:22' }, { timecode: '00:01:12' }, { frame: 1750 },
 *            { seconds: 72 }, { milliseconds: 72916 }
 * @returns {void}
 */
MediaTimelineManager.prototype.jumpToPosition = function(positionConfig) {
    if (!this.mediaElement) {
        console.error("MediaTimelineManager: Cannot jump to position, media element is not initialized.");
        return;
    }
    if (!positionConfig || typeof positionConfig !== 'object' || Object.keys(positionConfig).length === 0) {
        console.error("MediaTimelineManager: `jumpToPosition` requires a configuration object.");
        return;
    }

    const configKeys = Object.keys(positionConfig);
    if (configKeys.length > 1) {
        console.warn("MediaTimelineManager: Multiple seek options provided. Only the first valid option will be used.");
    }

    const seekOption = configKeys[0];
    const optionValue = positionConfig[seekOption];
    let targetTimeInSeconds = NaN;
    let smpteRepresentation = null;

    if (typeof optionValue === 'undefined' || optionValue === null || (typeof optionValue === 'string' && optionValue.trim() === '')) {
        console.error(`MediaTimelineManager: Value for seek option '${seekOption}' is invalid or empty.`);
        return;
    }

    // Use a switch statement for clearer logic
    switch (seekOption.toLowerCase()) {
        case 'smpte':
            smpteRepresentation = String(optionValue);
            targetTimeInSeconds = this.smpteToMilliseconds(smpteRepresentation) / 1000;
            break;
        case 'timecode': // Assuming HH:MM:SS format
            smpteRepresentation = String(optionValue);
            // Append ':00' for frame part if not present, to use smpteToMilliseconds
            if (smpteRepresentation.split(':').length === 3) {
                smpteRepresentation += ':00';
            }
            targetTimeInSeconds = this.smpteToMilliseconds(smpteRepresentation) / 1000;
            break;
        case 'frame':
            const frameNum = parseInt(optionValue, 10);
            if (isNaN(frameNum)) {
                console.error("MediaTimelineManager: Invalid frame number for seeking.");
                return;
            }
            smpteRepresentation = this.convertToSMPTE(frameNum);
            targetTimeInSeconds = this.smpteToMilliseconds(smpteRepresentation) / 1000;
            break;
        case 'seconds':
            targetTimeInSeconds = parseFloat(optionValue);
            break;
        case 'milliseconds':
            targetTimeInSeconds = parseFloat(optionValue) / 1000;
            break;
        default:
            console.error(`MediaTimelineManager: Unknown seek option '${seekOption}'. Supported: smpte, timecode, frame, seconds, milliseconds.`);
            return;
    }

    if (!isNaN(targetTimeInSeconds)) {
        // Add a small epsilon to ensure the video engine registers the seek,
        // especially when seeking to exact calculated times.
        const finalSeekTime = targetTimeInSeconds + 0.000001; // Another distinct epsilon
        this.mediaElement.currentTime = Math.min(finalSeekTime, this.mediaElement.duration || Infinity);
        console.info(`MediaTimelineManager: Seeked to ${finalSeekTime.toFixed(3)}s.`);
    } else {
        console.error("MediaTimelineManager: Failed to calculate valid target time for seeking.");
    }
};