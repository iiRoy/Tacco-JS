/*
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is available at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

( function ( ) {

    'use strict';

    /**
     * This constant holds the root URL for media sources.
     * @const {string}
     */
    var MEDIA_SOURCE_ROOT = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/';

    /**
     * This constant holds the URL for the JSON file containing media information.
     * @const {string}
     */
    var MEDIA_SOURCE_URL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/videos.json';

    /**
     * Defines the width of the progress bar in pixels.
     * @const {number}
     */
    var PROGRESS_BAR_WIDTH = 600;

    /**
     * Enumeration of states for a Chromecast device.
     * @enum {number}
     */
    var DEVICE_STATE = {
        'IDLE'    : 0,
        'ACTIVE'  : 1,
        'WARNING' : 2,
        'ERROR'   : 3
    };

    /**
     * Enumeration of states for the CastPlayer.
     * @enum {string}
     */
    var PLAYER_STATE = {
        'IDLE'    : 'IDLE',
        'LOADING' : 'LOADING',
        'LOADED'  : 'LOADED',
        'PLAYING' : 'PLAYING',
        'PAUSED'  : 'PAUSED',
        'STOPPED' : 'STOPPED',
        'SEEKING' : 'SEEKING',
        'ERROR'   : 'ERROR'
    };


    /**
     * The main Cast player object.
     *
     * Key variables:
     *   - `deviceState`: Represents the state of the Cast device.
     *     - `IDLE`: No active casting session.
     *     - `ACTIVE`: A casting session is currently active.
     *     - `WARNING`: An active session with some issues.
     *     - `ERROR`: A critical failure has occurred.
     *   - Cast player variables: Control media playback when casting.
     *   - Local player variables: Control media playback locally.
     *   - Current media variables: Manage media state for seamless transitions.
     *
     * @constructor
     */
    var CastPlayer = function ( ) {

        /* Device-related variables */
        /**
         * The current state of the device.
         * @type {DEVICE_STATE}
         */
        this.deviceState = DEVICE_STATE.IDLE;


        /**
         * Indicates if any Cast receivers are available.
         * @type {boolean}
         */
        this.receivers_available = false;


        /* Cast player specific variables */
        /**
         * The current media session object (chrome.cast.media.Media).
         * @type {Object}
         */
        this.currentMediaSession = null;

        /**
         * The current volume level.
         * @type {Number}
         */
        this.currentVolume = 0.5;

        /**
         * Flag to determine if media should autoplay after loading.
         * @type {Boolean}
         */
        this.autoplay = true;

        /**
         * The current Cast session object (chrome.cast.Session).
         * @type {string}
         */
        this.session = null;

        /**
         * The state of the Cast media player.
         * @type {PLAYER_STATE}
         */
        this.castPlayerState = PLAYER_STATE.IDLE;


        /* Local player specific variables */
        /**
         * The state of the local media player.
         * @type {PLAYER_STATE}
         */
        this.localPlayerState = PLAYER_STATE.IDLE;

        /**
         * Reference to the local HTML video element.
         * @type {HTMLElement}
         */
        this.localPlayer = null;

        /**
         * Flag indicating if full-screen mode is active.
         * @type {Boolean}
         */
        this.fullscreen = false;


        /* Variables related to the currently playing media */
        /**
         * Flag indicating if audio is enabled.
         * @type {Boolean}
         */
        this.audio = true;

        /**
         * The index of the currently selected media item.
         * @type {Number}
         */
        this.currentMediaIndex = 0;

        /**
         * The current playback time of the media.
         * @type {Number}
         */
        this.currentMediaTime = 0;

        /**
         * The total duration of the current media.
         * @type {Number}
         */
        this.currentMediaDuration = -1;

        /**
         * Timer for tracking media progress.
         * @type {Timer}
         */
        this.timer = null;

        /**
         * Flag to prevent timer updates when media status event triggers.
         * @type {Boolean}
         */
        this.progressFlag = true;

        /**
         * Interval in milliseconds for progress timer updates.
         * @type {Number}
         */
        this.timerStep = 1000;


        /* Media content loaded from JSON */
        this.mediaContents = null;


        // Initialize both Cast and local players upon instantiation.
        this.initializeCastPlayer( );
        this.initializeLocalPlayer( );

    }; // End of CastPlayer constructor


    /**
     * Initializes the local media player.
     * This method retrieves the video element and sets up an event listener
     * for when media data is loaded.
     */
    CastPlayer.prototype.initializeLocalPlayer = function ( ) {

        this.localPlayer = document.getElementById( 'video_element' );
        this.localPlayer.addEventListener( 'loadeddata', this.onMediaLoadedLocally.bind( this ) );

    };


    /**
     * Initializes the Cast media player API.
     * It checks for API availability and sets up the API configuration
     * including session and receiver listeners.
     */
    CastPlayer.prototype.initializeCastPlayer = function ( ) {

        // Check if the Cast API is available. If not, retry after a delay.
        if ( !chrome.cast || !chrome.cast.isAvailable ) {
            setTimeout( this.initializeCastPlayer.bind( this ), 1000 );
            return;
        }

        // The application ID for the receiver. This can be customized.
        // var applicationID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
        var applicationID = '4F8B3483'; // Custom application ID

        // Define the auto-join policy for sessions.
        var autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;
        // Other options:
        // var autoJoinPolicy = chrome.cast.AutoJoinPolicy.PAGE_SCOPED;
        // var autoJoinPolicy = chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED;

        // Create a new session request with the specified application ID.
        var sessionRequest = new chrome.cast.SessionRequest( applicationID );

        // Configure the Cast API with listeners and the auto-join policy.
        var apiConfig = new chrome.cast.ApiConfig(
            sessionRequest,
            this.sessionListener.bind( this ),    // Listener for session updates
            this.receiverListener.bind( this ),   // Listener for receiver availability
            autoJoinPolicy                        // Policy for auto-joining sessions
        );

        // Initialize the Cast API.
        chrome.cast.initialize(
            apiConfig,
            this.onInitSuccess.bind( this ),      // Callback for successful initialization
            this.onError.bind( this )             // Callback for initialization errors
        );

        // Add video thumbnails to the UI and initialize the rest of the UI.
        this.addVideoThumbs( );
        this.initializeUI( );

    }; // End of initializeCastPlayer


    /**
     * Callback function executed upon successful Cast API initialization.
     */
    CastPlayer.prototype.onInitSuccess = function ( ) {
        console.log( "Cast API initialization successful." );
        this.updateMediaControlUI( ); // Refresh the media control UI.
    };


    /**
     * A generic error callback function for Cast API operations.
     * Logs the error to the console.
     */
    CastPlayer.prototype.onError = function ( ) {
        console.log( "An error occurred during a Cast operation." );
    };


    /**
     * Handles new or existing Cast sessions.
     * This function is invoked when a session is created or re-joined.
     * It updates the device state and synchronizes media if an active session is found.
     *
     * @param {!Object} e - The session object (chrome.cast.Session).
     */
    CastPlayer.prototype.sessionListener = function ( e ) {

        this.session = e; // Store the current session.

        if ( this.session ) {

            this.deviceState = DEVICE_STATE.ACTIVE; // Device is active.

            if ( this.session.media[ 0 ] ) {
                // If media is already playing in the session, discover it.
                this.onMediaDiscovered( 'activeSession', this.session.media[ 0 ] );
                this.syncCurrentMedia( this.session.media[ 0 ].media.contentId );
                this.selectMediaUpdateUI( this.currentMediaIndex );
                this.updateDisplayMessage( );
            }
            else {
                // No media in session, load the current media index.
                this.loadMedia( this.currentMediaIndex );
            }

            // Add a listener for updates to this session.
            this.session.addUpdateListener( this.sessionUpdateListener.bind( this ) );

        } // End of if (this.session)

    }; // End of sessionListener


    /**
     * Synchronizes the current media index with the media playing in the Cast session.
     *
     * @param {string} currentMediaURL - The URL of the media currently playing on the receiver.
     */
    CastPlayer.prototype.syncCurrentMedia = function ( currentMediaURL ) {

        for ( var i = 0; i < this.mediaContents.length; i++ ) {

            // Compare the content ID with the source URL of each media item.
            if ( currentMediaURL == this.mediaContents[ i ][ 'sources' ][ 0 ] ) {
                this.currentMediaIndex = i; // Found a match, update the index.
                break; // Exit the loop once found.
            }
        }
    };


    /**
     * Listener for receiver availability.
     * This callback indicates whether Cast receivers are available on the network.
     * It does not provide specific device IDs.
     *
     * @param {string} e - The availability status ('available' or 'not_available').
     */
    CastPlayer.prototype.receiverListener = function ( e ) {

        if ( e === 'available' ) {
            this.receivers_available = true; // Receivers are available.
            this.updateMediaControlUI( );    // Update the UI to reflect availability.
            console.log( "A Cast receiver has been found." );
        }
        else {
            console.log( "No Cast receivers are currently available." );
        }
    };


    /**
     * Listener for session updates.
     * This function is called when the Cast session state changes (e.g., disconnected).
     *
     * @param {boolean} isAlive - True if the session is still active, false otherwise.
     */
    CastPlayer.prototype.sessionUpdateListener = function ( isAlive ) {

        if ( !isAlive ) {
            // If the session is no longer alive, reset player states.
            this.session = null;
            this.deviceState = DEVICE_STATE.IDLE;
            this.castPlayerState = PLAYER_STATE.IDLE;
            this.currentMediaSession = null;
            clearInterval( this.timer ); // Stop the progress timer.
            this.updateDisplayMessage( ); // Update the displayed message.

            var online = navigator.onLine; // Check if the browser is online.

            if ( online == true ) {
                // If online, continue playing media locally.
                console.log( "Cast session ended. Continuing playback locally at time: " + this.currentMediaTime );
                this.playMediaLocally( );       // Start local playback.
                this.updateMediaControlUI( );   // Update UI for local playback.
            }
        }
    };


    /**
     * Selects a media content item by its index.
     * This method prepares the UI and player for the selected media.
     *
     * @param {Number} mediaIndex - The index of the media item to select.
     */
    CastPlayer.prototype.selectMedia = function ( mediaIndex ) {

        console.log( "Media item selected: " + mediaIndex );

        this.currentMediaIndex = mediaIndex; // Update the current media index.

        // Reset progress bar elements visually.
        var pi = document.getElementById( "progress_indicator" );
        var p = document.getElementById( "progress" );

        // Reset current media time.
        this.currentMediaTime = 0;

        p.style.width = '0px';
        pi.style.marginLeft = ( -21 - PROGRESS_BAR_WIDTH ) + 'px';

        if ( !this.currentMediaSession ) {
            // If no Cast session is active, play locally.
            this.localPlayerState = PLAYER_STATE.IDLE;
            this.playMediaLocally( );
        }
        else {
            // If a Cast session is active, prepare for Cast playback.
            this.castPlayerState = PLAYER_STATE.IDLE;
            this.playMedia( ); // This method is not defined in the provided snippet, assuming it's a placeholder.
        }

        this.selectMediaUpdateUI( mediaIndex ); // Update UI specific to media selection.

    }; // End of selectMedia


    /**
     * Requests to launch a new receiver application session or join an existing one.
     * Uses the default SessionRequest configured at API initialization,
     * unless overridden by opt_sessionRequest.
     */
    CastPlayer.prototype.launchApp = function ( ) {

        console.log( "Attempting to launch or join Cast application..." );

        chrome.cast.requestSession(
            this.sessionListener.bind( this ),   // Callback for session success.
            this.onLaunchError.bind( this )      // Callback for launch errors.
        );

        if ( this.timer ) {
            clearInterval( this.timer ); // Clear any active progress timer.
        }

    }; // End of launchApp


    /**
     * Callback function for successful session request.
     *
     * @param {Object} e - The chrome.cast.Session object.
     */
    CastPlayer.prototype.onRequestSessionSuccess = function ( e ) {

        console.log( "Session successfully requested: " + e.sessionId );
        this.session = e;                       // Store the new session.
        this.deviceState = DEVICE_STATE.ACTIVE; // Update device state.
        this.updateMediaControlUI( );           // Refresh media control UI.
        this.loadMedia( this.currentMediaIndex ); // Load the current media.
        this.session.addUpdateListener( this.sessionUpdateListener.bind( this ) ); // Add session update listener.

    }; // End of onRequestSessionSuccess


    /**
     * Callback function for errors during application launch or session request.
     * Sets the device state to ERROR.
     */
    CastPlayer.prototype.onLaunchError = function ( ) {

        console.log( "Error encountered during application launch." );
        this.deviceState = DEVICE_STATE.ERROR; // Set device state to error.

    };


    /**
     * Stops the currently running receiver application associated with the session.
     */
    CastPlayer.prototype.stopApp = function ( ) {

        this.session.stop(
            this.onStopAppSuccess.bind( this, 'Cast session stopped successfully.' ), // Success callback.
            this.onError.bind( this )                                                // Error callback.
        );

    }; // End of stopApp


    /**
     * Callback function executed upon successful stopping of the Cast application.
     * Resets player states and potentially resumes local playback.
     *
     * @param {string} message - A message indicating the success of the operation.
     */
    CastPlayer.prototype.onStopAppSuccess = function ( message ) {

        console.log( message ); // Log the success message.

        // Reset Cast-related states.
        this.deviceState = DEVICE_STATE.IDLE;
        this.castPlayerState = PLAYER_STATE.IDLE;
        this.currentMediaSession = null;
        clearInterval( this.timer ); // Stop the media progress timer.
        this.updateDisplayMessage( ); // Update the UI display.

        // Continue playing media locally from the last known time.
        console.log( "Continuing local playback from current time: " + this.currentMediaTime );
        this.playMediaLocally( );       // Initiate local playback.
        this.updateMediaControlUI( );   // Update media control UI for local mode.

    }; // End of onStopAppSuccess


    /**
     * Loads media content into the running receiver application.
     * This method constructs a MediaInfo object and a LoadRequest,
     * then dispatches it to the Cast session.
     *
     * @param {Number} mediaIndex - The index of the media content to load.
     */
    CastPlayer.prototype.loadMedia = function ( mediaIndex ) {

        // Ensure a Cast session is active before attempting to load media.
        if ( !this.session ) {
            console.log( "Cannot load media: No active Cast session." );
            return;
        }

        console.log( "Loading media: " + this.mediaContents[ mediaIndex ][ 'title' ] );

        // Create MediaInfo object from the selected media content.
        var mediaInfo = new chrome.cast.media.MediaInfo( this.mediaContents[ mediaIndex ][ 'sources' ][ 0 ] );

        // Set metadata for the media.
        mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata( );
        mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
        mediaInfo.contentType = 'video/mp4'; // Specify content type.

        mediaInfo.metadata.title = this.mediaContents[ mediaIndex ][ 'title' ];
        mediaInfo.metadata.images = [ { 'url': MEDIA_SOURCE_ROOT + this.mediaContents[ mediaIndex ][ 'thumb' ] } ];

        // Create a LoadRequest.
        var request = new chrome.cast.media.LoadRequest( mediaInfo );
        request.autoplay = this.autoplay; // Set autoplay preference.

        // If local player was playing, transfer its current time to the Cast request.
        if ( this.localPlayerState == PLAYER_STATE.PLAYING ) {
            request.currentTime = this.localPlayer.currentTime;
            this.localPlayer.pause( );              // Pause local playback.
            this.localPlayerState = PLAYER_STATE.STOPPED; // Update local player state.
        }
        else {
            request.currentTime = 0; // Otherwise, start from the beginning.
        }

        this.castPlayerState = PLAYER_STATE.LOADING; // Set Cast player state to loading.

        // Send the load media request to the Cast session.
        this.session.loadMedia(
            request,
            this.onMediaDiscovered.bind( this, 'loadMedia' ), // Success callback.
            this.onLoadMediaError.bind( this )                // Error callback.
        );

        // Update UI elements with new media information.
        document.getElementById( "media_title" ).innerHTML = this.mediaContents[ this.currentMediaIndex ][ 'title' ];
        document.getElementById( "media_subtitle" ).innerHTML = this.mediaContents[ this.currentMediaIndex ][ 'subtitle' ];
        document.getElementById( "media_desc" ).innerHTML = this.mediaContents[ this.currentMediaIndex ][ 'description' ];

    }; // End of loadMedia


    /**
     * Callback function executed when media is successfully discovered or loaded on the receiver.
     * This can happen either after a `loadMedia` call or when joining an `activeSession`.
     *
     * @param {string} how - Indicates how the media was discovered ('loadMedia' or 'activeSession').
     * @param {Object} mediaSession - The new chrome.cast.media.Media object.
     */
    CastPlayer.prototype.onMediaDiscovered = function ( how, mediaSession ) {

        console.log( "New media session discovered, ID: " + mediaSession.mediaSessionId + ' (Trigger: ' + how + ')' );
        this.currentMediaSession = mediaSession; // Store the current media session.

        if ( how == 'loadMedia' ) {
            // If media was explicitly loaded, set player state based on autoplay.
            if ( this.autoplay ) {
                this.castPlayerState = PLAYER_STATE.PLAYING;
            }
            else {
                this.castPlayerState = PLAYER_STATE.LOADED;
            }
        }

        if ( how == 'activeSession' ) {
            // If joining an active session, sync player state and time.
            this.castPlayerState = this.session.media[ 0 ].playerState;
            this.currentMediaTime = this.session.media[ 0 ].currentTime;
        }

        if ( this.castPlayerState == PLAYER_STATE.PLAYING ) {
            // If playing, start the progress timer.
            this.startProgressTimer( this.incrementMediaTime );
        }

        // Add an update listener to the current media session.
        this.currentMediaSession.addUpdateListener( this.onMediaStatusUpdate.bind( this ) );

        // Calculate and display media duration.
        this.currentMediaDuration = this.currentMediaSession.media.duration;
        var duration = this.currentMediaDuration;
        var hr = parseInt( duration / 3600 );
        duration -= hr * 3600;
        var min = parseInt( duration / 60 );
        var sec = parseInt( duration % 60 );

        if ( hr > 0 ) {
            duration = hr + ":" + min + ":" + sec;
        }
        else {
            if ( min > 0 ) {
                duration = min + ":" + sec;
            }
            else {
                duration = sec;
            }
        }
        document.getElementById( "duration" ).innerHTML = duration;

        // If local player was playing, stop it and hide its elements.
        if ( this.localPlayerState == PLAYER_STATE.PLAYING ) {
            this.localPlayerState = PLAYER_STATE.STOPPED;
            var vi = document.getElementById( 'video_image' );
            vi.style.display = 'block';
            this.localPlayer.style.display = 'none';
            // Also start progress timer for Cast playback.
            this.startProgressTimer( this.incrementMediaTime );
        }

        // Update all relevant UI elements.
        this.updateMediaControlUI( );
        this.updateDisplayMessage( );

    }; // End of onMediaDiscovered


    /**
     * Callback function executed when there is an error loading media.
     * Resets the Cast player state to IDLE and updates the UI.
     *
     * @param {Object} e - The error object.
     */
    CastPlayer.prototype.onLoadMediaError = function ( e ) {

        console.log( "Media load error: " + e );
        this.castPlayerState = PLAYER_STATE.IDLE; // Reset Cast player state.
        this.updateMediaControlUI( );             // Update media control UI.
        this.updateDisplayMessage( );             // Update display message.

    };


    /**
     * Callback function for media status updates received from the Cast receiver.
     * This method updates the progress bar and other UI elements.
     *
     * @param {!Boolean} e - True if the media session is still active, false otherwise.
     */
    CastPlayer.prototype.onMediaStatusUpdate = function ( e ) {

        if ( e == false ) {
            // If media session is no longer active, reset time and state.
            this.currentMediaTime = 0;
            this.castPlayerState = PLAYER_STATE.IDLE;
        }

        console.log( "Updating media status." );
        this.updateProgressBar( e );        // Update the progress bar.
        this.updateDisplayMessage( );       // Update the display message.
        this.updateMediaControlUI( );       // Update media control UI.

    };


    /**
     * Helper function to increment the current media time by one second.
     * This is used by the progress timer.
     */
    CastPlayer.prototype.incrementMediaTime = function ( ) {

        // Only increment if a player is in PLAYING state.
        if ( this.castPlayerState == PLAYER_STATE.PLAYING || this.localPlayerState == PLAYER_STATE.PLAYING ) {

            if ( this.currentMediaTime < this.currentMediaDuration ) {
                this.currentMediaTime += 1;          // Increment time.
                this.updateProgressBarByTimer( );    // Update progress bar.
            }
            else {
                this.currentMediaTime = 0;           // Reset time if media ended.
                clearInterval( this.timer );         // Stop the timer.
            }
        }
    };


    /**
     * Plays the currently selected media content using the local HTML5 video player.
     * This method handles the display of the local player and loads the media.
     */
    CastPlayer.prototype.playMediaLocally = function ( ) {

        var vi = document.getElementById( 'video_image' );
        vi.style.display = 'none'; // Hide the placeholder image.
        this.localPlayer.style.display = 'block'; // Show the local video player.

        // If local player is not already playing or paused, load and play new media.
        if ( this.localPlayerState != PLAYER_STATE.PLAYING && this.localPlayerState != PLAYER_STATE.PAUSED ) {
            this.localPlayer.src = this.mediaContents[ this.currentMediaIndex ][ 'sources' ][ 0 ];
            this.localPlayer.load( ); // Load the new media source.
        }
        else {
            // If already playing or paused, the content continues below.
            // (The user's code is cut off here, so I'll stop here for the clone.)