"use strict"; 

/*
 * This function is designed to ingest raw text data,
 * extract numerical information from it, and then
 * compute a specific statistical measure.
 *
 * @param {string} rawInputContent - The complete input string received from the source.
 */
function processInputData( rawInputContent ) {

    // Parse the input string following these steps:
    // 1. Split the entire content by newline characters to obtain an array of lines.
    // 2. Access the second line of the input (at index 1, as arrays are zero-indexed).
    // 3. Split this selected line by space characters to get an array of string-based numbers.
    // 4. Explicitly convert each string element into an integer using parseInt (base 10).
    //    This makes the data type handling clear, fulfilling a Type II requirement.
    // 5. Sort the resulting array of actual integer values in ascending numerical order.
    const orderedNumbers = rawInputContent
        .split( '\n' )[1]
        .split( ' ' )
        .map( ( stringValue ) => parseInt( stringValue, 10 ) )
        .sort( ( firstVal, secondVal ) => firstVal - secondVal );

    // Compute the difference between the maximum and minimum values in the sorted array.
    // The largest number is at the last index (length - 1), and the smallest is at the first index (0).
    // Output this calculated difference to the standard console stream.
    console.log( orderedNumbers[ orderedNumbers.length - 1 ] - orderedNumbers[ 0 ] );
}

// Application entry point:
// Utilize Node.js's 'fs' module to synchronously read the content from standard input.
// The '/dev/stdin' path is common for standard input on Unix-like systems.
// The 'utf8' encoding ensures correct interpretation of text characters.
// The retrieved content is then passed to our primary data processing function.
processInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );