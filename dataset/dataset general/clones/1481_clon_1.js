/*
 *  File: audiostream.js
 *  --------------------
 *  This file defines the AudioStream module,
 *  providing functionality for audio playback and manipulation
 *  within a web browser environment.
 *
 *  Copyright (c) 2011 Kulikala. All Rights Reserved.
 *  ----------------------------------------------------
 */


(
    function ( window ) {


        // Define the main AudioStream constructor.
        // This function encapsulates all audio-related logic.
        var AudioStream = function
            (
            )
        {


            // --- Private properties and internal helper methods ---
            // These are not exposed directly to the consumer of the AudioStream object.


            var _audio = new Audio ( ) ; // Underlying HTML5 Audio element.
            var _audioBuffer = [ ] ; // Buffer to store incoming audio data.
            var _available = false ; // Flag indicating if audio setup is complete.
            var _bufPos = 0 ; // Current position within the head of the audio buffer.


            // Helper function to convert a Float32Array into an ArrayBuffer.
            // This is primarily used for serialization.
            var _binarify = function
                (
                    array
                )
            {
                var buffer = new ArrayBuffer( array.length * array.BYTES_PER_ELEMENT );
                var f32arr = new Float32Array( buffer );

                f32arr.set( array ); // Copy data from the input array.

                return buffer;
            } ; // End of _binarify function.


            /*
             *  _marshal: Serializes a Float32Array into a JSON string for network transmission.
             *  It includes audio channel and sample rate information along with the data.
             */
            var _marshal = function
                (
                    f32arr
                )
            {
                return JSON.stringify(
                    {
                        c: _audio.mozChannels,        // Number of channels
                        s: _audio.mozSampleRate,    // Sample rate
                        d: _stringify( f32arr )        // Audio data as hex string
                    }
                ) ;
            } ; // End of _marshal function.


            // Parses a hexadecimal string and converts it back into a Float32Array.
            // This reverses the _stringify operation.
            var _parse = function
                (
                    hexString
                )
            {
                var buffer = new ArrayBuffer( hexString.length / 2 ) ;
                var ui8arr = new Uint8Array( buffer ) ;

                // Iterate through the hex string, parsing two characters at a time.
                for ( var i = 0 ; i < ui8arr.length ; i++ )
                {
                    ui8arr[ i ] = parseInt( hexString.substr( i * 2 , 2 ) , 16 ) ;
                }

                return new Float32Array( buffer ) ;
            } ; // End of _parse function.


            // Converts a Float32Array into a hexadecimal string representation.
            // This is useful for transferring binary data as text.
            var _stringify = function
                (
                    array
                )
            {
                var ui8arr = new Uint8Array( _binarify( array ) ); // Get byte representation.
                var ret = [ ] ; // Array to build the hex string.

                // For each byte, convert to hex and pad with '0' if single digit.
                for ( var i = 0 ; i < ui8arr.length ; i++ )
                {
                    16 > ui8arr[ i ] && ret.push( '0' ) ; // Pad if necessary.
                    ret.push( ui8arr[ i ].toString( 16 ) ) ; // Convert to hex.
                }

                return ret.join( '' ) ; // Join all hex parts into a single string.
            } ; // End of _stringify function.


            /*
             *  _writeAudioData: Writes buffered audio data to the Audio object.
             *  This operation is asynchronous and handles partial writes.
             */
            var _writeAudioData = function
                (
                )
            {
                // Continue processing as long as there's data in the buffer.
                while ( 0 < _audioBuffer.length )
                {
                    // Get the first audio buffer from the queue.
                    var buffer = _audioBuffer[ 0 ] ;

                    // Attempt to write the audio frame to the Audio object.
                    var written = _audio.mozWriteAudio( buffer.subarray( _bufPos ) ) ;

                    // Check if the entire buffer was written.
                    if ( _bufPos + written < buffer.length )
                    {
                        // If not all data was written, update the buffer position
                        // and break to wait for the next write opportunity.
                        _bufPos += written ;
                        break ;
                    }
                    else
                    {
                        // If all data was written, remove the buffer from the queue
                        // and reset the position for the next buffer.
                        _audioBuffer.shift( ) ;
                        _bufPos = 0 ;
                    }
                }
            } ; // End of _writeAudioData function.


            // --- Public API of the AudioStream object ---
            // These methods and properties are accessible to users of AudioStream.


            return {

                /**
                 *  channels: Returns the number of audio channels.
                 *  @returns {number} The count of audio channels.
                 */
                channels: function
                    (
                    )
                {
                    return _audio.mozChannels ;
                },


                /**
                 *  load: Initiates loading of an audio media from a specified URL.
                 *  @param {string} url - The URL of the audio file to load.
                 */
                load: function
                    (
                        url
                    )
                {
                    // Set a flag indicating availability.
                    _avilable = true ;

                    // Assign the source URL and trigger the audio element's load method.
                    _audio.src = url ;
                    _audio.load( ) ;
                },


                /**
                 *  pause: Pauses the current audio playback.
                 */
                pause: function
                    (
                    )
                {
                    _audio.pause( ) ;
                },


                /**
                 *  play: Starts or resumes playback of the audio.
                 */
                play: function
                    (
                    )
                {
                    _audio.play( ) ;
                },


                /**
                 *  sampleRate: Returns the audio sample rate per second.
                 *  @returns {number} The sample rate.
                 */
                sampleRate: function
                    (
                    )
                {
                    return _audio.mozSampleRate ;
                },


                /**
                 *  onAudioData: Registers a callback for when new audio data is available.
                 *  The event object passed to the callback will contain marshalled audio data.
                 *  @param {function} callback - The function to call when audio data is available.
                 */
                onAudioData: function
                    (
                        callback
                    )
                {
                    // Add an event listener for 'MozAudioAvailable'.
                    _audio.addEventListener( 'MozAudioAvailable' , function ( event )
                    {
                        // Prepare the marshalled data from the frame buffer.
                        event.audioData = _marshal( event.frameBuffer ) ;

                        // Invoke the provided callback with the modified event object.
                        return callback( event ) ;
                    } , false ) ;
                },


                /**
                 *  onMetadata: Registers a callback for when metadata (e.g., duration) is loaded.
                 *  @param {function} callback - The function to call when metadata is available.
                 */
                onMetadata: function
                    (
                        callback
                    )
                {
                    _audio.addEventListener( 'loadedmetadata' , callback , false ) ;
                },


                /**
                 *  onTimeUpdate: Registers a callback for when the current playback position changes.
                 *  @param {function} callback - The function to call on time update.
                 */
                onTimeUpdate: function
                    (
                        callback
                    )
                {
                    _audio.addEventListener( 'timeupdate' , callback , false ) ;
                },


                /**
                 *  volume: Gets or sets the current audio volume.
                 *  @param {number} [value] - Optional: The new volume level (0.0 to 1.0).
                 *  @returns {number} The current volume level.
                 */
                volume: function
                    (
                        value
                    )
                {
                    // If a valid number is provided, set the audio volume.
                    if
                    (
                            typeof value === 'number'
                        &&  0 <= value
                        &&  1 >= value
                    )
                    {
                        _audio.value = value ;
                    }

                    return _audio.value ; // Return the current volume.
                },


                /**
                 *  setAudioData: Stores incoming audio data into an internal buffer
                 *  and schedules it for asynchronous writing to the audio output.
                 *  @param {string} audioData - JSON string containing audio channels, sample rate, and data.
                 */
                setAudioData: function
                    (
                        audioData
                    )
                {
                    // Parse the incoming JSON string.
                    audioData = JSON.parse( audioData ) ;

                    // If the audio system hasn't been initialized yet, do so.
                    if ( ! _available )
                    {
                        // Set up audio channels and sample rate using mozSetup.
                        _audio.mozSetup( audioData.c , audioData.s ) ;
                        _available = true ;
                    }

                    // Convert the data part into a Float32Array and add it to the buffer.
                    _audioBuffer.push( _parse( audioData.d ) ) ;

                    // Schedule the writing of audio data to happen shortly.
                    setTimeout( _writeAudioData , 1 ) ;
                }

            } ; // End of public API return.

        } ; // End of AudioStream constructor.


        /*
         *  Static properties and methods of AudioStream.
         *  These are accessed directly on the AudioStream constructor, not its instances.
         */

        /**
         *  audioPlayer: A factory method to create an AudioStream instance
         *  and immediately load an audio file.
         *  @param {string} url - The URL of the audio file.
         *  @returns {AudioStream} A new AudioStream instance.
         */
        AudioStream.audioPlayer = function
            (
                url
            )
        {
            var as = new AudioStream ( ) ; // Create a new instance.

            as.load( url ) ; // Load the specified URL.

            return as ; // Return the configured instance.
        } ;


        // --- Export AudioStream to the global window scope ---
        // This makes AudioStream accessible globally in the browser.
        window.AudioStream = AudioStream ;


    }
) ( window ) ;


//---------------------------------------------------------------------------
// End of audiostream.js module definition.
//---------------------------------------------------------------------------