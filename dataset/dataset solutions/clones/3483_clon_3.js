/**
 * This module provides a set of core mathematical and utility functions
 * designed to assist in numerical and string processing tasks.
 */

/**
 * Converts a given string representation into its integer equivalent.
 * It strictly adheres to base-10 parsing to ensure consistent numeric interpretation.
 *
 * @param {string} inputRepresentation - The string that needs to be converted into a number.
 * @returns {number} The integer value derived from the input string.
 */
function extractNumericValue(inputRepresentation) {
    // Using parseInt with a radix of 10 is a reliable method for string-to-integer conversion.
    return parseInt(inputRepresentation, 10);
}

/**
 * Calculates the Greatest Common Divisor (GCD) of two non-negative integers
 * using the iterative Euclidean algorithm. This method efficiently finds the
 * largest positive integer that divides both numbers without a remainder.
 *
 * @param {number} valueOne - The first integer for GCD calculation.
 * @param {number} valueTwo - The second integer for GCD calculation.
 * @returns {number} The greatest common divisor of the two input numbers.
 */
function determineCommonDivisor(valueOne, valueTwo) {
    // Ensure that both input values are treated as non-negative for GCD calculation.
    let currentDividend = Math.abs(valueOne);
    let currentDivisor = Math.abs(valueTwo);

    // The Euclidean algorithm continues until the divisor becomes zero.
    while (currentDivisor !== 0) {
        const remainder = currentDividend % currentDivisor;
        currentDividend = currentDivisor;
        currentDivisor = remainder;
    }
    return currentDividend; // The last non-zero remainder is the GCD.
}

/**
 * Computes the Least Common Multiple (LCM) of two integers.
 * The calculation is based on the fundamental relationship:
 * LCM(a, b) = |a * b| / GCD(a, b).
 * Special handling for cases where one or both inputs are zero.
 *
 * @param {number} operandA - The first integer.
 * @param {number} operandB - The second integer.
 * @returns {number} The least common multiple of the two integers.
 */
function computeLeastCommonMultiple(operandA, operandB) {
    // If either operand is zero, their LCM is defined as zero.
    if (operandA === 0 || operandB === 0) {
        return 0;
    }
    // Calculate the greatest common divisor first.
    const gcdResult = determineCommonDivisor(operandA, operandB);
    // Apply the formula to find LCM, ensuring a positive result.
    return Math.abs(operandA * operandB) / gcdResult;
}

/**
 * This is the primary function that orchestrates the solution logic.
 * It parses the input, performs necessary calculations involving string synchronization,
 * and outputs the result based on specific validation rules.
 *
 * @param {string} rawInputData - The complete input string received from the environment.
 */
function processSolution(rawInputData) {
    // Divide the raw input into an array of lines for structured access.
    const inputLines = rawInputData.split('\n');

    // Basic validation: ensure the first line containing parameters exists.
    if (!inputLines[0]) {
        console.log("-1"); // Indicate an error due to malformed input.
        return;
    }

    // Extract numerical parameters from the first line of input.
    const dimensionParameters = inputLines[0].split(' ');
    const firstSequenceLength = extractNumericValue(dimensionParameters[0]);
    const secondSequenceLength = extractNumericValue(dimensionParameters[1]);

    // Retrieve the actual character sequences from the input.
    // Provide default empty strings if lines are missing to prevent errors.
    const primaryCharacterSequence = inputLines[1] || '';
    const secondaryCharacterSequence = inputLines[2] || '';

    // Determine the common length required for synchronization, which is the LCM.
    // The order of arguments to computeLeastCommonMultiple does not affect the outcome.
    const commonSynchronizedLength = computeLeastCommonMultiple(firstSequenceLength, secondSequenceLength);

    // A boolean flag to track the validity of the synchronized sequence throughout the process.
    let isValidSynchronization = true;

    // Initialize an array to store the merged characters.
    // All positions are initially empty strings.
    const mergedCharacterArray = Array(commonSynchronizedLength).fill('');

    // Place the first character of the primary sequence into the merged array at index 0.
    mergedCharacterArray[0] = primaryCharacterSequence[0];

    // Calculate the 'stride' or step size for populating from the primary sequence.
    // This is equivalent to commonSynchronizedLength / firstSequenceLength.
    const primarySequenceStride = commonSynchronizedLength / firstSequenceLength;
    // Iterate through the primary sequence, starting from the second character (index 1).
    for (let sequenceIndex = 1; sequenceIndex < primaryCharacterSequence.length; sequenceIndex++) {
        // Compute the corresponding position in the merged array.
        const targetPosition = sequenceIndex * primarySequenceStride;
        mergedCharacterArray[targetPosition] = primaryCharacterSequence[sequenceIndex];
    }

    // Begin validation against the secondary character sequence.
    // First, check for an immediate mismatch at the initial position (index 0).
    if (mergedCharacterArray[0] !== secondaryCharacterSequence[0]) {
        console.log('-1'); // Output failure message directly if first characters conflict.
        isValidSynchronization = false; // Mark the overall synchronization as invalid.
    } else {
        // If initial characters match, proceed to validate the rest of the secondary sequence.
        // Calculate the 'stride' or step size for the secondary sequence.
        // This is equivalent to commonSynchronizedLength / secondSequenceLength.
        const secondarySequenceStride = commonSynchronizedLength / secondSequenceLength;
        // Iterate through the secondary sequence, starting from the second character.
        for (let sequenceIndex = 1; sequenceIndex < secondaryCharacterSequence.length; sequenceIndex++) {
            const currentVerificationPosition = sequenceIndex * secondarySequenceStride;

            // Check if the current position in the merged array is already populated
            // AND if its character conflicts with the character from the secondary sequence.
            if (mergedCharacterArray[currentVerificationPosition] !== '' &&
                mergedCharacterArray[currentVerificationPosition] !== secondaryCharacterSequence[sequenceIndex]) {
                console.log('-1'); // Output error for a detected conflict.
                isValidSynchronization = false; // Set the flag to indicate a failed synchronization.
                break; // Terminate further checks as a conflict has been found.
            }
            // An optional step: If the position is empty, populate it with the secondary sequence character.
            // This is not strictly required for the problem's output but makes the merged array more complete.
            // if (mergedCharacterArray[currentVerificationPosition] === '') {
            //     mergedCharacterArray[currentVerificationPosition] = secondaryCharacterSequence[sequenceIndex];
            // }
        }
    }

    // Finally, if no conflicts were found throughout the validation process,
    // output the calculated common synchronized length.
    if (isValidSynchronization) {
        console.log(commonSynchronizedLength);
    }
}

// The following line is essential for the execution environment and should not be altered.
// It reads input from standard input and passes it to the main processing function.
processSolution(require("fs").readFileSync("/dev/stdin", "utf8"));