// This script initializes standard input processing to read data.
// It then passes the received data to a core function for string manipulation.

process.stdin.resume(); // Ensures the standard input stream remains active.
process.stdin.setEncoding('utf8'); // Configures the character encoding for incoming data.

// Establishes an event listener for 'data' events on the standard input stream.
process.stdin.on('data', function(inputSegment) {
    // Upon receiving a chunk of data, it removes leading/trailing whitespace
    // and dispatches it to the primary processing routine.
    processInputString(inputSegment.trim());
});

/**
 * Executes a specific string transformation algorithm.
 * It iteratively removes all occurrences of the substring "ST" from the input string
 * until no more instances of "ST" can be found, then outputs the final length.
 *
 * @param {string} inputString The textual data to be processed.
 */
function processInputString(inputString) {
    // A variable to store the string's length from the previous iteration.
    // This is crucial for determining if any replacements occurred in the current pass.
    let previousLength = inputString.length;

    // Perform the initial replacement of "ST".
    inputString = inputString.replace("ST", "");

    // Enter a loop that continues as long as the string's length changes
    // after an attempted replacement. This signifies that "ST" was found and removed.
    while (previousLength !== inputString.length) {
        // Update the stored length to the current string length before the next replacement.
        previousLength = inputString.length;
        // Attempt another replacement of "ST".
        inputString = inputString.replace("ST", "");
    }

    // Once the loop terminates (meaning no more "ST" substrings were found),
    // the final length of the modified string is printed to the console.
    console.log(inputString.length);
}
