// This module handles processing command-line input for string pattern validation tasks.

/**
 * Generates a regular expression string based on two provided numeric lengths.
 * The resulting pattern is designed to match a sequence of digits,
 * followed by a hyphen, and then another sequence of digits.
 *
 * @param {number} lenA - The required length for the initial digit segment.
 * @param {number} lenB - The required length for the subsequent digit segment.
 * @returns {string} The fully constructed regular expression pattern string.
 */
function createLengthBasedPatternString(lenA, lenB) {
    // Ensure that the provided lengths are treated as valid positive integers
    // for robust regular expression construction. If an invalid number is
    // provided, it will be floored and set to a minimum of 1.
    const effectiveLenA = Math.max(1, Math.floor(Number(lenA)));
    const effectiveLenB = Math.max(1, Math.floor(Number(lenB)));

    // Utilize template literals to build the regex string dynamically and clearly.
    return `^\\d{${effectiveLenA}}-\\d{${effectiveLenB}}$`;
}

/**
 * Orchestrates the validation process for an input string against a dynamically
 * generated pattern. It parses input lines, extracts parameters, constructs
 * the regex, and reports whether the target string matches.
 *
 * @param {string[]} inputLines - An array of strings representing the raw input data.
 *                                The expected format is:
 *                                - First line: Two space-separated integers (e.g., "3 4").
 *                                - Second line: The string to be subjected to validation.
 */
function validateStringFormat(inputLines) {
    // Section A: Initial Input Data Pre-processing and Validation
    if (!Array.isArray(inputLines) || inputLines.length < 2) {
        console.error("Error: Insufficient input data provided. Expected at least two lines for processing.");
        return; // Terminate execution if the input structure is fundamentally incorrect.
    }

    const firstLineContent = inputLines[0];
    const targetCandidateString = inputLines[1];

    // Section B: Extracting Numerical Parameters from the First Line
    // Using a regex for split to gracefully handle potential multiple spaces.
    const numericalParts = firstLineContent.split(/\s+/);

    if (numericalParts.length !== 2) {
        console.error("Error: The first input line must contain exactly two space-separated numerical values.");
        return;
    }

    const firstLengthValue = parseInt(numericalParts[0], 10);
    const secondLengthValue = parseInt(numericalParts[1], 10);

    // Section C: Further Validation of Extracted Numerical Values
    if (isNaN(firstLengthValue) || isNaN(secondLengthValue) || firstLengthValue <= 0 || secondLengthValue <= 0) {
        console.error("Error: Both segment lengths extracted from the first line must be positive integers.");
        return;
    }

    // Section D: Dynamic Pattern Generation using the Helper Function
    const requiredPatternString = createLengthBasedPatternString(firstLengthValue, secondLengthValue);
    const dynamicRegex = new RegExp(requiredPatternString);

    // Section E: Performing the Validation Check on the Target String
    let isMatchFound = false; // A boolean flag to store the outcome of the regex test.

    if (targetCandidateString && typeof targetCandidateString === 'string') {
        isMatchFound = dynamicRegex.test(targetCandidateString);
    } else {
        // Log a warning if the target string is invalid and assume no match.
        console.warn("Warning: The target string provided for validation is not a valid string type. Assuming no match.");
        isMatchFound = false;
    }

    // Section F: Reporting the Final Outcome
    let outcomeMessage;
    if (isMatchFound) {
        outcomeMessage = "Yes";
    } else {
        outcomeMessage = "No";
    }
    console.log(outcomeMessage);
}

// Main execution block: This part reads data from standard input,
// cleans it, and then passes it to the primary validation function.
try {
    const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");
    // Clean and split the input into an array of lines.
    const cleanedInputLines = rawSystemInput.trim().split("\n");
    validateStringFormat(cleanedInputLines);
} catch (ioError) {
    // Catch and report any errors encountered during file system operations.
    console.error("Failed to read input from /dev/stdin:", ioError.message);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
}