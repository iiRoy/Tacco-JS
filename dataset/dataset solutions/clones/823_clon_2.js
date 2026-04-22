/*
 * This JavaScript module is designed to process numerical inputs,
 * where each input number is evaluated to determine the count of distinct ways
 * it can be represented as a sum of two or more consecutive positive integers.
 * The script reads data line by line from standard input.
 */
function ProcessInputData ( rawContentString ) {
    // The incoming rawContentString contains all input data, potentially across multiple lines.
    // We split this string by newline characters to obtain an array,
    // where each element corresponds to a single line of input.
    rawContentString = rawContentString.split( '\n' );

    // Initiate an indefinite loop to iterate through each processed line of data.
    // This loop structure requires an explicit 'break' statement for termination.
    for ( let lineIndex = 0; true; ++lineIndex ) {
        // Parse the string representation of the number from the current line
        // into its integer equivalent, using base 10 for interpretation.
        // This 'targetNumericValue' is the integer we are currently analyzing.
        const targetNumericValue = parseInt( rawContentString[lineIndex], 10 );
        // Initialize a variable to accumulate the total number of consecutive sum combinations
        // that successfully add up to 'targetNumericValue'.
        let successfulCombinationsTally = 0;

        // A 'targetNumericValue' of zero acts as a sentinel value, indicating
        // that there are no further input lines to process.
        // Upon detecting zero, the processing loop must be exited.
        if ( targetNumericValue === 0 ) {
            break; // Exit the main input processing loop.
        }

        // Commence an inner loop to explore different possible lengths (represented by 'sequenceLength')
        // for sequences of consecutive positive integers.
        // The loop starts from a sequence length of 2, as a sum of consecutive integers
        // typically implies more than one term. It continues as long as 'sequenceLength'
        // is less than the 'targetNumericValue'.
        for ( let sequenceLength = 2; sequenceLength < targetNumericValue; ++sequenceLength ) {
            // The problem seeks to find if 'targetNumericValue' (N) can be expressed as a sum of
            // 'sequenceLength' (k) consecutive integers, starting from some integer 'a'.
            // The formula for such a sum is: N = k*a + k*(k-1)/2.
            // To find 'a', we rearrange: a = (N - k*(k-1)/2) / k.
            // For 'a' to be a positive integer, two conditions must simultaneously hold:
            // 1. The numerator (N - k*(k-1)/2) must be strictly greater than zero.
            // 2. The numerator must be perfectly divisible by 'k' (i.e., the remainder when divided by 'k' is zero).
            if ( ( targetNumericValue - sequenceLength * ( sequenceLength - 1 ) / 2 ) > 0 &&
                 ( ( targetNumericValue - sequenceLength * ( sequenceLength - 1 ) / 2 ) % sequenceLength === 0 ) ) {
                // If both conditions are met, it signifies that 'targetNumericValue' can indeed be
                // formed by a sequence of 'sequenceLength' consecutive integers.
                successfulCombinationsTally++; // Increment the counter for valid combinations.
            }
        }

        // After evaluating all possible sequence lengths for the current 'targetNumericValue',
        // print the total count of 'successfulCombinationsTally' to the console.
        console.log( successfulCombinationsTally );
    }
}

// The main execution point of the script.
// It uses Node.js's 'fs' (file system) module to synchronously read the entirety
// of the standard input stream ('/dev/stdin'). The content is read as a UTF-8 encoded string.
// This string is then passed as an argument to the 'ProcessInputData' function for analysis.
ProcessInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );