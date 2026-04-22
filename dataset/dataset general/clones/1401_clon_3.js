const AudioCore = AudioCore || {};

// A no-operation function, useful for default callbacks
AudioCore.noOp = function() {};

// --- Toolkit for common utilities ---
AudioCore.Toolkit = {
    /**
     * Merges properties from a source object into a target object.
     * Later properties overwrite earlier ones.
     * @param {object} target - The object to extend.
     * @param {object} source - The object providing properties.
     * @returns {object} The extended target object.
     */
    mergeProperties: function(target, source) {
        if (!target || typeof target !== 'object') {
            target = {};
        }
        if (source && typeof source === 'object') {
            Object.assign(target, source);
        }
        return target;
    },

    /**
     * Combines multiple sets of event handlers, ensuring that specific
     * lifecycle handlers (like onLoad, onPlay) are merged correctly,
     * allowing for chaining or overriding.
     * This version prioritizes handlers from later objects in the array.
     * @param {Array<object>} handlerObjects - An array of objects containing event handlers.
     * @returns {object} A single object with combined handlers.
     */
    combineEventHandlers: function(handlerObjects) {
        const combined = {};
        handlerObjects.forEach(handlers => {
            if (handlers && typeof handlers === 'object') {
                for (const key in handlers) {
                    if (Object.prototype.hasOwnProperty.call(handlers, key)) {
                        combined[key] = handlers[key];
                    }
                }
            }
        });
        return combined;
    },

    /**
     * Dynamically injects a JavaScript script into the document.
     * @param {string} scriptUrl - The URL of the script to inject.
     */
    injectScript: function(scriptUrl) {
        if (!scriptUrl) {
            console.warn('AudioCore.Toolkit.injectScript: No script URL provided.');
            return;
        }
        const scriptElement = document.createElement('script');
        scriptElement.src = scriptUrl;
        scriptElement.async = true; // Make script loading non-blocking
        document.head.appendChild(scriptElement);
    },

    /**
     * Basic logging utility.
     * @param {string} message - The message to log.
     * @param {string} [level='info'] - The log level ('info', 'warn', 'error').
     */
    log: function(message, level = 'info') {
        if (console && console[level]) {
            console[level](`[AudioCore] ${message}`);
        }
    }
};

// --- Constants for sound and playback states ---
AudioCore.SoundState = {
    UNINITIALIZED: 0,
    LOADING: 1,
    FAILED: 2,
    LOADED: 3
};

AudioCore.PlaybackState = {
    STOPPED: 0,
    PLAYING_OR_BUFFERING: 1
};


/**
 * @constructor
 * Manages audio playback for the application.
 * This class orchestrates the loading, playing, pausing, and stopping of audio streams.
 */
AudioCore.SoundManager = function () {
    // Establish a global reference to this manager instance.
    // This allows JSONP callbacks to easily target the active manager.
    AudioCore.activeManager = this;

    /**
     * A collection of registered audio track objects, keyed by their stream ID.
     * @type {Object.<string, AudioTrackObject>}
     */
    this.audioTracks = {};

    /**
     * The unique identifier of the audio track currently playing or paused.
     * Null if no track is active.
     * @type {string|null}
     */
    this.currentTrackId = null;

    // Additional internal state to track last known activity
    this._lastActivityTimestamp = Date.now();

    AudioCore.Toolkit.log('SoundManager initialized.');
};

/**
 * Defines audio MIME types supported by the player.
 * @type {string[]}
 */
AudioCore.SoundManager.SUPPORTED_AUDIO_FORMATS = [
    "audio/mpeg",
    "audio/aac",
    "audio/x-aac",
    "audio/flv",
    "audio/mov",
    "audio/mp4",
    "audio/m4v",
    "audio/f4v",
    "audio/m4a",
    "audio/x-m4a",
    "audio/x-m4b",
    "audio/mp4v",
    "audio/3gp",
    "audio/3g2"
];

/**
 * Default event listeners for audio tracks.
 * These functions provide no-op behavior if specific handlers are not provided.
 * @type {object}
 */
AudioCore.SoundManager.DEFAULT_LISTENERS = {
    onLoad: AudioCore.noOp,
    onPlay: AudioCore.noOp,
    onPause: AudioCore.noOp,
    onResume: AudioCore.noOp,
    onStop: AudioCore.noOp,
    onFinish: AudioCore.noOp,
    onWhileLoading: AudioCore.noOp,
    onWhilePlaying: AudioCore.noOp
};

// --- SoundManager Prototype Methods ---
AudioCore.SoundManager.prototype = {

    /**
     * Retrieves an array of all MIME types supported by the player.
     * @returns {string[]} An array of supported MIME type strings.
     */
    retrieveSupportedFormats: function () {
        return AudioCore.SoundManager.SUPPORTED_AUDIO_FORMATS.slice(); // Return a copy
    },

    /**
     * Enrolls a new audio stream with the manager, creating an internal audio object.
     * If a stream with the same ID already exists, it returns `false`.
     * @param {object} trackInfo - Object containing stream details (must have `sid`).
     * @param {object} [eventHandlers] - Optional custom event handlers for this track.
     * @returns {AudioTrackObject|boolean} The newly created audio track object, or `false` if registration failed.
     */
    enrollAudioStream: function (trackInfo, eventHandlers) {
        if (!trackInfo || !trackInfo.sid) {
            AudioCore.Toolkit.log('Cannot enroll audio stream: Invalid trackInfo or missing sid.', 'error');
            return false;
        }

        const streamId = trackInfo.sid;
        if (this.audioTracks[streamId]) {
            AudioCore.Toolkit.log(`Audio stream with ID "${streamId}" is already enrolled.`, 'warn');
            return false;
        }

        // Merge default handlers with provided ones
        let finalHandlers = AudioCore.Toolkit.combineEventHandlers([
            AudioCore.SoundManager.DEFAULT_LISTENERS,
            eventHandlers || {}
        ]);

        // Dynamically add wrappers for global services like UI and history tracking
        const handlerChain = [finalHandlers];

        if (AudioCore.playbackUI && typeof AudioCore.playbackUI.getSoundCallbacks === 'function') {
            handlerChain.push(AudioCore.playbackUI.getSoundCallbacks(trackInfo));
        }
        if (AudioCore.historyTracker && typeof AudioCore.historyTracker.getSoundCallbacks === 'function') {
            handlerChain.push(AudioCore.historyTracker.getSoundCallbacks(trackInfo));
        }

        // Re-combine all handlers, with service wrappers potentially overriding/extending base handlers
        finalHandlers = AudioCore.Toolkit.combineEventHandlers(handlerChain);

        const self = this; // Capture 'this' for use within the audio object's methods

        /**
         * Factory function to create an audio track object.
         * @param {string} id - The sound ID.
         * @param {object} info - The track information.
         * @param {object} handlers - The combined event handlers.
         * @returns {object} An audio track object.
         */
        const _createAudioTrackObject = (id, info, handlers) => {
            return {
                trackIdentifier: `s_${id}`,
                trackDetails: info,
                eventListeners: handlers,
                loadStatus: AudioCore.SoundState.UNINITIALIZED,
                playbackStatus: AudioCore.PlaybackState.STOPPED,
                
                // Public control methods for the track
                togglePlaybackPause: function () {
                    self.requestPauseToggle(id);
                },
                updatePlaybackPosition: function (newPosition) {
                    self.setPlaybackPosition(id, newPosition);
                },
                haltPlayback: function (shouldUnload) {
                    self.terminatePlayback(id, shouldUnload);
                },
                disposeTrack: AudioCore.noOp, // Placeholder for potential cleanup logic

                // Internal callback handlers for JSONP responses
                handlePlayResponse: function (responsePayload) {
                    if (responsePayload && responsePayload.response === 'ok') {
                        this.playbackStatus = AudioCore.PlaybackState.PLAYING_OR_BUFFERING;
                        this.loadStatus = AudioCore.SoundState.LOADED;
                        self.currentTrackId = id; // Update manager's current track
                        
                        // Notify UI if available
                        if (AudioCore.playbackUI) {
                            AudioCore.playbackUI.playHandler(this.trackDetails);
                        }
                        this.eventListeners.onPlay.call(this);
                    } else {
                        this.loadStatus = AudioCore.SoundState.FAILED;
                        AudioCore.Toolkit.log(`Playback failed for track ${id}: ${responsePayload ? responsePayload.message : 'Unknown error'}`, 'error');
                    }
                    this.eventListeners.onLoad.call(this); // onLoad is called regardless of success/failure
                },
                handleStopResponse: function (status) { // 'status' might be a simple string or object depending on API
                    this.playbackStatus = AudioCore.PlaybackState.STOPPED;
                    this.loadStatus = AudioCore.SoundState.UNINITIALIZED; // Reset state
                    if (self.currentTrackId === id) {
                        self.currentTrackId = null;
                    }
                    this.eventListeners.onStop.call(this);
                },
                handlePauseToggleResponse: function (responsePayload) {
                    // Update playback state based on current state
                    this.playbackStatus = this.playbackStatus === AudioCore.PlaybackState.PLAYING_OR_BUFFERING
                        ? AudioCore.PlaybackState.STOPPED
                        : AudioCore.PlaybackState.PLAYING_OR_BUFFERING;
                    
                    if (this.playbackStatus === AudioCore.PlaybackState.PLAYING_OR_BUFFERING) {
                        this.eventListeners.onResume.call(this);
                    } else {
                        this.eventListeners.onPause.call(this);
                    }
                }
            };
        };

        const audioObject = _createAudioTrackObject(streamId, trackInfo, finalHandlers);
        this.audioTracks[streamId] = audioObject;
        AudioCore.Toolkit.log(`Enrolled audio stream: ${streamId}`);
        return audioObject;
    },

    /**
     * Generates a unique JSONP callback name for a specific track and method.
     * @param {string} trackId - The ID of the track.
     * @param {string} methodName - The name of the callback method on the track object.
     * @returns {string} The full JSONP callback string.
     */
    _generateTrackCallbackName: function(trackId, methodName) {
        // Ensure trackId is safe for string interpolation in JS
        const safeTrackId = trackId.replace(/"/g, '\\"');
        return `AudioCore.activeManager.audioTracks["${safeTrackId}"].${methodName}`;
    },

    /**
     * Initiates playback for a specified audio stream.
     * If a different track is currently playing, it will be stopped first.
     * @param {string} trackId - The ID of the audio track to play.
     * @returns {AudioTrackObject|null} The audio track object if found, otherwise null.
     */
    startPlayback: function (trackId) {
        const audioObject = this.audioTracks[trackId];
        if (!audioObject) {
            AudioCore.Toolkit.log(`Cannot start playback: Track ID "${trackId}" not found.`, 'error');
            return null;
        }

        // If a different track is currently playing, stop it.
        if (this.currentTrackId && this.currentTrackId !== trackId) {
            this.haltCurrentPlayback();
        }
        
        // Request the API to play/toggle pause the track.
        // This implicitly handles playing if not loaded, or toggling pause if already playing.
        audioObject.togglePlaybackPause();
        this._lastActivityTimestamp = Date.now();
        AudioCore.Toolkit.log(`Attempting to start playback for track: ${trackId}`);
        return audioObject;
    },

    /**
     * Halts the currently playing audio track.
     * @param {boolean} [forceStop=false] - If true, implies a more aggressive stop (e.g., clearing history tracker).
     */
    haltCurrentPlayback: function (forceStop = false) {
        if (forceStop && AudioCore.historyTracker) {
            AudioCore.historyTracker.stop(); // Notify history tracker of forced stop
        }
        
        // Notify UI to clear current playback status
        if (AudioCore.playbackUI) {
            AudioCore.playbackUI.stopCurrent();
        }

        const currentTrack = this.getCurrentPlayingTrack();
        if (currentTrack) {
            currentTrack.haltPlayback(forceStop); // Call the track's internal stop method
            AudioCore.Toolkit.log(`Halting current playback: ${currentTrack.trackDetails.sid}`);
        } else {
            AudioCore.Toolkit.log('No track currently playing to halt.');
        }
    },

    /**
     * Halts a specific audio stream if it matches the currently playing track.
     * @param {string} trackId - The ID of the audio track to stop.
     * @returns {boolean} True if the specified track was stopped, false otherwise.
     */
    haltSpecificStream: function (trackId) {
        if (!trackId) {
            AudioCore.Toolkit.log('Cannot halt specific stream: No track ID provided.', 'warn');
            return false;
        }

        // Only stop if the requested track is the one currently active
        if (this.currentTrackId === trackId) {
            this.haltCurrentPlayback();
            AudioCore.Toolkit.log(`Stopped specific stream: ${trackId}`);
            return true;
        }
        AudioCore.Toolkit.log(`Track ${trackId} is not the current playing track, no action taken.`);
        return false;
    },

    /**
     * Checks if any audio track is currently designated as playing or paused.
     * @returns {boolean} True if a track ID is present in `currentTrackId`, false otherwise.
     */
    isAnyTrackPlaying: function () {
        // Simplified check using boolean coercion
        return !!this.currentTrackId;
    },

    /**
     * Retrieves the AudioTrackObject for the currently playing track.
     * @returns {AudioTrackObject|null} The current playing track object, or null if none.
     */
    getCurrentPlayingTrack: function () {
        if (this.currentTrackId && this.audioTracks[this.currentTrackId]) {
            return this.audioTracks[this.currentTrackId];
        }
        return null;
    },

    /**
     * Toggles the playback state (play/pause) of the currently active track.
     * If no track is active, no action is taken.
     */
    toggleCurrentTrackPlayback: function () {
        if (this.isAnyTrackPlaying()) {
            // Re-use startPlayback as it handles the toggle logic
            this.startPlayback(this.currentTrackId);
            AudioCore.Toolkit.log(`Toggling playback for current track: ${this.currentTrackId}`);
        } else {
            AudioCore.Toolkit.log('No current track to toggle playback for.');
        }
    },

    /* --- API Interaction Methods --- */

    /**
     * Constructs a URL for interacting with the backend API.
     * @param {string} apiMethod - The specific API method to call (e.g., 'play', 'stop').
     * @param {object} [requestParams={}] - Parameters for the API call.
     * @returns {string} The complete URL for the API request.
     */
    composeApiUrl: function (apiMethod, requestParams = {}) {
        requestParams.call_id = Date.now(); // Use Date.now() for unique call_id
        requestParams.jsonp = requestParams.jsonp || 'AudioCore.noOp'; // Default JSONP callback
        requestParams.method = apiMethod;

        if (AudioCore.apiClient && typeof AudioCore.apiClient.appendAuthToken === 'function') {
            AudioCore.apiClient.appendAuthToken(requestParams);
        } else {
            AudioCore.Toolkit.log('API client or appendAuthToken method not found. Authentication token may be missing.', 'warn');
        }

        if (AudioCore.apiClient && typeof AudioCore.apiClient.getServiceBaseUrl === 'function') {
            return AudioCore.apiClient.getServiceBaseUrl("/player", requestParams);
        } else {
            AudioCore.Toolkit.log('API client or getServiceBaseUrl method not found. Cannot compose API URL.', 'error');
            // Fallback: construct a basic URL, might not work
            const queryString = Object.keys(requestParams).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(requestParams[key])}`).join('&');
            return `/player?${queryString}`;
        }
    },
    
    /**
     * Initiates playback for a track via the API.
     * @param {string} trackId - The ID of the track to play.
     */
    initiatePlayback: function (trackId) {
        if (!trackId) {
            AudioCore.Toolkit.log('Cannot initiate playback: No track ID provided.', 'error');
            return;
        }
        const callbackName = this._generateTrackCallbackName(trackId, 'handlePlayResponse');
        const apiUrl = this.composeApiUrl('play', {
            sid: trackId,
            jsonp: callbackName
        });
        AudioCore.Toolkit.injectScript(apiUrl);
        this._lastActivityTimestamp = Date.now();
        AudioCore.Toolkit.log(`API call: initiatePlayback for ${trackId}`);
    },

    /**
     * Terminates playback for a track via the API.
     * The original `onUnload` functionality involving `window.open` has been removed
     * as a Type III structural change, simplifying the stop mechanism.
     * @param {string} trackId - The ID of the track to stop.
     * @param {boolean} [isUnloadOperation=false] - Flag if this is part of an unload process (ignored for now).
     */
    terminatePlayback: function (trackId, isUnloadOperation = false) {
        if (!trackId) {
            AudioCore.Toolkit.log('Cannot terminate playback: No track ID provided.', 'error');
            return;
        }
        const callbackName = this._generateTrackCallbackName(trackId, 'handleStopResponse');
        const apiUrl = this.composeApiUrl('stop', {
            sid: trackId,
            jsonp: callbackName
        });
        AudioCore.Toolkit.injectScript(apiUrl);
        this._lastActivityTimestamp = Date.now();
        AudioCore.Toolkit.log(`API call: terminatePlayback for ${trackId}`);
    },

    /**
     * Toggles the pause state of a track via the API.
     * If the track is uninitialized (loadStatus is 0), it will attempt to play it.
     * @param {string} trackId - The ID of the track to toggle pause for.
     */
    requestPauseToggle: function (trackId) {
        if (!trackId) {
            AudioCore.Toolkit.log('Cannot toggle pause: No track ID provided.', 'error');
            return;
        }
        const audioObject = this.audioTracks[trackId];
        if (!audioObject) {
            AudioCore.Toolkit.log(`Cannot toggle pause: Track ID "${trackId}" not found.`, 'error');
            return;
        }

        if (audioObject.loadStatus === AudioCore.SoundState.UNINITIALIZED) {
            // If the track hasn't started loading, treat toggle as a play request.
            this.initiatePlayback(trackId);
        } else {
            const callbackName = this._generateTrackCallbackName(trackId, 'handlePauseToggleResponse');
            const apiUrl = this.composeApiUrl('pausetoggle', {
                sid: trackId,
                jsonp: callbackName
            });
            AudioCore.Toolkit.injectScript(apiUrl);
            this._lastActivityTimestamp = Date.now();
            AudioCore.Toolkit.log(`API call: requestPauseToggle for ${trackId}`);
        }
    },

    /**
     * Sets the playback position for a track.
     * This method is currently a placeholder and logs a warning.
     * @param {string} trackId - The ID of the track.
     * @param {number} position - The desired position in milliseconds.
     */
    setPlaybackPosition: function (trackId, position) {
        AudioCore.Toolkit.log(`setPlaybackPosition for track ${trackId} to ${position} is not yet fully implemented.`, 'warn');
        this._lastActivityTimestamp = Date.now();
    },

    /**
     * Retrieves the ID of the track currently playing via an API call.
     * This method initiates an API request and doesn't return the ID directly.
     */
    retrieveCurrentTrackId: function () {
        const apiUrl = this.composeApiUrl('np', { jsonp: 'AudioCore.noOp' });
        AudioCore.Toolkit.injectScript(apiUrl);
        this._lastActivityTimestamp = Date.now();
        AudioCore.Toolkit.log('API call: retrieveCurrentTrackId');
    },

    /**
     * Removes an audio track from the manager's registry.
     * This can be used for cleanup if a track is no longer needed.
     * @param {string} trackId - The ID of the track to remove.
     * @returns {boolean} True if the track was removed, false otherwise.
     */
    deregisterAudioStream: function(trackId) {
        if (!trackId) {
            AudioCore.Toolkit.log('Cannot deregister audio stream: No track ID provided.', 'warn');
            return false;
        }
        if (this.audioTracks[trackId]) {
            // Ensure it's not the currently playing track before removal
            if (this.currentTrackId === trackId) {
                this.haltCurrentPlayback(); // Stop it first
                this.currentTrackId = null; // Clear active status
            }
            delete this.audioTracks[trackId];
            AudioCore.Toolkit.log(`Deregistered audio stream: ${trackId}`);
            return true;
        }
        AudioCore.Toolkit.log(`Audio stream with ID "${trackId}" not found for deregistration.`, 'warn');
        return false;
    }
};