"use strict";

// This module processes a numerical sequence to determine specific digit-pair relationships.
// It reads an upper bound 'N' from input, then counts how many numbers from 1 to N
// start with a specific digit 'X' and end with a specific digit 'Y'.
// Finally, it calculates a cumulative sum based on these frequencies.
const processNumericalSequence = (rawData) => {
    // --- Input Validation and Parsing ---

    // Ensure the input is a string, preventing unexpected runtime errors.
    if (typeof rawData !== 'string') {
        console.error("InputError: The provided data is not a string.");
        // In a real-world scenario, one might throw an exception or return a specific error code.
        return;
    }

    const trimmedInput = rawData.trim(); // Remove leading/trailing whitespace.

    // Check if the input string is empty after trimming.
    if (trimmedInput.length === 0) {
        console.error("InputError: The input string is empty or contains only whitespace.");
        return;
    }

    // Split the input into lines. We are primarily interested in the first line.
    const inputLines = trimmedInput.split("\n");

    // Attempt to parse the first line as the upper limit for our sequence.
    const sequenceLimitString = inputLines[0];
    const sequenceLimit = Number(sequenceLimitString); // Using Number() for conversion.

    // Validate the parsed numerical limit. It must be a positive integer.
    if (isNaN(sequenceLimit) || !Number.isInteger(sequenceLimit) || sequenceLimit < 1) {
        console.error(`InputError: Invalid or non-positive integer for sequence limit: '${sequenceLimitString}'.`);
        return;
    }

    // --- Frequency Matrix Initialization ---

    // Define the range for digits (0-9).
    const maxDigitValue = 10;

    // Create a 2D array (matrix) to store the counts.
    // `digitPairFrequencies[leadingDigit][trailingDigit]` will hold the count of numbers
    // that start with `leadingDigit` and end with `trailingDigit`.
    // Initialize all counts to zero.
    const digitPairFrequencies = Array.from({ length: maxDigitValue }, () =>
        new Array(maxDigitValue).fill(0)
    );

    // --- Populating the Frequency Matrix ---

    // Iterate through each number from 1 up to the defined sequence limit.
    for (let currentNumber = 1; currentNumber <= sequenceLimit; ++currentNumber) {
        // Convert the current number to its string representation to easily extract digits.
        const numberString = currentNumber.toString();
        const stringLength = numberString.length;

        // Extract the very first digit (character) and the very last digit (character).
        const firstDigitChar = numberString.charAt(0);
        const lastDigitChar = numberString.charAt(stringLength - 1);

        // Convert the character digits back to numerical values.
        const initialDigit = Number(firstDigitChar);
        const finalDigit = Number(lastDigitChar);

        // Increment the counter in our frequency matrix for this specific (initial, final) digit pair.
        // No need for bounds checking here as charAt() for digits 0-9 will always yield valid indices.
        digitPairFrequencies[initialDigit][finalDigit]++;
    }

    // --- Final Calculation ---

    // The objective is to calculate the sum of (count[X][Y] * count[Y][X]) for all X, Y pairs.
    // This effectively finds pairs of numbers (A, B) such that A starts with X and ends with Y,
    // and B starts with Y and ends with X.
    let cumulativeProductSum = 0; // Accumulator for the final result.

    // Iterate through all possible starting digits (X).
    for (let startDigit = 0; startDigit < maxDigitValue; ++startDigit) {
        // Iterate through all possible ending digits (Y).
        for (let endDigit = 0; endDigit < maxDigitValue; ++endDigit) {
            // Get the frequency of numbers starting with 'startDigit' and ending with 'endDigit'.
            const countStartEnd = digitPairFrequencies[startDigit][endDigit];

            // Get the frequency of numbers starting with 'endDigit' and ending with 'startDigit'.
            const countEndStart = digitPairFrequencies[endDigit][startDigit];

            // Multiply these two frequencies and add to the running total.
            cumulativeProductSum += countStartEnd * countEndStart;
        }
    }

    // Output the computed final result to the console.
    console.log(cumulativeProductSum);
};

// Execute the main processing function with data read from standard input.
// This assumes the environment provides 'fs' module and '/dev/stdin' for input.
processNumericalSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));