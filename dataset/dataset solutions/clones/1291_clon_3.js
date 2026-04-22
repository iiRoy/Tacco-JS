// --- Start of Type III Clone ---

// This constant defines the special numeric value indicating a missing or default score.
const MISSING_SCORE_INDICATOR = -1;
// This constant signifies a specific termination pattern for input processing.
// It's an array to precisely match a sequence of three -1s.
const TERMINATION_PATTERN_MARKER = [-1, -1, -1];
// Minimum number of score components expected on a valid input line for primary processing.
const MIN_EXPECTED_SCORE_COMPONENTS = 2;

// Buffer to accumulate raw data chunks received from standard input.
let accumulatedRawData = '';

/**
 * Helper function to safely parse a string into an integer score.
 * It applies a specific rule: if the parsed value is the MISSING_SCORE_INDICATOR,
 * it is treated as zero instead.
 * @param {string} scoreString - The string representation of a score.
 * @returns {number} The parsed and adjusted numeric score.
 */
const safelyParseScore = (scoreString) => {
    // Use parseInt with base 10 to prevent potential octal interpretation issues.
    const numericValue = parseInt(scoreString, 10);
    // Apply the custom rule: -1 values are normalized to 0.
    return numericValue === MISSING_SCORE_INDICATOR ? 0 : numericValue;
};

/**
 * Determines if a given array of string components signals a termination condition.
 * This function handles two types of termination:
 * 1. A specific three-part pattern (e.g., "-1 -1 -1").
 * 2. A single '0' on a line.
 * @param {string[]} componentsArray - An array of string parts from a single input line.
 * @returns {boolean} True if a termination signal is detected, false otherwise.
 */
const checkTerminationSignal = (componentsArray) => {
    // Check for the three-part termination pattern.
    if (componentsArray.length >= 3 &&
        parseInt(componentsArray[0], 10) === TERMINATION_PATTERN_MARKER[0] &&
        parseInt(componentsArray[1], 10) === TERMINATION_PATTERN_MARKER[1] &&
        parseInt(componentsArray[2], 10) === TERMINATION_PATTERN_MARKER[2]) {
        return true;
    }
    // Check for the single '0' termination pattern.
    if (componentsArray.length === 1 && parseInt(componentsArray[0], 10) === 0) {
        return true;
    }
    return false;
};

/**
 * The core processing function executed once all standard input data has been received.
 * It parses lines, applies grading logic, and outputs results.
 */
const processCollectedInput = () => {
    // Split the accumulated raw data into individual lines.
    // Use filter to remove any empty strings that might result from extra newlines.
    const processedLines = accumulatedRawData.split('\n').filter(line => line.trim() !== '');

    // Iterate over each non-empty line of input.
    for (const currentLineEntry of processedLines) {
        // Split the current line by spaces to get its constituent parts (e.g., scores).
        const lineComponents = currentLineEntry.split(' ');

        // Immediately check if the current line represents a termination signal.
        if (checkTerminationSignal(lineComponents)) {
            // If a termination signal is found, stop processing further lines.
            break;
        }

        // --- Input Validation and Parsing ---
        // Guard clause: Ensure there are enough components for primary score calculation.
        if (lineComponents.length < MIN_EXPECTED_SCORE_COMPONENTS) {
            // Log an error for malformed lines and skip to the next entry.
            console.error(`Warning: Skipping malformed line "${currentLineEntry}". Expected at least ${MIN_EXPECTED_SCORE_COMPONENTS} score components.`);
            continue; // Move to the next line in the loop.
        }

        // Parse the first two primary scores, applying the -1 rule via `safelyParseScore`.
        const scoreOne = safelyParseScore(lineComponents[0]);
        const scoreTwo = safelyParseScore(lineComponents[1]);

        // Calculate the combined total score from the two primary scores.
        const totalCombinedScore = scoreOne + scoreTwo;

        // --- Grade Determination Logic ---
        let finalAssignedGrade = 'F'; // Default grade is 'F'.

        // Determine the grade based on the total combined score.
        // The conditions are ordered from highest score threshold to lowest.
        if (totalCombinedScore >= 80) {
            finalAssignedGrade = 'A';
        } else if (totalCombinedScore >= 65) {
            finalAssignedGrade = 'B';
        } else if (totalCombinedScore >= 50) {
            finalAssignedGrade = 'C';
        } else {
            // This block handles cases where totalCombinedScore is less than 50.
            // A special condition applies if the score is >= 30, involving a third component.
            if (totalCombinedScore >= 30) {
                // Attempt to parse an optional third score component.
                // If it's not present, default it to 0 for evaluation.
                const supplementaryScore = lineComponents.length >= 3 ? parseInt(lineComponents[2], 10) : 0;

                // If the supplementary score is 50 or higher, the grade becomes 'C'.
                // Otherwise, for combined scores >= 30, it's a 'D'.
                if (supplemen