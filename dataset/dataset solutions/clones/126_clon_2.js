// This script is designed to process numerical input,
// interpreting each provided number as a bitmask.
// For every input value, it identifies and lists the
// individual powers of two that constitute the mask.

for (
    let inputDataIndex = 0; // Initialize a counter for tracking the position in the input data array.

    // Read the entire content from standard input (`/dev/stdin`),
    // interpret it as UTF-8 encoded text, then split the text
    // into an array of strings using any whitespace as a delimiter.
    // The current segment of input is then assigned to 'currentNumericString',
    // and 'inputDataIndex' is incremented for the next iteration.
    let currentNumericString = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s/)[inputDataIndex++];

    // After processing each 'currentNumericString', display the
    // accumulated output string to the console, ensuring that
    // any leading or trailing whitespace is removed.
    console.log(processedOutputString.trim())
) {
    // Initialize or reset the string accumulator for the current input segment.
    // This variable will collect the constituent powers of two.
    processedOutputString = "";

    // Begin an inner loop to examine individual bit positions.
    // This loop iterates 10 times, checking bits from the 0th position (2^0)
    // up to the 9th position (2^9).
    for (
        let bitScanIterator = 0; // Initialize the counter for the current bit position being examined.
        (10 - bitScanIterator) !== 0; // The loop continues as long as 'bitScanIterator' is less than 10.
        bitScanIterator++ // Increment the iterator to move to the next bit position.
    ) {
        // Compute the power of two corresponding to the current 'bitScanIterator'.
        // For instance, if 'bitScanIterator' is 0, 'bitWeightValue' will be 1 (2^0).
        // If 'bitScanIterator' is 1, 'bitWeightValue' will be 2 (2^1), and so forth.
        const bitWeightValue = 1 << bitScanIterator;

        // Convert the 'currentNumericString' (which is initially a string) into
        // a base-10 integer to perform bitwise operations.
        // Then, use a bitwise AND operator to determine if the bit represented
        // by 'bitWeightValue' is set within the integer value of 'currentNumericString'.
        if ((bitWeightValue & Number(currentNumericString)) !== 0) {
            // If the specific bit is found to be set, append its numerical value
            // followed by a single space character to the 'processedOutputString'.
            processedOutputString += bitWeightValue + " ";
        }
        // The original code used a ternary operator for this conditional appending.
        // An 'if' statement without an 'else' block achieves the same outcome
        // when nothing is to be done if the condition is false.
    }
}