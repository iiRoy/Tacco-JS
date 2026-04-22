/* This is a generated Type I clone of a JavaScript file.
 * The original code's functionality is preserved entirely.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but logically identical version.
 */
// Start of script execution flow.


process.stdin.resume( ); // Resumes the standard input stream.


process.stdin.setEncoding( 'utf8' ); // Configures the input stream to use UTF-8 encoding.


// Sets up an event listener to handle incoming data chunks from stdin.
process.stdin.on( 'data', function ( chunk ) {

    // The received chunk is trimmed of leading/trailing whitespace
    // and then passed to the main processing function.
    main( chunk.trim() );

} ); // End of 'data' event listener.


/**
 * The core function responsible for processing a given string chunk.
 * This function applies a series of pattern replacements iteratively
 * until the string length stabilizes, then logs the final length.
 *
 * @param {string} chunk The string data chunk to be processed.
 * @returns {void} This function does not return a value; it prints to console.
 */
function     main   (   chunk   )   {

    // A variable 'line' is declared and assigned the result of splitting
    // the input 'chunk' into an array of individual characters.
    // Note: 'line' is not used further in the given logic.
    var     line     =     chunk.split( "" );



    // Perform an initial replacement of "ST" within the chunk.
    chunk     =     chunk.replace( "ST", "" );


    // The 'ans' variable is used to track the chunk's length
    // in the previous iteration to determine if further replacements
    // are necessary. In the original code, 'ans' is implicitly declared
    // here if not in strict mode, or would cause a ReferenceError if in strict mode.
    // For a Type I clone, this original behavior must be retained.
    while ( ans   !=   chunk.length ) {

        // Update 'ans' with the current length of the chunk.
        // This value will be compared in the next iteration.
        ans     =     chunk.length;

        // Apply a series of pattern replacements to the chunk.
        // These operations modify the chunk in place.
        chunk     =     chunk.replace( "ST", "" );
        chunk     =     chunk.replace( "SSTT", "" );
        chunk     =     chunk.replace( "SSSTTT", "" );
        chunk     =     chunk.replace( "SSSSTTTT", "" );

    } // End of while loop.


    // After the chunk's length has stabilized (no more patterns removed),
    // its final length is printed to the standard output.
    console.log( chunk.length );

} // End of main function definition.

// End of script.