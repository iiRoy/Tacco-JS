/**
 * This module provides the core logic for processing character sequences,
 * specifically to analyze runs of identical characters and compute a derived value.
 */

/**
 * Iteratively calculates the lengths of consecutive identical character segments within a given string.
 * This function effectively performs a form of run-length encoding.
 *
 * @param {string} sequenceToProcess - The string that needs to be analyzed for character runs.
 * @returns {number[]} An array containing the length of each consecutive character run found.
 *                     Returns an empty array if the input sequence is null, undefined, or empty.
 */
const calculateRunGroups = (sequenceToProcess) => {
    // Robustly convert the input to a string, handling potential non-string types or null values.
    let mutableSequence = String(sequenceToProcess || '');
    const detectedRunLengths = []; // This array will store the lengths of each character run.

    // Continue processing as long as there are characters left in the sequence.
    while (mutableSequence.length > 0) {
        const definingCharacter = mutableSequence[0]; // The character that starts the current run.
        let currentRunCount = 0; // Counter for the length of the current consecutive run.

        // Iterate through the current segment of the sequence to find the end of the run.
        for (let charIterator = 0; charIterator < mutableSequence.length; charIterator++) {
            if (mutableSequence[charIterator] === definingCharacter) {
                currentRunCount++; // Increment count if the character matches the defining character.
            } else {
                // A different character means the current run has ended.
                break;
            }
        }

        // Add the length of the just-completed run to our results.
        detectedRunLengths.push(currentRunCount);
        // Remove the processed run from the beginning of the sequence to prepare for the next iteration.
        mutableSequence = mutableSequence.substring(currentRunCount);
    }
    return detectedRunLengths; // Return the complete list of run lengths.
};

/**
 * This is the primary entry point for the application, designed to process standard input.
 * It reads raw input, extracts the relevant string, and then applies a specific logic
 * to compute and output a numerical result based on character run lengths.
 *
 * @param {string} rawInputContent - The raw string content received from standard input.
 */
const ProcessInputData = (rawInputContent) => {
    // Safely parse the raw input, ensuring it's a string, trimming whitespace, and splitting by newlines.
    const inputLinesArray = String(rawInputContent || '').trim().split('\n');

    // Implement a guard clause for empty or invalid input scenarios.
    if (inputLinesArray.length === 0 || inputLinesArray[0].trim().length === 0) {
        console.log(0); // For no valid sequence, output 0 as per problem conventions for edge cases.
        return;
    }

    // The first non-empty line is the target sequence for our analysis.
    const primarySequence = inputLinesArray[0].trim();

    // Obtain the lengths of all consecutive character runs in the primary sequence.
    const characterRunLengths = calculateRunGroups(primarySequence);

    let finalCalculatedValue = 0; // Initialize the variable that will hold the ultimate result.

    // Apply different calculation rules based on the number of character runs identified.
    if (characterRunLengths.length <= 1) {
        // If there are zero or one runs (e.g., "", "A", "AAAA"), there are no adjacent pairs
        // to sum or compare. The original code would produce NaN for length 1;
        // this handles such edge cases by yielding 0, which is often the expected behavior
        // for "no possible operation" in competitive programming.
        finalCalculatedValue = 0;
    } else if (characterRunLengths.length === 2) {
        // If there are exactly two distinct character runs (e.g., "AAABBB"),
        // the result is the maximum of their two lengths.
        finalCalculatedValue = Math.max(characterRunLengths[0], characterRunLengths[1]);
    } else {
        // For three or more character runs (e.g., "AAABBC"),
        // the objective is to find the minimum sum among all adjacent pairs of run lengths.
        // Start by initializing with the sum of the first two runs.
        let smallestAdjacentPairSum = characterRunLengths[0] + characterRunLengths[1];

        // Iterate through the remaining adjacent pairs to find if any sum is smaller.
        // The loop goes up to `length - 2` because we access `pairIndex + 1`.
        for (let pairIndex = 1; pairIndex < characterRunLengths.length - 1; pairIndex++) {
            const currentAdjacentSum = characterRunLengths[pairIndex] + characterRunLengths[pairIndex + 1];
            // Update the minimum sum found so far.
            smallestAdjacentPairSum = Math.min(smallestAdjacentPairSum, currentAdjacentSum);
        }
        finalCalculatedValue = smallestAdjacentPairSum;
    }

    // Output the final computed result to the standard output stream.
    console.log(finalCalculatedValue);
};

// The following line is standard boilerplate for competitive programming platforms
// to read input from /dev/stdin and invoke the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));