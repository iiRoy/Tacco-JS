/*
 * This script initializes a client for a BinaryJS server and handles audio streaming.
 * It uses getUserMedia to capture audio from the user's microphone.
 *
 * Author: AI Assistant
 * Date: 2023-10-27 (Example Date)
 */
( function ( window ) {

    // Establish a connection to the BinaryJS server.
    // The server is expected to be running on localhost:9001.
    var client = new BinaryClient( 'ws://localhost:9001' ) ;


    client.on( 'open' , function ( ) {
        // Once the connection is open, create a new stream for sending data.
        window.Stream = client.createStream( ) ;


        // Check if the standard navigator.getUserMedia is available.
        // If not, try common vendor-prefixed versions for broader compatibility.
        if ( ! navigator.getUserMedia ) {
            /*
             * Polyfill for getUserMedia across different browsers.
             * This ensures that the audio capture functionality works
             * even on browsers that use prefixed versions.
             */
            navigator.getUserMedia = navigator.getUserMedia ||
                                     navigator.webkitGetUserMedia ||
                                     navigator.mozGetUserMedia    ||
                                     navigator.msGetUserMedia     ;
        }


        // Proceed only if getUserMedia (or its polyfill) is available.
        if ( navigator.getUserMedia ) {
            // Request audio access from the user.
            // On success, the 'success' callback function will be invoked.
            // On failure, an error message will be displayed.
            navigator.getUserMedia (
                { audio : true } ,
                success ,
                function ( e ) {
                    // Alert the user about the audio capture error.
                    alert ( 'Error capturing audio: ' + e.name + ' - ' + e.message + '.' ) ;
                }
            ) ;
        }
        else {
            // If getUserMedia is not supported at all, inform the user.
            alert ( 'getUserMedia not supported in this browser. Please update or use a different browser.' ) ;
        }


        // Internal flag to track the recording state.
        var recording = false ;


        // Expose a global function to start audio recording.
        window.startRecording = function ( ) {
            /*
             * Sets the internal recording flag to true.
             * This will enable the audio processing callback to send data.
             */
            recording = true ;
        } ;


        // Expose a global function to stop audio recording.
        window.stopRecording = function ( ) {
            // Set the recording flag to false to stop data transmission.
            recording = false ;

            // End the BinaryJS stream, signaling that no more data will be sent.
            window.Stream.end ( ) ;
        } ;


        /**
         * Callback function executed when getUserMedia successfully captures audio.
         *
         * @param {MediaStream} e - The MediaStream object representing the audio input.
         */
        function success ( e ) {

            // Initialize AudioContext, using vendor-prefixed versions if necessary.
            var audioContext = window.AudioContext || window.webkitAudioContext ;
            var context = new audioContext ( ) ; // Create a new audio context instance.


            // Create an audio source from the captured MediaStream.
            audioInput = context.createMediaStreamSource ( e ) ;

            // Define the buffer size for the audio processor.
            // This determines how many samples are processed at once.
            var bufferSize = 2048 ;

            // Create a ScriptProcessorNode for direct audio processing.
            // The parameters are: bufferSize, number of input channels (1 for mono), number of output channels (1 for mono).
            recorder = context.createScriptProcessor ( bufferSize , 1 , 1 ) ;


            // Assign the onaudioprocess event handler.
            // This function will be called repeatedly with audio data.
            recorder.onaudioprocess = function ( e ) {
                // If recording is not active, simply return without processing.
                if ( ! recording ) {
                    return ;
                }

                // Log a message to the console indicating that recording is active.
                console.log ( 'recording audio data...' ) ;

                // Get the audio data from the left channel (channel 0).
                var left = e.inputBuffer.getChannelData ( 0 ) ;

                // Convert the Float32Array data to Int16Array and write it to the stream.
                window.Stream.write ( convertoFloat32ToInt16 ( left ) ) ;
            } ;

            // Connect the audio input to the recorder.
            audioInput.connect ( recorder ) ;

            // Connect the recorder to the audio context's destination (speakers).
            // This allows the audio to be heard while being processed, if desired.
            recorder.connect ( context.destination ) ;
        }


        /**
         * Converts a Float32Array audio buffer to an Int16Array buffer.
         * This is often required for sending audio data over networks or to specific encodings.
         *
         * @param {Float32Array} buffer - The input Float32Array buffer.
         * @returns {ArrayBuffer} - The resulting Int16Array's underlying ArrayBuffer.
         */
        function convertoFloat32ToInt16 ( buffer ) {
            var l = buffer.length ;       // Get the length of the input buffer.
            var buf = new Int16Array ( l ) ; // Create a new Int16Array of the same length.

            // Iterate through the buffer, converting each float sample to a 16-bit integer.
            while ( l -- ) {
                buf[ l ] = buffer[ l ] * 0xFFFF ; // Multiply by 0xFFFF (65535) to scale to 16-bit range.
            }

            // Return the underlying ArrayBuffer of the Int16Array.
            return buf.buffer ;
        }

    } ) ; // End of client.on('open') callback.

} ) ( this ) ; // End of IIFE, passing 'this' (which is 'window' in a browser context) as 'window'.