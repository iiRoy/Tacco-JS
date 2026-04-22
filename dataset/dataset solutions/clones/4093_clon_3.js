// This JavaScript module computes a specific numerical range based on input constraints.
// It performs a series of calculations to identify valid lower and upper bounds.

/**
 * Retrieves the raw input data from the standard input stream.
 * This function is designed for environments where '/dev/stdin' is available,
 * typically Node.js in a Unix-like system.
 * @returns {string} The complete string content read from stdin.
 */
const obtainRawSystemInput = () => {
    // Using Node.js 'fs' module to perform a synchronous read operation.
    // This ensures that the entire input is available before proceeding.
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

/**
 * Parses and validates the raw input string, extracting key parameters.
 * The expected format is two lines:
 * - The first line contains a single integer representing the primary index.
 * - The second line contains multiple space-separated integers, forming a coefficient array.
 * @param {string} incomingTextData - The unprocessed string received from the input source.
 * @returns {object} An object containing `targetIdentifier` (the K value) and `coefficientSequence` (the A array).
 * @throws {Error} If the input format is invalid or insufficient data is provided.
 */
const interpretInputData = (incomingTextData) => {
    // Normalize the input by removing any leading or trailing whitespace.
    const cleanedText = incomingTextData.trim();
    // Break the cleaned text into individual lines.
    const contentLines = cleanedText.split('\n');

    // Implement a validation check for the number of input lines.
    if (contentLines.length < 2) {
        throw new Error("Input data is incomplete. Expected at least two lines for processing.");
    }

    // Extract the target identifier (K) from the first line.
    // We only care about the first number on the first line.
    const extractedTargetIdentifier = parseInt(contentLines[0].split(' ')[0], 10);
    // Extract the sequence of coefficients (A) from the second line.
    // Each string element is converted to an integer.
    const extractedCoefficientSequence = contentLines[1].split(' ').map(numericString => parseInt(numericString, 10));

    // Perform validation on the parsed numeric data.
    if (isNaN(extractedTargetIdentifier) || extractedTargetIdentifier < 1) {
        throw new Error("The primary index (K) must be a positive integer.");
    }
    // Check if any of the coefficient values failed to parse as a number.
    if (extractedCoefficientSequence.some(val => isNaN(val))) {
        throw new Error("All values in the coefficient sequence must be valid integers.");
    }

    return {
        targetIdentifier: extractedTargetIdentifier,
        coefficientSequence: extractedCoefficientSequence
    };
};

/**
 * Computes the final permissible range (minimum and maximum bounds) based on
 * the provided target index and coefficient array. This function encapsulates
 * the core algorithm.
 * @param {number} primaryIndex - The 'K' value, indicating a specific position in the sequence.
 * @param {number[]} factorSet - The 'A' array, containing the numerical factors for range adjustment.
 * @returns {string} A string formatted as "min_value max_value" if a valid range is found,
 *                   otherwise "-1" indicating no such range exists.
 */
const computeAllowableRange = (primaryIndex, factorSet) => {
    // Initial guard clause: Ensure the primary index is valid relative to the factor set's length.
    if (primaryIndex > factorSet.length || primaryIndex <= 0) {
        return '-1'; // Index is out of bounds or non-positive.
    }

    // Check the specific condition related to the element at (K-1) position.
    // This is an early exit condition based on problem specifications.
    const lastRelevantFactor = factorSet[primaryIndex - 1];
    if (lastRelevantFactor > 2) {
        return '-1'; // If this factor is too large, no solution is possible.
    }

    // Initialize the boundaries of the range. These are fixed starting points for the algorithm.
    let currentLowerBound = 2;
    let currentUpperBound = 3;

    // Iterate backwards through the factor set, from 'K-2' down to the start of the array.
    // Each iteration refines the bounds based on the current factor.
    for (let processingIndex = primaryIndex - 2; processingIndex >= 0; processingIndex--) {
        const currentFactor = factorSet[processingIndex];

        // Adjust the lower bound: find the smallest multiple of `currentFactor` that is
        // greater than or equal to `currentLowerBound`.
        currentLowerBound = Math.ceil(currentLowerBound / currentFactor) * currentFactor;
        
        // Adjust the upper bound: find the largest multiple of `currentFactor` that is
        // less than or equal to `currentUpperBound`, then extend it to the end of that interval.
        currentUpperBound = Math.floor(currentUpperBound / currentFactor) * currentFactor + currentFactor - 1;

        // Critical validation: After each adjustment, check if the range remains valid.
        // If the upper bound drops below the current factor, or if the lower bound
        // surpasses the upper bound, no valid range exists.
        if (currentUpperBound < currentFactor || currentLowerBound > currentUpperBound) {
            return '-1'; // Inconsistent range detected, terminate early.
        }
    }

    // If the loop completes without an early exit, a valid range has been successfully determined.
    return `${currentLowerBound} ${currentUpperBound}`;
};

// The primary execution flow of the script.
// It orchestrates the reading, parsing, calculation, and output steps.
try {
    // Step 1: Secure the raw input text from the system.
    const rawDataInput = obtainRawSystemInput();

    // Step 2: Process and validate the raw text into structured variables.
    const { targetIdentifier: kValue, coefficientSequence: aValues } = interpretInputData(rawDataInput);

    // Step 3: Execute the core algorithm to derive the final range.
    const finalCalculatedRange = computeAllowableRange(kValue, aValues);

    // Step 4: Display the computed result to the standard output.
    console.log(finalCalculatedRange);

} catch (processingError) {
    // Catch and handle any errors that occur during the input processing or validation stages.
    // Output an informative error message to the console's error stream.
    console.error(`Execution halted due to an input or processing error: ${processingError.message}`);
    // Depending on specific problem requirements, one might also output '-1' here
    // to indicate a failure to find a solution due to bad input.
    // For this clone, we differentiate between logical '-1' and structural errors.
}