let shortestOverallLength = Number.POSITIVE_INFINITY; // Global variable to store the minimum length found across all reduction attempts.

/**
 * Iteratively reduces a given string of digits by removing sequences of four or more identical, consecutive digits.
 * For example, "1111" or "22222" would be removed. This process repeats until no further reductions are possible.
 * The function updates the global 'shortestOverallLength' if the resulting sequence is shorter than any previously found.
 *
 * @param {string} currentDigitSequence - The input string representing a sequence of digits (e.g., "12311112").
 */
function reduceSequence(currentDigitSequence) {
    // Basic input validation: ensure the input is a string.
    if (typeof currentDigitSequence !== 'string') {
        console.error("Error: Input for reduction must be a string.");
        return; // Exit if input is invalid.
    }

    let previousSequenceLength; // Holds the sequence length from the previous iteration.
    // Regular expression to find groups of 4 or more identical digits (1s, 2s, or 3s).
    // The 'g' flag ensures all occurrences are replaced.
    const bombPattern = /(1{4,}|2{4,}|3{4,})/g;

    // Continue looping as long as the sequence length changes, indicating a reduction occurred.
    do {
        previousSequenceLength = currentDigitSequence.length; // Store current length.
        // Replace all matching patterns with an empty string.
        currentDigitSequence = currentDigitSequence.replace(bombPattern, "");
    } while (currentDigitSequence.length !== previousSequenceLength); // Check if length changed from previous iteration.

    // After all possible reductions, compare the final length with the global minimum.
    if (currentDigitSequence.length < shortestOverallLength) {
        shortestOverallLength = currentDigitSequence.length; // Update if a new minimum is found.
    }
}

// --- Main Program Execution Flow ---

// Read the entire standard input synchronously. This is common in competitive programming.
// '/dev/stdin' is a standard path for input in Unix-like systems (including common online judges).
// 'utf8' specifies the encoding.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Prepare the input data:
// 1. Trim any leading/trailing whitespace from the entire content.
// 2. Split the content into an array of strings, where each string is a line from the input.
const inputLinesArray = rawInputContent.trim().split('\n');

// Process test cases one by one. The loop continues until a specific termination condition is met.
while (true) {
    // Extract the number of elements for the current test case.
    // `shift()` removes and returns the first element (line) from `inputLinesArray`.
    // `parseInt()` converts the string to an integer, with base 10 specified for safety.
    const currentCaseElementCount = parseInt(inputLinesArray.shift(), 10);

    // Termination condition: If the count of elements is 0, break out of the loop.
    if (currentCaseElementCount === 0) {
        break;
    }

    // Initialize an array to store the individual digit values for the current test case.
    const digitValueList = [];
    // Populate the `digitValueList` by reading the next `currentCaseElementCount` lines.
    for (let elementIndex = 0; elementIndex < currentCaseElementCount; elementIndex++) {
        const singleDigit = parseInt(inputLinesArray.shift(), 10); // Parse each digit.
        digitValueList.push(singleDigit); // Add to our list.
    }

    // Reset the global minimum length for the current test case.
    // Each test case's result should start fresh from infinity.
    shortestOverallLength = Number.POSITIVE_INFINITY;

    // Convert the array of digits into a single concatenated string.
    const initialCombinedDigits = digitValueList.join('');
    // Store the length of this initial string for potential optimization or clarity.
    const baseStringLength = initialCombinedDigits.length;

    // Iterate through each position in the initial digit sequence.
    // For each position, we explore two specific transformations of the sequence.
    for (let currentPosition = 0; currentPosition < currentCaseElementCount; currentPosition++) {
        let transformedSequence = ''; // Variable to hold the sequence after a transformation.

        // Transformation 1: Simulate replacing the digit at `currentPosition` with the digit at `currentPosition + 1`.
        // This operation is only valid if `currentPosition + 1` is within the bounds of the array.
        if (currentPosition + 1 < currentCaseElementCount) {
            // Construct the new sequence:
            // 1. Substring from the beginning up to `currentPosition`.
            // 2. The digit value located at `currentPosition + 1`.
            // 3. Substring from `currentPosition + 1` to the end of the original string.
            transformedSequence = initialCombinedDigits.substring(0, currentPosition) +
                                  digitValueList[currentPosition + 1] +
                                  initialCombinedDigits.substring(currentPosition + 1);
            // Apply the reduction logic to this newly formed sequence.
            reduceSequence(transformedSequence);
        }

        // Transformation 2: Simulate replacing the digit at `currentPosition` with the digit at `currentPosition - 1`.
        // This operation is only valid if `currentPosition - 1` is a non-negative index.
        if (currentPosition > 0) {
            // Construct the new sequence following a similar pattern:
            // 1. Substring from the beginning up to `currentPosition`.
            // 2. The digit value located at `currentPosition - 1`.
            // 3. Substring from `currentPosition + 1` to the end of the original string.
            //    (Note: `substring(currentPosition + 1)` effectively skips the original digit at `currentPosition`).
            transformedSequence = initialCombinedDigits.substring(0, currentPosition) +
                                  digitValueList[currentPosition - 1] +
                                  initialCombinedDigits.substring(currentPosition + 1);
            // Apply the reduction logic to this second transformed sequence.
            reduceSequence(transformedSequence);
        }
    }

    // After processing all possible transformations for the current test case,
    // print the overall shortest length found for this specific case.
    console.log(shortestOverallLength);
}