"use strict";

/**
 * Processes a raw input string, extracts numerical parameters,
 * generates a sequence of numbers, and outputs specific parts of it.
 * This function serves as the main entry point for the application logic.
 *
 * @param {string} rawDataString - The input string containing space-separated numbers.
 */
const processInputData = (rawDataString) => {

    /**
     * Internal helper function to safely convert a string token to a number.
     * Includes basic validation to ensure the conversion is successful.
     * @param {string} tokenString - The string to convert.
     * @returns {number} The converted number, or 0 if conversion fails.
     */
    const parseNumericToken = (tokenString) => {
        const numericValue = Number(tokenString); // Explicitly convert to number
        if (isNaN(numericValue)) {
            // Log an error for invalid input, but continue processing with a default value
            console.error("Warning: Non-numeric input encountered, defaulting to 0:", tokenString);
            return 0;
        }
        return numericValue;
    };

    // Split the input string by spaces and convert each part to a number.
    // The input is expected to contain three numbers: start, end, and count limit.
    const numericParameters = rawDataString.split(" ").map(parseNumericToken);

    // Destructure the parameters for better readability and explicit naming.
    // startValue: The beginning of the number range (inclusive).
    // endValue: The end of the number range (inclusive).
    // countToPrint: The quantity of elements to print from both the start and end.
    const [startValue, endValue, countToPrint] = numericParameters;

    // --- Input Validation and Guard Clauses ---
    // If the start value is greater than the end value, the sequence would be empty.
    // In this case, we can exit early as there's nothing to generate or print.
    if (startValue > endValue) {
        // console.log("Start value is greater than end value. No sequence generated.");
        return;
    }

    // If the count to print is non-positive, no elements will be printed.
    // The loops below will handle this gracefully (zero iterations), but an early exit is possible.
    if (countToPrint <= 0) {
        // console.log("Print quantity is zero or negative. No elements printed.");
        return;
    }

    // Array to hold the complete sequence of numbers.
    const generatedSequence = [];
    let currentIterationValue = startValue;

    // Populate the sequence array using a while loop.
    // This generates all numbers from 'startValue' up to 'endValue', inclusive.
    while (currentIterationValue <= endValue) {
        generatedSequence.push(currentIterationValue);
        currentIterationValue++;
    }

    // If the generated sequence is empty after population, there's nothing to do.
    if (generatedSequence.length === 0) {
        return;
    }

    // Determine the total number of elements successfully generated.
    const totalSequenceLength = generatedSequence.length;

    /**
     * Helper function to output a single element to the console.
     * Can be extended for more complex logging if needed.
     * @param {number} element - The number to be logged.
     */
    const displayElement = (element) => {
        console.log(element);
    };

    // --- Printing the first 'countToPrint' elements ---
    // Calculate the actual number of elements to print from the beginning.
    // This ensures we don't try to print more elements than are available in the sequence.
    const actualFirstBlockSize = Math.min(countToPrint, totalSequenceLength);

    // Loop through and print the elements from the start of the sequence.
    for (let currentElementIndex = 0; currentElementIndex < actualFirstBlockSize; currentElementIndex++) {
        displayElement(generatedSequence[currentElementIndex]);
    }

    // --- Printing the last 'countToPrint' elements ---
    // Calculate the starting index for the last block of elements.
    // We use Math.max(0, ...) to ensure the index does not go below zero,
    // which would happen if 'countToPrint' is larger than 'totalSequenceLength'.
    const startingIndexForLastBlock = Math.max(0, totalSequenceLength - countToPrint);

    // Loop through and print the elements from the end of the sequence.
    // Note: If 'countToPrint' is large enough, this block might overlap with the first block,
    // resulting in some elements being printed twice, consistent with the original logic.
    for (let currentElementIndex = startingIndexForLastBlock; currentElementIndex < totalSequenceLength; currentElementIndex++) {
        displayElement(generatedSequence[currentElementIndex]);
    }
};

// --- Application Entry Point ---
// This block reads input from standard input and initiates the processing.
// It uses Node.js's 'fs' module to read the file content asynchronously.
try {
    const fileSystemModule = require('fs');
    const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    processInputData(standardInputContent);
} catch (error) {
    console.error("An error occurred during input processing:", error.message);
    // Optionally, handle different error types or provide user feedback
}