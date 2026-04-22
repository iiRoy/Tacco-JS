const fileSystemUtility = require("fs");

// --- Global Configuration and Utilities ---

// Define standard paths for input/output operations
const appInputSourcePath = "/dev/stdin";
const defaultEncoding = "utf8";
const newlineDelimiter = "\n";
const whitespaceDelimiter = " ";

// A set of constants to represent different data transformation types
const DataTransformationType = Object.freeze({
    PARSE_INT: 101,
    SPLIT_TO_STRINGS_BY_SPACE: 102,
    SPLIT_TO_INTEGERS_BY_SPACE: 104,
    SPLIT_TO_CHARS_AS_STRINGS: 106,
    SPLIT_TO_CHARS_AS_INTEGERS: 107, // Unused in this specific application, kept for potential extension
    JOIN_WITH_SPACE: 108, // Unused
    JOIN_WITH_NEWLINE: 109, // Unused
    JOIN_CONCATENATED: 110, // Unused
    RETURN_AS_IS: 999
});

// Function to log general application messages to standard output
const applicationOutputPrefix = "[APP_INFO] ";
function displayApplicationOutput(messageContent) {
    console.log(applicationOutputPrefix + messageContent);
}

// Function to log error messages to standard error, with timestamp
function recordApplicationError(errorMessage) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${errorMessage}`);
}

// --- Input Processing Layer ---

// Attempt to read raw input data from the specified source
let rawInputDataContent;
try {
    rawInputDataContent = fileSystemUtility.readFileSync(appInputSourcePath, defaultEncoding);
} catch (readError) {
    recordApplicationError(`Failed to read input from '${appInputSourcePath}': ${readError.message}`);
    // Fallback to an empty string to prevent further errors if file read fails
    rawInputDataContent = "";
}

// Clean and parse the raw input into an array of lines
const processedInputLines = rawInputDataContent.trim().split(newlineDelimiter);

// Guard against empty or invalid initial input
if (processedInputLines.length === 0 || (processedInputLines.length === 1 && processedInputLines[0] === '')) {
    recordApplicationError("No substantial input data found. Application cannot proceed.");
    displayApplicationOutput("Execution aborted due to lack of input.");
    process.exit(1); // Exit with a non-zero code to indicate an error
}

/**
 * A class designed to iterate over a collection of input lines.
 * Provides methods to check for available data and retrieve the next line.
 */
class SequentialInputReader {
    constructor(sourceLines) {
        this.inputDataCollection = sourceLines;
        this.currentReadPointer = 0;
        this.totalLineCount = sourceLines.length;

        // Log a warning if the reader is initialized with no data
        if (this.totalLineCount === 0) {
            console.warn("[WARN] InputReader initialized with an empty dataset. No data to process.");
        }
    }

    /**
     * Checks if there are more lines available to be read.
     * @returns {boolean} True if more data exists, false otherwise.
     */
    hasMoreDataAvailable() {
        return this.currentReadPointer < this.totalLineCount;
    }

    /**
     * Retrieves the next available line from the input collection.
     * Advances the internal pointer. Throws an error if no more data.
     * @returns {string} The next line of input.
     * @throws {Error} If no elements are left to read.
     */
    retrieveNextDataItem() {
        if (!this.hasMoreDataAvailable()) {
            throw new Error("InputExhaustedException: Attempted to read beyond the end of the input stream.");
        }
        const currentItem = this.inputDataCollection[this.currentReadPointer];
        this.currentReadPointer++;
        return currentItem;
    }

    /**
     * Peeks at the next available item without advancing the pointer.
     * @returns {string|undefined} The next item or undefined if no more data.
     */
    peekNextDataItem() {
        if (!this.hasMoreDataAvailable()) {
            return undefined;
        }
        return this.inputDataCollection[this.currentReadPointer];
    }
}

// Instantiate the input reader with the processed lines
const applicationInputReader = new SequentialInputReader(processedInputLines);

/**
 * A versatile utility function to transform input strings based on a specified type.
 * Includes error handling and type validation.
 * @param {string|Array} inputContent The value to be transformed.
 * @param {number} transformationCode A constant from DataTransformationType.
 * @returns {*} The transformed value, or the original input if transformation fails or is not applicable.
 */
function processValueTransformation(inputContent, transformationCode) {
    // Basic validation for null/undefined input
    if (inputContent === null || inputContent === undefined) {
        recordApplicationError("Attempted to transform null or undefined input value.");
        return ""; // Return an empty string or consider throwing an error for strictness
    }

    try {
        switch (transformationCode) {
            case DataTransformationType.PARSE_INT:
                const parsedInteger = parseInt(inputContent, 10);
                if (isNaN(parsedInteger)) {
                    recordApplicationError(`Failed to convert "${inputContent}" to an integer. Returning original string.`);
                    return inputContent; // Return original if parsing fails
                }
                return parsedInteger;

            case DataTransformationType.SPLIT_TO_STRINGS_BY_SPACE:
                // Ensure input is a string before splitting
                return String(inputContent).split(whitespaceDelimiter);

            case DataTransformationType.SPLIT_TO_INTEGERS_BY_SPACE:
                // Split by space, then map each part to a number, filtering out non-numeric values
                const parts = String(inputContent).split(whitespaceDelimiter);
                return parts.map(segment => {
                    const numVal = Number(segment);
                    return isNaN(numVal) ? null : numVal; // Use null for invalid numbers
                }).filter(val => val !== null); // Remove nulls from the array

            case DataTransformationType.SPLIT_TO_CHARS_AS_STRINGS:
                return String(inputContent).split("");

            case DataTransformationType.SPLIT_TO_CHARS_AS_INTEGERS:
                // Similar to SPLIT_TO_INTEGERS_BY_SPACE, but splits by character
                const charParts = String(inputContent).split("");
                return charParts.map(charSegment => {
                    const charNumVal = Number(charSegment);
                    return isNaN(charNumVal) ? null : charNumVal;
                }).filter(val => val !== null);

            // Additional transformation types (currently unused in Main logic but available)
            case DataTransformationType.JOIN_WITH_SPACE:
                return Array.isArray(inputContent) ? inputContent.join(whitespaceDelimiter) : String(inputContent);
            case DataTransformationType.JOIN_WITH_NEWLINE:
                return Array.isArray(inputContent) ? inputContent.join(newlineDelimiter) : String(inputContent);
            case DataTransformationType.JOIN_CONCATENATED:
                return Array.isArray(inputContent) ? inputContent.join("") : String(inputContent);

            case DataTransformationType.RETURN_AS_IS:
            default:
                return inputContent;
        }
    } catch (conversionError) {
        recordApplicationError(`An error occurred during transformation of "${inputContent}" (type: ${transformationCode}): ${conversionError.message}`);
        return inputContent; // Return original input as a safe fallback
    }
}

// --- Global Accessor Functions for Input Reader and Transformer ---

// Provides the next raw line from the input stream
function fetchNextInputLine() { return applicationInputReader.retrieveNextDataItem(); }

// Reads the next line and converts it to an integer
function acquireNextInteger() { return processValueTransformation(fetchNextInputLine(), DataTransformationType.PARSE_INT); }

// Reads the next line and splits it into an array of strings by space
function acquireNextStringArray() { return processValueTransformation(fetchNextInputLine(), DataTransformationType.SPLIT_TO_STRINGS_BY_SPACE); }

// Reads the next line, splits it by space, and converts parts to integers
function acquireNextIntegerArray() { return processValueTransformation(fetchNextInputLine(), DataTransformationType.SPLIT_TO_INTEGERS_BY_SPACE); }

// Reads the next line and splits it into an array of single characters
function acquireNextCharacterArray() { return processValueTransformation(fetchNextInputLine(), DataTransformationType.SPLIT_TO_CHARS_AS_STRINGS); }

// Checks if there's any more data left to process
function checkIfAnyMoreInput() { return applicationInputReader.hasMoreDataAvailable(); }

// --- Core Application Logic ---

/**
 * Performs a conditional calculation based on two numeric operands.
 * @param {number} primaryVal - The first operand.
 * @param {number} secondaryVal - The second operand.
 * @returns {number|string} The calculated result or an error message if inputs are invalid.
 */
function executeConditionalCalculation(primaryVal, secondaryVal) {
    // Extensive validation for calculation inputs
    if (typeof primaryVal !== 'number' || typeof secondaryVal !== 'number' || isNaN(primaryVal) || isNaN(secondaryVal)) {
        recordApplicationError(`Invalid numeric operands provided for calculation: primary=${primaryVal}, secondary=${secondaryVal}`);
        return "Error: Non-numeric values detected for calculation.";
    }

    // Critical check for modulo operation: primaryVal cannot be zero
    if (primaryVal === 0) {
        recordApplicationError("Primary operand cannot be zero for modulo operation, potential division by zero.");
        return "Error: Cannot perform operation when first value is zero.";
    }

    const moduloResult = secondaryVal % primaryVal;
    let finalCalculatedOutcome;

    // Use a ternary operator for concise conditional logic
    finalCalculatedOutcome = (moduloResult === 0) ? (primaryVal - secondaryVal) : (primaryVal + secondaryVal);

    // Add a post-calculation check or log
    if (finalCalculatedOutcome < 0) {
        console.info(`[DEBUG] Calculation yielded a negative result: ${finalCalculatedOutcome}`);
    }

    return finalCalculatedOutcome;
}


/**
 * The main entry point for the application's core logic.
 * Orchestrates input reading, data processing, and output.
 */
function runApplicationCore() {
    // Retrieve the first line of input, expected to be two integers
    const initialNumericParameters = acquireNextIntegerArray();

    // Guard clause: Ensure enough parameters were read
    if (!initialNumericParameters || initialNumericParameters.length < 2) {
        recordApplicationError("Insufficient numeric parameters provided in the first input line. Expected at least two.");
        displayApplicationOutput("Operation terminated: Insufficient input data.");
        return; // Exit the function early
    }

    const firstNumericalOperand = initialNumericParameters[0];
    const secondNumericalOperand = initialNumericParameters[1];

    // Additional type validation to ensure operands are indeed numbers after conversion
    if (typeof firstNumericalOperand !== 'number' || typeof secondNumericalOperand !== 'number' ||
        isNaN(firstNumericalOperand) || isNaN(secondNumericalOperand)) {
        recordApplicationError(`Detected non-numeric values after initial parsing: P1=${firstNumericalOperand}, P2=${secondNumericalOperand}.`);
        displayApplicationOutput("Operation failed: Input values are not valid numbers.");
        return;
    }

    // Execute the main calculation logic
    const finalComputationResult = executeConditionalCalculation(firstNumericalOperand, secondNumericalOperand);

    // Display the final result to the user
    displayApplicationOutput(finalComputationResult);

    // Optional: Log a message if there are unprocessed input lines
    if (checkIfAnyMoreInput()) {
        console.info("[INFO] Additional input lines were detected but not processed by this application run.");
    }
}

// --- Application Execution Block ---

// Use an Immediately Invoked Function Expression (IIFE) to encapsulate the main execution flow
// and provide a top-level error handler for the entire application.
(function initializeAndExecuteApp() {
    try {
        runApplicationCore();
    } catch (unhandledException) {
        recordApplicationError(`An unexpected and unhandled exception occurred during application runtime: ${unhandledException.message}`);
        // For detailed debugging, uncomment the following line:
        // console.error(unhandledException.stack);
        displayApplicationOutput("Application encountered a critical error and has stopped.");
        process.exit(1); // Indicate abnormal termination
    }
})();