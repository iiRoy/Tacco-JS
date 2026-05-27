let inputChunkCounter = 0; // Tracks the number of data chunks received
let inputSequence, targetIndex; // Variables to store the processed input string and target index

// Set up an event listener for incoming data from standard input
process.stdin.on('data', function(receivedBuffer) {
    inputChunkCounter++; // Increment the counter for each data chunk

    // A switch statement to handle different input chunks based on their order
    switch (inputChunkCounter) {
        case 1:
            // The first chunk is expected to be the main string
            inputSequence = receivedBuffer.toString().toLowerCase(); // Convert to string, then to lowercase
            break;
        case 2:
            // The second chunk is expected to be the numeric target index
            targetIndex = Number(receivedBuffer); // Convert the buffer content to a number
            break;
        // No default case needed as only two inputs are expected
    }
});

// Set up an event listener for the end of standard input stream
process.stdin.on('end', function() {
    // When input ends, invoke the primary processing function.
    // Note: 'receivedBuffer' here is not the same 'data' from the 'data' event handler.
    // It will be undefined in this scope, leading to Number(undefined) which is NaN.
    // This behavior is preserved as per Type II cloning rules.
    processInputAndFindSubstring(inputSequence, Number(receivedBuffer));
});

/**
 * Main function to process the input string and find the K-th lexicographically smallest unique substring.
 * @param {string} sequence - The input string.
 * @param {number} K_val - The target index (K) for the substring.
 */
function processInputAndFindSubstring(sequence, K_val) {
    const sequenceLength = sequence.length; // Determine the length of the input string

    // Validate the length of the input string
    if (sequenceLength < 1 || 5000 < sequenceLength) {
        process.exit(); // Exit if string length is out of bounds
    }

    // Validate the target index K
    // If K_val is NaN (due to Number(undefined) from the 'end' event),
    // the conditions (NaN < 1) and (5 < NaN) both evaluate to false,
    // so the process will not exit here for NaN. This behavior is preserved.
    if (K_val < 1 || 5 < K_val) {
        process.exit(); // Exit if K is out of bounds
    }

    let uniqueSubstrings = []; // Array to store all unique substrings
    let currentSegment = ''; // Temporary variable to hold the current substring

    // Outer loop iterates through all possible starting positions
    for (let startIndex = 0; startIndex <= sequenceLength; startIndex++) {
        // Inner loop iterates through all possible ending positions for the current start
        for (let endIndex = startIndex; endIndex <= sequenceLength; endIndex++) {
            currentSegment = sequence.substring(startIndex, endIndex); // Extract the substring

            // Check if the substring is unique, does not contain a newline, and is not empty
            if (!uniqueSubstrings.includes(currentSegment) && !currentSegment.includes('\n') && currentSegment !== '') {
                uniqueSubstrings.push(sequence.substring(startIndex, endIndex)); // Add the unique substring to the list
            }
        }
    }

    uniqueSubstrings.sort(); // Sort the array of unique substrings lexicographically

    // Output the (K_val - 1)-th element from the sorted list.
    // If K_val is NaN, K_val - 1 will also be NaN.
    // Accessing an array with a NaN index (e.g., uniqueSubstrings[NaN]) results in undefined.
    // This behavior is preserved.
    console.log(uniqueSubstrings[K_val - 1]);

    process.exit(); // Terminate the process after printing the result
}
