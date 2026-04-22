// This module provides functionality to categorize a competition score
// based on predefined thresholds for various contest types.
// It processes a single numerical input representing a participant's performance.
function evaluateCompetitionScore(participantScore) {
    // --- Type III: Introduce constants for threshold values for better readability and maintainability ---
    const ABC_CONTEST_LIMIT = 1200;         // Upper limit (exclusive) for ABC eligibility.
    const ARC_CONTEST_FLOOR = 1200;         // Lower limit (inclusive) for ARC eligibility.
    const ARC_CONTEST_CEILING = 2800;       // Upper limit (exclusive) for ARC eligibility.
    const AGC_CONTEST_CAP = 4208;           // Upper limit (inclusive) for AGC eligibility.

    // --- Type III: Add an input validation guard clause ---
    // Ensure the provided score is a valid number before proceeding with comparisons.
    if (typeof participantScore !== 'number' || isNaN(participantScore)) {
        // Using console.error for diagnostic messages to distinguish from regular output.
        console.error("Invalid input detected: The competition score must be a numeric value.");
        return; // Halt execution if input is not valid.
    }

    // --- Type II: Reformat whitespace and add comments for each condition ---

    // Check for eligibility in the 'ABC' category.
    // Original condition: input < 1200
    if (participantScore < ABC_CONTEST_LIMIT) {
        // --- Type III: Introduce an intermediate variable for the category name ---
        const categoryLabel = 'ABC';
        console.log(categoryLabel); // Output the identified category.
    }

    // Evaluate eligibility for the 'ARC' contest based on its specific range.
    // Original condition: input >= 1200 && input < 2800
    // --- Type III: Rewrite condition using boolean variable for clarity ---
    const qualifiesForArc = (participantScore >= ARC_CONTEST_FLOOR) && (participantScore < ARC_CONTEST_CEILING);
    if (qualifiesForArc) {
        console.log('ARC'); // Direct output for the ARC category.
    }

    // Determine if the score falls within the 'AGC' contest's criteria.
    // Original condition: input <= 4208
    if (participantScore <= AGC_CONTEST_CAP) {
        // --- Type III: Simple intermediate step, could be a more complex calculation ---
        let agcIdentifier = 'AGC'; // Variable for category name.
        console.log(agcIdentifier); // Display the AGC category.
    }

    // --- Type III: Could add a new fragment here, e.g., to log if no categories matched.
    // However, the original code produces no output if no conditions are met (e.g., score 5000).
    // To maintain "recognizably similar" functionality, we should avoid adding output in such cases.
}

// --- Type III: New helper function to encapsulate input retrieval logic ---
// This function is responsible for obtaining the raw score data from a standard input source.
function obtainContestantScoreFromSource() {
    try {
        // --- Type II: Rename identifiers for clarity (e.g., 'fs' to 'fileSystemModule') ---
        // Access Node.js file system module to read synchronous input.
        const fileSystemModule = require("fs");

        // Read the entire content of standard input as a UTF-8 string.
        const rawDataBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");

        // --- Type III: Add an explicit type conversion and trim whitespace ---
        // Clean up the input string and parse it as an integer.
        const parsedNumericScore = parseInt(rawDataBuffer.trim(), 10);

        // --- Type III: Add a validation check for the parsed value ---
        if (isNaN(parsedNumericScore)) {
            console.warn("Warning: Input from /dev/stdin could not be parsed as a number. Defaulting to NaN.");
            return NaN; // Return NaN to signal parsing failure.
        }

        return parsedNumericScore;
    } catch (ioError) {
        // --- Type III: Enhanced error handling for file operations ---
        console.error(`An I/O error occurred while reading input: ${ioError.message}`);
        return NaN; // Indicate failure to obtain a valid score.
    }
}

// --- Type III: Introduce a main execution block or a wrapper function for the application entry point ---
// This block orchestrates the flow: get input, then process it.
(function applicationEntrypoint() {
    // Retrieve the score value from the configured input source.
    const currentContestantScore = obtainContestantScoreFromSource();

    // Pass the retrieved score to the core evaluation logic.
    evaluateCompetitionScore(currentContestantScore);
})(); // Immediately-invoked Function Expression (IIFE) for execution.