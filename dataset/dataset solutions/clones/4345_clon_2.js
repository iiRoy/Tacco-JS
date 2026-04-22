/*
 * This module processes raw input data to calculate a specific sum.
 * It reads from standard input, parses numerical values, and applies a custom reduction logic.
 */
function ProcessData( rawInputText ) {

    // Split the entire input text into individual lines.
    // Each line is treated as a separate input row.
    const inputRows = rawInputText.split( /\n/ ) ;

    // Parse the first line to get an initial count.
    const initialCount = convertToInt( inputRows[ 0 ] ) ;

    // Parse the second line to get a target numerical value.
    const targetValue = convertToInt( inputRows[ 1 ] ) ;

    // The third line contains space-separated numbers, split them into an array of strings.
    const numberStrings = inputRows[ 2 ].split( ' ' ) ;


    // Perform a reduction operation on the array of number strings.
    // The logic for adding to the accumulator depends on a comparison.
    const calculatedTotal = numberStrings.reduce( function ( accumulator, currentElement, elementIndex ) {
        // If the absolute difference between the target and the current number is less than the current element's string value (type coerced),
        // add this difference to the accumulator.
        if ( Math.abs( targetValue - convertToInt( currentElement ) ) < currentElement ) {
            return accumulator + Math.abs( targetValue - convertToInt( currentElement ) ) ;
        }
        // Otherwise, convert both the accumulator and the current element to integers and add them.
        else {
            return convertToInt( accumulator ) + convertToInt( currentElement ) ;
        }
    }, 0 ) ; // Start the accumulation from zero.

    // Output the final calculated total to the console.
    console.log( calculatedTotal ) ;

}


/*
 * Helper function to safely convert a string value to an integer.
 * Uses base 10 for parsing.
 * @param {string} strValue - The string to convert.
 * @returns {number} The parsed integer.
 */
function convertToInt( strValue ) {
    return parseInt( strValue, 10 ) ;
}


// Entry point: Read data from standard input and pass it to the main processing function.
ProcessData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;