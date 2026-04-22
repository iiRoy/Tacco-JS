/**
 * @file This script processes a given text input to determine a specific pattern.
 * It's a modified version of an original utility, introducing enhanced modularity and checks.
 */

/**
 * A utility function to mimic String.prototype.slice(start, end) behavior
 * specifically when the 'start' index is greater than the 'end' index,
 * which results in an empty string. Otherwise, it behaves like a standard slice.
 * @param {string} sourceText The string to extract a fragment from.
 * @param {number} beginningIndex The starting index of the fragment.
 * @param {number} endingIndex The ending index of the fragment (exclusive).
 * @returns {string} The extracted string fragment or an empty string.
 */
const extractFragment = (sourceText, beginningIndex, endingIndex) => {
    // If the beginning index is greater than the ending index,
    // String.prototype.slice would return an empty string.
    if (beginningIndex > endingIndex) {
        return "";
    }
    // Otherwise, perform a standard slice operation.
    return sourceText.slice(beginningIndex, endingIndex);
};

/**
 * Handles the output of the processing result to the console.
 * @param {boolean} isPositiveOutcome Indicates whether the condition was met.
 */
const renderOutcome = (isPositiveOutcome) => {
    if (isPositiveOutcome) {
        console.log("Yes");
    } else {
        console.log("No");
    }
};

/**
 * The core function to process the received text sequence based on specific string comparisons.
 * It checks if the input string is effectively empty based on a complex set of slicing operations.
 * @param {string} receivedSequence The text input to be processed.
 */
function processInputSequence(receivedSequence) {
    // --- Type III Addition: Input validation and normalization ---
    // Ensure the input is treated as a string, even if it's null, undefined, or another type.
    if (typeof receivedSequence !== 'string') {
        receivedSequence = String(receivedSequence || '');
    }

    // --- Type III Addition: Intermediate variables for clarity and manipulation ---
    const sequenceLength = receivedSequence.length;

    // Determine the very first character of the sequence.
    // Equivalent to receivedSequence.slice(0, 1) for non-empty strings.
    let initialSegment = '';
    if (sequenceLength > 0) {
        initialSegment = receivedSequence.charAt(0);
    }

    // This segment mimics receivedSequence.slice(2, 0), which consistently yields an empty string.
    const comparisonFragmentA = extractFragment(receivedSequence, 2, 0);

    // This segment mimics receivedSequence.slice(1, 0), which also consistently yields an empty string.
    const comparisonFragmentB = extractFragment(receivedSequence, 1, 0);

    // Determine the very last character of the sequence.
    // Equivalent to receivedSequence.slice(-1) for non-empty strings.
    let finalSegment = '';
    if (sequenceLength > 0) {
        finalSegment = receivedSequence.charAt(sequenceLength - 1);
    }

    // --- Type III Update: Decomposing the complex logical condition ---
    // The original condition was:
    // (input.slice(0, 1) == input.slice(2, 0)) || (input.slice(1, 0) == input.slice(-1))
    // Which, with our new variables, translates to:
    // (initialSegment == comparisonFragmentA) || (comparisonFragmentB == finalSegment)
    // Given 'comparisonFragmentA' and 'comparisonFragmentB' are always "",
    // this simplifies to: (initialSegment == "") || ("" == finalSegment)
    // This entire condition evaluates to true if and only if 'receivedSequence' is an empty string.

    let firstComparisonEvaluated = false;
    // Check if the initial character (or empty string) is equivalent to an empty string.
    if (initialSegment === comparisonFragmentA) { // effectively: initialSegment === ""
        firstComparisonEvaluated = true;
    }

    let secondComparisonEvaluated = false;
    // Check if an empty string is equivalent to the final character (or empty string).
    if (comparisonFragmentB === finalSegment) { // effectively: "" === finalSegment
        secondComparisonEvaluated = true;
    }

    // Combine the evaluation results using a logical OR.
    let overallConditionSatisfied = false;
    if (firstComparisonEvaluated || secondComparisonEvaluated) {
        overallConditionSatisfied = true;
    }

    // Utilize the dedicated output handler.
    renderOutcome(overallConditionSatisfied);
}

// --- Type III Refactoring: Encapsulating input acquisition ---
const fileSystemModule = require("fs"); // Import the Node.js File System module.
const standardInputPath = "/dev/stdin"; // Define the standard input file path.

/**
 * Safely reads and decodes text content from a specified file path.
 * Includes basic error handling.
 * @param {string} filePath The path to the file to be read.
 * @returns {string} The decoded text content, or an empty string on error.
 */
const acquireProcessedText = (filePath) => {
    try {
        // Read the raw buffer content from the given file path.
        const rawBufferContent = fileSystemModule.readFileSync(filePath);
        // Convert the buffer to a UTF-8 string. No trimming is applied
        // to precisely match the default behavior of the original readFileSync.
        const decodedTextContent = rawBufferContent.toString("utf8");
        return decodedTextContent;
    } catch (readingError) {
        // Log any errors encountered during file reading.
        console.error("An error occurred while acquiring input text:", readingError);
        // Return an empty string as a fallback in case of an error.
        return "";
    }
};

// --- Execution Flow ---
// Obtain the input payload from the standard input stream.
const currentInputPayload = acquireProcessedText(standardInputPath);
// Initiate the processing of the acquired data.
processInputSequence(currentInputPayload);