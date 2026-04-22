"use strict";

/**
 * Orchestrates the solution for a specific string manipulation and comparison challenge.
 * This function handles input parsing, character transformations, and final determination.
 * @param {string} problemStatementData - The complete raw input data received, typically from standard input.
 */
const SolveStringChallenge = (problemStatementData) => {
    // --- Input Acquisition and Initial Preparation ---
    // First, remove any leading or trailing whitespace from the entire input block.
    // Then, segment the cleaned input into an array of individual lines.
    // A subsequent filter step ensures that only non-empty lines are considered for processing,
    // preventing issues with accidental blank lines in the input.
    const processedInputLines = problemStatementData
        .trim() // Remove peripheral whitespace (e.g., trailing newline, leading spaces)
        .split('\n') // Break the string into an array of lines based on newline characters
        .filter(lineText => lineText.length > 0); // Keep only lines that contain actual content

    // --- Input Validation and Early Exit ---
    // Implement a guard clause to ensure the input meets the minimum structural requirements.
    // This specific problem expects at least two distinct lines of character data.
    // If fewer than two valid lines are present, it indicates malformed input,
    // and we should report 'No' as the outcome, then terminate execution.
    const minimumRequiredLines = 2;
    if (processedInputLines.length < minimumRequiredLines) {
        // Log an error to stderr for diagnostic purposes.
        console.error("Error: Insufficient data lines for processing. Expected at least two lines.");
        // Output 'No' as the default or safe response for invalid input scenarios.
        console.log('No');
        return; // Halt further processing
    }

    // --- Data Extraction and Character Array Conversion ---
    // Obtain the content of the first and second valid lines.
    // Convert each line string into an array of its constituent characters.
    const charactersOfFirstSegment = Array.from(processedInputLines[0]);
    const charactersOfSecondSegment = Array.from(processedInputLines[1]);

    // --- First String Transformation Logic ---
    // Sort the characters of the first segment in ascending lexicographical order.
    // The `localeCompare` method is used for robust string comparison, ensuring correct ordering.
    // After sorting, the characters are concatenated back into a single string using `reduce`,
    // which serves as an alternative to the standard `join('')` method.
    const resultantStringA = charactersOfFirstSegment
        .sort((charOne, charTwo) => charOne.localeCompare(charTwo)) // Sort alphabetically (A-Z)
        .reduce((accumulatorString, currentCharacter) => accumulatorString + currentCharacter, ''); // Reconstruct string

    // --- Second String Transformation Logic ---
    // Sort the characters of the second segment in descending lexicographical order.
    // This is achieved by swapping the arguments in the `localeCompare` function.
    // The characters are then reassembled into a new string, again utilizing `reduce`.
    const resultantStringB = charactersOfSecondSegment
        .sort((charOne, charTwo) => charTwo.localeCompare(charOne)) // Sort reverse alphabetically (Z-A)
        .reduce((accumulatorString, currentCharacter) => accumulatorString + currentCharacter, ''); // Reconstruct string

    // --- Final Comparison and Output Decision ---
    // Perform a lexicographical comparison between the two newly formed strings.
    // The `localeCompare` method returns a value less than 0 if the reference string
    // comes before the compared string.
    const comparisonOutcome = resultantStringA.localeCompare(resultantStringB);

    // If the first transformed string lexicographically precedes the second,
    // the condition is met, and 'Yes' is printed. Otherwise, 'No' is printed.
    if (comparisonOutcome < 0) {
        console.log('Yes');
    } else {
        console.log('No');
    }
};

// --- Main Execution Block ---
// This section handles the environment-specific task of reading input from /dev/stdin
// and invoking the primary challenge solver function. A try-catch block is used
// to gracefully manage potential file system I/O errors.
const filesystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';
const inputDataEncoding = 'utf8';

try {
    // Read the entire content of the standard input file synchronously.
    const fullInputText = filesystemModule.readFileSync(standardInputFilePath, inputDataEncoding);
    // Pass the read data to our main solver function.
    SolveStringChallenge(fullInputText);
} catch (fileReadError) {
    // If an error occurs during file reading (e.g., file not found, permission issues),
    // log the error details and output 'No' as a default failure response.
    console.error(`Failed to retrieve input from ${standardInputFilePath}: ${fileReadError.message}`);
    console.log('No'); // Indicate failure for the challenge
}