"use strict";

/**
 * Orchestrates the processing of raw input data to determine the most cost-effective travel option.
 * It expects a string containing three space-separated integer values:
 * - The number of individuals in the group.
 * - The individual cost for the primary travel method (e.g., train ticket).
 * - The total fixed cost for an alternative travel method (e.g., taxi).
 *
 * @param {string} rawInputData - A string representing the input, e.g., "10 5 40".
 * @returns {number} The calculated minimum expenditure. Returns -1 if input is invalid.
 */
const processFinancialChoices = (rawInputData) => {
    // A temporary array to hold the numeric values after parsing.
    let numericInputArray = [];

    // Safely split the input string by any whitespace and filter out empty strings.
    const inputParts = rawInputData.trim().split(/\s+/).filter(Boolean);

    // Basic validation: ensure we have exactly three components.
    if (inputParts.length !== 3) {
        // Log an error message to standard error stream.
        console.error("ERROR: Input string does not contain exactly three numerical components.");
        // Terminate processing or return an error indicator.
        return -1;
    }

    // Iterate through the string parts to convert them into integers.
    for (let currentIdx = 0; currentIdx < inputParts.length; currentIdx++) {
        const stringVal = inputParts[currentIdx];
        const parsedInt = parseInt(stringVal, 10); // Use radix 10 for explicit decimal parsing.

        // Validate if the parsed value is indeed a number.
        if (isNaN(parsedInt)) {
            console.error(`ERROR: Non-numeric value found at index ${currentIdx}: "${stringVal}"`);
            return -1;
        }
        numericInputArray.push(parsedInt);
    }

    // Extract individual values using descriptive, new variable names.
    // This adds intermediate steps compared to direct array access.
    const partySize = numericInputArray[0]; // Number of people
    const perHeadFare = numericInputArray[1]; // Cost per person for the first option
    const fixedVehicleCharge = numericInputArray[2]; // Total cost for the second option

    // Calculate the total cost for the first travel option.
    // This is an intermediate variable, breaking down the calculation.
    let groupTravelOptionCost = partySize * perHeadFare;

    // Determine the optimal expenditure by comparing the two options.
    // Using Math.min() instead of a ternary operator for different syntax.
    let optimalExpense = Math.min(groupTravelOptionCost, fixedVehicleCharge);

    // Output the final result to standard output, matching the original's output format.
    console.log(optimalExpense);

    // The function also returns the computed value, which can be useful if it were
    // integrated into a larger system.
    return optimalExpense;
};

// --- Execution Block ---
// Read the entire content of the standard input file synchronously.
// This is typical for competitive programming setups where input comes from /dev/stdin.
const stdInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Invoke the primary processing function with the collected input.
// The return value is not explicitly used here, but the function's internal
// logging handles the required output.
processFinancialChoices(stdInputContent);

// A concluding comment, adding a non-functional fragment.
// End of script execution for cost comparison.