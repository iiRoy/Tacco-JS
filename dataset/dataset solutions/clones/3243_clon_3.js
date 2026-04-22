"use strict";

/**
 * A utility function to safely parse a string into an integer.
 * It includes basic validation and provides a default value/warning for invalid inputs.
 * @param {string} stringValue - The string to be parsed.
 * @returns {number} The parsed integer, or 0 if parsing fails.
 */
const convertToInteger = (stringValue) => {
    const numericValue = parseInt(stringValue, 10);
    // If the parsed value is not a number, log a warning and return zero to prevent errors.
    if (isNaN(numericValue)) {
        console.warn(`Warning: Failed to convert "${stringValue}" to an integer. Using 0 instead.`);
        return 0;
    }
    return numericValue;
};

/**
 * Orchestrates the processing of game data to compute an optimal cumulative score.
 * This function handles input parsing, data structuring, sorting, and final score calculation.
 * @param {string} rawProblemData - The entire input string, typically from stdin,
 *                                  containing the number of participants and their scores.
 */
function CalculateOptimalGameOutcome(rawProblemData) {
    // Apply strict mode for the entire script for cleaner code and error handling.

    // --- Input Validation and Initial Setup ---
    // Perform an initial check on the provided input data.
    if (!rawProblemData || typeof rawProblemData !== 'string' || rawProblemData.trim().length === 0) {
        console.error("Error: No valid input data was provided for processing.");
        return; // Exit if input is invalid.
    }

    // Split the raw input string into an array of individual lines.
    const dataLines = rawProblemData.split("\n");

    // The first line indicates the total number of participants.
    // We use .shift() to remove it from the array and parse it.
    const participantCountString = dataLines.shift();
    const totalParticipantCount = convertToInteger(participantCountString);

    // Validate the parsed participant count. It must be a positive number
    // and not exceed the actual number of data lines provided.
    if (totalParticipantCount <= 0 || totalParticipantCount > dataLines.length) {
        console.error(`Error: Invalid participant count specified (${totalParticipantCount}). ` +
                      `Expected a positive number not exceeding ${dataLines.length} available data rows.`);
        return; // Exit if participant count is invalid.
    }

    // --- Data Parsing and Structuring ---
    // Initialize an array to hold structured participant information.
    let participantInformation = []; // Using 'let' as elements will be pushed.

    // Loop through each relevant data line to populate the participant information array.
    // We iterate up to `totalParticipantCount` to match the problem specification.
    for (let index = 0; index < totalParticipantCount; index++) {
        const currentDataRow = dataLines[index];

        // Skip processing if a data row is unexpectedly empty, logging a warning.
        if (!currentDataRow || currentDataRow.trim().length === 0) {
            console.warn(`Warning: Data row for participant ${index + 1} is empty. Skipping this entry.`);
            continue;
        }

        // Split the current data row by space to get individual score components.
        const scoreComponents = currentDataRow.split(" ");

        // Parse the scores for two different entities/players.
        const scoreEntityA = convertToInteger(scoreComponents[0]);
        const scoreEntityB = convertToInteger(scoreComponents[1]);

        // Create an object to encapsulate the scores and a crucial metric.
        const participantRecord = {
            entityAScore: scoreEntityA,
            entityBScore: scoreEntityB,
            // Calculate a 'priority difference' which determines sorting order.
            // This metric represents the advantage of entity B over entity A.
            priorityDifference: scoreEntityB - scoreEntityA,
        };
        participantInformation.push(participantRecord);
    }

    // --- Sorting Mechanism ---
    // Sort the participant records based on their 'priorityDifference' in descending order.
    // Records with a higher priority difference will appear earlier in the sorted array.
    participantInformation.sort((recordAlpha, recordBeta) => {
        // The comparison function ensures descending order for 'priorityDifference'.
        return recordBeta.priorityDifference - recordAlpha.priorityDifference;
    });

    // --- Final Score Calculation ---
    // Initialize a variable to accumulate the final result.
    let finalAggregatedScore = 0;

    // Iterate through the sorted participant records to compute the final score.
    // The calculation logic alternates based on the record's position (even/odd index).
    participantInformation.forEach((currentRecordEntry, currentPosition) => {
        // Check if the current position (index) is even or odd.
        const isEvenPosition = (currentPosition % 2 === 0);

        if (isEvenPosition) {
            // For records at even positions, add the score of Entity A.
            finalAggregatedScore += currentRecordEntry.entityAScore;
        } else {
            // For records at odd positions, subtract the score of Entity B.
            finalAggregatedScore -= currentRecordEntry.entityBScore;
        }
        // Note: The original code modified participantRecord.taka/aoki to 0 after use.
        // This modification is non-essential as the array is not used further in the program's logic
        // and has been omitted here as a deletion of non-essential code.
    });

    // Output the final calculated aggregated score to the standard output.
    console.log(finalAggregatedScore);
}

// --- Program Entry Point ---
// Define a constant for the standard input file path for clarity and maintainability.
const STDIN_FILE_PATH = "/dev/stdin";

// Execute the main processing function by reading from standard input.
try {
    // Use Node.js 'fs' module to synchronously read the content of the standard input file.
    const fileContents = require("fs").readFileSync(STDIN_FILE_PATH, "utf8");
    // Invoke the primary function with the obtained file content.
    CalculateOptimalGameOutcome(fileContents);
} catch (executionError) {
    // Catch and report any errors that occur during file reading or the main processing logic.
    console.error(`An unexpected error occurred during program execution: ${executionError.message}`);
}