let rawDataAccumulator = ''; // Global buffer to accumulate all incoming standard input data.

// Define constants for the specific substrings we are looking for and their length.
const TARGET_SEQUENCE_ALPHA = 'JOI';
const TARGET_SEQUENCE_BETA = 'IOI';
const SEQUENCE_WINDOW_SIZE = 3; // All target sequences are 3 characters long.

/**
 * Initializes a fresh counter object for our target sequences.
 * This ensures each line's analysis starts with zero counts.
 * @returns {object} An object with keys for each target sequence, initialized to zero.
 */
function initializeSequenceCounters() {
    return {
        [TARGET_SEQUENCE_ALPHA]: 0,
        [TARGET_SEQUENCE_BETA]: 0
    };
}

/**
 * Examines a single string line to detect occurrences of predefined sequences.
 * It slides a window of `SEQUENCE_WINDOW_SIZE` characters across the line.
 * @param {string} currentTextString - The individual line of text to be scanned.
 * @returns {object} An object containing the aggregated counts for TARGET_SEQUENCE_ALPHA and TARGET_SEQUENCE_BETA.
 */
function scanForTargetSequences(currentTextString) {
    // Input validation: Ensure we have a valid string of sufficient length to scan.
    if (typeof currentTextString !== 'string' || currentTextString.length < SEQUENCE_WINDOW_SIZE) {
        // If the line is invalid or too short to contain a target sequence, return zero counts.
        console.warn(`Skipping invalid or short line: "${currentTextString}"`);
        return initializeSequenceCounters();
    }

    let detectedCounts = initializeSequenceCounters(); // Counters for this specific line.
    let currentWindowStart = 0; // Index to start the current 3-character window.
    const maximumWindowStart = currentTextString.length - SEQUENCE_WINDOW_SIZE; // The last possible starting index.

    // Iterate through the string using a sliding window.
    // A 'while' loop is used here as an alternative to 'for' for structural variation.
    while (currentWindowStart <= maximumWindowStart) {
        // Extract the 3-character segment at the current window position.
        // Using `slice()` method, which is functionally equivalent to `substring()` for positive indices.
        const extractedSegment = currentTextString.slice(currentWindowStart, currentWindowStart + SEQUENCE_WINDOW_SIZE);

        // Explicitly check if the extracted segment matches any of our target sequences.
        if (extractedSegment === TARGET_SEQUENCE_ALPHA) {
            detectedCounts[TARGET_SEQUENCE_ALPHA]++; // Increment count for the first target.
        } else if (extractedSegment === TARGET_SEQUENCE_BETA) {
            detectedCounts[TARGET_SEQUENCE_BETA]++; // Increment count for the second target.
        }
        // Other segments are implicitly ignored.

        currentWindowStart++; // Move the window one character to the right.
    }

    return detectedCounts; // Return the final counts for this line.
}

/**
 * The primary function responsible for orchestrating the entire data processing workflow.
 * This is invoked once all standard input has been received.
 */
function initiateDataProcessing() {
    let processedTextLines; // Variable to hold the array of individual lines.

    try {
        // Guard clause: Handle cases where no data was provided or it's just an empty string.
        if (!rawDataAccumulator.trim()) { // .trim() to catch inputs with only whitespace
            console.error("No valid input data received. Exiting.");
            return; // Exit early if there's nothing to process.
        }

        // Split the accumulated raw data into an array of lines.
        // Filter out any empty strings that might result from extra newlines.
        processedTextLines = rawDataAccumulator.split('\n').filter(line => line.length > 0);

        // Another guard clause: If filtering results in an empty array.
        if (processedTextLines.length === 0) {
            console.error("Input data contained only empty lines. No analysis performed.");
            return;
        }

        let lineCounter = 0; // Helper variable to track the number of lines processed.

        // Iterate over each line in the parsed input.
        for (let lineIndex = 0; lineIndex < processedTextLines.length; lineIndex++) {
            const currentLineContent = processedTextLines[lineIndex];

            // Perform the sequence scanning for the current line.
            const analysisResults = scanForTargetSequences(currentLineContent);

            // Output the results clearly for each target sequence.
            // The output format is made more descriptive.
            console.log(`Line ${lineIndex + 1} - ${TARGET_SEQUENCE_ALPHA} detections: ${analysisResults[TARGET_SEQUENCE_ALPHA]}`);
            console.log(`Line ${lineIndex + 1} - ${TARGET_SEQUENCE_BETA} detections: ${analysisResults[TARGET_SEQUENCE_BETA]}`);
            lineCounter++; // Increment the counter for successfully processed lines.
        }

        // Optional: A final summary message.
        // console.log(`Processing complete. Analyzed ${lineCounter} non-empty lines.`);

    } catch (processingError) {
        // Centralized error handling for the main processing logic.
        console.error("An unexpected error occurred during data processing:", processingError.message);
        // Additional error details could be logged here for debugging.
    }
}

// --- Node.js Standard Input Stream Setup ---

// Ensure the standard input stream is active and listening for data.
process.stdin.resume();
// Specify the character encoding for the incoming data to avoid issues.
process.stdin.setEncoding('utf8');

// Event handler for when data chunks are received from stdin.
process.stdin.on('data', (incomingDataChunk) => {
    // Append each received chunk to our global buffer.
    rawDataAccumulator += incomingDataChunk;
});

// Event handler for when the standard input stream ends (e.g., EOF).
process.stdin.on('end', () => {
    // Once all data has been collected, initiate the main processing logic.
    initiateDataProcessing();
});

// Optional: Error handling for the stdin stream itself.
process.stdin.on('error', (streamError) => {
    console.error("Error reading from standard input:", streamError.message);
});