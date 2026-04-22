/*
 * This module is designed to process a string of space-separated numerical entries,
 * perform a specific logical comparison on the first two successfully parsed numbers,
 * and then output a resultant integer based on that comparison's outcome.
 *
 * The core objective is to ascertain if the numerical value of the initial datum
 * is greater than or equivalent to the numerical value of the subsequent datum.
 */

/**
 * Executes a comparative analysis on the first two valid numeric components
 * extracted from a given raw text string, and prints a corresponding indicator.
 *
 * @param {string} rawTextualInput - The unformatted input string, expected to contain
 *                                   space-separated numerical representations.
 */
function performNumericComparisonAnalysis(rawTextualInput) {
    // A constant defining the character used as a separator between individual values.
    const ELEMENT_SEPARATOR = ' ';

    // Step 1: Pre-process the input string to remove any redundant leading or trailing whitespace.
    const normalizedInputString = rawTextualInput.trim();

    // Step 2: Deconstruct the normalized string into an array of string segments
    // by using the defined separator. We also filter out any empty segments
    // that might arise from consecutive separators or edge cases.
    const stringSegments = normalizedInputString.split(ELEMENT_SEPARATOR).filter(segment => segment.length > 0);

    // Step 3: Iterate through the string segments and convert them into a collection
    // of actual integer values. Invalid entries are noted and discarded.
    const collectedNumericValues = [];
    for (const currentSegment of stringSegments) {
        // Attempt to parse the current segment into a base-10 integer.
        const convertedValue = Number.parseInt(currentSegment, 10);

        // Validate the conversion result. If it's not a number (NaN),
        // we log a warning and do not include it in our collection.
        if (!Number.isNaN(convertedValue)) {
            collectedNumericValues.push(convertedValue);
        } else {
            console.warn(`Warning: Non-numeric segment '${currentSegment}' detected. This will be excluded from processing.`);
        }
    }

    // Step 4: Determine the final outcome based on the comparison.
    // Initialize the output indicator to a default 'failure' or 'not applicable' state.
    let finalOutcomeIndicator = 0;

    // A crucial validation check: ensure there are at least two numbers available
    // to perform the intended comparison. This acts as a guard clause.
    if (collectedNumericValues.length >= 2) {
        const primaryDatum = collectedNumericValues[0]; // The first relevant number.
        const secondaryDatum = collectedNumericValues[1]; // The second relevant number.

        // Perform the core logical comparison.
        if (primaryDatum >= secondaryDatum) {
            finalOutcomeIndicator = 10; // Set indicator for a 'success' or 'true' outcome.
        } else {
            finalOutcomeIndicator = 0; // Retain default indicator for a 'failure' or 'false' outcome.
        }
    } else {
        // Inform the user if the input was insufficient for a meaningful comparison.
        console.info("Information: Insufficient valid numeric data provided for comparison. Defaulting to base outcome.");
        // The 'finalOutcomeIndicator' remains 0 in this scenario, as initialized.
    }

    // Step 5: Present the computed result to the standard output.
    console.log(finalOutcomeIndicator);
}

// This self-executing anonymous function serves as the program's primary entry point.
// It orchestrates the reading of input from the system and delegates processing.
(function initializeProgramExecution() {
    // Define the conventional path for standard input in a UNIX-like environment.
    const SYSTEM_INPUT_FILE_PATH = "/dev/stdin";

    try {
        // Utilize Node.js's file system module to synchronously read the content
        // of the standard input file. The 'utf8' encoding ensures text interpretation.
        const inputBufferContent = require('node:fs').readFileSync(SYSTEM_INPUT_FILE_PATH, "utf8");

        // Invoke the main analysis function with the content retrieved from the file.
        performNumericComparisonAnalysis(inputBufferContent);
    } catch (readingError) {
        // Should any error occur during the file reading process (e.g., file not found, permissions),
        // an error message is logged, and the application terminates with an error code.
        console.error(`FATAL ERROR: Failed to read input from '${SYSTEM_INPUT_FILE_PATH}'. Details:`, readingError.message);
        process.exit(1); // Signal an abnormal program termination.
    }
})();