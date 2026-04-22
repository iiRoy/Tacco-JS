// This module is designed to process a single line of input data
// and determine if a derived numerical value meets or exceeds a predefined threshold.

const CRITICAL_NUMERIC_THRESHOLD = 30; // Defines the benchmark value for comparison.

/**
 * Retrieves the raw textual content from the standard input stream.
 * This function encapsulates the file system interaction.
 * @returns {string} The entire string read from the /dev/stdin file.
 */
function fetchStandardInputContent() {
    // Dynamically load the Node.js file system module for I/O operations.
    const fileSystemModuleReference = require("fs");
    // Specify the standard input file path, common in Unix-like environments.
    const stdinFilePath = "/dev/stdin";
    // Define the character encoding to ensure correct interpretation of input.
    const textEncodingFormat = "utf8";

    // Synchronously read the file content and return it.
    return fileSystemModuleReference.readFileSync(stdinFilePath, textEncodingFormat);
}

/**
 * Analyzes a given string payload to check if its numerical representation
 * is greater than or equal to a globally defined threshold.
 * @param {string} rawStringPayload The input string that needs to be evaluated.
 * @returns {string} "Affirmative" if the condition is met, "Negative" otherwise.
 */
function analyzeInputForThreshold(rawStringPayload) {
    // Step 1: Pre-process the input string by removing any leading or trailing whitespace.
    // This ensures that numerical conversion is not affected by extraneous spaces.
    const sanitizedString = rawStringPayload.trim();

    // Step 2: Convert the cleaned string into a numerical format.
    // Note: An empty string or a non-numeric string (e.g., "hello") will convert to 0 or NaN.
    const numericalInterpretation = Number(sanitizedString);

    // Step 3: Implement a guard clause to handle invalid numerical inputs.
    // If the conversion results in Not-a-Number (NaN), the input cannot satisfy the condition.
    if (isNaN(numericalInterpretation)) {
        // In such cases, the condition is definitively not met.
        return 'Negative';
    }

    // Step 4: Evaluate the numerical interpretation against the predefined threshold.
    let outcomeMessage; // Declare a variable to store the result message.
    if (numericalInterpretation >= CRITICAL_NUMERIC_THRESHOLD) {
        outcomeMessage = 'Affirmative'; // The numerical value meets or exceeds the threshold.
    } else {
        outcomeMessage = 'Negative'; // The numerical value is below the threshold.
    }

    // Step 5: Return the final determined message.
    return outcomeMessage;
}

// --- Primary Application Execution Flow ---
// This section orchestrates the sequence of operations.

// 1. Acquire the raw data from the standard input source.
const receivedDataStream = fetchStandardInputContent();

// 2. Process the acquired data to compute the definitive decision based on the threshold.
const computedResultDecision = analyzeInputForThreshold(receivedDataStream);

// 3. Output the final decision message to the standard console.
console.log(computedResultDecision);