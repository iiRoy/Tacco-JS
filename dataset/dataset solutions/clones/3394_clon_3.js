"use strict";

// Helper utility function to ascertain if a given numeric value represents a power of two.
// This function efficiently checks if a positive integer has only a single bit set in its binary representation.
// The bitwise operation `(n & (n - 1))` yields zero if and only if 'n' is a power of two (and 'n' is positive).
function checkIfPowerOfTwo(numericVal) {
    // Comprehensive type and value validation for robustness.
    if (typeof numericVal !== 'number' || !Number.isFinite(numericVal) || !Number.isInteger(numericVal)) {
        // For non-numeric or non-integer inputs, it cannot be a power of two.
        return false;
    }

    // Powers of two, by definition, must be positive integers.
    // E.g., 2^0 = 1, 2^1 = 2, 2^2 = 4, etc. Zero and negative numbers are not powers of two.
    if (numericVal <= 0) {
        return false;
    }

    // The core bitwise trick: if a number is a power of two, it has only one '1' bit.
    // Subtracting 1 flips all bits from the rightmost '1' onwards, including that '1'.
    // Performing a bitwise AND with the original number will result in zero if there was only one '1' bit.
    return (numericVal & (numericVal - 1)) === 0;
}

// Main operational function to process the input string and determine the result.
function executeSolution(sourceDataString) {
    // Preliminary validation for the input data string.
    if (typeof sourceDataString !== 'string' || sourceDataString.length === 0) {
        console.error("Execution Error: Provided input data string is either empty or not a valid string type.");
        return; // Terminate execution if input is invalid.
    }

    // Process raw input: split into lines, remove leading/trailing whitespace from each line,
    // and then filter out any lines that become empty after trimming.
    const relevantInputLines = sourceDataString
        .split('\n')
        .map(lineContent => lineContent.trim())
        .filter(trimmedLine => trimmedLine.length > 0);

    // Guard clause: ensure sufficient input lines are present for processing.
    // (Assuming first line might be N, second line contains the numbers).
    if (relevantInputLines.length < 2) {
        console.error("Execution Error: Insufficient lines detected in the input data. Expected at least two lines.");
        return;
    }

    // Parse the array of numbers from the second line of the filtered input.
    // Each string segment is converted to an integer using parseInt with an explicit radix of 10.
    const rawNumericValues = relevantInputLines[1].split(' ').map(strVal => parseInt(strVal, 10));

    // Further refinement: filter out any values that are not valid positive integers.
    // This ensures we operate only on appropriate data.
    const validatedNumbersList = rawNumericValues.filter(item => Number.isInteger(item) && item > 0);

    // If no valid numbers remain after filtering, no pairs can be formed.
    if (validatedNumbersList.length === 0) {
        console.log(0);
        return;
    }

    // Sort the list of valid numbers in descending order.
    // This strategy simplifies the pairing logic by always taking the largest available number.
    const numbersSortedDescending = validatedNumbersList.sort((valA, valB) => valB - valA);

    let successfulPairCount = 0; // Initialize a counter for the number of successful pairs found.

    // Main loop: continues as long as there are numbers remaining in our sorted list.
    while (numbersSortedDescending.length > 0) {
        // The largest available number is always at the beginning of the sorted array.
        const currentPrimaryElement = numbersSortedDescending[0];
        let wasPairFoundThisRound = false; // Flag to indicate if a partner was found for currentPrimaryElement.

        // Iterate through the rest of the list (starting from the second element) to find a suitable partner.
        for (let partnerSearchIndex = 1; partnerSearchIndex < numbersSortedDescending.length; partnerSearchIndex++) {
            const potentialPartnerElement = numbersSortedDescending[partnerSearchIndex];
            const combinedSum = currentPrimaryElement + potentialPartnerElement;

            // Minor optimization/guard: The smallest power of two is 1 (2^0) or 2 (2^1).
            // If the sum is less than 2, it cannot be a power of two (given positive integers).
            if (combinedSum < 2) {
                continue; // Skip to the next potential partner.
            }

            // Utilize the helper function to check if the sum is a power of two.
            if (checkIfPowerOfTwo(combinedSum)) {
                // If a valid pair is found:
                // 1. Remove the partner element first to avoid shifting indices of elements to its left.
                numbersSortedDescending.splice(partnerSearchIndex, 1);
                // 2. Remove the primary element (which is always at index 0). `shift()` is clear for this.
                numbersSortedDescending.shift();
                successfulPairCount++; // Increment the counter for found pairs.
                wasPairFoundThisRound = true; // Set the flag indicating a pair was found.
                break; // Exit the inner loop as the primary element has found its partner.
            }
        }

        // If no partner was found for the current primary element in this round,
        // it means it cannot form a power-of-two sum with any other number. Remove it alone.
        if (!wasPairFoundThisRound) {
            numbersSortedDescending.shift(); // Remove the unpaired element from the front.
        }
    }

    // Output the final tally of successful pairs.
    console.log(successfulPairCount);
}

// Script entry point: Read input from standard input and execute the solution.
// A try-catch block is used to gracefully handle potential file system errors.
try {
    const fileInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    executeSolution(fileInputContent);
} catch (executionError) {
    console.error("An error occurred during file reading or solution execution:", executionError.message);
}