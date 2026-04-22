// This program determines a specific classification based on a numerical input value.
// It reads a single numeric string from standard input, attempts to parse it,
// and then applies a categorization rule based on a predefined threshold.

// Define key constants for improved clarity and easier maintenance.
const CATEGORIZATION_THRESHOLD_VALUE = 1200;
const FIRST_CLASSIFICATION_LABEL = 'ALPHA_BRAVO_CHARLIE'; // Corresponds to 'ABC'
const SECOND_CLASSIFICATION_LABEL = 'ALPHA_ROMEO_CHARLIE';   // Corresponds to 'ARC'
const INVALID_INPUT_CLASSIFICATION_LABEL = 'ERR_INVALID_DATA'; // A new category for non-numeric input
const STANDARD_INPUT_DEVICE_PATH = '/dev/stdin'; // Path to standard input stream

/**
 * Utility function to securely read content from a specified file path.
 * Includes basic error handling for file system operations.
 *
 * @param {string} sourcePath The path to the input file (e.g., /dev/stdin).
 * @returns {string | null} The trimmed content of the file, or null if an error occurred.
 */
const fetchSourceData = (sourcePath) => {
    try {
        // Dynamically import the 'fs' module for file system operations.
        const fileSystemUtility = require('fs');
        // Read the file synchronously and decode it as UTF-8.
        const rawContentBuffer = fileSystemUtility.readFileSync(sourcePath, 'utf-8');
        // Trim any leading or trailing whitespace from the acquired data.
        return rawContentBuffer.trim();
    } catch (dataAcquisitionError) {
        // Log an error if file reading fails.
        console.error(`[ERROR]: Failed to retrieve data from ${sourcePath}. Details: ${dataAcquisitionError.message}`);
        return null; // Indicate failure to the caller.
    }
};

/**
 * Core logic function that processes a potential numeric string and assigns a classification.
 * It includes validation steps for the input string.
 *
 * @param {string | null} candidateString The string potentially containing a number.
 * @returns {string} The assigned classification label.
 */
const performNumericalClassification = (candidateString) => {
    // Initial validation: check for empty or null input strings.
    if (candidateString === null || candidateString.length === 0) {
        console.warn('[WARNING]: Received an empty or null input string for classification. Assigning default invalid category.');
        return INVALID_INPUT_CLASSIFICATION_LABEL;
    }

    // Attempt to convert the input string to a number.
    // Using the unary plus operator for type conversion, which is equivalent to Number().
    const processedNumericalValue = +candidateString;

    // Validate if the conversion resulted in a valid number.
    if (isNaN(processedNumericalValue)) {
        console.warn(`[WARNING]: Input "${candidateString}" could not be interpreted as a valid number. Assigning default invalid category.`);
        return INVALID_INPUT_CLASSIFICATION_LABEL;
    }

    // Apply the classification rule using a ternary operator for conciseness.
    // The comparison determines which label to return.
    const finalAssignedLabel = (processedNumericalValue < CATEGORIZATION_THRESHOLD_VALUE)
        ? FIRST_CLASSIFICATION_LABEL
        : SECOND_CLASSIFICATION_LABEL;

    // Optional: Log intermediate results for debugging purposes.
    // console.debug(`[DEBUG]: Input: "${candidateString}", Parsed Value: ${processedNumericalValue}, Label: ${finalAssignedLabel}`);

    return finalAssignedLabel;
};

/**
 * The main execution orchestrator for the program.
 * It coordinates input fetching, processing, and output display.
 */
const orchestrateProgramExecution = () => {
    // Step 1: Acquire the raw input data from the standard input path.
    const acquiredRawInput = fetchSourceData(STANDARD_INPUT_DEVICE_PATH);

    // Step 2: Perform the numerical classification based on the acquired input.
    const resultantClassification = performNumericalClassification(acquiredRawInput);

    // Step 3: Output the final classification to the console.
    console.log(resultantClassification);
};

// Initiate the entire program sequence.
orchestrateProgramExecution();