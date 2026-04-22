/* This module provides utilities for sequence comparison. */

// A recursive utility to compare two sequences lexicographically.
// It assumes both sequences are comparable element by element (e.g., strings or arrays of comparable items).
function compareLexicographically(
    firstItem, /* The initial sequence for comparison. */
    secondItem /* The other sequence to compare against. */
) {
    // Check if the first element of the first sequence is greater than the second.
    if (firstItem[0] > secondItem[0]) {

        return 'GREATER'; // If so, the first sequence is lexicographically greater.

    }
    // Else, check if the first element of the first sequence is less than the second.
    else if (firstItem[0] < secondItem[0]) {

        return 'LESS';    // If so, the first sequence is lexicographically lesser.

    }
    // If the first elements are equal, we need to check further.
    // If the first sequence has only one element left (and they were equal up to this point),
    // then both sequences must be effectively equal in length and content up to this point.
    else if (firstItem.length === 1) {

        return 'EQUAL';   // They are considered equal.

    }
    // If first elements are equal and there's more to compare,
    // recursively call the function with the rest of the sequences.
    else {
        // Use substring for string manipulation, effectively stripping the first character.
        return compareLexicographically(
            firstItem.substring(1),
            secondItem.substring(1)
        );
    }
}

/*
 * This is the primary function to handle the input data.
 * It reads content, processes it, and outputs a comparison result.
 */
function processInputFileContent(
    rawText /* The entire input content as a single string. */
) {
    // Split the input string into an array of lines based on newline characters.
    let linesArray = rawText.split('\n');

    // Compare the lengths of the first two lines.
    // If the first line is longer, it's considered 'GREATER'.
    if (linesArray[0].length > linesArray[1].length) {

        console.log('GREATER');

    }
    // Else if the first line is shorter, it's considered 'LESS'.
    else if (linesArray[0].length < linesArray[1].length) {

        console.log('LESS');

    }
    // If the lengths are identical, perform a detailed lexicographical comparison
    // using the recursive helper function.
    else {
        // Pass complete copies of the first two lines for comparison.
        console.log(
            compareLexicographically(
                linesArray[0].substring(0), // Start from index 0 to get the full string.
                linesArray[1].substring(0)  // Start from index 0 to get the full string.
            )
        );
    }
}

// Execute the main processing function with content read from standard input.
// This uses Node.js 'fs' module to synchronously read the file.
processInputFileContent(
    require('fs').readFileSync(
        '/dev/stdin', // Path to standard input on Unix-like systems.
        'utf8'        // Encoding for the input file content.
    )
);