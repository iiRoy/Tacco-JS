/*
 * This JavaScript module is designed to process standard input
 * and perform a specific character count operation.
 * It demonstrates event-driven programming with Node.js `process.stdin`.
 */

// Ensure the standard input stream is active and ready to receive data.
process . stdin . resume ( ) ;

// Set the character encoding for the standard input stream to UTF-8
// to correctly handle various character sets.
process . stdin . setEncoding ( 'utf8' ) ;


// Declare and initialize a global variable to accumulate all incoming data
// from standard input before processing.
var   g_input   =   ''   ;

// Attach an event listener to the standard input stream for 'data' events.
// This callback function will be executed every time new data is available.
process . stdin . on (
    'data' ,

    function ( chunk )   {
        // Append the received 'chunk' of data to the global input string.
        // This ensures all input is gathered before final processing.
        g_input   +=   chunk ;
    }
) ;

// Attach an event listener to the standard input stream for the 'end' event.
// This callback signifies that no more input will be received.
process . stdin . on (
    'end' ,

    function ( )   {
        // Once all input has been received, split the accumulated string
        // by newline characters (handling both Windows and Unix line endings)
        // and pass the resulting array of lines to the main processing function.
        main ( g_input . split ( / \r? \n / ) ) ;
    }
) ;

/**
 * The primary function responsible for processing the input.
 * It counts occurrences of the digit '2' within the combined input.
 *
 * @param {Array<string>} input - An array where each element is a line
 *                                from the standard input.
 */
function   main ( input )   {

    // Coerce the input array into a single string.
    // This effectively joins all elements without a separator,
    // which is useful for matching across line boundaries.
    input   =   input   +   "" ;

    // Use a regular expression to find all non-overlapping matches of the digit '2'.
    // The 'g' flag ensures that all occurrences are found, not just the first one.
    // The result will be an array of matched strings, or `null` if no matches are found.
    input   =   input . match ( / 2 / g ) ;

    // If the `match` method returned `null` (meaning no '2's were found),
    // reassign `input` to an empty array. This prevents errors when trying
    // to access `length` on `null`.
    if   ( input   ===   null )   {
        input   =   [ ] ;
    }

    // Output the total number of '2's found, which is the length of the
    // array returned by the `match` function (or the empty array if none).
    console . log ( input . length ) ;

} // End of the main function definition.