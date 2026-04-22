'use strict';

// --- Configuration Constants (Type III: Extracted magic numbers/strings for clarity) ---

// Delimiters used for parsing input data.
const LINE_BREAK_DELIMITER = '\n';
const VALUE_SEPARATOR_TOKEN = ' ';

// The numerical threshold for a contestant to qualify for the Advanced tier.
const ADVANCED_TIER_SCORE_THRESHOLD = 1200;

// String labels identifying the different contest tiers.
const ADVANCED_TIER_LABEL = 'ARC'; // Represents AtCoder Regular Contest
const BEGINNER_TIER_LABEL = 'ABC'; // Represents AtCoder Beginner Contest

// --- Utility Functions (Type III: Added helper functions for modularity and robustness) ---

/**
 * Retrieves all content from the standard input stream synchronously.
 * This function encapsulates the file system access logic.
 * (Type II: Renamed module and function identifiers; Type III: Encapsulated I/O operation)
 * @returns {string} The entire content read from '/dev/stdin' as a UTF-8 string.
 */
const retrieveStandardInputContent = () => {
    // Dynamically obtain the Node.js file system module for I/O operations.
    const fileSystemModule = require('fs');
    // Read the complete contents of the standard input file synchronously, specifying UTF-8 encoding.
    return fileSystemModule.readFileSync('/dev/stdin', 'utf8');
};

/**
 * Attempts to convert a given string into an integer. If the conversion fails
 * (e.g., the string is not a valid number), it returns a specified fallback value.
 * (Type III: Enhanced parsing with explicit radix and error handling for robustness)
 * @param {string} stringValue - The string representation of the number to parse.
 * @param {number} [fallbackValue=0] - The default numeric value to return if parsing is unsuccessful.
 * @returns {number} The successfully parsed integer, or the `fallbackValue` if parsing fails.
 */
const parseIntegerWithFallback = (stringValue, fallbackValue = 0) => {
    // Use parseInt with radix 10 to ensure decimal parsing.
    const parsedNumber = parseInt(stringValue, 10);
    // (Type III: Explicit check for NaN (Not-a-Number) result from parsing)
    if (isNaN(parsedNumber)) {
        // Log a warning if parsing fails, indicating the problematic value and the fallback used.
        console.warn(`[WARNING] Failed to interpret "${stringValue}" as an integer. Using fallback value: ${fallbackValue}.`);
        return fallbackValue;
    }
    return parsedNumber;
};

/**
 * Displays the determined contest tier label to the console.
 * (Type III: Encapsulated output operation for consistency and potential future changes)
 * @param {string} tierIdentifier - The string label representing the contest tier (e.g., 'ARC', 'ABC').
 */
const displayContestTier = (tierIdentifier) => {
    console.log(tierIdentifier);
};

// --- Core Logic Function (Type II & III: Extensive modifications applied here) ---

/**
 * Analyzes raw competition data to determine and output the appropriate contest tier
 * ('ARC' for Advanced Regular Contest or 'ABC' for AtCoder Beginner Contest)
 * based on a contestant's score.
 * (Type II: Renamed function and its primary parameter for clarity)
 * @param {string} rawContestData - The raw input string containing the competition score data.
 */
const evaluateContestantPerformance = (rawContestData) => {
    // (Type III: Initial validation: Check if any raw data was provided at all)
    if (!rawContestData || rawContestData.length === 0) {
        console.error("[ERROR] No raw contest data was supplied. Defaulting to the beginner tier.");
        displayContestTier(BEGINNER_TIER_LABEL);
        return; // Terminate execution early if no data.
    }

    // (Type III: Introduce an intermediate variable to store the result of trimming)
    // Remove any leading or trailing whitespace from the entire input string.
    const trimmedInputContent = rawContestData.trim();

    // (Type III: Guard clause: Check if the input became empty after trimming whitespace)
    if (trimmedInputContent.length === 0) {
        console.error("[ERROR] Raw contest data consists only of whitespace or is empty after trimming. Defaulting to beginner tier.");
        displayContestTier(BEGINNER_TIER_LABEL);
        return;
    }

    // (Type II: Renamed variable; Type III: Utilized a constant for the line delimiter)
    // Split the cleaned content into an array, where each element is an individual line of data.
    const dataLines = trimmedInputContent.split(LINE_BREAK_DELIMITER);

    // (Type III: Validation: Ensure there's at least one line of data to process)
    if (dataLines.length === 0) {
        console.error("[ERROR] No discernible lines of data were found in the contest input. Defaulting to beginner tier.");
        displayContestTier(BEGINNER_TIER_LABEL);
        return;
    }

    // (Type III: Introduce an intermediate variable for the first line, as it contains the crucial score)
    // The relevant contestant score is expected to be located on the very first line of input.
    const primaryScoreLine = dataLines[0];

    // (Type III: Validation: Check if the primary score line itself is empty or just whitespace)
    if (!primaryScoreLine || primaryScoreLine.trim().length === 0) {
        console.error("[ERROR] The primary score line is either absent or contains no meaningful data. Defaulting to beginner tier.");
        displayContestTier(BEGINNER_TIER_LABEL);
        return;
    }

    // (Type II: Renamed variable; Type III: Utilized a constant for the value separator)
    // Further segment the primary line into an array of string tokens, using space as the separator.
    const scoreTokens = primaryScoreLine.split(VALUE_SEPARATOR_TOKEN);

    // (Type III: Validation: Verify that score components were successfully extracted)
    if (scoreTokens.length === 0) {
        console.error("[ERROR] No score components were identified on the primary line. Defaulting to beginner tier.");
        displayContestTier(BEGINNER_TIER_LABEL);
        return;
    }

    // (Type II: Renamed variable; Type III: Employed the robust helper function for parsing)
    // The actual numerical score is anticipated to be the first token in the `scoreTokens` array.
    let contestantNumericalScore = parseIntegerWithFallback(scoreTokens[0], 0); // Use 0 as a safe default

    // (Type III: Additional data validation: Ensure the score is logically valid, e.g., non-negative)
    if (contestantNumericalScore < 0) {
        console.warn(`[WARNING] A negative score (${contestantNumericalScore}) was detected. Normalizing this value to 0 for tier evaluation.`);
        contestantNumericalScore = 0; // Normalize any negative scores to zero, as they are likely invalid.
    }

    // (Type III: Rewriting conditional logic from a ternary operator to a more explicit if-else block)
    // (Type II: Renamed variable; Type III: Used constants for tier labels and the score threshold)
    let determinedContestTier;
    if (contestantNumericalScore >= ADVANCED_TIER_SCORE_THRESHOLD) {
        determinedContestTier = ADVANCED_TIER_LABEL; // Assign 'ARC' if the score meets or exceeds the advanced threshold.
    } else {
        determinedContestTier = BEGINNER_TIER_LABEL; // Otherwise, assign 'ABC' for the beginner tier.
    }

    // (Type III: Utilized the helper function to present the final determined tier)
    displayContestTier(determinedContestTier);
};

// --- Program Entry Point (Type III: Encapsulated the main execution flow) ---

/**
 * The primary entry point function for the application, responsible for
 * orchestrating the retrieval of input data and initiating the performance evaluation.
 */
const initiateApplication = () => {
    try {
        // (Type III: Used the helper function to acquire the raw input data)
        const receivedApplicationInput = retrieveStandardInputContent();
        // (Type III: Called the core logic function to process the received data)
        evaluateContestantPerformance(receivedApplicationInput);
    } catch (operationError) {
        // (Type III: Implemented global error handling for unexpected exceptions during execution)
        console.error("[CRITICAL ERROR] An unhandled exception occurred during the application's execution:", operationError.message);
        // In the event of a critical failure, provide a fallback default output to ensure some result.
        displayContestTier(BEGINNER_TIER_LABEL);
    }
};

// Execute the main application logic to start the process.
initiateApplication();