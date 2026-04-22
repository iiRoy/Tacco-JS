/**
 * @file This script evaluates a contestant's score to determine
 *       which contest category they qualify for based on a predefined threshold.
 *       It processes input from standard input.
 */

// Define constants for the rating threshold and contest names for clarity and maintainability.
const ARC_RATING_THRESHOLD = 1200;
const ARC_CONTEST_NAME = "ARC";
const ABC_CONTEST_NAME = "ABC";

/**
 * Parses an array of string representations of numbers into an array of actual numbers.
 * Each string is trimmed and then converted to an integer.
 *
 * @param {string[]} stringCollection - An array of strings, potentially containing numeric values.
 * @returns {number[]} An array of parsed integer values. Non-numeric strings will result in NaN.
 */
function parseNumericStrings(stringCollection) {
    // Using an arrow function for conciseness and modern JavaScript style.
    // Each string value is trimmed to remove leading/trailing whitespace before parsing.
    return stringCollection.map(currentString => parseInt(currentString.trim(), 10));
}

/**
 * Retrieves the raw input string from the standard input stream.
 * This function encapsulates the file system reading logic.
 *
 * @returns {string} The raw string content read from /dev/stdin.
 * @throws {Error} If there is an issue reading from /dev/stdin.
 */
function acquireSystemInput() {
    // Using 'fs' module to read from the standard input file descriptor.
    // 'utf8' encoding is specified for proper character interpretation.
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

/**
 * Evaluates a contestant's rank based on their provided score.
 * It takes a raw input string, parses the score, and prints the corresponding
 * contest name (ARC or ABC) to the console.
 *
 * @param {string} inputDataString - The raw string input, expected to contain a single score.
 *                                   e.g., "1200", " 1199 ", "1200\n".
 */
function evaluateContestantRank(inputDataString) {
    // First, clean the input string by trimming whitespace and splitting it.
    // Using a regex for split handles multiple spaces or newlines as delimiters.
    const cleanedParts = inputDataString.trim().split(/\s+/);

    // Guard clause: Check if any meaningful parts were extracted.
    // If the input was empty or only whitespace, cleanedParts might be [''] or [].
    if (cleanedParts.length === 0 || (cleanedParts.length === 1 && cleanedParts[0] === '')) {
        console.error("Error: Input data is empty or malformed. Cannot determine rank.");
        console.log(ABC_CONTEST_NAME); // Default to ABC for safety.
        return;
    }

    // Convert the array of string parts into an array of numbers.
    const processedScores = parseNumericStrings(cleanedParts);

    // Guard clause: Ensure the first parsed score is a valid number.
    // If the first part couldn't be parsed (e.g., "abc"), it would be NaN.
    if (processedScores.length === 0 || isNaN(processedScores[0])) {
        console.error("Error: Could not parse a valid numeric score from input.");
        console.log(ABC_CONTEST_NAME); // Default to ABC for safety.
        return;
    }

    // Extract the primary score for comparison, which is expected to be the first element.
    const contestantScore = processedScores[0];

    // Determine the contest type based on the threshold.
    let designatedContest;
    if (contestantScore >= ARC_RATING_THRESHOLD) {
        designatedContest = ARC_CONTEST_NAME;
    } else {
        designatedContest = ABC_CONTEST_NAME;
    }

    // Output the final decision to the standard output.
    console.log(designatedContest);
}

// Immediately Invoked Function Expression (IIFE) to encapsulate execution logic.
// This serves as the program's entry point.
(function initializeAndExecute() {
    try {
        // Attempt to read input from the system.
        const rawInputContent = acquireSystemInput();
        // Process the obtained input to determine the contest rank.
        evaluateContestantRank(rawInputContent);
    } catch (executionError) {
        // Catch any errors that occur during input reading or processing.
        console.error("An unexpected error occurred during program execution:", executionError.message);
        // As a fallback, output the default contest type.
        console.log(ABC_CONTEST_NAME);
    }
})();