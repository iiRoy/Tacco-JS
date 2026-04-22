'use strict';

/**
 * Parses a string of space-separated numeric values into an array of numbers.
 * This is a utility function to streamline data extraction from input lines.
 * @param {string} inputLine - The string containing space-separated numbers.
 * @returns {number[]} An array of parsed numbers.
 */
const parseNumericLine = (inputLine) => {
    // Using `Number` as a map callback efficiently converts string parts to numbers.
    return inputLine.split(' ').map(Number);
};

// Define a constant to represent a state where no valid solution has been identified yet.
// Using Infinity is a common pattern for finding minimums, as any real number will be less than it.
const NO_SOLUTION_VALUE_INDICATOR = Infinity;

/**
 * Orchestrates the processing of raw textual input to determine the lowest cost
 * for an item that satisfies a given time constraint.
 * @param {string} fullInputText - The complete raw input string, typically from stdin.
 */
const processSolutionCandidate = (fullInputText) => {
    // --- Input Validation and Pre-processing ---

    // Ensure the input is a valid non-empty string before proceeding.
    if (typeof fullInputText !== 'string' || fullInputText.trim().length === 0) {
        console.error("Error: Received invalid or empty input data.");
        return; // Exit early if input is not usable.
    }

    // Divide the entire input text into individual lines.
    let dataLines = fullInputText.split('\n');

    // Clean up any trailing empty lines that might result from input formatting.
    while (dataLines.length > 0 && dataLines[dataLines.length - 1].trim() === '') {
        dataLines.pop();
    }

    // After cleaning, if no meaningful data remains, report an error.
    if (dataLines.length === 0) {
        console.error("Error: No meaningful data lines found after initial parsing.");
        return;
    }

    // --- Extracting Core Parameters ---

    // The first line contains global parameters: total number of items and the time threshold.
    const [itemCount, timeThreshold] = parseNumericLine(dataLines[0]);

    // Validate the core parameters to ensure they are positive and valid numbers.
    if (isNaN(itemCount) || isNaN(timeThreshold) || itemCount < 0 || timeThreshold < 0) {
        console.error(`Error: Invalid initial parameters. Item Count: ${itemCount}, Time Threshold: ${timeThreshold}`);
        return;
    }

    // --- Main Logic: Iterating and Finding the Best Option ---

    // Initialize the lowest cost found so far to the indicator for no solution.
    let lowestQualifiedCost = NO_SOLUTION_VALUE_INDICATOR;
    // A flag to track if at least one item met the criteria.
    let hasFoundValidCandidate = false;

    // Iterate through the lines representing each item's details.
    // The loop starts from the second line (index 1) and runs for `itemCount` entries.
    for (let currentItemIndex = 0; currentItemIndex < itemCount; currentItemIndex++) {
        const lineIndex = currentItemIndex + 1; // Adjust for 0-based array index.

        // Defensive check: ensure we don't try to access a line that doesn't exist.
        if (lineIndex >= dataLines.length) {
            console.warn(`Warning: Expected ${itemCount} items, but input ended prematurely at item ${currentItemIndex + 1}.`);
            break; // Stop processing if input is shorter than declared.
        }

        const currentItemDataLine = dataLines[lineIndex];
        const [itemCost, itemDuration] = parseNumericLine(currentItemDataLine);

        // Perform validation on the current item's data. Skip if invalid.
        if (isNaN(itemCost) || isNaN(itemDuration) || itemCost < 0 || itemDuration < 0) {
            console.warn(`Skipping invalid item data on line ${lineIndex + 1}: '${currentItemDataLine}'`);
            continue; // Move to the next item if current one is invalid.
        }

        // Check if the current item's duration is strictly less than the allowed threshold.
        if (itemDuration < timeThreshold) {
            // If this item qualifies by time, check if its cost is lower than the best found so far.
            if (itemCost < lowestQualifiedCost) {
                lowestQualifiedCost = itemCost; // Update the best cost.
                hasFoundValidCandidate = true;  // Mark that a valid candidate has been found.
            }
        }
    }

    // --- Final Output Determination ---

    // Based on whether any valid candidate was found, print the result.
    if (hasFoundValidCandidate) {
        console.log(lowestQualifiedCost); // Output the minimum cost.
    } else {
        console.log('TLE'); // Output 'TLE' (Time Limit Exceeded) if no item met the criteria.
    }
};

// --- Execution Entry Point ---

// This block handles reading input from standard input and invoking the main processing function.
try {
    const fileSystem = require('fs'); // Dynamically load the 'fs' module.
    // Read the entire content of standard input synchronously, using UTF-8 encoding.
    const standardInputContent = fileSystem.readFileSync('/dev/stdin', 'utf-8');
    // Pass the acquired input to our solution processor.
    processSolutionCandidate(standardInputContent);
} catch (executionError) {
    // Catch and report any errors that occur during file reading or processing.
    console.error("An unhandled error occurred during execution:", executionError.message);
    // For debugging, the full stack trace can be useful:
    // console.error(executionError.stack);
}