// This module provides a primary function to process a numerical input.
// It iteratively calculates the sum of trailing zeros for a sequence of numbers,
// starting from the input value and decrementing by two in each step until zero.

/**
 * Orchestrates the calculation of the total count of trailing zeros.
 * It takes an initial numeric input, decrements it by two in a loop,
 * and sums the trailing zero counts of each number encountered.
 *
 * @param {string} inputStringRepresentation The initial numeric value as a string.
 */
function computeSumOfTrailingZeros(inputStringRepresentation) {
    // Attempt to convert the string input into a numerical value.
    // Using Number() for conversion, which is generally more robust than parseInt
    // for recognizing various numeric string formats.
    let initialNumericValue = Number(inputStringRepresentation);

    // --- Type III Addition: Robust Input Validation (Guard Clause) ---
    // Validate that the converted value is a non-negative integer.
    // If not, log an error and exit to prevent further incorrect processing.
    if (isNaN(initialNumericValue) || initialNumericValue < 0 || !Number.isInteger(initialNumericValue)) {
        console.error("Error: Invalid or non-integer negative input provided. Please supply a valid non-negative integer string.");
        return; // Terminate execution gracefully for invalid input.
    }

    // Initialize a variable to accumulate the total count of trailing zeros.
    let cumulativeZeroTally = 0;

    // --- Type III Addition: Introduce a Helper Constant for Loop Step ---
    // Define the fixed decrement step for the iteration loop.
    const iterationStep = 2;

    // The main processing loop: continues as long as the current value is positive.
    // This ensures that only positive numbers are considered for trailing zero calculation.
    while (initialNumericValue > 0) {
        // --- Type III Addition: Use an Intermediate Variable for Function Result ---
        // Call the helper function to determine the number of trailing zeros
        // for the current numeric value in the sequence.
        const currentNumberZeroCount = retrieveSuffixZeroCount(initialNumericValue);

        // Add the count of zeros from the current number to the running total.
        cumulativeZeroTally += currentNumberZeroCount;

        // --- Type III Update: Utilize the Helper Constant for Decrement ---
        // Decrement the current numeric value by the predefined step.
        initialNumericValue -= iterationStep;
    }

    // After the loop completes, output the final accumulated sum of trailing zeros.
    console.log(cumulativeZeroTally);
}

/**
 * Counts the number of consecutive '0' characters at the end of a number's
 * string representation. For example, 120 returns 1, 100 returns 2, 123 returns 0.
 *
 * @param {number} valueToExamine The numeric value to analyze for trailing zeros.
 * @returns {number} The count of trailing zeros. Returns 0 for non-numeric or negative inputs.
 */
function retrieveSuffixZeroCount(valueToExamine) {
    // --- Type III Addition: Input Type and Value Validation ---
    // Ensure the input is indeed a non-negative number before processing.
    // Trailing zeros are typically a concept applied to non-negative integers.
    if (typeof valueToExamine !== 'number' || valueToExamine < 0) {
        // Return 0 if the input is not a valid non-negative number.
        return 0;
    }

    // --- Type III Update: Convert to string once and store for efficiency ---
    // Convert the numeric value to its string representation.
    // This allows character-by-character inspection from the end.
    const stringifiedRepresentation = String(valueToExamine);

    let zeroCounter = 0; // Initialize a counter for the trailing zeros found.

    // --- Type II Change: Renamed 'index' to 'currentCharacterPosition' for clarity ---
    // Start checking from the last character of the string.
    let currentCharacterPosition = stringifiedRepresentation.length - 1;

    // --- Type III Update: Simplified and Direct Loop Condition ---
    // Iterate backwards through the string. The loop continues as long as:
    // 1. We haven't gone past the beginning of the string (index >= 0).
    // 2. The character at the current position is a '0'.
    while (currentCharacterPosition >= 0 && stringifiedRepresentation[currentCharacterPosition] === '0') {
        zeroCounter++; // Increment the counter for each trailing '0'.
        currentCharacterPosition--; // Move to the previous character to continue checking.
    }

    // Return the final accumulated count of trailing zeros.
    return zeroCounter;
}

// --- Type II Change: Updated function call to the new name ---
// This is the entry point for the program when executed.
// It reads input from standard input, decodes it as UTF-8,
// and then passes it to our main processing function.
computeSumOfTrailingZeros(require("fs").readFileSync("/dev/stdin", "utf8"));