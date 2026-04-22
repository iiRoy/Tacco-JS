/*
 * Dictate.js - A JavaScript library for speech recognition using WebSockets.
 * This file contains the core Dictate object and a helper Transcription object.
 *
 * This version is a Type I clone, preserving all logic and identifiers,
 * while extensively modifying whitespace and comments for visual difference.
 */
( function( window ) {

    // --- Configuration Constants and Default Values ---
    // These constants define the endpoints for the speech recognition server
    // and its status monitor, along with audio format specifications.
    var SERVER =
        "ws://bark.phon.ioc.ee:82/dev/duplex-speech-api/ws/speech"; /* Default WebSocket server URL for speech recognition */

    var SERVER_STATUS =
        "ws://bark.phon.ioc.ee:82/dev/duplex-speech-api/ws/status"; /* Default WebSocket server URL for status updates */

    var REFERENCE_HANDLER =
        "http://bark.phon.ioc.ee:82/dev/duplex-speech-api/dynamic/reference"; /* URL for submitting reference text */

    var CONTENT_TYPE =
        "content-type=audio/x-raw,+layout=(string)interleaved,+rate=(int)16000,+format=(string)S16LE,+channels=(int)1"; /* MIME type for audio data */

    // Recommended interval to send audio blocks to the server, in milliseconds.
    var INTERVAL = 250;

    var TAG_END_OF_SENTENCE = "EOS"; // Special tag indicating end of a sentence/utterance

    var RECORDER_WORKER_PATH = 'recorderWorker.js'; // Path to the Web Worker script for audio recording


    // --- Error Codes ---
    // These codes help categorize different types of errors that can occur.
    // Naming conventions largely follow Android error names.
    var ERR_NETWORK = 2; // Network-related error
    var ERR_AUDIO = 3; // Audio input/processing error
    var ERR_SERVER = 4; // Server-side error
    var ERR_CLIENT = 5; // Client-side error (e.g., browser incompatibility)


    // --- Event Codes ---
    // Messages indicating various stages and events in the speech recognition process.
    var MSG_WAITING_MICROPHONE = 1;      // Waiting for microphone access permission
    var MSG_MEDIA_STREAM_CREATED = 2;    // Media stream (audio input) successfully created
    var MSG_INIT_RECORDER = 3;           // Audio recorder initialized
    var MSG_RECORDING = 4;               // Recording is active
    var MSG_SEND = 5;                    // Audio data sent to server
    var MSG_SEND_EMPTY = 6;              // An empty audio block was sent
    var MSG_SEND_EOS = 7;                // End-of-sentence tag sent
    var MSG_WEB_SOCKET = 8;              // WebSocket message received
    var MSG_WEB_SOCKET_OPEN = 9;         // WebSocket connection opened
    var MSG_WEB_SOCKET_CLOSE = 10;       // WebSocket connection closed
    var MSG_STOP = 11;                   // Recording stopped
    var MSG_SERVER_CHANGED = 12;         // Server URL was changed


    // --- Server Status Codes Mapping ---
    // Provides human-readable descriptions for server-side status codes.
    // Source: https://github.com/alumae/kaldi-gstreamer-server
    var SERVER_STATUS_CODE = {
        0: 'Success',      // Recognition successful, results usually follow
        1: 'No speech',    // Input contained significant silence or non-speech
        2: 'Aborted',      // Recognition process was aborted by the server
        9: 'No available'  // No recognition processes are free; server is busy
    };


    // --- Internal State Variables ---
    // These variables hold references to core objects initialized at different stages.
    var audioContext;     // Web Audio API AudioContext, initialized by init()
    var recorder;         // Audio recorder instance, initialized by init()

    var ws;               // WebSocket instance for speech data, initialized by startListening()
    var intervalKey;      // Key for the setInterval timer, initialized by startListening()

    var wsServerStatus;   // WebSocket instance for server status, initialized during Dictate construction


    /**
     * Dictate Constructor
     * Manages the speech recognition lifecycle, including audio recording,
     * WebSocket communication, and event handling.
     *
     * @param {object} cfg - Configuration object for Dictate.
     */
    var Dictate = function( cfg ) {

        var config = cfg || {}; // Ensure config object exists

        // Apply default values if not provided in cfg
        config.server = config.server || SERVER;
        config.serverStatus = config.serverStatus || SERVER_STATUS;
        config.referenceHandler = config.referenceHandler || REFERENCE_HANDLER;
        config.contentType = config.contentType || CONTENT_TYPE;
        config.interval = config.interval || INTERVAL;
        config.recorderWorkerPath = config.recorderWorkerPath || RECORDER_WORKER_PATH;

        // Default callback functions (empty functions if not provided)
        config.onReadyForSpeech = config.onReadyForSpeech || function() {};
        config.onEndOfSpeech = config.onEndOfSpeech || function() {};
        config.onPartialResults = config.onPartialResults || function( data ) {};
        config.onResults = config.onResults || function( data ) {};
        config.onEndOfSession = config.onEndOfSession || function() {};
        config.onEvent = config.onEvent || function( e, data ) {};
        config.onError = config.onError || function( e, data ) {};
        config.onServerStatus = config.onServerStatus || null; // Can be null if status monitoring is not desired
        config.rafCallback = config.rafCallback || function( time ) {}; // RequestAnimationFrame callback

        // If a server status callback is provided, initiate status monitoring.
        if ( config.onServerStatus ) {
            monitorServerStatus();
        }


        /**
         * Returns the current configuration object for this Dictate instance.
         * @returns {object} The configuration object.
         */
        this.getConfig = function() {
            return config;
        };


        /**
         * Initializes the audio context and requests microphone access.
         * This method should be called before starting speech recognition.
         * It can be safely called multiple times without adverse effects.
         */
        this.init = function() {
            // Inform the user that we are waiting for microphone permission.
            config.onEvent( MSG_WAITING_MICROPHONE, "Waiting for approval to access your microphone ..." );

            try {
                // Normalize AudioContext and getUserMedia across browsers
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                window.URL = window.URL || window.webkitURL;

                audioContext = new AudioContext(); // Create new audio context
            }
            catch ( e ) {
                // Handle cases where Web Audio API is not available or configured
                // Example: Firefox 24 might need 'media.webaudio.enabled = true' in about:config
                config.onError( ERR_CLIENT, "Error initializing Web Audio browser: " + e );
            }

            // Request access to the user's microphone
            if ( navigator.getUserMedia ) {
                navigator.getUserMedia(
                    { audio: true }, // Request audio input
                    startUserMedia,  // Success callback: stream obtained
                    function( e ) {  // Error callback: failed to get stream
                        config.onError( ERR_CLIENT, "No live audio input in this browser: " + e );
                    }
                );
            }
            else {
                // Browser does not support getUserMedia
                config.onError( ERR_CLIENT, "No user media support" );
            }
        };


        /**
         * Starts the speech recognition process.
         * This includes initiating WebSocket communication and audio recording.
         */
        this.startListening = function() {
            // Ensure recorder is initialized before starting
            if ( ! recorder ) {
                config.onError( ERR_AUDIO, "Recorder undefined" );
                return;
            }

            // If a previous WebSocket connection exists, cancel it first.
            if ( ws ) {
                cancel();
            }

            try {
                ws = createWebSocket(); // Attempt to establish a new WebSocket connection
            }
            catch ( e ) {
                // Handle browsers without WebSocket support
                config.onError( ERR_CLIENT, "No web socket support in this browser!" );
            }
        };


        /**
         * Stops the ongoing speech recognition and recording.
         * This sends any remaining audio data to the server and then the EOS tag.
         */
        this.stopListening = function() {
            // Stop the periodic sending of audio data
            clearInterval( intervalKey );

            // If recorder exists, stop it and process remaining audio
            if ( recorder ) {
                recorder.stop(); // Halt audio recording
                config.onEvent( MSG_STOP, 'Stopped recording' );

                // Export and send the last recorded audio chunk
                recorder.export16kMono( function( blob ) {
                    socketSend( blob );                  // Send audio blob
                    socketSend( TAG_END_OF_SENTENCE );   // Send end-of-sentence marker
                    recorder.clear();                    // Clear recorder's buffer
                }, 'audio/x-raw' );

                config.onEndOfSpeech(); // Notify that end of speech has occurred
            }
            else {
                config.onError( ERR_AUDIO, "Recorder undefined" ); // Recorder not available
            }
        };


        /**
         * Cancels the speech recognition process immediately.
         * This stops recording and closes the WebSocket connection without waiting for server responses.
         */
        this.cancel = function() {
            // Stop the scheduled audio sending if active
            clearInterval( intervalKey );

            // If recorder is active, stop and clear it
            if ( recorder ) {
                recorder.stop();
                recorder.clear();
                config.onEvent( MSG_STOP, 'Stopped recording' );
            }

            // If WebSocket is open, close it and nullify the reference
            if ( ws ) {
                ws.close();
                ws = null;
            }
        };


        /**
         * Sets a new URL for the speech recognition server.
         * @param {string} server - The new server URL.
         */
        this.setServer = function( server ) {
            config.server = server;
            config.onEvent( MSG_SERVER_CHANGED, 'Server changed: ' + server );
        };


        /**
         * Sets a new URL for the server status monitoring WebSocket.
         * If server status monitoring is enabled, it will reconnect to the new URL.
         * @param {string} serverStatus - The new server status URL.
         */
        this.setServerStatus = function( serverStatus ) {
            config.serverStatus = serverStatus;

            // If status monitoring is active, restart it with the new URL
            if ( config.onServerStatus ) {
                monitorServerStatus();
            }

            config.onEvent( MSG_SERVER_CHANGED, 'Server status server changed: ' + serverStatus );
        };


        /**
         * Submits reference text to the speech server.
         * This is typically used for training or evaluation purposes.
         * Requires jQuery to be present for AJAX calls.
         *
         * @param {string} text - The reference text to submit.
         * @param {function} successCallback - Callback for successful submission.
         * @param {function} errorCallback - Callback for failed submission.
         */
        this.submitReference = function submitReference( text, successCallback, errorCallback ) {
            var headers = {};

            // Add User-Id header if configured
            if ( config["user_id"] ) {
                headers["User-Id"] = config["user_id"];
            }

            // Add Content-Id header if configured
            if ( config["content_id"] ) {
                headers["Content-Id"] = config["content_id"];
            }

            // Use jQuery.ajax to send the reference text
            $.ajax( {
                url: config.referenceHandler,
                type: "POST",
                headers: headers,
                data: text,
                dataType: "text",
                success: successCallback,
                error: errorCallback,
            } );
        };


        // --- Private Helper Functions ---

        /**
         * Callback function executed when user media (microphone stream) is successfully obtained.
         * @param {MediaStream} stream - The audio media stream from the microphone.
         */
        function startUserMedia( stream ) {
            // Create an audio source from the media stream
            var input = audioContext.createMediaStreamSource( stream );
            config.onEvent( MSG_MEDIA_STREAM_CREATED, 'Media stream created' );

            // Create an analyser node and connect it to the input for visualization (e.g., waveform)
            window.userSpeechAnalyser = audioContext.createAnalyser();
            input.connect( window.userSpeechAnalyser );

            // Trigger the requestAnimationFrame callback for audio visualization
            config.rafCallback();

            // Initialize the Recorder object with the audio input and worker path
            recorder = new Recorder( input, { workerPath : config.recorderWorkerPath } );
            config.onEvent( MSG_INIT_RECORDER, 'Recorder initialized' );
        }


        /**
         * Sends an item (audio blob or EOS tag) over the WebSocket connection.
         * Handles checking WebSocket state and logging events/errors.
         *
         * @param {*} item - The data to send (either an audio Blob or the TAG_END_OF_SENTENCE string).
         */
        function socketSend( item ) {
            if ( ws ) {
                var state = ws.readyState; // Get current WebSocket state

                // WebSocket.OPEN state is 1
                if ( state == 1 ) {
                    // Check if the item is an audio blob
                    if ( item instanceof Blob ) {
                        if ( item.size > 0 ) {
                            ws.send( item ); // Send non-empty audio blob
                            config.onEvent( MSG_SEND, 'Send: blob: ' + item.type + ', ' + item.size );
                        }
                        else {
                            // Log sending of an empty blob
                            config.onEvent( MSG_SEND_EMPTY, 'Send: blob: ' + item.type + ', EMPTY' );
                        }
                    }
                    else {
                        // Otherwise, it's assumed to be the EOS tag (string)
                        ws.send( item );
                        config.onEvent( MSG_SEND_EOS, 'Send tag: ' + item );
                    }
                }
                else {
                    // WebSocket is not in OPEN state, log an error
                    config.onError( ERR_NETWORK, 'WebSocket: readyState!=1: ' + state + ": failed to send: " + item );
                }
            }
            else {
                // No WebSocket connection established, log a client error
                config.onError( ERR_CLIENT, 'No web socket connection: failed to send: ' + item );
            }
        }


        /**
         * Creates and configures a new WebSocket connection to the speech server.
         * Sets up event handlers for messages, open, close, and error events.
         *
         * @returns {WebSocket} The newly created WebSocket instance.
         */
        function createWebSocket() {
            // Construct the WebSocket URL with content type and optional user/content IDs.
            // Example: "ws://server:port/path?content-type=audio/x-raw..."
            var url = config.server + '?' + config.contentType;

            if ( config["user_id"] ) {
                url += '&user-id=' + config["user_id"];
            }

            if ( config["content_id"] ) {
                url += '&content-id=' + config["content_id"];
            }

            var ws = new WebSocket( url ); // Establish the WebSocket connection

            // WebSocket message handler
            ws.onmessage = function( e ) {
                var data = e.data;
                config.onEvent( MSG_WEB_SOCKET, data ); // Log raw WebSocket message

                // Handle different types of received data
                if ( data instanceof Object && ! ( data instanceof Blob ) ) {
                    // Received an object that is not a Blob (unexpected)
                    config.onError( ERR_SERVER, 'WebSocket: onEvent: got Object that is not a Blob' );
                }
                else if ( data instanceof Blob ) {
                    // Received a Blob (unexpected for speech results)
                    config.onError( ERR_SERVER, 'WebSocket: got Blob' );
                }
                else {
                    // Assume it's a JSON string with recognition results
                    var res = JSON.parse( data );

                    if ( res.status == 0 ) { // Status 0 usually indicates success
                        if ( res.result.final ) {
                            config.onResults( res.result.hypotheses ); // Final recognition results
                        }
                        else {
                            config.onPartialResults( res.result.hypotheses ); // Partial, interim results
                        }
                    }
                    else {
                        // Server returned an error status
                        config.onError( ERR_SERVER, 'Server error: ' + res.status + ': ' + getDescription( res.status ) );
                    }
                }
            };

            // WebSocket connection open handler
            ws.onopen = function( e ) {
                // Start a recurring interval to export and send audio data
                intervalKey = setInterval( function() {
                    recorder.export16kMono( function( blob ) {
                        socketSend( blob ); // Send the audio chunk
                        recorder.clear();   // Clear recorder buffer after sending
                    }, 'audio/x-raw' );
                }, config.interval );

                recorder.record();              // Begin recording audio
                config.onReadyForSpeech();      // Notify that the system is ready for speech
                config.onEvent( MSG_WEB_SOCKET_OPEN, e ); // Log WebSocket open event
            };

            // WebSocket connection close handler
            ws.onclose = function( e ) {
                var code = e.code;         // Close code
                var reason = e.reason;     // Reason for closing
                var wasClean = e.wasClean; // Whether the connection closed cleanly

                // The server typically closes the connection when its end-pointer detects end of utterance.
                config.onEndOfSession();                                           // Notify end of recognition session
                config.onEvent( MSG_WEB_SOCKET_CLOSE, e.code + "/" + e.reason + "/" + e.wasClean ); // Log close event
            };

            // WebSocket error handler
            ws.onerror = function( e ) {
                var data = e.data;
                config.onError( ERR_NETWORK, data ); // Log network error
            };

            return ws; // Return the configured WebSocket instance
        }


        /**
         * Establishes a WebSocket connection to monitor the speech server's status.
         * If an existing status connection is open, it will be closed first.
         */
        function monitorServerStatus() {
            // Close any existing status WebSocket connection
            if ( wsServerStatus ) {
                wsServerStatus.close();
            }

            // Create a new WebSocket connection for server status
            wsServerStatus = new WebSocket( config.serverStatus );

            // Handle incoming status messages
            wsServerStatus.onmessage = function( evt ) {
                // Parse the JSON status message and pass it to the callback
                config.onServerStatus( JSON.parse( evt.data ) );
            };
        }


        /**
         * Retrieves a human-readable description for a given server status code.
         * @param {number} code - The server status code.
         * @returns {string} The description for the code, or "Unknown error" if not found.
         */
        function getDescription( code ) {
            if ( code in SERVER_STATUS_CODE ) {
                return SERVER_STATUS_CODE[ code ];
            }
            return "Unknown error";
        }
    };


    /**
     * Transcription Constructor
     * A simple utility class for managing and concatenating transcription results.
     * It keeps track of partial and final results, forming a complete transcription.
     *
     * @param {object} cfg - Configuration object (currently unused, but allows for future expansion).
     */
    var Transcription = function( cfg ) {
        var index = 0;   // Current line index for final transcriptions
        var list = [];   // Array to store transcription parts

        /**
         * Adds a text segment to the transcription.
         * If `isFinal` is true, it marks the current segment as complete and
         * prepares for a new segment.
         *
         * @param {string} text - The transcription text to add.
         * @param {boolean} isFinal - True if this is a final transcription segment.
         */
        this.add = function( text, isFinal ) {
            list[ index ] = text;
            if ( isFinal ) {
                index++; // Move to the next line for a new final transcription
            }
        };

        /**
         * Returns the complete transcription as a single string,
         * with final segments joined by '. '.
         *
         * @returns {string} The full transcribed text.
         */
        this.toString = function() {
            return list.join( '. ' );
        };
    };

    // Expose Dictate and Transcription globally on the window object
    window.Dictate = Dictate;
    window.Transcription = Transcription;

} )( window ); // Immediately Invoked Function Expression (IIFE)