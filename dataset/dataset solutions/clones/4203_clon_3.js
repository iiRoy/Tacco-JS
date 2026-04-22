// This module processes input strings to determine if they contain a specific pattern.
// The pattern is related to the word "AKIHABARA" with optional 'A' characters at certain positions.

/**
 * Executes the primary logic for pattern detection based on provided textual data.
 * This function analyzes the input string to find a specific sequence of characters.
 *
 * @param {string} incomingData - The raw string data to be analyzed for the pattern.
 */
function analyzeTextData(incomingData) {
    // Guard clause: Validate the input data type and content as a structural addition.
    // This ensures robustness against unexpected input types or empty strings.
    if (typeof incomingData !== 'string' || incomingData.length === 0) {
        // In a competitive programming context, an empty or invalid string typically means no match.
        // We output "NO" and terminate the processing for this specific input.
        console.log("NO");
        return; // Exit the function early if input is invalid.
    }

    // Define the regular expression pattern as a constant for clarity and reusability.
    // The pattern searches for "KIHBR" with optional 'A' characters before 'K', after 'H', after 'B', and after 'R'.
    const desiredAkibaPattern = /A?KIHA?BA?RA?/;

    // Perform the pattern matching operation.
    // Using the 'test()' method of the regex object directly returns a boolean,
    // which simplifies the subsequent conditional logic compared to 'match()'.
    const patternSuccessfullyIdentified = desiredAkibaPattern.test(incomingData);

    // Prepare the final result message based on whether the pattern was detected.
    // This uses an explicit if/else block for verbosity, a Type III structural modification.
    let finalVerificationStatus;
    if (patternSuccessfullyIdentified) {
        finalVerificationStatus = "YES"; // The required pattern was found within the input.
    } else {
        finalVerificationStatus = "NO";  // The required pattern was not found.
    }

    // Output the determined status to the standard console.
    console.log(finalVerificationStatus);
}

// --- Input Handling and Program Execution Section ---

/**
 * A utility function designed to retrieve and preprocess standard input from the execution environment.
 * This function encapsulates the details of reading from `/dev/stdin`, a common practice in
 * competitive programming environments for JavaScript.
 *
 * @returns {string} The cleaned and trimmed string content read from standard input.
 */
function obtainProcessedStdin() {
    // Import the Node.js file system module for reading files.
    // Using 'let' to allow for potential reassignment if different FS modules were used dynamically.
    let fileSystemModule = require("fs");

    // Read all content synchronously from the standard input stream.
    // The 'utf8' encoding is specified to correctly interpret character data.
    const rawBufferContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

    // Remove any leading or trailing whitespace (like newlines) from the obtained string.
    const cleanedUpInput = rawBufferContent.trim();

    return cleanedUpInput;
}

// This block serves as the main entry point for the program's execution.
// It orchestrates the input acquisition and the core pattern analysis.
// An intermediate variable `programInputData` is used to store the input,
// demonstrating an added step in the data flow (Type III addition).
const programInputData = obtainProcessedStdin();

// Execute the main analysis function with the preprocessed input.
analyzeTextData(programInputData);