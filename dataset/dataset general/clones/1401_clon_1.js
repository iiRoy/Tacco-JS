Playdar.PlaydarPlayer = function() {
  // Assign the current instance to Playdar.player for global access
  Playdar.player = this;

  // Initialize an empty object to store sound objects
  this.sounds = {};

  // Initialize the ID of the currently playing sound to null
  this.nowplayingid = null;
}; // End of Playdar.PlaydarPlayer constructor function


// MIME types configuration for PlaydarPlayer
// This object maps MIME type strings to boolean values.
// A 'true' value indicates that the audio format is MPEG4 and
// may require specific handling (like 'isMovieStar' in SoundManager2).
Playdar.PlaydarPlayer.MIMETYPES = {
    "audio/mpeg": false,  // Standard MPEG audio, typically MP3
    "audio/aac": true,   // AAC audio, often found in MP4 containers
    "audio/x-aac": true, // Vendor-specific AAC
    "audio/flv": true,   // Flash Video audio (often AAC or MP3 within FLV)
    "audio/mov": true,   // QuickTime Movie audio
    "audio/mp4": true,   // MPEG-4 Part 14 audio/video container
    "audio/m4v": true,   // Apple's MP4 video file extension
    "audio/f4v": true,   // Adobe Flash Video (similar to MP4)
    "audio/m4a": true,   // Apple Lossless Audio Codec (ALAC) or AAC in MP4 container
    "audio/x-m4a": true, // Vendor-specific M4A
    "audio/x-m4b": true, // M4B audiobooks (AAC in MP4 container)
    "audio/mp4v": true,  // MPEG-4 video stream
    "audio/3gp": true,   // 3GPP multimedia container
    "audio/3g2": true    // 3GPP2 multimedia container
}; // MIMETYPES object definition ends here


// Default callback functions for PlaydarPlayer sound events.
// These are 'nop' (no operation) functions to prevent errors
// if specific callbacks are not provided by the user.
Playdar.PlaydarPlayer.BaseCallbacks = {
    onload: Playdar.nop,       // Called when a sound has finished loading
    onplay: Playdar.nop,       // Called when a sound starts playing
    onpause: Playdar.nop,      // Called when a sound is paused
    onresume: Playdar.nop,     // Called when a sound resumes playing from a paused state
    onstop: Playdar.nop,       // Called when a sound is stopped
    onfinish: Playdar.nop,     // Called when a sound finishes playing naturally
    whileloading: Playdar.nop, // Called periodically while a sound is loading
    whileplaying: Playdar.nop  // Called periodically while a sound is playing
}; // BaseCallbacks object definition ends here


// Prototype methods for PlaydarPlayer instances.
// These methods define the core functionality of the player.
Playdar.PlaydarPlayer.prototype = {

    /**
     * Retrieves an array of all supported MIME types configured in Playdar.PlaydarPlayer.MIMETYPES.
     * @returns {Array<string>} An array containing all recognized MIME type strings.
     */
    getMimeTypes: function() {
        var mime_types = []; // Initialize an empty array to hold MIME types

        // Iterate over the keys (MIME types) in the MIMETYPES object
        for (var type in Playdar.PlaydarPlayer.MIMETYPES) {
            // Add each MIME type string to the array
            mime_types.push(type);
        }

        return mime_types; // Return the populated array
    },


    /**
     * Registers a new stream (sound) with the player.
     * If a sound with the given SID already exists, it returns false.
     * Otherwise, it creates a new sound object, merges callbacks, and stores it.
     *
     * @param {Object} result - The result object containing sound details, including 'sid'.
     * @param {Object} [callbacks] - Optional object with custom callback functions for the sound.
     * @returns {Object|boolean} The newly registered sound object, or false if already registered.
     */
    register_stream: function(result, callbacks) {
        // Check if a sound with this SID (Stream ID) has already been registered.
        if (this.sounds[result.sid]) {
            return false; // If it exists, prevent re-registration and return false.
        }

        // Merge in default callbacks and register user-provided callbacks.
        // Ensure callbacks object exists; if not, initialize it to an empty object.
        callbacks = callbacks || {};

        // Create an array to hold all callback options, starting with user-provided.
        var callbackOptions = [callbacks];

        // Add the base (default) callbacks to be merged.
        callbackOptions.push(Playdar.PlaydarPlayer.BaseCallbacks);

        // If a status bar is available, wrap sound progress callbacks with its handlers.
        if (Playdar.statusBar) {
            callbackOptions.push(Playdar.statusBar.getSoundCallbacks(result));
        }

        // If a scrobbler is available, wrap sound lifecycle callbacks with scrobbling calls.
        if (Playdar.scrobbler) {
            callbackOptions.push(Playdar.scrobbler.getSoundCallbacks(result));
        }

        // Extend the user-provided callbacks object with the merged options.
        // This effectively applies defaults and wrappers without overwriting explicit user callbacks.
        Playdar.Util.extendObject(callbacks, Playdar.Util.mergeCallbackOptions(callbackOptions));

        var player = this; // Store a reference to 'this' (the PlaydarPlayer instance) for use in nested functions.

        // Define the structure of a sound object.
        var sound = {
            sID: 's_' + result.sid, // Unique ID for the sound, prefixed for clarity.
            result: result,         // The original result object associated with this sound.
            callbacks: callbacks,   // Merged callback functions for this sound.

            /*
             * Numeric value indicating a sound's current load status.
             * 0 = uninitialised (default state)
             * 1 = loading (sound data is being fetched)
             * 2 = failed/error (loading failed or an error occurred)
             * 3 = loaded/success (sound data has been successfully loaded)
             */
            readyState: 0,

            /*
             * Numeric value indicating the current playing state of the sound.
             * 0 = stopped/uninitialised (sound is not playing)
             * 1 = playing or buffering sound (play has been called, waiting for data, etc.)
             * Note that a 1 may not always guarantee that sound is being heard,
             * given buffering status and autoPlay settings.
             */
            playState: 0,

            // Method to toggle the pause state of this specific sound.
            togglePause: function() {
                player.togglePause(result.sid);
            },

            // Method to set the playback position of this sound.
            setPosition: function(position) {
                player.setPosition(result.sid, position);
            },

            // Method to stop this sound.
            stop: function(onUnload) {
                player.stop(result.sid, onUnload);
            },

            // Callback handler for when a play request response is received.
            playCallback: function(json) {
                if (json.response == 'ok') {
                    this.playState = 1;      // Set play state to playing
                    this.readyState = 3;     // Set ready state to loaded
                    Playdar.player.nowplayingid = this.sID; // Update global now playing ID

                    // Update status bar if available
                    if (Playdar.statusBar) {
                        Playdar.statusBar.playHandler(this.result);
                    }

                    this.callbacks.onplay.call(this); // Execute the onplay callback
                } else {
                    this.readyState = 2; // Set ready state to failed if response is not 'ok'
                }
                this.callbacks.onload.call(this); // Execute the onload callback regardless of success
            },

            // Callback handler for when a stop request response is received.
            stopCallback: function(status) {
                this.playState = 0; // Set play state to stopped
                this.readyState = 0; // Reset ready state to uninitialised
                Playdar.player.nowplayingid = null; // Clear global now playing ID
                this.callbacks.onstop.call(this); // Execute the onstop callback
            },

            // Callback handler for when a pause toggle request response is received.
            togglePauseCallback: function(json) {
                // Toggle the playState: if 1, set to 0; if 0, set to 1.
                this.playState = this.playState ? 0 : 1;

                if (this.playState === 1) {
                    this.callbacks.onresume.call(this); // If now playing, call onresume
                } else {
                    this.callbacks.onpause.call(this); // If now paused, call onpause
                }
            },

            unload: Playdar.nop, // Placeholder for an unload function, currently no operation.
            chained: false       // Indicates if this sound is part of a playback chain.
                                 // TODO: Allow options to override this. Figure out options/callbacks.
        };

        // Store the newly created sound object in the 'sounds' collection, indexed by its original SID.
        this.sounds[result.sid] = sound;

        return sound; // Return the registered sound object.
    },


    /**
     * Initiates playback of a registered stream (sound).
     * If another sound is currently playing, it will be stopped first.
     *
     * @param {string} sid - The Stream ID of the sound to play.
     * @returns {Object} The sound object that is now playing.
     */
    play_stream: function(sid) {
        var sound = this.sounds[sid]; // Get the sound object using its SID.

        // If the requested sound is different from the one currently playing, stop the current one.
        if (this.nowplayingid != sid) {
            this.stop_current();
        }

        // Toggle the pause state of the sound. If it's stopped, it will start playing.
        // If it's paused, it will resume.
        sound.togglePause();

        return sound; // Return the sound object that was played.
    },


    /**
     * Stops the currently playing stream.
     * Optionally, performs a "hard" stop which may involve scrobbler updates.
     *
     * @param {boolean} [hard] - If true, performs a hard stop (e.g., informs scrobbler).
     */
    stop_current: function(hard) {
        // If a hard stop is requested and a scrobbler is available, notify the scrobbler.
        if (hard) {
            if (Playdar.scrobbler) {
                Playdar.scrobbler.stop();
            }
        }

        // Update the status bar if it exists.
        if (Playdar.statusBar) {
            Playdar.statusBar.stopCurrent();
        }

        // Get the sound object that is currently playing.
        var sound = this.getNowPlaying();

        // If there's a sound playing, stop it.
        if (sound) {
            sound.stop(hard);
        }
    },


    /**
     * Stops a specific stream if it is currently playing.
     *
     * @param {string} sid - The Stream ID of the sound to stop.
     * @returns {boolean} True if the specified sound was stopped, false otherwise.
     */
    stop_stream: function(sid) {
        // Check if the requested SID matches the currently playing sound's SID.
        if (sid && sid == this.nowplayingid) {
            this.stop_current(); // If it matches, stop the current sound.
            return true;         // Indicate that the sound was stopped.
        }
        return false;            // Indicate that the sound was not stopped (either not playing or different).
    },


    /**
     * Checks if any sound is currently playing.
     *
     * @returns {boolean} True if a sound is currently playing, false otherwise.
     */
    is_now_playing: function() {
        // If nowplayingid is not null or undefined, a sound is playing.
        if (this.nowplayingid) {
            return true;
        }
        return false;
    },


    /**
     * Retrieves the sound object that is currently playing.
     *
     * @returns {Object|undefined} The sound object if something is playing, otherwise undefined.
     */
    getNowPlaying: function() {
        // If there's a nowplayingid, return the corresponding sound object.
        if (this.nowplayingid) {
            return this.sounds[this.nowplayingid];
        }
        // If no sound is playing, implicitly returns undefined.
    },


    /**
     * Toggles the playback state (play/pause) of the currently playing sound.
     * This method will only act if a sound is currently playing.
     */
    toggle_nowplaying: function() {
        // Check if there is a sound currently playing.
        if (this.is_now_playing()) {
            // If yes, call play_stream on the currently playing sound's ID.
            // This will toggle its pause state if it's already playing.
            this.play_stream(this.nowplayingid);
        }
    },


    /*
     * --------------------------------------------------------------------------
     * API methods for interacting with the Playdar backend player service.
     * These methods typically construct a URL and use Playdar.Util.loadJs
     * to make a JSONP request.
     * --------------------------------------------------------------------------
     */

    /**
     * Constructs a URL for a Playdar API call to the player service.
     * Adds necessary query parameters like call_id, jsonp callback, method, and authentication token.
     *
     * @param {string} method - The API method name (e.g., 'play', 'stop', 'pausetoggle').
     * @param {Object} [query_params] - Optional object containing additional query parameters.
     * @returns {string} The complete URL for the API call.
     */
    getUrl: function(method, query_params) {
        // Ensure query_params is an object, default to empty if not provided.
        query_params = query_params || {};

        // Add a unique call ID (timestamp) to prevent caching.
        query_params.call_id = new Date().getTime();

        // Set a default JSONP callback if one isn't provided.
        query_params.jsonp = query_params.jsonp || 'Playdar.nop';

        // Add the API method name to the parameters.
        query_params.method = method;

        // Add authentication token to the query parameters via Playdar.client.
        Playdar.client.addAuthToken(query_params);

        // Construct and return the full URL using the client's base URL for the player endpoint.
        return Playdar.client.getBaseUrl("/player", query_params);
    },


    /**
     * Sends a request to the Playdar backend to start playing a sound.
     *
     * @param {string} sid - The Stream ID of the sound to play.
     */
    play: function(sid) {
        // Load the JavaScript for the 'play' API call.
        Playdar.Util.loadJs(this.getUrl('play', {
            sid: sid, // Pass the Stream ID.
            // Specify the JSONP callback function to handle the response.
            // This callback is dynamically generated to target the specific sound object.
            jsonp: 'Playdar.player.sounds["' + sid + '"].playCallback'
        }));
    },


    /**
     * Sends a request to the Playdar backend to stop a sound.
     * Can optionally open a new window for the stop request if `onUnload` is true.
     *
     * @param {string} sid - The Stream ID of the sound to stop.
     * @param {boolean} [onUnload] - If true, opens a new window to execute the stop request,
     *                                useful for preventing browser warnings on page unload.
     */
    stop: function(sid, onUnload) {
        // If onUnload is true, create a temporary popup window to execute the stop call.
        // This is often used to ensure the call goes through even if the main page is closing.
        if (onUnload) {
            var stopper = window.open(); // Open a new, blank window.
            var stopUrl = this.getUrl('stop', {
                // Custom JSONP callback to close the new window after the stop call.
                jsonp: "function Playdar_close (json) { window.close() } Playdar_close"
            });
            // Write a simple HTML page into the new window that loads the stop URL as a script.
            stopper.document.write('<html>'
                + '<body>'
                + '<script src="' + stopUrl + '"></script>'
                + '</body>'
                + '</html>'
            );
        } else {
            // If not onUnload, simply load the stop URL in the current context.
            Playdar.Util.loadJs(this.getUrl('stop', {
                sid: sid, // Pass the Stream ID.
                // Specify the JSONP callback function to handle the response.
                jsonp: 'Playdar.player.sounds["' + sid + '"].stopCallback'
            }));
        }
    },


    /**
     * Toggles the pause state of a specific sound.
     * If the sound is uninitialised (readyState 0), it will initiate playback.
     * Otherwise, it sends a request to toggle pause/resume.
     *
     * @param {string} sid - The Stream ID of the sound to toggle pause for.
     */
    togglePause: function(sid) {
        // If the sound is not yet loaded/initialised (readyState is 0), attempt to play it.
        if (this.sounds[sid].readyState == 0) {
            this.play(sid);
        } else {
            // Otherwise, send a request to the backend to toggle the pause state.
            Playdar.Util.loadJs(this.getUrl('pausetoggle', {
                sid: sid, // Pass the Stream ID.
                // Specify the JSONP callback function to handle the response.
                jsonp: 'Playdar.player.sounds["' + sid + '"].togglePauseCallback'
            }));
        }
    },


    /**
     * Requests the current playback position of the playing sound from the backend.
     * Note: The current implementation does not use the `sid` parameter.
     *
     * @param {string} sid - The Stream ID of the sound to get position for (currently unused).
     */
    getPosition: function(sid) {
        // Load the JavaScript for the 'pos' API call.
        // The response will typically trigger a global callback or a sound-specific one if implemented.
        Playdar.Util.loadJs(this.getUrl('pos'));
    },


    /**
     * Attempts to set the playback position of a specific sound.
     * This feature is currently not implemented in the Playdar backend.
     *
     * @param {string} sid - The Stream ID of the sound.
     * @param {number} position - The desired playback position in milliseconds.
     */
    setPosition: function(sid, position) {
        // Not implemented yet - This is a placeholder for future functionality.
        // A backend API call would typically be made here.
    },


    /**
     * Requests the Stream ID of the currently playing sound from the Playdar backend.
     */
    getNowPlayingSid: function() {
        // Load the JavaScript for the 'np' (now playing) API call.
        // The response will typically update Playdar.player.nowplayingid.
        Playdar.Util.loadJs(this.getUrl('np'));
    }

}; // End of Playdar.PlaydarPlayer.prototype object.