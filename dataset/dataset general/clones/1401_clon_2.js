AudioStreamer.StreamHandler = function ( ) {
    AudioStreamer.currentInstance = this;

    this.audioItems = {};
    this.activeStreamIdentifier = null;
};

// Media types flagged as 'true' are typically MPEG4 and necessitate 'isMovieStar' configuration in the sound management initialization.
AudioStreamer.StreamHandler.MEDIA_FORMATS = {
    "audio/mp3": false,
    "audio/aac": true,
    "audio/x-aac": true,
    "audio/flv": true,
    "audio/mov": true,
    "audio/mp4": true,
    "audio/m4v": true,
    "audio/f4v": true,
    "audio/m4a": true,
    "audio/x-m4a": true,
    "audio/x-m4b": true,
    "audio/mp4v": true,
    "audio/3gp": true,
    "audio/3g2": true
};

AudioStreamer.StreamHandler.DEFAULT_LISTENERS = {
    onLoad: AudioStreamer.noOp,
    onPlay: AudioStreamer.noOp,
    onPause: AudioStreamer.noOp,
    onResume: AudioStreamer.noOp,
    onStop: AudioStreamer.noOp,
    onFinish: AudioStreamer.noOp,
    whileLoading: AudioStreamer.noOp,
    whilePlaying: AudioStreamer.noOp
};

AudioStreamer.StreamHandler.prototype = {

    /**
     * Retrieves a list of supported media formats.
     * @returns {Array<string>} An array containing all supported MIME types.
     */
    retrieveMediaFormats: function( ) {
        var formatList = []; // Initialize an empty array for media formats.
        for (var formatKey in AudioStreamer.StreamHandler.MEDIA_FORMATS) {
            formatList.push(formatKey); // Add each format key to the list.
        }
        return formatList;
    },

    /**
     * Registers a new audio source with the stream handler.
     * @param {Object} sourceData - Data pertaining to the audio source, including its ID.
     * @param {Object} eventListeners - Custom callback functions for various audio events.
     * @returns {Object|boolean} The newly registered audio item or false if already exists.
     */
    registerAudioSource: function ( sourceData, eventListeners ) {
        if ( this.audioItems[sourceData.streamId] ) {
            return false; // Audio item with this ID already registered.
        }

        // Merge provided listeners with defaults and additional module listeners.
        eventListeners = eventListeners || {};
        var listenerOptions = [eventListeners];
        listenerOptions.push(AudioStreamer.StreamHandler.DEFAULT_LISTENERS);

        // Incorporate status display callbacks if the module is available.
        if ( AudioStreamer.statusDisplay ) {
            listenerOptions.push(AudioStreamer.statusDisplay.getAudioListeners(sourceData));
        }

        // Add tracking module callbacks for lifecycle events if tracking is enabled.
        if ( AudioStreamer.trackingModule ) {
            listenerOptions.push(AudioStreamer.trackingModule.getAudioListeners(sourceData));
        }

        AudioStreamer.Utility.mergeProperties(eventListeners, AudioStreamer.Utility.combineListeners(listenerOptions));

        var handlerRef = this; // Reference to the current stream handler instance.

        // Define the audio item object structure.
        var audioItem = {
            itemIdentifier: 's_' + sourceData.streamId,
            sourceData: sourceData,
            eventListeners: eventListeners,

            /*
             * Numeric value indicating the current loading status of the audio item.
             * 0 = Uninitialized / not yet loaded
             * 1 = Currently loading data
             * 2 = Loading failed / error occurred
             * 3 = Fully loaded / success
             */
            loadStatus: 0,

            /*
             * Numeric value indicating the current playback state of the audio item.
             * 0 = Stopped or uninitialized state
             * 1 = Playing or buffering (playback initiated, awaiting data, etc.)
             * Note: A state of 1 does not always guarantee audible sound due to buffering or autoPlay settings.
             */
            playbackStatus: 0,

            /** Toggles the paused state of this specific audio item. */
            toggleItemPause: function( ) {
                handlerRef.toggleStreamPause(sourceData.streamId);
            },

            /** Sets the playback position for this audio item. */
            setItemPosition: function( newPosition ) {
                handlerRef.updatePlaybackPosition(sourceData.streamId, newPosition);
            },

            /** Halts playback for this audio item. */
            haltItem: function( onUnloadFlag ) {
                handlerRef.endPlayback(sourceData.streamId, onUnloadFlag);
            },

            /**
             * Callback function executed upon successful playback initiation.
             * @param {Object} responsePayload - Response data from the server.
             */
            onPlaybackStart: function( responsePayload ) {
                if ( responsePayload.status === 'success' ) {
                    this.playbackStatus = 1;
                    this.loadStatus = 3;
                    AudioStreamer.currentInstance.activeStreamIdentifier = this.itemIdentifier;
                    // Update the status display if available.
                    if ( AudioStreamer.statusDisplay ) {
                        AudioStreamer.statusDisplay.handlePlaybackInitiated(this.sourceData);
                    }
                    this.eventListeners.onPlay.call(this);
                } else {
                    this.loadStatus = 2; // Mark as failed if response is not 'success'.
                }
                this.eventListeners.onLoad.call(this);
            },

            /**
             * Callback function executed upon playback termination.
             * @param {Object} terminationStatus - Status information regarding the termination.
             */
            onPlaybackEnd: function( terminationStatus ) {
                this.playbackStatus = 0;
                this.loadStatus = 0;
                AudioStreamer.currentInstance.activeStreamIdentifier = null;
                this.eventListeners.onStop.call(this);
            },

            /**
             * Callback function executed when playback pause is toggled.
             * @param {Object} pauseResponse - Response from the pause/resume API call.
             */
            onPauseToggle: function( pauseResponse ) {
                // Invert the playback status.
                this.playbackStatus = this.playbackStatus ? 0 : 1;
                if ( this.playbackStatus === 1 ) {
                    this.eventListeners.onResume.call(this);
                } else {
                    this.eventListeners.onPause.call(this);
                }
            },

            /** Placeholder for resource release logic. */
            releaseItem: AudioStreamer.noOp,

            isChained: false // Indicates if this item is part of a chained playback sequence.
        };

        this.audioItems[sourceData.streamId] = audioItem;
        return audioItem;
    },

    /**
     * Initiates playback for a specified audio stream.
     * If another stream is active, it will be stopped first.
     * @param {string} streamIdToPlay - The unique identifier of the stream to play.
     * @returns {Object} The audio item that was played.
     */
    initiateStreamPlayback: function ( streamIdToPlay ) {
        var targetAudio = this.audioItems[streamIdToPlay];
        if ( this.activeStreamIdentifier !== streamIdToPlay ) {
            this.stopCurrentPlayback(); // Stop any currently active stream.
        }

        targetAudio.toggleItemPause(); // Play or resume the target audio.
        return targetAudio;
    },

    /**
     * Halts the currently playing audio stream.
     * @param {boolean} [forceTermination=false] - If true, performs a hard stop, potentially affecting external modules.
     */
    stopCurrentPlayback: function ( forceTermination ) {
        if ( forceTermination ) {
            if ( AudioStreamer.trackingModule ) {
                AudioStreamer.trackingModule.stopTracking(); // Notify tracking module of hard stop.
            }
        }
        // Update any visual status display.
        if ( AudioStreamer.statusDisplay ) {
            AudioStreamer.statusDisplay.clearActive();
        }
        var activeAudio = this.getActiveAudioItem();
        if ( activeAudio ) {
            activeAudio.haltItem(forceTermination); // Stop the active audio item.
        }
    },

    /**
     * Stops a specific audio stream if it is the currently active one.
     * @param {string} streamIdToStop - The identifier of the stream to stop.
     * @returns {boolean} True if the stream was stopped, false otherwise.
     */
    stopSpecificStream: function ( streamIdToStop ) {
        if ( streamIdToStop && streamIdToStop === this.activeStreamIdentifier ) {
            this.stopCurrentPlayback();
            return true;
        }
        return false;
    },

    /**
     * Checks if any audio stream is currently active.
     * @returns {boolean} True if a stream is playing, false otherwise.
     */
    isAnyStreamPlaying: function( ) {
        if ( this.activeStreamIdentifier ) {
            return true;
        }
        return false;
    },

    /**
     * Retrieves the currently active audio item object.
     * @returns {Object|undefined} The active audio item or undefined if none.
     */
    getActiveAudioItem: function( ) {
        if ( this.activeStreamIdentifier ) {
            return this.audioItems[this.activeStreamIdentifier];
        }
    },

    /** Toggles playback for the currently active stream. */
    toggleActiveStreamPlayback: function( ) {
        if ( this.isAnyStreamPlaying() ) {
            this.initiateStreamPlayback(this.activeStreamIdentifier);
        }
    },

    /* --- Public API Methods --- */

    /**
     * Generates a URL for an API endpoint.
     * @param {string} apiCall - The name of the API method to call.
     * @param {Object} [requestParams={}] - Parameters for the API request.
     * @returns {string} The constructed API URL.
     */
    generateApiEndpoint: function ( apiCall, requestParams ) {
        requestParams = requestParams || {};
        requestParams.requestId = new Date().getTime(); // Unique ID for this request.
        requestParams.jsonpHandler = requestParams.jsonpHandler || 'AudioStreamer.noOp';
        requestParams.operation = apiCall;
        AudioStreamer.apiClient.addAuthIdentifier(requestParams); // Add authentication token.
        return AudioStreamer.apiClient.getServiceUrl("/player", requestParams);
    },

    /**
     * Initiates playback of an audio stream via an API call.
     * @param {string} targetStreamId - The ID of the stream to play.
     */
    startPlayback: function ( targetStreamId ) {
        AudioStreamer.Utility.loadScriptDynamically(this.generateApiEndpoint('play', {
            id: targetStreamId,
            jsonpHandler: 'AudioStreamer.currentInstance.audioItems["'+targetStreamId+'"].onPlaybackStart'
        }));
    },

    /**
     * Terminates playback of an audio stream via an API call.
     * @param {string} targetStreamId - The ID of the stream to stop.
     * @param {boolean} onWindowClose - Indicates if the stop is triggered by a window unload event.
     */
    endPlayback: function ( targetStreamId, onWindowClose ) {
        if ( onWindowClose ) {
            var tempWindow = window.open(); // Open a temporary window for the unload action.
            var terminationApiUrl = this.generateApiEndpoint('stop', {
                jsonpHandler: "function StreamHandler_close (data) { window.close() } StreamHandler_close"
            });
            tempWindow.document.write('<html>'
                + '<body>'
                + '<script src="' + terminationApiUrl + '"></script>'
                + '</body>'
                + '</html>'
            );
        } else {
            AudioStreamer.Utility.loadScriptDynamically(this.generateApiEndpoint('stop', {
                jsonpHandler: 'AudioStreamer.currentInstance.audioItems["'+targetStreamId+'"].onPlaybackEnd'
            }));
        }
    },

    /**
     * Toggles the pause/resume state of an audio stream.
     * If the stream is not loaded, it will attempt to play it.
     * @param {string} targetStreamId - The ID of the stream to toggle.
     */
    pauseResumeToggle: function ( targetStreamId ) {
        if ( this.audioItems[targetStreamId].loadStatus === 0 ) {
            this.startPlayback(targetStreamId); // If not loaded, initiate playback.
        } else {
            AudioStreamer.Utility.loadScriptDynamically(this.generateApiEndpoint('pausetoggle', {
                jsonpHandler: 'AudioStreamer.currentInstance.audioItems["'+targetStreamId+'"].onPauseToggle'
            }));
        }
    },

    /**
     * Fetches the current playback position of a stream (API call only).
     * @param {string} streamIdentifier - The ID of the stream. (Currently unused in implementation)
     */
    fetchCurrentPosition: function ( streamIdentifier ) {
        AudioStreamer.Utility.loadScriptDynamically(this.generateApiEndpoint('currentPosition'));
    },

    /**
     * Updates the playback position of a stream. (Currently not implemented)
     * @param {string} streamIdentifier - The ID of the stream.
     * @param {number} newPositionValue - The desired new position in milliseconds.
     */
    updatePlaybackPosition: function ( streamIdentifier, newPositionValue ) {
        // This functionality is not yet implemented in the API.
    },

    /**
     * Fetches the identifier of the actively playing stream (API call only).
     */
    fetchActiveStreamIdentifier: function( ) {
        AudioStreamer.Utility.loadScriptDynamically(this.generateApiEndpoint('activeId'));
    }
};