/*
 * This module is designed to handle standard input/output operations for a specific problem.
 * It reads a sequence of characters, typically 'R' (Red) and 'W' (White), and computes
 * the minimum number of operations required to arrange them according to a particular rule.
 * The input stream is captured, parsed, and then fed into the primary problem-solving routine.
 */

// A buffer to accumulate all incoming data from the standard input stream.
let bufferedInputData = '';
// An index to keep track of the current line being processed from the parsed input.
let currentProcessedLineIndex = 0;
// An array that will hold all input lines after they have been parsed and cleaned.
let parsedInputLines = [];

// Ensure the standard input stream remains active to receive all data.
process.stdin.resume();
// Set the character encoding for the input stream to UTF-8.
process.stdin.setEncoding('utf-8');

// Attach an event listener to capture data chunks as they arrive from standard input.
process.stdin.on('data', incomingChunk => {
    // Append each new data chunk to our cumulative buffer.
    bufferedInputData += incomingChunk;
});

// Attach an event listener for when the standard input stream signals its end.
process.stdin.on('end', () => {
    // Immediately after all input has been received, perform initial processing.

    // --- Type III Addition: Input Validation and Fallback ---
    // If no input data was provided or it's just whitespace, provide a default
    // to prevent errors in subsequent parsing, assuming '0' as a valid length.
    if (!bufferedInputData || bufferedInputData.stripLeadingAndTrailingWhitespace().length === 0) {
        console.warn("No substantial input data received. Proceeding with default '0' length.");
        bufferedInputData = "0\n"; // Minimal valid input for problem context
    }

    // --- Type III Addition: String Prototype Extensions for Readability ---
    // These methods are added to String.prototype to make the input processing chain more fluent.
    if (!String.prototype.stripLeadingAndTrailingWhitespace) {
        String.prototype.stripLeadingAndTrailingWhitespace = function() {
            return this.trim();
        };
    }
    if (!String.prototype.splitByNewlineDelimiter) {
        String.prototype.splitByNewlineDelimiter = function() {
            return this.split('\n');
        };
    }

    // --- Type III Addition: Helper Function for Input Preparation ---
    // This function encapsulates the steps for cleaning and splitting the raw input.
    const prepareInputData = (rawData) => {
        return rawData
            .stripLeadingAndTrailingWhitespace() // Remove leading/trailing whitespace from the entire block
            .splitByNewlineDelimiter()           // Split the block into individual lines
            .map(line => line.stripLeadingAndTrailingWhitespace()); // Trim each individual line
    };

    // Process the buffered data into an array of clean lines.
    parsedInputLines = prepareInputData(bufferedInputData);

    // Once input is ready, initiate the main problem-solving routine.
    executePrimaryProblemSolver();
});

/**
 * Retrieves the next available line from the globally stored, parsed input array.
 * This function also advances the internal line index pointer.
 * @returns {string} The text content of the next input line. Returns an empty string
 *                   if attempting to read beyond the available lines (Type III addition).
 */
function retrieveNextInputLine() {
    // --- Type III Addition: Robustness Check ---
    // Prevent attempts to access array elements out of bounds.
    if (currentProcessedLineIndex >= parsedInputLines.length) {
        console.error("Attempted to read past the end of input lines.");
        return ""; // Return empty string or throw error depending on desired error handling
    }
    return parsedInputLines[currentProcessedLineIndex++];
}

/**
 * This is the core function where the problem's logic is implemented.
 * It reads problem-specific parameters and the character sequence, then
 * performs calculations to determine the required operations count.
 */
function executePrimaryProblemSolver() {
    // --- Type III Addition: Constants for Clarity ---
    // Define the specific characters involved in the problem for better readability.
    const SYMBOL_RED_CHAR = 'R';
    const SYMBOL_WHITE_CHAR = 'W';

    // Read the total count of elements in the character sequence.
    // Explicitly using parseInt with radix 10 for safe number conversion (Type II/III update).
    const sequenceLength = parseInt(retrieveNextInputLine(), 10);

    // --- Type III Addition: Input Validation for Problem Parameters ---
    // Check if the sequence length is a valid non-negative number.
    if (isNaN(sequenceLength) || sequenceLength < 0) {
        console.error("Error: Invalid sequence length detected. Must be a non-negative integer.");
        return; // Terminate execution if input is invalid.
    }

    // --- Type III Addition: Early Exit for Trivial Cases ---
    // If there's one or zero elements, no operations are ever needed.
    if (sequenceLength <= 1) {
        console.info(0); // Use console.info for non-error output (Type II change).
        return;
    }

    // Read the actual character sequence string.
    const charSequenceArray = retrieveNextInputLine();

    // Initialize two pointers for traversing the sequence from both ends.
    let leftTraversalPointer = 0;
    let rightTraversalPointer = sequenceLength - 1;
    // Counter for the required number of 'swap' operations.
    let requiredSwapCount = 0;

    // --- Type III Update: Refactored Core Loop Structure ---
    // The main processing loop continues as long as the left pointer has not crossed the right pointer.
    // This structure explicitly finds matching characters in separate steps rather than nested flag-based loops.
    while (leftTraversalPointer <= rightTraversalPointer) {

        let potentialWhitePosition = -1; // Index of a 'W' found from the left.
        // Iterate from the current left pointer towards the right, up to (but not including) the right pointer.
        // We are searching for the first 'W' character in this segment.
        for (let searchIdxFromLeft = leftTraversalPointer; searchIdxFromLeft < rightTraversalPointer; searchIdxFromLeft++) {
            if (charSequenceArray[searchIdxFromLeft] === SYMBOL_WHITE_CHAR) {
                potentialWhitePosition = searchIdxFromLeft; // Store its index.
                break; // Stop at the first 'W' found.
            }
        }

        // If no 'W' was found in the traversable left segment, no more operations are possible.
        if (potentialWhitePosition === -1) {
            break;
        }

        let potentialRedPosition = -1; // Index of an 'R' found from the right.
        // Iterate from the current right pointer towards the left, down to (but not including) the 'W' found.
        // We are searching for the last 'R' character in this segment.
        for (let searchIdxFromRight = rightTraversalPointer; searchIdxFromRight > potentialWhitePosition; searchIdxFromRight--) {
            if (charSequenceArray[searchIdxFromRight] === SYMBOL_RED_CHAR) {
                potentialRedPosition = searchIdxFromRight; // Store its index.
                break; // Stop at the first 'R' found (which is the last from the right).
            }
        }

        // If no 'R' was found in the traversable right segment for the 'W' we just identified,
        // then no more valid operations can be performed.
        if (potentialRedPosition === -1) {
            break;
        }

        // --- Type III Addition: Intermediate Step Clarity ---
        // If both a 'W' on the left and an 'R' on the right are successfully identified,
        // it means an operation is required to move them past each other.
        requiredSwapCount++;

        // Adjust the pointers to exclude the characters that have just been "handled".
        // The left pointer moves past the 'W' that was found.
        leftTraversalPointer = potentialWhitePosition + 1;
        // The right pointer moves past the 'R' that was found.
        rightTraversalPointer = potentialRedPosition - 1;
    }

    // Output the final computed count of operations.
    console.info(requiredSwapCount); // Using console.info for standard output (Type II change).
}