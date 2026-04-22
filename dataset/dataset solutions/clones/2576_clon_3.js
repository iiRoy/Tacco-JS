// Helper function to safely parse a line of space-separated numeric values.
// This function adds robustness by validating input and handling non-numeric segments.
const parseNumericLineSegments = (lineContent) => {
    // Ensure the input is a string and not merely whitespace.
    if (typeof lineContent !== 'string' || lineContent.trim() === '') {
        // Log a warning and return an empty array if the line is invalid or empty.
        console.warn("Warning: Attempted to parse an empty or invalid line for numeric segments.");
        return [];
    }

    // Split the string by spaces and convert each segment to an integer.
    // It also includes a basic check for NaN results.
    return lineContent.split(' ').map(segment => {
        const numericalValue = parseInt(segment.trim(), 10);
        // If conversion results in NaN, indicating a non-numeric segment,
        // log a warning and default to 0 to prevent program crash.
        if (isNaN(numericalValue)) {
            console.warn(`Warning: Encountered non-numeric data '${segment}' during line parsing. Defaulting to 0.`);
            return 0;
        }
        return numericalValue;
    });
};

/**
 * Computes a cumulative score based on a sequence of activities and associated point values.
 * This function processes raw input text, parses it, and applies scoring logic,
 * including a bonus for consecutive activities.
 *
 * @param {string} rawInputSource - The complete input data as a single string, typically from stdin.
 * @returns {number} The total calculated score, or 0 if input is invalid or an error occurs.
 */
function calculateActivitySequenceScore(rawInputSource) {
    // --- Input Validation and Initial Data Preparation ---

    // Guard clause for null, undefined, or empty input strings.
    if (!rawInputSource || typeof rawInputSource !== 'string' || rawInputSource.trim().length === 0) {
        console.error("Error: The provided input data is null, empty, or not a string. Cannot proceed with scoring.");
        return 0; // Return 0 for invalid input.
    }

    // Split the raw input into individual lines and filter out any completely empty lines.
    const processedInputLines = rawInputSource.split("\n").filter(line => line.trim() !== '');

    // Define the minimum number of data lines expected for a valid input set.
    const MINIMUM_EXPECTED_LINES = 4;
    if (processedInputLines.length < MINIMUM_EXPECTED_LINES) {
        console.error(`Error: Insufficient input lines. Expected at least ${MINIMUM_EXPECTED_LINES} lines, but received ${processedInputLines.length}.`);
        return 0;
    }

    // Parse the total count of activities from the first line.
    // This explicitly converts the string to an integer, making the intent clearer than implicit JS coercion.
    let totalActivityCount = parseInt(processedInputLines[0].trim(), 10);

    // Validate the parsed activity count. It must be a positive integer.
    if (isNaN(totalActivityCount) || totalActivityCount <= 0) {
        console.error(`Error: Invalid or non-positive activity count specified: '${processedInputLines[0]}'. Must be a positive integer.`);
        return 0;
    }

    // Parse the sequence of activity identifiers from the second line.
    const activityIdentifierSequence = parseNumericLineSegments(processedInputLines[1]);

    // Parse the base point values for each activity type from the third line.
    const basePointLookupTable = parseNumericLineSegments(processedInputLines[2]);

    // Parse the bonus points for consecutive activities from the fourth line.
    const consecutiveBonusLookupTable = parseNumericLineSegments(processedInputLines[3]);

    // --- Core Scoring Logic Initialization ---

    let accumulatedScore = 0; // Initialize the running total for the score.

    // --- Iterative Score Calculation ---

    // Loop through each activity in the sequence based on the `totalActivityCount`.
    for (let currentActivityIndex = 0; currentActivityIndex < totalActivityCount; ++currentActivityIndex) {
        // Fetch the identifier for the current activity.
        const currentActivityId = activityIdentifierSequence[currentActivityIndex];

        // --- Base Score Calculation ---
        // Validate the current activity ID before attempting to access base points.
        // Activity IDs are typically 1-indexed, so we check if they are within valid bounds.
        if (currentActivityId === undefined || currentActivityId <= 0 || currentActivityId > basePointLookupTable.length) {
            console.warn(`Warning: Invalid activity ID '${currentActivityId}' encountered at sequence index ${currentActivityIndex}. Base score for this activity will be skipped.`);
            continue; // Skip to the next activity if the current one is invalid.
        }

        // Add the base points for the current activity.
        // We subtract 1 from the ID to convert it to a 0-indexed array position.
        const pointsForCurrentActivity = basePointLookupTable[currentActivityId - 1];
        accumulatedScore += pointsForCurrentActivity;

        // --- Consecutive Activity Bonus Check ---
        // Bonus points are only applicable from the second activity onwards (index > 0).
        if (currentActivityIndex > 0) {
            const previousActivityId = activityIdentifierSequence[currentActivityIndex - 1];

            // Check if the current activity's ID is exactly one greater than the previous activity's ID.
            // This is the condition for earning a consecutive bonus.
            if (currentActivityId === previousActivityId + 1) {
                // The bonus is indexed by the *previous* activity's ID.
                const bonusIndex = previousActivityId - 1;

                // Validate the bonus index to prevent out-of-bounds access.
                if (bonusIndex >= 0 && bonusIndex < consecutiveBonusLookupTable.length) {
                    const earnedBonusPoints = consecutiveBonusLookupTable[bonusIndex];
                    accumulatedScore += earnedBonusPoints; // Add the bonus points to the total score.
                } else {
                    console.warn(`Warning: Bonus index '${bonusIndex}' derived from previous activity ID '${previousActivityId}' at index ${currentActivityIndex - 1} is out of bounds for bonus points table. No bonus applied.`);
                }
            }
        }
    }

    // Return the final computed score.
    return accumulatedScore;
}

// --- Entry Point for Execution in a Node.js Environment ---
// This block handles reading input from /dev/stdin and printing the result.
try {
    // Read the entire content of the standard input stream synchronously.
    const standardInputData = require("fs").readFileSync("/dev/stdin", "utf8");

    // Call the main scoring function with the input data.
    const finalScoreResult = calculateActivitySequenceScore(standardInputData);

    // Output the computed score to the console.
    console.log(finalScoreResult);
} catch (executionError) {
    // Catch and log any errors that occur during file reading or score calculation.
    console.error("An unexpected error occurred during program execution:", executionError.message);
    // In competitive programming, it's common to print a default value (like 0) on error.
    console.log(0);
}