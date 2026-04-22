// This module provides file system utilities for interacting with the operating system.
const fileSystemUtility = require("fs");

// Define a constant for the standard input file path, which is commonly used in competitive programming.
const STANDARD_INPUT_PATH = "/dev/stdin";

/**
 * Attempts to read the entire content of a file synchronously.
 * This function handles potential file system errors gracefully.
 *
 * @param {string} sourceFilePath - The complete path to the file that needs to be read.
 * @returns {string | null} The content of the file as a UTF-8 string, or null if an error occurred during reading.
 */
function acquireFileContent(sourceFilePath) {
    try {
        // Execute a synchronous read operation on the specified file.
        // The 'utf8' encoding ensures the content is returned as a readable string.
        const fileBuffer = fileSystemUtility.readFileSync(sourceFilePath, "utf8");
        return fileBuffer;
    } catch (errorReadingFile) {
        // If an error is caught during the file read, log it to the console for debugging purposes.
        console.error(`ERROR: Failed to retrieve data from the specified source: ${errorReadingFile.message}`);
        // Return null to explicitly indicate that the file content could not be obtained.
        return null;
    }
}

/**
 * Processes a raw string of input data, extracting and validating potential numeric tokens.
 * It filters out non-numeric entries, empty strings, and negative values.
 *
 * @param {string} rawDataString - The raw string data, expected to contain space-separated tokens.
 * @returns {number[]} An array containing only the valid, non-negative numeric values extracted from the input.
 */
function parseAndFilterNumericInput(rawDataString) {
    // Implement a guard clause for null or empty input strings to prevent further processing errors.
    if (!rawDataString) {
        console.warn("WARNING: No raw input data provided for parsing. Returning empty array.");
        return [];
    }

    // Split the entire input string by one or more whitespace characters to get individual tokens.
    const allTokens = rawDataString.split(/\s+/);
    const validNumericValues = []; // Initialize an array to store successfully parsed numbers.

    // Iterate over each token obtained from the splitting operation.
    for (const currentToken of allTokens) {
        // Remove leading/trailing whitespace from the current token.
        const trimmedToken = currentToken.trim();

        // Skip tokens that become empty after trimming, as they don't represent meaningful data.
        if (trimmedToken === "") {
            continue;
        }

        // Attempt to convert the trimmed token into a floating-point number.
        const parsedNumber = Number(trimmedToken);

        // Validate if the conversion resulted in a legitimate, finite number.
        // isNaN checks if it's "Not a Number", isFinite checks for Infinity/-Infinity.
        if (!isNaN(parsedNumber) && isFinite(parsedNumber)) {
            // Add an additional validation: ensure the weight is not negative.
            if (parsedNumber >= 0) {
                validNumericValues.push(parsedNumber); // Store the valid numeric value.
            } else {
                // Inform the user about negative weights being skipped.
                console.warn(`NOTICE: Skipping invalid negative weight value: "${trimmedToken}"`);
            }
        } else {
            // Log a warning for tokens that could not be interpreted as valid numbers.
            console.warn(`NOTICE: Discarding non-numeric or invalid data fragment: "${trimmedToken}"`);
        }
    }
    return validNumericValues; // Return the array of valid numbers.
}

// Define constants for the upper weight limits (in kilograms) for each boxing category.
// These constants enhance readability and maintainability compared to magic numbers.
const MAX_WEIGHT_LIGHT_FLY = 48.0;
const MAX_WEIGHT_FLY = 51.0;
const MAX_WEIGHT_BANTAM = 54.0;
const MAX_WEIGHT_FEATHER = 57.0;
const MAX_WEIGHT_LIGHT = 60.0;
const MAX_WEIGHT_LIGHT_WELTER = 64.0;
const MAX_WEIGHT_WELTER = 69.0;
const MAX_WEIGHT_LIGHT_MIDDLE = 75.0;
const MAX_WEIGHT_MIDDLE = 81.0;
const MAX_WEIGHT_LIGHT_HEAVY = 91.0;
// Any weight above MAX_WEIGHT_LIGHT_HEAVY is classified as 'heavy'.

/**
 * Classifies a given weight into its corresponding boxing weight category.
 * This function uses an if-else if ladder for clear, sequential classification.
 *
 * @param {number} actualWeightKg - The weight in kilograms to be classified.
 * @returns {string} The name of the boxing category (e.g., 'light fly', 'heavy'), or an error string if input is invalid.
 */
function classifyBoxingWeight(actualWeightKg) {
    // Initial guard clause to handle non-numeric, NaN, or negative weight inputs.
    if (typeof actualWeightKg !== 'number' || isNaN(actualWeightKg) || actualWeightKg < 0) {
        return "INVALID_WEIGHT_INPUT"; // Return a specific error message for clarity.
    }

    let categoryIdentifier; // Declare a variable to hold the determined category name.

    // Use a series of if-else if statements to determine the category based on weight.
    // This structure replaces the original nested ternary operators, improving readability.
    if (actualWeightKg <= MAX_WEIGHT_LIGHT_FLY) {
        categoryIdentifier = 'light fly';
    } else if (actualWeightKg <= MAX_WEIGHT_FLY) {
        categoryIdentifier = 'fly';
    } else if (actualWeightKg <= MAX_WEIGHT_BANTAM) {
        categoryIdentifier = 'bantam';
    } else if (actualWeightKg <= MAX_WEIGHT_FEATHER) {
        categoryIdentifier = 'feather';
    } else if (actualWeightKg <= MAX_WEIGHT_LIGHT) {
        categoryIdentifier = 'light';
    } else if (actualWeightKg <= MAX_WEIGHT_LIGHT_WELTER) {
        categoryIdentifier = 'light welter';
    } else if (actualWeightKg <= MAX_WEIGHT_WELTER) {
        categoryIdentifier = 'welter';
    } else if (actualWeightKg <= MAX_WEIGHT_LIGHT_MIDDLE) {
        categoryIdentifier = 'light middle';
    } else if (actualWeightKg <= MAX_WEIGHT_MIDDLE) {
        categoryIdentifier = 'middle';
    } else if (actualWeightKg <= MAX_WEIGHT_LIGHT_HEAVY) {
        categoryIdentifier = 'light heavy';
    } else {
        // If the weight exceeds all defined maximums, it falls into the 'heavy' category.
        categoryIdentifier = 'heavy';
    }

    return categoryIdentifier; // Return the determined category.
}

/**
 * A simple utility function to output a given message to the standard console.
 * This abstraction allows for easy modification of output behavior if needed.
 *
 * @param {string} messageToDisplay - The string message to be printed to the console.
 */
function emitResultToConsole(messageToDisplay) {
    console.log(messageToDisplay);
}

/**
 * Orchestrates the entire weight classification process:
 * 1. Reads raw input from a predefined source.
 * 2. Parses and filters this input to obtain valid numeric weights.
 * 3. Classifies each valid weight into a boxing category.
 * 4. Outputs each classification result to the console.
 * Includes error handling and informative messages for different scenarios.
 */
function executeWeightClassificationProcess() {
    // Step 1: Acquire the raw data from the standard input path.
    const rawInputData = acquireFileContent(STANDARD_INPUT_PATH);

    // Guard clause: If file reading failed, terminate the process and inform the user.
    if (rawInputData === null) {
        emitResultToConsole("PROCESS TERMINATED: Input data acquisition failed. Check file path or permissions.");
        return;
    }

    // Step 2: Parse the raw data string and filter for valid numeric weights.
    const weightsToAnalyze = parseAndFilterNumericInput(rawInputData);

    // Guard clause: If no valid numeric weights were found after parsing, inform the user and terminate.
    if (weightsToAnalyze.length === 0) {
        emitResultToConsole("NO VALID WEIGHTS: No valid numeric weights were identified for classification.");
        return;
    }

    // Step 3: Iterate through each successfully parsed numeric weight.
    for (const currentWeight of weightsToAnalyze) {
        // Determine the boxing category for the current weight.
        const determinedCategory = classifyBoxingWeight(currentWeight);
        // Output the classification result to the console.
        emitResultToConsole(determinedCategory);
    }
}

// Initiate the main execution flow of the weight classification process.
executeWeightClassificationProcess();