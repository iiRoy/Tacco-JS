// Module for processing raw text input and determining a specific string component based on comparison rules.

/**
 * Executes the primary logic to identify a particular string component from a given input.
 * The function expects a single line of text containing at least three space-separated segments.
 * It follows a specific comparison rule:
 * 1. If the first two segments are identical, the third segment is chosen.
 * 2. Otherwise (if the first two are different), it checks if the first and third segments are identical.
 * 3. If the first and third are identical, the second segment is chosen.
 * 4. As a fallback (if first is different from second, and first is different from third), the first segment is chosen.
 *
 * @param {string} sourceData - The raw input string, expected to contain at least one line.
 * @returns {string} The identified string component, or an error/default string if input is invalid.
 */
function processInputData(sourceData) {
    // Perform initial validation on the provided input data.
    if (typeof sourceData !== 'string' || sourceData.trim().length === 0) {
        // Log an error message if the input is not a valid non-empty string.
        console.error("Error: Input provided to processInputData must be a non-empty string.");
        return "ERROR_INVALID_INPUT_TYPE"; // Return a specific error string.
    }

    // Extract the very first line from the potentially multi-line input.
    const primaryLineContent = sourceData.split('\n')[0];

    // Split the extracted line into its constituent string segments using space as a delimiter.
    const stringSegments = primaryLineContent.split(' ');

    // Validate that there are enough segments for the comparison logic to proceed.
    const MINIMUM_SEGMENTS_REQUIRED = 3;
    if (stringSegments.length < MINIMUM_SEGMENTS_REQUIRED) {
        // Log an error if the number of segments is insufficient.
        console.error(`Error: Insufficient data components. Expected at least ${MINIMUM_SEGMENTS_REQUIRED}, but received ${stringSegments.length}.`);
        return "ERROR_INSUFFICIENT_COMPONENTS"; // Return a specific error string.
    }

    // Assign more descriptive variable names to the first three critical segments.
    const initialElement = stringSegments[0];
    const secondaryElement = stringSegments[1];
    const tertiaryElement = stringSegments[2];

    /**
     * Helper function to perform a robust string comparison.
     * Ensures both arguments are treated as strings and trims whitespace before comparison.
     * @param {any} valueOne - The first value to compare.
     * @param {any} valueTwo - The second value to compare.
     * @returns {boolean} True if the trimmed string representations are strictly equal, false otherwise.
     */
    const areElementsIdentical = (valueOne, valueTwo) => {
        return String(valueOne).trim() === String(valueTwo).trim();
    };

    // Declare a variable to store the final determined output.
    let determinedOutcome;

    // Begin the core decision-making logic:

    // Step 1: Check if the initial and secondary elements are identical.
    if (areElementsIdentical(initialElement, secondaryElement)) {
        // If they match, the tertiary element is the designated outcome.
        determinedOutcome = tertiaryElement;
    } else {
        // If the initial and secondary elements are different, proceed to the next comparison.

        // Step 2: Check if the initial and tertiary elements are identical.
        if (areElementsIdentical(initialElement, tertiaryElement)) {
            // If they match, the secondary element is the designated outcome.
            determinedOutcome = secondaryElement;
        } else {
            // If initial is different from secondary, AND initial is different from tertiary,
            // then the initial element itself becomes the default outcome.
            // This covers cases where all three are distinct (e.g., A B C)
            // or where secondary and tertiary are identical but different from initial (e.g., B A A).
            determinedOutcome = initialElement;
        }
    }

    // Output the final determined string component to the console.
    console.log(determinedOutcome);

    // Return the determined outcome for potential external use or testing.
    return determinedOutcome;
}

// This block handles the execution flow when the script is run directly.
// It attempts to read input from standard input and pass it to the processing function.
try {
    // Utilize Node.js's built-in 'fs' (file system) module to read data from standard input.
    // The readFileSync method is synchronous, blocking execution until input is available.
    // 'utf8' encoding is specified to handle text data correctly.
    const systemStandardInput = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoke the main data processing function with the acquired system input.
    processInputData(systemStandardInput);
} catch (executionError) {
    // Catch and handle any errors that might occur during file reading or during the function execution.
    // Log the error message to the standard error stream.
    console.error("An unhandled exception occurred during script execution:", executionError.message);
    // Exit the process with a non-zero status code to indicate an error.
    process.exit(1);
}