'use strict'; // Enforce strict mode for cleaner code practices

/**
 * Determines whether two given month numbers correspond to the same
 * length-of-month category (e.g., both 31-day months, both 30-day months, or both February).
 * This function handles input parsing, validation, and the core comparison logic.
 *
 * @param {string} rawInputText - The complete string content read from the input source.
 *                                It is expected to contain two space-separated integers
 *                                representing month numbers on its first line.
 */
function determineMonthDayGroupEquivalence(rawInputText) {
    // Initialize data structures to categorize months by their typical number of days.
    // Using Sets provides efficient O(1) average time complexity for membership checks.
    const monthsWithThirtyOneDays = new Set([1, 3, 5, 7, 8, 10, 12]); // January, March, etc.
    const monthsWithThirtyDays = new Set([4, 6, 9, 11]);             // April, June, etc.
    const februaryIdentifier = 2;                                   // February is a unique case

    // --- Input Processing and Robust Validation ---

    // Trim whitespace from the raw input and split into lines.
    const allInputLines = rawInputText.trim().split('\n');

    // Check if any significant input was provided.
    if (allInputLines.length === 0 || allInputLines[0].trim() === '') {
        console.error("Input Error: No data found in the provided raw input string.");
        return; // Terminate execution if input is empty.
    }

    // Extract and process the first line which should contain the month numbers.
    const primaryLineTokens = allInputLines[0].trim().split(' ');

    // Validate that exactly two numerical tokens were provided.
    if (primaryLineTokens.length !== 2) {
        console.error(`Input Error: Expected two month numbers, but found ${primaryLineTokens.length}.`);
        return;
    }

    // Parse the string tokens into integer values.
    const firstMonthAsString = primaryLineTokens[0];
    const secondMonthAsString = primaryLineTokens[1];

    const firstMonthNumeric = parseInt(firstMonthAsString, 10);
    const secondMonthNumeric = parseInt(secondMonthAsString, 10);

    // Check if parsing resulted in valid numbers.
    if (isNaN(firstMonthNumeric) || isNaN(secondMonthNumeric)) {
        console.error("Input Error: One or both provided month values are not valid numbers.");
        return;
    }

    // Check if the month numbers are within the valid range (1 to 12).
    const isFirstMonthWithinRange = firstMonthNumeric >= 1 && firstMonthNumeric <= 12;
    const isSecondMonthWithinRange = secondMonthNumeric >= 1 && secondMonthNumeric <= 12;

    if (!isFirstMonthWithinRange || !isSecondMonthWithinRange) {
        console.error("Input Error: Month numbers must be between 1 and 12 (inclusive).");
        return;
    }

    // --- Core Logic: Group Identification Helper ---

    /**
     * Categorizes a given month number into its corresponding day-length group.
     * @param {number} monthValue - The month number (1-12) to categorize.
     * @returns {string} A string representing the group ('february', 'long_days', 'medium_days', or 'unclassified').
     */
    const determineMonthCategory = (monthValue) => {
        if (monthValue === februaryIdentifier) {
            return 'february';
        } else if (monthsWithThirtyOneDays.has(monthValue)) {
            return 'long_days'; // Months with 31 days
        } else if (monthsWithThirtyDays.has(monthValue)) {
            return 'medium_days'; // Months with 30 days
        } else {
            // This 'unclassified' state should ideally not be reachable if month validation (1-12) passes.
            return 'unclassified';
        }
    };

    // Determine the category for both input months.
    const categoryOfFirstMonth = determineMonthCategory(firstMonthNumeric);
    const categoryOfSecondMonth = determineMonthCategory(secondMonthNumeric);

    // --- Final Comparison and Output ---

    let resultOutputString;

    // Compare the categories to see if they match.
    // This correctly handles the case where the original code had a subtle bug
    // with `indexOf` returning 0 (falsy) for the first element.
    if (categoryOfFirstMonth === categoryOfSecondMonth) {
        resultOutputString = "Yes";
    } else {
        resultOutputString = "No";
    }

    console.log(resultOutputString);
}

// --- Program Execution Entry Point ---
// This block reads input from standard input and calls the main processing function.
try {
    // Attempt to read the entire content of standard input as a UTF-8 string.
    // This is a common pattern in environments like competitive programming platforms.
    const inputContentFromFs = require("fs").readFileSync("/dev/stdin", "utf8");
    determineMonthDayGroupEquivalence(inputContentFromFs);
} catch (executionError) {
    // Catch and report any errors that occur during file reading or function execution.
    console.error("Execution Failure: An unexpected error prevented the program from completing.", executionError.message);
}