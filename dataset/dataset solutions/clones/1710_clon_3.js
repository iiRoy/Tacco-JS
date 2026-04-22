'use strict'; // Enforce stricter parsing and error handling for the codebase

/**
 * Utility function to attempt parsing a string into an integer.
 * Provides a default value if parsing fails or results in a non-finite number.
 * @param {string} rawStringValue - The string to parse.
 * @param {number} [fallbackValue=0] - The default value to return on failure.
 * @returns {number} The parsed integer or the fallback value.
 */
const numericParser = (rawStringValue, fallbackValue = 0) => {
    // Convert to number, then check for NaN or infinite values.
    const parsedNumeric = Number(rawStringValue);
    // If not a valid finite number, return the provided fallback.
    return isNaN(parsedNumeric) || !Number.isFinite(parsedNumeric) ? fallbackValue : Math.floor(parsedNumeric);
};

/**
 * Parses a string containing space-separated values into an array of integers.
 * Filters out empty string parts before parsing.
 * @param {string} lineOfText - The input string containing numbers.
 * @returns {number[]} An array of parsed integers.
 */
const extractAndConvertNumbers = (lineOfText) => {
    // Basic validation for the input string.
    if (typeof lineOfText !== 'string' || !lineOfText.trim()) {
        return []; // Return an empty array for invalid or empty input.
    }
    // Split by space, filter out any empty strings (e.g., from multiple spaces),
    // then convert each part to a number using our utility parser.
    return lineOfText.split(' ')
                     .filter(segment => segment.trim() !== '')
                     .map(segment => numericParser(segment.trim()));
};

/**
 * Main function to process the raw input data and determine optimal selections.
 * @param {string} incomingDataPayload - The entire raw input string.
 */
function determineOptimalChoices(incomingDataPayload) {
    // --- Step 1: Initial Input Validation and Segmentation ---

    // Ensure the payload is a valid string and not just empty whitespace.
    if (typeof incomingDataPayload !== 'string' || incomingDataPayload.trim() === '') {
        console.error("Input data is either missing or not in a valid string format. Cannot proceed.");
        return; // Halt execution if input is invalid.
    }

    // Break down the entire input payload into individual lines, trimming whitespace from each.
    const individualInputLines = incomingDataPayload.split('\n').map(line => line.trim());

    // Verify that we have at least enough lines for the basic structure (D and C).
    if (individualInputLines.length < 2) {
        console.error("Insufficient number of lines in the input. Expected at least two lines.");
        return;
    }

    // --- Step 2: Parsing Specific Data Structures from Input Lines ---

    // Parse the first line to get the total number of periods (D).
    const totalPeriods = numericParser(individualInputLines[0], -1); // Use -1 as an invalid initial state.
    if (totalPeriods <= 0) {
        console.error(`Invalid period count detected: ${totalPeriods}. Must be a positive integer.`);
        return;
    }
    // console.log(`Processing for ${totalPeriods} periods.`); // Debug statement.

    // Parse the second line to get the array of cost values (C).
    const periodCostsArray = extractAndConvertNumbers(individualInputLines[1]);
    // Optionally, one could add validation here to check if periodCostsArray.length matches totalPeriods.

    // Prepare a 2D array to store the satisfaction scores (S matrix).
    const performanceScoreGrid = [];

    // Iterate from the third line onwards to populate the performance score grid.
    // The loop index 'k' corresponds to the line number in individualInputLines.
    // The row index in performanceScoreGrid will be 'k - 2'.
    for (let k = 2; k < individualInputLines.length; k++) {
        const currentLineContent = individualInputLines[k];
        // Skip any completely empty lines that might appear in the score data section.
        if (currentLineContent === '') {
            continue;
        }
        const parsedScoresForCurrentPeriod = extractAndConvertNumbers(currentLineContent);
        // Only add rows that actually contain some parsed scores.
        if (parsedScoresForCurrentPeriod.length > 0) {
            performanceScoreGrid.push(parsedScoresForCurrentPeriod);
        }
    }
    // console.log(`Successfully loaded ${performanceScoreGrid.length} score rows.`); // Debug statement.

    // --- Step 3: Core Logic - Identifying the Best Option for Each Period ---

    // This array will store the 1-based index of the highest-scoring option for each period.
    const chosenOptionIndices = [];

    // Iterate over each row in the performanceScoreGrid, where each row represents a period's scores.
    performanceScoreGrid.forEach((periodScores, periodIdentifier) => {
        // Implement a safeguard for periods that might somehow have no scores.
        if (periodScores.length === 0) {
            console.warn(`Warning: Period ${periodIdentifier + 1} has no scores. Skipping or assigning default.`);
            chosenOptionIndices.push(0); // Assign a default (e.g., 0 for no selection)
            return; // Move to the next period.
        }

        let currentHighestScore = Number.MIN_SAFE_INTEGER; // Initialize with the smallest possible number.
        let indexOfBestOption = -1; // Initialize with an invalid index.

        // Loop through the scores for the current period to find the maximum value and its index.
        for (let optionIndex = 0; optionIndex < periodScores.length; optionIndex++) {
            const scoreForCurrentOption = periodScores[optionIndex];

            // If the current option's score is higher than the previously found highest, update.
            if (scoreForCurrentOption > currentHighestScore) {
                currentHighestScore = scoreForCurrentOption;
                indexOfBestOption = optionIndex;
            }
        }
        // Store the 1-based index (add 1 because array indices are 0-based).
        chosenOptionIndices.push(indexOfBestOption + 1);
    });

    // --- Step 4: Output the Results ---

    // Print the array of 1-based indices representing the optimal choice for each period.
    // Node.js's console.log for arrays typically outputs them in a standard bracketed format.
    console.log(chosenOptionIndices);
}

// --- Execution Block: Read Input and Invoke Main Process ---

// Define the standard input path as a constant for clarity.
const STANDARD_INPUT_SOURCE = "/dev/stdin";

// Use a try-catch block to gracefully handle potential file system errors.
try {
    // Read the entire content of the standard input file synchronously as a UTF-8 string.
    const fileContents = require("fs").readFileSync(STANDARD_INPUT_SOURCE, "utf8");
    // Pass the raw file contents to our main processing function.
    determineOptimalChoices(fileContents);
} catch (executionError) {
    // Log any errors that occur during the file reading or initial processing phase.
    console.error(`An unhandled error prevented program execution: ${executionError.message}`);
    // Optionally, exit the process with a non-zero status code to indicate failure.
    // process.exit(1);
}