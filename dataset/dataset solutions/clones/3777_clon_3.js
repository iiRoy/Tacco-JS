"use strict";

/**
 * Processes raw string input to calculate a special sum of its digits.
 * This function takes a string, attempts to parse it as an integer,
 * extracts each digit, sums them up, and applies a specific rule
 * before logging the final result.
 *
 * @param {string} rawInputContent - The input string, expected to be a numeric value.
 */
const processNumericString = (rawInputContent) => {
    // --- Input Validation and Pre-processing ---

    // Ensure the input is a non-empty string.
    if (typeof rawInputContent !== 'string' || rawInputContent.trim() === '') {
        console.error("Error: Provided input must be a non-empty string.");
        return; // Terminate execution for invalid input.
    }

    // Convert the raw string data into an integer.
    // This step is critical for subsequent numerical operations.
    let parsedNumericValue = parseInt(rawInputContent, 10);

    // Check if the parsing was successful. NaN indicates a non-numeric string.
    if (isNaN(parsedNumericValue)) {
        console.error("Error: Input could not be parsed as a valid integer.");
        return; // Terminate if parsing fails.
    }

    // For digit extraction, it's generally simpler to work with the absolute value.
    // The original logic implicitly handled positive integers.
    // The number of digits will be based on this absolute representation.
    const positiveNumericRepresentation = Math.abs(parsedNumericValue);

    // Determine the count of digits in the number.
    // This is used to set up the initial place value for extraction.
    const totalDigitCount = String(positiveNumericRepresentation).length;

    // Handle the special case where the input number is 0.
    // If 0, the loop below would still work, extracting 0.
    // The sum would be 0, and the final rule won't apply.
    if (positiveNumericRepresentation === 0) {
        console.log(0); // Sum of digits for 0 is 0.
        return;
    }

    // --- Digit Extraction Process ---

    // Initialize a multiplier to isolate digits from the most significant place.
    // For example, for 123, it starts at 100 (10^(3-1)).
    let currentPlaceValueMultiplier = Math.pow(10, totalDigitCount - 1);

    // A dynamic collection to store each individual digit as it's extracted.
    const individualDigitsArray = [];

    // Iterate through the number, extracting one digit at a time from left to right.
    // The loop runs for as many digits as there are in the number.
    let workingValue = positiveNumericRepresentation; // Use a mutable copy for extraction.
    for (let digitIteration = 0; digitIteration < totalDigitCount; digitIteration++) {
        // Calculate the current most significant digit.
        // Math.floor ensures we get a whole number digit (e.g., 1 from 123 / 100).
        const extractedDigit = Math.floor(workingValue / currentPlaceValueMultiplier);
        individualDigitsArray.push(extractedDigit); // Add the digit to our array.

        // Update the remaining part of the number by taking the modulo.
        // This effectively removes the most significant digit just extracted.
        workingValue %= currentPlaceValueMultiplier;

        // Decrease the place value multiplier by a factor of 10 for the next iteration.
        // This shifts focus to the next less significant digit (e.g., from 100 to 10).
        currentPlaceValueMultiplier /= 10;
    }

    // --- Summation and Final Rule Application ---

    // Calculate the aggregate sum of all extracted digits.
    // Using a traditional loop for variety instead of array.reduce().
    let accumulatedSumOfDigits = 0;
    for (const digitValue of individualDigitsArray) {
        accumulatedSumOfDigits += digitValue;
    }

    // Apply a specific transformation rule: if the sum of digits is 1, it becomes 10.
    // This is a custom business logic or a specific problem requirement.
    const finalResultForDisplay = (accumulatedSumOfDigits === 1) ? 10 : accumulatedSumOfDigits;

    // --- Output ---

    // Display the final computed result to the console.
    console.log(finalResultForDisplay);
};

// --- Execution Entry Point ---

// This block handles reading input from standard input, typical for competitive programming.
try {
    // Read the entire content from /dev/stdin as a UTF-8 string.
    const inputDataFromStream = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Pass the cleaned input (trimmed to remove potential newlines) to the processing function.
    processNumericString(inputDataFromStream.trim());
} catch (ioError) {
    // Catch and report any errors that occur during file reading or processing.
    console.error("An error occurred while reading from /dev/stdin or processing input:", ioError.message);
}