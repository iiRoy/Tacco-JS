// Define system constants for input source and encoding.
const SYSTEM_INPUT_PATH = "/dev/stdin";
const TEXT_ENCODING_FORMAT = "utf8";
const DECREMENT_VALUE = 1; // Constant for the value to subtract during calculation.

/**
 * A utility function to safely convert a string segment into a numeric value.
 * It uses the global `Number` constructor for conversion and returns `NaN`
 * if the conversion is not successful, enabling robust error checking.
 *
 * @param {string} inputStringSegment - The string part to be converted.
 * @returns {number} The numeric representation of the string, or `NaN` if invalid.
 */
function safeParseNumericValue(inputStringSegment) {
    // Attempt to convert the string segment into a number.
    const parsedValue = Number(inputStringSegment);
    // Return the result of the conversion. `NaN` indicates a failed conversion.
    return parsedValue;
}

/**
 * Computes an adjusted sum of two given numbers.
 * Each number is first decremented by a predefined constant value
 * before their sum is calculated and returned.
 *
 * @param {number} firstOperand - The first number for the calculation.
 * @param {number} secondOperand - The second number for the calculation.
 * @returns {number} The sum of the two decremented numbers.
 */
function calculateAdjustedSum(firstOperand, secondOperand) {
    // Decrement the first operand by the constant value.
    const adjustedFirst = firstOperand - DECREMENT_VALUE;
    // Decrement the second operand by the constant value.
    const adjustedSecond = secondOperand - DECREMENT_VALUE;
    // Return the sum of the two adjusted operands.
    return adjustedFirst + adjustedSecond;
}

/**
 * The primary function orchestrating the data processing workflow.
 * It takes raw input data, validates it, parses it, performs a specific
 * arithmetic calculation, and outputs the final result.
 *
 * @param {string} rawInputDataSource - The raw string data received from an external source.
 * @returns {void} This function outputs directly to the console and does not return a value.
 */
function ExecuteDataProcessingWorkflow(rawInputDataSource) {
    // --- Input Validation: Type Check ---
    // Ensure the provided input is indeed a string before attempting further processing.
    if (typeof rawInputDataSource !== 'string') {
        console.error("ERROR: The provided input data source must be a string type.");
        return; // Halt execution for invalid input type.
    }

    // --- Data Sanitization ---
    // Remove any leading or trailing whitespace characters from the input string
    // to ensure clean and predictable parsing.
    const cleanedStringPayload = rawInputDataSource.trim();

    // --- Input Validation: Empty Check ---
    // After trimming, check if the string payload is empty. An empty string
    // indicates no meaningful data was provided.
    if (!cleanedStringPayload) {
        console.warn("WARNING: Input data is empty or contains only whitespace after trimming. No processing performed.");
        return; // Halt execution if there's no data to process.
    }

    // --- Data Parsing ---
    // Split the cleaned string into an array of individual string segments,
    // using a space character as the delimiter.
    const stringSegments = cleanedStringPayload.split(" ");

    // --- Input Validation: Segment Count ---
    // Verify that there are at least two string segments available.
    // Our specific calculation requires at least two numeric values.
    if (stringSegments.length < 2) {
        console.error("ERROR: Insufficient data segments for the required calculation. Expected at least two numeric parts.");
        return; // Halt execution if not enough segments are present.
    }

    // --- Numeric Conversion ---
    // Convert the first and second string segments into numeric values
    // using our safe parsing utility function.
    const firstNumericElement = safeParseNumericValue(stringSegments[0]);
    const secondNumericElement = safeParseNumericValue(stringSegments[1]);

    // --- Input Validation: Numeric Validity ---
    // Check if both converted elements are valid numbers (not NaN).
    // If either conversion failed, it indicates malformed input.
    if (isNaN(firstNumericElement) || isNaN(secondNumericElement)) {
        console.error("ERROR: One or more input segments could not be reliably converted into valid numbers.");
        return; // Halt execution if numeric conversion failed.
    }

    // --- Core Calculation ---
    // Perform the primary arithmetic operation using our dedicated helper function.
    const finalComputedResult = calculateAdjustedSum(firstNumericElement, secondNumericElement);

    // --- Output Result ---
    // Display the final calculated result to the standard output console.
    console.log(finalComputedResult);
}

// --- Script Entry Point ---
// This block serves as the main execution handler for the script.
// It is responsible for reading data from the file system and initiating the workflow.
try {
    // Dynamically import the Node.js 'fs' (File System) module.
    // This module provides functionalities for interacting with the file system.
    const nodeFileSystem = require("fs");

    // Read the entire content of the specified standard input file synchronously.
    // The `TEXT_ENCODING_FORMAT` constant ensures the content is interpreted correctly as a string.
    const fileContent = nodeFileSystem.readFileSync(SYSTEM_INPUT_PATH, TEXT_ENCODING_FORMAT);

    // Once the file content is successfully read, invoke the main data processing workflow.
    ExecuteDataProcessingWorkflow(fileContent);
} catch (readError) {
    // --- Error Handling: File Read ---
    // Catch any exceptions that might occur during the file reading process.
    // This could include file not found errors, permission issues, etc.
    console.error(`CRITICAL ERROR: Failed to read input file from '${SYSTEM_INPUT_PATH}'. Details:`, readError.message);
    // Optionally, an exit code could be set here to indicate failure to the operating system.
    // process.exit(1);
}