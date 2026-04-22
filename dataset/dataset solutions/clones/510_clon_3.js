const fileSystemModule = require('node:fs');

// Helper function to robustly extract and clean input lines from a raw string.
// This function handles different line ending types and ensures no leading/trailing whitespace
// for the entire input block before splitting.
const extractAndCleanLines = (dataString) => {
    return dataString.trim().split(/\r?\n/);
};

// Helper function to safely parse an integer from a string, including basic validation.
const parseInteger = (inputString) => {
    const numericalValue = parseInt(inputString, 10);
    // If parsing fails, return 0 as a default, or an error could be thrown.
    // For this problem, 0 is often a termination signal, so it's a safe default.
    if (isNaN(numericalValue)) {
        return 0;
    }
    return numericalValue;
};

// Reads the entire raw input data from standard input.
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Processes the raw input into an array of cleaned lines.
let processedInputLines = extractAndCleanLines(rawInputData);

// A pointer to keep track of the current line being processed in the input array,
// providing an alternative to using Array.prototype.shift() repeatedly.
let currentLineIndex = 0;

/**
 * Determines if a given numeric sequence constitutes an arithmetic progression.
 * An arithmetic progression is a sequence of numbers such that the difference
 * between consecutive terms is constant.
 * @param {number[]} sequenceToCheck - The array of numbers to evaluate.
 * @param {number} expectedLength - The anticipated length of the AP (useful for validation).
 * @returns {boolean} True if the sequence is an arithmetic progression, false otherwise.
 */
const isArithmeticProgression = (sequenceToCheck, expectedLength) => {
    // Type III: Explicitly handle edge cases for sequences with fewer than two elements.
    // A sequence of 0 or 1 element is always considered an arithmetic progression.
    if (sequenceToCheck.length < 2) {
        return true;
    }

    // Type III: Add an additional validation for the sequence length.
    if (sequenceToCheck.length !== expectedLength) {
        return false; // Mismatch in expected vs actual length.
    }

    // Calculate the common difference from the first two elements.
    const initialCommonDifference = sequenceToCheck[1] - sequenceToCheck[0];

    // Type III: Utilize a standard for loop starting from the third element
    // to verify the common difference across the rest of the sequence.
    for (let currentPosition = 2; currentPosition < sequenceToCheck.length; currentPosition++) {
        const observedDifference = sequenceToCheck[currentPosition] - sequenceToCheck[currentPosition - 1];
        if (observedDifference !== initialCommonDifference) {
            return false; // Found a discrepancy in the common difference.
        }
    }
    return true; // All elements conform to the same common difference.
};


// Main loop to process each test case from the input.
while (true) {
    // Type III: Guard clause for ensuring there are more lines to read.
    if (currentLineIndex >= processedInputLines.length) {
        break; // No more input available, terminate processing.
    }

    // Read the line indicating the desired length of the arithmetic progression.
    const desiredAPLengthString = processedInputLines[currentLineIndex];
    currentLineIndex++; // Advance the pointer to the next line.

    // Parse the desired length. A value of 0 signals the end of test cases.
    const desiredAPLength = parseInteger(desiredAPLengthString);

    if (desiredAPLength === 0) {
        break; // Termination condition met.
    }

    // Type III: Guard clause for ensuring the sequence line exists.
    if (currentLineIndex >= processedInputLines.length) {
        // Log a warning or handle as an error for incomplete input.
        process.stderr.write("Warning: Expected a sequence of numbers, but input ended unexpectedly.\n");
        break; // Exit due to malformed input.
    }

    // Read the line containing the sequence of numbers for the current test case.
    const sequenceOfNumbersLine = processedInputLines[currentLineIndex];
    currentLineIndex++; // Advance the pointer.

    // Parse the sequence string into an array of integers.
    const initialNumericSequence = sequenceOfNumbersLine.split(" ").map(val => parseInteger(val));

    // Type III: Add validation for the number of elements in the initial sequence.
    // The problem implies there should be one more element than the desired AP length.
    if (initialNumericSequence.length !== (desiredAPLength + 1)) {
        process.stderr.write(`Warning: Case expects ${desiredAPLength + 1} numbers, but found ${initialNumericSequence.length}. Skipping.\n`);
        continue; // Skip this malformed test case and proceed to the next.
    }

    // Variable to store the index of the element that, when removed, forms an AP.
    let indexFoundForRemoval = -1;

    // Type III: Iterate through each element of the initial sequence,
    // hypothetically removing one at a time to check for an AP.
    for (let removalCandidateIndex = 0; removalCandidateIndex <= desiredAPLength; removalCandidateIndex++) {
        // Type III: Create a temporary sequence by excluding the element at removalCandidateIndex.
        // This is an alternative to Array.prototype.filter().
        const temporarySequenceWithoutCandidate = initialNumericSequence.slice(0, removalCandidateIndex)
                                                  .concat(initialNumericSequence.slice(removalCandidateIndex + 1));

        // Type III: Delegate the arithmetic progression check to the dedicated helper function.
        if (isArithmeticProgression(temporarySequenceWithoutCandidate, desiredAPLength)) {
            indexFoundForRemoval = removalCandidateIndex;
            break; // An AP was successfully formed; no need to check further.
        }
    }

    // Type III: Output the result. Use process.stdout.write for a different I/O flavor.
    if (indexFoundForRemoval !== -1) {
        const valueToBeRemoved = initialNumericSequence[indexFoundForRemoval];
        process.stdout.write(valueToBeRemoved + '\n');
    } else {
        // This branch should ideally not be reached if the problem guarantees a solution.
        // However, for robustness, we can output a sentinel value or an error message.
        process.stderr.write("Error: No suitable element found for removal to form an AP.\n");
        process.stdout.write("-1\n"); // Output a placeholder for "not found"
    }
}