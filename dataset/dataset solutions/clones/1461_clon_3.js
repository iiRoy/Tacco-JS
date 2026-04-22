const parseNumberSequence = (lineText) => {
    // This utility function takes a string line and converts it into an array of numbers.
    // It handles potential empty strings or non-numeric entries gracefully.
    if (typeof lineText !== 'string' || lineText.trim().length === 0) {
        return []; // Return an empty array if the input line is invalid or empty.
    }
    return lineText.split(' ').map(token => {
        const numericValue = Number(token);
        // Filter out any non-numeric tokens that might result in NaN.
        return isNaN(numericValue) ? null : numericValue;
    }).filter(item => item !== null); // Remove any nulls (originally NaNs) from the array.
};

/**
 * Core processing routine to analyze a given set of numbers against a collection of query numbers.
 * It determines how many of the query numbers exist within the unique collection.
 * @param {string} completeRawInput - The full string input, typically from a file or stdin.
 */
function processNumericDataChallenge(completeRawInput) {
    // First, clean up the input string and split it into individual lines.
    const inputSegments = completeRawInput.trim().split('\n');

    // A crucial validation step: ensure we have the minimum expected number of lines.
    // We need at least 4 lines: N (unused), N numbers, M, M numbers.
    if (inputSegments.length < 4) {
        console.error("Error: Input data is incomplete. Expected at least 4 lines of data.");
        return; // Exit if input format is incorrect.
    }

    // Extract the line containing the primary list of numbers to form our unique set.
    const primaryNumbersString = inputSegments[1];
    // Convert these numbers into a Set for efficient membership testing (O(1) average time complexity).
    const uniqueNumberCollection = new Set(parseNumberSequence(primaryNumbersString));

    // Retrieve the line that specifies the count of query numbers.
    const queryCountIndicator = inputSegments[2];
    const desiredQueryLimit = parseInt(queryCountIndicator, 10);

    // Validate the parsed query limit to prevent unexpected behavior.
    if (isNaN(desiredQueryLimit) || desiredQueryLimit < 0) {
        console.error(`Error: The specified query count '${queryCountIndicator}' is invalid.`);
        return;
    }

    // Extract the line containing the numbers that will be queried against our set.
    const queryNumbersString = inputSegments[3];
    // Parse these numbers into an array.
    const candidateElementsForSearch = parseNumberSequence(queryNumbersString);

    // Initialize a counter to track how many query numbers are found in the unique set.
    let totalFoundOccurrences = 0;

    // Determine the actual number of elements to iterate through.
    // This ensures we don't go beyond the specified limit OR the actual array length.
    const effectiveIterationBound = Math.min(desiredQueryLimit, candidateElementsForSearch.length);

    // Iterate through the candidate elements up to the determined bound.
    for (let currentSearchIndex = 0; currentSearchIndex < effectiveIterationBound; ++currentSearchIndex) {
        const elementToVerify = candidateElementsForSearch[currentSearchIndex];

        // Check if the current element from the query list exists in our unique collection.
        if (uniqueNumberCollection.has(elementToVerify)) {
            // If it exists, increment the counter.
            totalFoundOccurrences = totalFoundOccurrences + 1;
        }
    }

    // Display the final count of matching elements to standard output.
    console.log(totalFoundOccurrences);
}

// This block handles the execution environment, typically for Node.js.
// It reads data from standard input and passes it to the main processing function.
try {
    const fileSystemAccess = require('fs');
    const stdInputBuffer = fileSystemAccess.readFileSync("/dev/stdin", "utf8");
    // Call our main function with the content read from stdin.
    processNumericDataChallenge(stdInputBuffer);
} catch (ioError) {
    // Catch and report any errors that occur during file system operations or input reading.
    console.error("An error occurred while reading from standard input:", ioError.message);
    // Exit with a non-zero status code to indicate failure.
    process.exit(1);
}