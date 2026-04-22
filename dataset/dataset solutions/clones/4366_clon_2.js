/*
 * This routine processes raw text data to compute a numerical outcome.
 * It expects the raw input to be a string.
 * The first line of the input is extracted and then processed character by character.
 * Subsequent lines, if any, are ignored due to the specific data parsing approach.
 */
function ProcessNumericData( sourceContent ) {

    // Divide the entire content into an array of strings, each representing a line.
    let lineFragments = sourceContent.split('\n');

    // Extract the very first line from the array.
    // The variable 'lineFragments' is then reassigned to hold this single string.
    // This means subsequent operations will only apply to the characters of this first line.
    lineFragments = lineFragments.shift();

    // Convert the characters of the extracted first line into arrays of parsed integers.
    // Each character is treated as a separate 'segment'.
    let numericalSegments = lineFragments.map( function( charSegment ) {

        // For each character, split by space (results in ['char'] or ['', ''] for space),
        // then attempt to parse each resulting string into an integer.
        // This will result in arrays like [number] or [NaN, NaN].
        return charSegment.split(' ').map( function(strVal) {
            return parseInt(strVal, 10);
        } );
    } );

    // Initialize an accumulator for the final calculation.
    let aggregateResult = 0;

    // Iterate through the processed numerical segments.
    // Each 'itemPair' will be an array like [number] or [NaN, NaN].
    numericalSegments.forEach( function(itemPair) {
        // Attempt to sum (itemPair[1] - itemPair[0] + 1).
        // For typical character processing, itemPair[1] will often be undefined or NaN,
        // leading to NaN in the sum.
        aggregateResult += (itemPair[1] - itemPair[0] + 1);
    } );

    // Output the computed aggregate result.
    console.log('Final Outcome: %d', aggregateResult);

}

// Invoke the main processing function with data read from standard input.
// This uses Node.js 'fs' module to synchronously read the content of /dev/stdin.
ProcessNumericData( require("fs").readFileSync("/dev/stdin", "utf8") );