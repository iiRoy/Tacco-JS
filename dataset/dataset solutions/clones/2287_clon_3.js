"use strict";

/**
 * Parses a string of space-separated numbers into an array of numbers.
 * Handles empty or invalid string inputs gracefully.
 * @param {string} lineContent - The string containing numbers.
 * @returns {number[]} An array of parsed numbers.
 */
const extractNumericSequence = (lineContent) => {
    if (typeof lineContent !== 'string' || lineContent.trim() === '') {
        // Return an empty array for any non-string or empty input,
        // preventing errors in subsequent operations.
        return [];
    }
    // Split the string by spaces and convert each part to a number.
    return lineContent.split(" ").map(Number);
};

/**
 * Processes an array of numbers to return only unique elements,
 * sorted in descending order. This also handles potential duplicates efficiently.
 * @param {number[]} rawNumbers - The array of numbers to process.
 * @returns {number[]} An array of unique numbers, sorted descending.
 */
const deduplicateAndSortDescending = (rawNumbers) => {
    // Using a Set to quickly get unique values, then converting back to an array.
    const uniqueNumbers = Array.from(new Set(rawNumbers));
    // Sort the unique numbers in descending order.
    return uniqueNumbers.sort((valueA, valueB) => valueB - valueA);
};

/**
 * The primary function to calculate a special count based on input parameters.
 * It simulates a specific mathematical condition check.
 * @param {string} rawInputText - The entire input as a single string.
 */
function computeSpecialConditionCount(rawInputText) {
    // Define a constant for the fractional component used in calculations.
    const FRACTIONAL_INCREMENT = 0.5;

    // Split the raw input into an array of lines, trimming overall whitespace.
    const inputSegments = rawInputText.trim().split("\n");

    // --- Input Validation and Parsing ---
    // Ensure that enough input lines are provided for processing.
    if (inputSegments.length < 2) {
        console.error("Input data error: Expected at least two lines of input, but received fewer.");
        return; // Terminate execution if input is insufficient.
    }

    // Parse the first line to extract the upper bound 'M'.
    const firstLineValues = extractNumericSequence(inputSegments[0]);
    if (firstLineValues.length < 2) {
        console.error("Input data error: The first line must contain at least two numeric values.");
        return;
    }
    const ceilingValueM = firstLineValues[1]; // The second value is our 'M'.

    // Parse the second line to get the initial array of numbers.
    const secondLineRawNumbers = extractNumericSequence(inputSegments[1]);
    // Process these numbers: remove duplicates and sort them in descending order.
    const processedElements = deduplicateAndSortDescending(secondLineRawNumbers);

    // If no unique elements remain after processing, the count is zero.
    if (processedElements.length === 0) {
        console.log(0);
        return;
    }

    // Extract the 'base' value, which is the largest unique element.
    // This operation modifies 'processedElements' by removing the first item.
    const referenceBaseValue = processedElements.shift();

    let successfulIterationCount = 0; // Initialize a counter for valid cases.

    // --- Main Calculation Loop ---
    // Iterate through potential multiplier factors, starting from 1.
    // The loop continues indefinitely until an explicit 'break' condition is met.
    for (let currentMultiplier = 1; ; currentMultiplier++) {
        // Calculate the current candidate product using the base value and multiplier.
        // Formula: x = base * (p + 0.5)
        const candidateProduct = referenceBaseValue * (currentMultiplier + FRACTIONAL_INCREMENT);

        // If the candidate product exceeds the defined ceiling 'M', stop the loop.
        if (candidateProduct > ceilingValueM) {
            break;
        }

        let conditionFailed = false; // Flag to indicate if any element breaks the rule.

        // Iterate through the remaining processed elements.
        for (let idx = 0; idx < processedElements.length; idx++) {
            const currentElement = processedElements[idx];

            // Guard against division by zero, which would result in Infinity or NaN.
            if (currentElement === 0) {
                conditionFailed = true; // A zero element means this candidateProduct is invalid.
                break; // No need to check further elements for this candidateProduct.
            }

            // Calculate the potential factor for the current element.
            // Formula: _p = x / a[i] - 0.5
            const derivedFactor = (candidateProduct / currentElement) - FRACTIONAL_INCREMENT;

            // Check if the derived factor is an integer.
            // If it's not an integer, the condition for this element fails.
            if (!Number.isInteger(derivedFactor)) {
                conditionFailed = true; // Condition violated.
                break; // No need to check further elements for this candidateProduct.
            }
        }

        // If after checking all elements, no condition failed, then this is a successful iteration.
        if (!conditionFailed) {
            successfulIterationCount++;
        }
    }

    // Output the final count of successful iterations.
    console.log(successfulIterationCount);
}

// --- Entry Point ---
// Read the entire standard input synchronously as a UTF-8 string.
const systemInput = require('fs').readFileSync('/dev/stdin', 'utf8');
// Call the main processing function with the obtained input.
computeSpecialConditionCount(systemInput);