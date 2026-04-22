'use strict';

// This module provides a function to calculate the total sum of all possible
// arithmetic expressions formed by inserting addition operators between the
// digits of a given numeric string. For example, for "123", it calculates
// (1+2+3) + (1+23) + (12+3).

/**
 * Orchestrates the processing of a numeric string input to compute
 * the cumulative sum of all valid additive partitions.
 * @param {string} rawInputText The initial string provided as input, expected to contain digits.
 */
const processInputData = (rawInputText) => {
    // Normalize the input by removing leading/trailing whitespace.
    const trimmedInput = rawInputText.trim();

    // Implement robust input validation at the entry point.
    if (!trimmedInput) {
        console.error("Error: Input string cannot be empty. Please provide a sequence of digits.");
        return; // Exit if input is invalid.
    }
    if (!/^\d+$/.test(trimmedInput)) {
        console.error("Error: Input must consist solely of numeric digits (0-9).");
        return; // Exit if input contains non-digit characters.
    }

    // Convert the validated input string into an array of individual character digits.
    // This allows for easier iteration and manipulation of each digit.
    const digitCharacters = Array.from(trimmedInput);

    // Determine the count of potential positions where a '+' operator could be inserted.
    // For an N-digit number, there are N-1 possible gaps for operators.
    const potentialSeparatorCount = digitCharacters.length - 1;

    // Initialize the accumulator for the grand total sum across all expressions.
    let cumulativeSum = 0;

    // Handle edge cases for input length explicitly for clarity and robustness.
    if (potentialSeparatorCount < 0) { // Implies an empty input after trim, though checked above.
        console.log(0); // An empty input string results in a sum of zero.
        return;
    } else if (potentialSeparatorCount === 0) { // Case for a single digit input (e.g., "7").
        cumulativeSum = Number(digitCharacters[0]); // The sum is simply the digit itself.
        console.log(cumulativeSum);
        return;
    }

    // Calculate the total number of unique ways to insert plus signs.
    // This is 2 raised to the power of (number of possible separator positions).
    const totalCombinationCount = Math.pow(2, potentialSeparatorCount);

    // Iterate through each possible combination, represented by a bitmask.
    // Each bit in 'combinationMask' corresponds to a potential separator position.
    for (let combinationMask = 0; combinationMask < totalCombinationCount; ++combinationMask) {
        // This array will store the individual numeric string segments (e.g., "1", "23")
        // that form a single arithmetic expression for the current combination.
        const expressionSegments = [];
        // Initialize the first segment with the very first digit of the input.
        let currentSegmentBuilder = digitCharacters[0];

        // Traverse the remaining digits, starting from the second one.
        // For each digit, decide if it should start a new segment or extend the current one.
        for (let digitIndex = 0; digitIndex < potentialSeparatorCount; ++digitIndex) {
            const nextCharacter = digitCharacters[digitIndex + 1];
            // Compute the bit value for the current potential separator position.
            // (1 << digitIndex) creates a mask with a single bit set at 'digitIndex'.
            const separatorBitFlag = 1 << digitIndex;

            // Check if the corresponding bit in 'combinationMask' is set.
            // If it is, a '+' operator is placed here, meaning a new segment begins.
            if ((combinationMask & separatorBitFlag) !== 0) {
                expressionSegments.push(currentSegmentBuilder); // Finalize and add the current segment.
                currentSegmentBuilder = nextCharacter;         // Start a new segment with the next digit.
            } else {
                // If the bit is not set, no '+' operator is placed; extend the current segment.
                currentSegmentBuilder += nextCharacter;
            }
        }
        // After the loop, the very last segment built by 'currentSegmentBuilder'
        // must be added to the collection of expression parts.
        expressionSegments.push(currentSegmentBuilder);

        // Sum the numeric values of all segments for the current expression.
        let currentExpressionTotal = 0;
        // Using a 'for...of' loop for iterating over the segments.
        for (const segmentStringValue of expressionSegments) {
            // Convert each string segment into its numeric equivalent and add to the total.
            // The unary '+' operator or `Number()` provides a concise way to convert to number.
            currentExpressionTotal += Number(segmentStringValue);
        }

        // Add the sum of the current expression to the overall running total.
        cumulativeSum += currentExpressionTotal;
    }

    // Display the final computed sum to standard output.
    console.log(cumulativeSum);
};

// Self-executing anonymous function to manage the program's lifecycle.
// This structure helps encapsulate the input reading logic and error handling.
(() => {
    try {
        // Read input synchronously from standard input ('/dev/stdin'), common in scripting environments.
        const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
        // Pass the read content to the main processing function.
        processInputData(fileContent);
    } catch (runtimeError) {
        // Log any errors encountered during file reading or processing.
        console.error("An operational error occurred:", runtimeError.message);
        // Terminate the process with a non-zero exit code to indicate failure.
        process.exit(1);
    }
})();