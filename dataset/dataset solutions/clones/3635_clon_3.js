// This comprehensive script is designed to process a single numerical entry
// from standard input, subsequently categorizing it based on a series of
// pre-established thresholds. It demonstrates robust input parsing and
// conditional logic for classification.

const fileSystemOperations = require('fs');

// --- Configuration Constants for Classification ---
// These values define the boundaries for assigning different categories.
const LOWER_CLASSIFICATION_THRESHOLD = 1200; // The upper limit for the first category.
const MIDDLE_CLASSIFICATION_THRESHOLD = 2800; // The upper limit for the second category.

/**
 * Assigns a specific classification string to a given numeric value.
 * This function encapsulates the core business logic of the application.
 *
 * @param {number} targetNumericValue - The numerical input to be classified.
 * @returns {string} A string representing the assigned classification (e.g., 'CLASS_A', 'CLASS_B', 'CLASS_C').
 */
function determineClassificationLabel(targetNumericValue) {
    let finalClassificationResult; // Local variable to hold the determined label.

    // Evaluate the target value against the defined thresholds.
    // The order of checks is crucial for correct categorization.
    if (targetNumericValue < LOWER_CLASSIFICATION_THRESHOLD) {
        finalClassificationResult = 'CLASS_A'; // Corresponds to 'ABC' in original logic.
    }
    else if (targetNumericValue < MIDDLE_CLASSIFICATION_THRESHOLD) {
        finalClassificationResult = 'CLASS_B'; // Corresponds to 'ARC' in original logic.
    }
    else {
        // If the value does not fall into the preceding categories, it defaults here.
        finalClassificationResult = 'CLASS_C'; // Corresponds to 'AGC' in original logic.
    }

    return finalClassificationResult;
}

// --- Application Entry Point ---
// This Immediately Invoked Function Expression (IIFE) serves as the main execution block.
(function applicationMain() {
    // Step 1: Read the raw data from the standard input stream.
    // Using an options object for clarity and specifying read flag.
    const rawInputContent = fileSystemOperations.readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });

    // Step 2: Parse the raw content.
    // Split by one or more whitespace characters and filter out any resultant empty strings.
    const processedInputSegments = rawInputContent
                                    .split(/\s+/)
                                    .filter(segment => segment.trim().length > 0);

    // Step 3: Validate the presence of input data.
    if (processedInputSegments.length === 0) {
        console.error('RUNTIME ERROR: No discernible input data was provided via stdin. Program cannot proceed.');
        process.exit(1); // Terminate with an error code.
    }

    // Step 4: Convert the first segment into a base-10 integer.
    // Using parseInt for explicit radix control.
    const principalNumericInput = parseInt(processedInputSegments[0], 10);

    // Step 5: Validate the successful conversion to a number.
    if (isNaN(principalNumericInput)) {
        console.error(`DATA PARSING ERROR: The input segment "${processedInputSegments[0]}" could not be converted to a valid integer.`);
        process.exit(1); // Terminate due to invalid data format.
    }

    // Step 6: Invoke the classification logic with the validated numeric input.
    const computedCategoryDesignation = determineClassificationLabel(principalNumericInput);

    // Step 7: Output the final result to the console, providing context.
    console.log(`The assigned program category is: ${computedCategoryDesignation}`);
})();