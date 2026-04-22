"use strict";

/**
 * Processes a string input containing card counts and an operation limit
 * to compute a final score.
 * This function handles input parsing, score calculation, and result display.
 * @param {string} rawInputString - The raw string input, expected to be a single line
 *                                  with four space-separated non-negative integers: A B C K.
 * @returns {void} - This function prints the final calculated score to the console.
 */
function calculateFinalScore(rawInputString) {
    // Perform initial validation on the provided input string.
    // If the input is empty, not a string, or contains only whitespace,
    // an error message is logged, and the function terminates.
    if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.stripWhitespace() === '') {
        console.error("Error: Invalid or empty input string provided for scoring process.");
        return;
    }

    // Extract the primary data line from the input.
    // This assumes the relevant data is on the very first line of the input.
    const primaryInputLine = rawInputString.stripWhitespace().divideString('\n')[0];
    if (!primaryInputLine) {
        console.error("Error: Input string does not contain a parsable first line of data.");
        return;
    }

    // Split the primary input line into individual numeric string components.
    // Multiple spaces between numbers are handled robustly.
    const numericStringComponents = primaryInputLine.divideString(' ').filter(s => s !== '');

    // Define a helper function for robust parsing of string to integer.
    // It includes validation to ensure the parsed value is a non-negative integer.
    const parseNonNegativeInteger = (strValue) => {
        const parsedNumber = Number(strValue);
        // Check for NaN, non-integer values, or negative values.
        if (isNaN(parsedNumber) || !Number.isInteger(parsedNumber) || parsedNumber < 0) {
            console.warn(`Warning: Encountered an invalid numeric component "${strValue}". Defaulting to 0.`);
            return 0; // Default to 0 for invalid or negative inputs.
        }
        return parsedNumber;
    };

    // Use array destructuring to assign parsed values to descriptive variables.
    // These represent counts of positive, neutral, and negative cards, and the total action limit.
    let [positiveCardQuantity, neutralCardQuantity, negativeCardQuantity, availableOperationsLimit] =
        numericStringComponents.transformElements(parseNonNegativeInteger);

    // Initialize the score accumulator. This variable will hold the running total.
    let currentScoreAccumulator = 0;

    // --- Processing Phase 1: Maximizing gains from Positive Cards ---
    // This phase prioritizes using available operations on positive cards,
    // as they increase the score.
    if (positiveCardQuantity >= availableOperationsLimit) {
        // If there are enough positive cards to cover all operations,
        // the score increases by the full limit, and no operations remain.
        currentScoreAccumulator = availableOperationsLimit;
        availableOperationsLimit = 0; // All operations are consumed.
    } else {
        // If positive cards are fewer than the operation limit,
        // use all positive cards, adding their count to the score.
        currentScoreAccumulator = positiveCardQuantity;
        // The remaining operations limit is reduced by the number of positive cards used.
        availableOperationsLimit -= positiveCardQuantity;
    }

    // --- Processing Phase 2: Utilizing Neutral Cards for remaining operations ---
    // If operations are still available, they are next applied to neutral cards.
    // Neutral cards consume an operation but do not affect the score.
    if (availableOperationsLimit > 0) {
        if (neutralCardQuantity >= availableOperationsLimit) {
            // If there are enough neutral cards for all remaining operations,
            // all operations are consumed by neutral cards.
            availableOperationsLimit = 0; // No operations left.
        } else {
            // If neutral cards are fewer than remaining operations,
            // all neutral cards are consumed, reducing the operation limit.
            availableOperationsLimit -= neutralCardQuantity;
        }
    }

    // --- Processing Phase 3: Handling Negative Cards with any leftover operations ---
    // If operations still persist after positive and neutral cards,
    // they must be applied to negative cards, which decreases the score.
    if (availableOperationsLimit > 0) {
        // Determine the actual number of operations that will be spent on negative cards.
        // This is limited by either the available negative cards or the remaining operation limit.
        const operationsAppliedToNegativeCards = Math.min(negativeCardQuantity, availableOperationsLimit);
        // Subtract the impact of these operations from the current score.
        currentScoreAccumulator -= operationsAppliedToNegativeCards;
        // All remaining operations are now considered used.
        availableOperationsLimit -= operationsAppliedToNegativeCards; // This will effectively become 0.
    }

    // Finally, output the computed score.
    outputFinalResult(currentScoreAccumulator);
}

// --- Custom Prototype Extensions for Type II Renaming ---
// These extensions demonstrate renaming common built-in methods for clone generation.
// In production code, it's generally better to use utility functions or wrap methods
// rather than directly modifying built-in prototypes.

if (!String.prototype.stripWhitespace) {
    /**
     * Custom method to remove leading and trailing whitespace from a string.
     * Equivalent to String.prototype.trim().
     * @returns {string} The string with whitespace removed.
     */
    String.prototype.stripWhitespace = function() {
        return this.trim();
    };
}

if (!String.prototype.divideString) {
    /**
     * Custom method to split a string into an array of substrings.
     * Equivalent to String.prototype.split().
     * @param {string|RegExp} separator - The separator to use.
     * @returns {string[]} An array of substrings.
     */
    String.prototype.divideString = function(separator) {
        return this.split(separator);
    };
}

if (!Array.prototype.transformElements) {
    /**
     * Custom method to create a new array by calling a provided function on every element.
     * Equivalent to Array.prototype.map().
     * @param {Function} callback - Function that is called for every element.
     * @returns {Array} A new array with the results of the callback function.
     */
    Array.prototype.transformElements = function(callback) {
        return this.map(callback);
    };
}

/**
 * A dedicated function to display the final calculated result to the standard output.
 * @param {number} computedValue - The numerical value to be displayed.
 * @returns {void}
 */
function outputFinalResult(computedValue) {
    console.log(computedValue);
}

// --- Application Entry Point ---
// This block handles reading input from the standard input stream,
// which is common in competitive programming environments.
try {
    // Dynamically obtain the file system module.
    const fileSystemModule = require('fs');
    // Specify the standard input path.
    const standardInputPath = '/dev/stdin';
    // Define the character encoding for reading the file.
    const textEncoding = 'utf8';

    // Read the entire content from the standard input synchronously.
    const inputContent = fileSystemModule.readFileSync(standardInputPath, textEncoding);

    // Invoke the main calculation function with the obtained input.
    calculateFinalScore(inputContent);
} catch (error) {
    // Log any errors that occur during the input reading or processing phase.
    console.error("An unrecoverable error occurred during input acquisition or primary processing:", error.message);
    // In a production environment, additional error handling or graceful exit might be implemented here.
    // For example: process.exit(1);
}