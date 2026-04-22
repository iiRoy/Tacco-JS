/*
 * This module provides a JavaScript function to interact with the
 * Google Speech-to-Text API. It leverages several utility libraries
 * for stream handling, HTTP requests, and data manipulation.
 */

var _        = require( 'lodash' );
var async    = require( 'async' );
var concat   = require( 'concat-stream' );
var duplexer = require( 'duplexer' );
var fs       = require( 'fs' );
var format   = require( 'google-speech-format' );
var qs       = require( 'qs' );
var request  = require( 'request' );
var through  = require( 'through' );


/**
 * Initializes the Google Speech-to-Text API client and returns a duplex stream
 * for audio input and speech recognition output.
 *
 * @param {object} options - Configuration options for the speech recognition.
 * @param {function} callback - Callback function to be invoked upon completion or error.
 * @returns {duplexer} A duplex stream for audio input and recognition results.
 */
module.exports = function ( options, callback ) {
    // Default parameters for the Google Speech API request.
    // These can be overridden by the 'options' object.
    var params = {
        app:        '',             // Application identifier (often left blank)
        client:     'chromium',     // Client type, 'chromium' is a common one
        key:        '',             // API key (optional, but recommended for production)
        lang:       'en-US',        // Language code for speech recognition
        maxResults: 1,              // Maximum number of recognition results to return
        output:     'json',         // Output format for the recognition results
        pfilter:    1,              // Profanity filter (1 = enabled, 0 = disabled)
        xjerr:      1               // Include X-JavaScript-Error header (1 = enabled)
    };

    // Extend default parameters with user-provided options.
    // _.pick.apply ensures that only valid 'params' keys from 'options' are used.
    params = _.extend( params, _.pick.apply( this, [ options ].concat( _.keys( params ) ) ) );

    // Ensure pfilter is strictly 0 or 1.
    params.pfilter = params.pfilter ? 1 : 0;

    // Apply default options for internal processing,
    // merging user options, modified params, and internal defaults.
    options = _.defaults( options, params, {
        clipSize:    15,    // Size of audio clips in seconds for processing
        maxRequests: 4,     // Maximum concurrent requests to the Google API
        sampleRate:  16000  // Audio sample rate in Hz (e.g., 16000 for standard)
    } );


    // Create a readable stream that will emit speech recognition results.
    // It signals completion by queuing `null` and then initiating the speech recognition process.
    var readStream = through( null, function () {
        this.queue( null ); /* Signals the end of the readable stream. */
        start();           // Begin the speech processing workflow.
    } );


    // Create a writable stream to receive raw audio data.
    // It concatenates all incoming audio chunks into a single buffer.
    // Once all data is received, it stores it in options.file and signals
    // the readStream to end, which triggers the speech recognition.
    var writeStream = concat( function ( data ) {
        options.file = data;      // Store the concatenated audio data.
        readStream.end();         // Signal the read stream to complete its processing.
    } );


    // Define HTTP headers required for the Google Speech API request.
    // The content type specifies FLAC audio and its sample rate.
    var headers = { 'content-type': 'audio/x-flac; rate=' + options.sampleRate };

    // Construct the full URL for the Google Speech API endpoint,
    // including all specified parameters.
    var url = 'https://www.google.com/speech-api/v2/recognize?' + qs.stringify( params );

    // Create a duplex stream, combining the writeStream for input audio
    // and the readStream for recognition results.
    var stream = duplexer( writeStream, readStream );

    // Initially pause the duplex stream to prevent data flow until
    // all setup is complete or a file is provided.
    stream.pause();


    /**
     * Helper function to perform a single speech recognition request for a given audio file.
     *
     * @param {string|Buffer} file - Path to the audio file or the audio buffer itself.
     * @param {function} callback - Callback function (err, result) for the recognition.
     */
    function getSpeech( file, callback ) {
        // Read the audio file from the file system.
        fs.readFile( file, function ( err, data ) {
            if ( err ) {
                // If there's an error reading the file, propagate it.
                return callback( err );
            }

            // Send a POST request to the Google Speech API with the audio data.
            request.post( { body: data, headers: headers, url: url },
                function ( err, res, body ) {
                    if ( err ) {
                        // Handle network or request-related errors.
                        return callback( err );
                    }
                    // The API sometimes returns an HTML page on error (e.g., rate limit).
                    // Check for this and treat it as an error.
                    if ( /<!DOCTYPE html>/i.test( body ) ) {
                        return callback( body );
                    }

                    // The API response might contain multiple lines; the actual JSON
                    // result is typically the last line. Extract it.
                    body = _.last( body.split( '\n' ), 2 )[ 0 ];

                    try {
                        // Attempt to parse the JSON response.
                        callback( null, JSON.parse( body ) );
                    }
                    catch ( e ) {
                        // If JSON parsing fails, propagate the error.
                        callback( e );
                    }
                    finally {
                        // Ensure the temporary audio file is deleted after processing.
                        fs.unlink( file );
                    }
                }
            );
        } );
    }


    /**
     * Final callback handler for the entire speech recognition process.
     * It passes the results to the original callback and then closes the stream.
     *
     * @param {Error} err - An error object, if any occurred during processing.
     * @param {object} res - The final speech recognition results.
     */
    function end( err, res ) {
        // Invoke the user-provided callback with the final results.
        callback( err, res );
        // Resume the stream, queue the stringified result, and end it.
        // This makes the result available to consumers of the duplex stream.
        stream.resume().queue( JSON.stringify( res ) ).end();
    }


    /**
     * Initiates the speech recognition process.
     * It first formats the audio into smaller clips if necessary,
     * then processes these clips in parallel using `async.mapLimit`.
     */
    function start() {
        // Format the audio file (e.g., split into smaller chunks) based on options.
        format( options, function ( err, files ) {
            if ( err ) {
                // If formatting fails, propagate the error.
                return callback( err );
            }
            // Process the formatted audio files concurrently up to maxRequests.
            async.mapLimit( files, options.maxRequests, getSpeech, end );
        } );
    }


    // If an audio file is directly provided in the options,
    // start the recognition process immediately.
    if ( options.file ) {
        start();
    }

    // Otherwise, the stream will wait for audio data to be piped into its
    // writable side, which will then trigger the recognition process.
    return stream;
};

// End of module.