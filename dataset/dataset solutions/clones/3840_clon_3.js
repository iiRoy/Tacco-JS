let inputLineCount = 0; // Tracks the number of input lines received
let mainInputString = ''; // Stores the primary string input
let targetKValue = 0; // Stores the numeric 'K' input
let accumulatedInputData = ''; // Gathers all raw input chunks

// Helper function to handle critical exits
const terminateProcess = (message = 'Exiting due to an unrecoverable error.') => {
    // console.error(message); // Optional: log error message before exiting
    process.exit(1); // Exit with a non-zero code to indicate an error
};

// Validates the length of the string and the K value
const validateParameters = (textLength, kValue) => {
    const minTextLen = 1;
    const maxTextLen = 5000;
    const minKVal = 1;
    const maxKVal = 5;

    // Check if string length is within acceptable bounds
    if (textLength < minTextLen || textLength > maxTextLen) {
        // console.error(`Input string length (${textLength}) is out of range [${minTextLen}, ${maxTextLen}].`);
        return false;
    }

    // Check if K value is within acceptable bounds
    if (kValue < minKVal || kValue > maxKVal) {
        // console.error(`K value (${kValue}) is out of range [${minKVal}, ${maxKVal}].`);
        return false;
    }
    return true;
};

// Checks if a given string segment is valid for consideration
const isMeaningfulSegment = (segment) => {
    // A meaningful segment should not be empty and should not contain newline characters
    return segment.length > 0 && !segment.includes('\n') && !segment.includes('\r');
};

// Set the encoding for standard input to correctly handle characters
process.stdin.setEncoding('utf8');

// Event handler for incoming data chunks from standard input
process.stdin.on('data', function(chunkBuffer) {
    // Accumulate all incoming data into a single string
    accumulatedInputData += chunkBuffer.toString();
});

// Event handler for the end of standard input stream
process.stdin.on('end', function() {
    // Split the accumulated input into lines
    const inputLines = accumulatedInputData.split(/\r?\n/).filter(line => line.trim().length > 0);

    // Ensure we have at least two lines of input
    if (inputLines.length < 2) {
        // console.error('Insufficient input provided. Expected at least two lines.');
        terminateProcess('Input format error: not enough lines.');
    }

    // Assign the first line as the main string, converted to lowercase
    mainInputString = inputLines[0].toLowerCase();
    // Assign the second line as the K value, parsed as an integer
    targetKValue = parseInt(inputLines[1], 10);

    // Validate the parsed K value
    if (isNaN(targetKValue)) {
        // console.error('Invalid K value provided. Must be a number.');
        terminateProcess('Input format error: K is not a number.');
    }

    // Execute the core logic with the processed inputs
    executeSubstringAnalysis(mainInputString, targetKValue);
});

// The main function that performs substring generation and selection
function executeSubstringAnalysis(sourceString, kthTarget) {
    const sourceStringLength = sourceString.length;

    // Perform initial validation of input parameters
    if (!validateParameters(sourceStringLength, kthTarget)) {
        terminateProcess('Input validation failed.');
    }

    // Use a Set to efficiently store unique substrings
    const collectedUniqueSubstrings = new Set();
    let currentSegment = ''; // Temporary variable for the current substring slice

    // Iterate through all possible start and end indices to generate substrings
    for (let startIdx = 0; startIdx < sourceStringLength; startIdx++) {
        for (let endIdx = startIdx + 1; endIdx <= sourceStringLength; endIdx++) {
            currentSegment = sourceString.slice(startIdx, endIdx); // Extract the substring

            // Check if the segment is meaningful before adding to the set
            if (isMeaningfulSegment(currentSegment)) {
                collectedUniqueSubstrings.add(currentSegment);
            }
        }
    }

    // Convert the Set of unique substrings to an Array for sorting
    const sortedSegments = Array.from(collectedUniqueSubstrings);
    // Sort the array lexicographically
    sortedSegments.sort();

    // Determine the index for the K-th smallest substring (K is 1-based)
    const resultIndex = kthTarget - 1;

    // Check if the requested K-th substring exists
    if (resultIndex < 0 || resultIndex >= sortedSegments.length) {
        // console.warn(`The K-th substring (K=${kthTarget}) is out of bounds for the ${sortedSegments.length} unique substrings found.`);
        console.log(''); // Output an empty line or a specific error indicator
    } else {
        // Output the K-th smallest unique substring
        console.log(sortedSegments[resultIndex]);
    }

    // Signal successful completion of the program
    process.exit(0);
}