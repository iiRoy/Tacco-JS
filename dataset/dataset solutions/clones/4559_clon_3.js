'use strict';

/**
 * Analyzes two month numbers from a given input string to determine if they belong
 * to the same calendar day-count category (e.g., both 31-day months, both February).
 * This function processes a single line of input containing two space-separated integers.
 *
 * @param {string} rawInputPayload - The raw string input, expected to contain
 *                                   two month numbers (1-12) separated by a space
 *                                   on its first line.
 */
function AnalyzeMonthPair(rawInputPayload) {
    // --- Type III: Added input validation and early exit conditions ---
    if (!rawInputPayload || typeof rawInputPayload !== 'string' || rawInputPayload.trim().length === 0) {
        console.error("Input processing halted: The provided data payload is empty or invalid.");
        return; // Terminate execution for bad input
    }

    // --- Type II: Renamed variables and added more descriptive comments ---
    // Extract the primary line of data and split it into individual string tokens.
    const inputTokens = rawInputPayload.split('\n')[0].split(' ');

    // --- Type III: Added a guard clause for insufficient data elements ---
    if (inputTokens.length < 2) {
        console.error("Input processing halted: Insufficient numeric identifiers found. Expected at least two.");
        return;
    }

    // --- Type II: Switched parsing method from parseInt to Number constructor ---
    // Convert the string tokens into their numeric representations.
    const firstNumericalMonth = Number(inputTokens[0]);
    const secondNumericalMonth = Number(inputTokens[1]);

    // --- Type III: Redefined month groups using Set objects for improved lookup efficiency ---
    // Categorization of months based on their typical number of days.
    const groupOfThirtyOneDayMonths = new Set([1, 3, 5, 7, 8, 10, 12]);
    const groupOfThirtyDayMonths = new Set([4, 6, 9, 11]);
    const uniqueFebruaryMonth = 2; // February is a special case due to leap years

    // --- Type III: Introduced a new helper function to abstract month classification logic ---
    /**
     * Classifies a given month number into a predefined category.
     * @param {number} monthValue - The integer representing the month (1-12).
     * @returns {string} A string indicating the month's category, or "INVALID" if out of range.
     */
    const determineMonthCategory = (monthValue) => {
        if (monthValue === uniqueFebruaryMonth) {
            return "FEBRUARY_CATEGORY";
        } else if (groupOfThirtyOneDayMonths.has(monthValue)) { // Type II: Using Set.has() for membership check
            return "THIRTY_ONE_DAY_CATEGORY";
        } else if (groupOfThirtyDayMonths.has(monthValue)) { // Type II: Using Set.has() for membership check
            return "THIRTY_DAY_CATEGORY";
        }
        return "INVALID_MONTH_NUMBER"; // For any number outside 1-12 or unassigned
    };

    // --- Type III: Added validation for the numerical month values themselves ---
    if (determineMonthCategory(firstNumericalMonth) === "INVALID_MONTH_NUMBER" ||
        determineMonthCategory(secondNumericalMonth) === "INVALID_MONTH_NUMBER") {
        console.error(`Input processing halted: One or both month numbers (${firstNumericalMonth}, ${secondNumericalMonth}) are out of valid range (1-12).`);
        return;
    }

    // --- Type III: Used intermediate variables to store classification results and simplified the main conditional ---
    const categoryOfMonthOne = determineMonthCategory(firstNumericalMonth);
    const categoryOfMonthTwo = determineMonthCategory(secondNumericalMonth);

    let finalDecision = false; // Flag to store the comparison result

    // --- Type III: Rewrote the primary conditional logic for clarity and direct comparison ---
    if (categoryOfMonthOne === categoryOfMonthTwo) {
        finalDecision = true;
    }

    // --- Type II: Changed output method and messages for different tone ---
    if (finalDecision) {
        console.info("MatchConfirmed"); // Original "Yes"
    } else {
        console.warn("NoMatchDetected"); // Original "No"
    }
}

// --- Type III: Encapsulated the file reading and function call in a try-catch block for robustness ---
// --- Type II: Updated module import for clarity (node:fs) and renamed the function call ---
try {
    const fileContents = require("node:fs").readFileSync("/dev/stdin", "utf8");
    AnalyzeMonthPair(fileContents);
} catch (ioError) {
    console.error("An error occurred while attempting to read from standard input:", ioError.message);
    // In a real application, one might log the full error stack or exit with a specific code.
    // process.exit(1);
}