// This utility module provides a structured approach for reading input from standard input
// and performing various data conversions. It's designed to be a standalone component
// for applications requiring console-based input processing.

// --- Global Input Management Initialization ---
// The primary input handler is set up once at the start of the program's execution.
const applicationInputProcessor = initializeInputController();

// --- Main Program Entry Point ---
// After setting up input, the core application logic is invoked.
executeMainProgramLogic();

// --- Input Reading Interface Functions ---

/**
 * Retrieves the next available line from the input stream and attempts to parse it as an integer.
 * It uses a dedicated conversion function to ensure type safety and proper handling.
 * @returns {number} The integer value obtained from the input.
 */
function getNextIntegerEntry() {
    // Directs the raw input line to the conversion utility, requesting integer parsing.
    return processInputDataFormat(retrieveNextLine(), InputConversionType.INTEGER);
}

/**
 * Fetches the subsequent line of input and segments it into an array of strings,
 * using a single space as the delimiter. This is suitable for lines with multiple
 * string tokens separated by spaces.
 * @returns {string[]} An array containing the individual string segments.
 */
function getNextStringCollection() {
    // Applies the conversion logic specifically for space-delimited string arrays.
    return processInputDataFormat(retrieveNextLine(), InputConversionType.STRING_ARRAY_SPACED);
}

/**
 * Reads the next line, splits it by whitespace, and then transforms each resulting
 * string segment into a numerical value. The output is an array of numbers.
 * @returns {number[]} An array of numerical values.
 */
function getNextNumericCollection() {
    // Utilizes the conversion for space-separated numerical arrays, handling parsing for each element.
    return processInputDataFormat(retrieveNextLine(), InputConversionType.NUMBER_ARRAY_SPACED);
}

/**
 * Obtains the next line from the input and breaks it down into an array where
 * each element is a single character from the original line.
 * @returns {string[]} An array of individual characters.
 */
function getNextCharacterList() {
    // Employs the conversion method designed for splitting input into a character array.
    return processInputDataFormat(retrieveNextLine(), InputConversionType.CHARACTER_ARRAY);
}

/**
 * Advances the internal input pointer and returns the raw string content of the
 * current line. This function acts as the low-level line retriever.
 * @returns {string} The raw string content of the next input line.
 * @throws {Error} Throws an error if there are no more lines available in the input source.
 */
function retrieveNextLine() {
    return applicationInputProcessor.advanceAndFetch();
}

/**
 * Provides a boolean flag indicating whether additional lines are available
 * for processing in the input stream. This helps in managing input loop conditions.
 * @returns {boolean} `true` if more input lines exist, `false` otherwise.
 */
function hasMoreInputLines() {
    return applicationInputProcessor.checkAvailability();
}

// --- Core Input Data Acquisition System ---

/**
 * Responsible for acquiring all input content from the standard input stream.
 * It reads the entire stream, trims leading/trailing whitespace, and then
 * segments it into an array of lines based on newline characters.
 * @returns {string[]} An array of strings, where each string represents a line from stdin.
 * @throws {Error} Propagates an error if reading from `/dev/stdin` encounters issues.
 */
function acquireStandardInputContent() {
    // Dynamically importing the 'fs' module for file system operations.
    const fileSystemModule = require("fs");
    // Standard path for reading from console input in Unix-like systems.
    const standardInputDevicePath = "/dev/stdin";

    try {
        // Synchronously read the entire content of the standard input device.
        const rawBuffer = fileSystemModule.readFileSync(standardInputDevicePath, "utf8");
        // Clean up the raw buffer: remove outer whitespace and split into individual lines.
        const processedLines = rawBuffer.trim().split("\n");
        return processedLines;
    } catch (readOperationError) {
        // Catches and logs any errors during the file read process, then re-throws
        // a more generic error to indicate input acquisition failure.
        logErrorMessage(`System error during input content acquisition: ${readOperationError.message}`);
        throw new Error("Input source access failed.");
    }
}

/**
 * Initializes and configures an object that acts as a controller for processing
 * sequential input lines. This controller maintains the state of the input stream,
 * including the current position and total line count, and provides methods
 * for checking availability and fetching lines.
 * @returns {object} An input state controller object.
 */
function initializeInputController() {
    const rawInputData = acquireStandardInputContent(); // First, get all lines.
    const totalAvailableLines = rawInputData.length; // Determine the total count of lines.

    // Internal helper function to perform an initial validation check on the acquired input data.
    const validateInitialInputState = () => {
        if (!Array.isArray(rawInputData) || rawInputData.length === 0) {
            logErrorMessage("Input data source is either not an array or is empty. Cannot initialize.");
            throw new Error("Critical: Malformed or empty input stream.");
        }
    };
    validateInitialInputState(); // Execute the validation check immediately.

    // The state object containing input lines, current index, and operational methods.
    const inputStateObject = {
        dataLines: rawInputData, // The complete array of input lines.
        currentLineIndex: 0,     // Index pointing to the next line to be read.
        totalLines: totalAvailableLines, // Total count of lines in the input.

        /**
         * Checks if there are more lines left to read in the input stream.
         * @returns {boolean} `true` if `currentLineIndex` is less than `totalLines`, `false` otherwise.
         */
        checkAvailability: function() {
            return this.currentLineIndex < this.totalLines;
        },

        /**
         * Retrieves the line at the `currentLineIndex`, then increments the index.
         * @returns {string} The content of the line at the current position.
         * @throws {Error} Throws an error if an attempt is made to read beyond the last line.
         */
        advanceAndFetch: function() {
            if (!this.checkAvailability()) {
                // If no more lines, signal an end-of-input condition.
                throw new Error("InputBoundsError: Attempted to read past the end of the input stream.");
            }
            const lineContent = this.dataLines[this.currentLineIndex]; // Get the line.
            this.currentLineIndex++; // Advance the pointer for the next read.
            return lineContent;
        }
    };
    return inputStateObject;
}

// --- Output and Error Reporting Utilities ---

/**
 * Displays a given message or variable content to the standard output stream.
 * Includes a check for null/undefined content to provide clearer feedback.
 * @param {*} messageContent The data or message to be printed.
 */
function displayOutputMessage(messageContent) {
    if (messageContent === null || messageContent === undefined) {
        // For clarity, indicate when output is explicitly empty or undefined.
        console.log("[OUTPUT_IS_EMPTY]");
    } else {
        console.log(messageContent);
    }
}

/**
 * Logs an error message to the standard error stream.
 * Error messages are prefixed with `[ERROR]` for easy identification in logs.
 * @param {*} errorDetails Information pertaining to the error that occurred.
 */
function logErrorMessage(errorDetails) {
    console.error(`[ERROR] ${errorDetails}`); // Standard error logging with a prefix.
}

// --- Input Conversion and Parsing Logic ---

// An enumeration-like object to clearly define different input conversion strategies.
// This improves readability and maintainability over magic numbers.
const InputConversionType = {
    INTEGER: 1,                 // Convert to a single integer.
    STRING_ARRAY_SPACED: 2,     // Split into an array of strings by spaces.
    NUMBER_ARRAY_SPACED: 4,     // Split by spaces and convert each part to a number.
    CHARACTER_ARRAY: 6          // Split into an array of individual characters.
    // Note: Other conversion types from the original code (e.g., joining arrays,
    // char array to numbers) have been removed as they are not utilized by the
    // main program logic, simplifying this utility for its specific use case.
};

/**
 * Applies a specific conversion algorithm to an input value based on a provided code.
 * This function acts as a central dispatcher for various parsing and splitting tasks.
 * @param {*} rawInput The unprocessed input value, typically a string.
 * @param {number} conversionCode An integer constant from `InputConversionType` indicating the desired format.
 * @returns {*} The converted value, or the original `rawInput` if conversion fails or the code is unknown.
 */
function processInputDataFormat(rawInput, conversionCode) {
    // A guard clause to handle null or undefined input gracefully, preventing further errors.
    if (rawInput === null || rawInput === undefined) {
        logErrorMessage("Conversion attempted on null or undefined input. Returning null.");
        return null;
    }

    let resultValue = rawInput; // Default to the original input if no specific conversion applies.

    // Using an if-else if structure for conversion logic, which can be more readable
    // than a large switch statement for a limited number of distinct cases.
    if (conversionCode === InputConversionType.INTEGER) {
        const parsedNumber = parseInt(rawInput, 10); // Attempt to parse as a base-10 integer.
        if (isNaN(parsedNumber)) {
            logErrorMessage(`Failed to parse "${rawInput}" as an integer. Returning original input.`);
            // If parsing fails, it's often safer to return the original value or throw a specific error.
            return rawInput;
        }
        resultValue = parsedNumber;
    } else if (conversionCode === InputConversionType.STRING_ARRAY_SPACED) {
        // Splits the string by a single space character into an array of strings.
        resultValue = rawInput.split(" ");
    } else if (conversionCode === InputConversionType.NUMBER_ARRAY_SPACED) {
        // Splits the string by spaces, then maps each resulting string segment to its numerical equivalent.
        resultValue = rawInput.split(" ").map(item => {
            const num = Number(item); // Convert string part to a number.
            if (isNaN(num)) {
                logErrorMessage(`Warning: Element "${item}" could not be converted to a number. Retaining as string.`);
                return item; // If conversion fails, keep the original string part.
            }
            return num;
        });
    } else if (conversionCode === InputConversionType.CHARACTER_ARRAY) {
        // Splits the string into an array of individual characters.
        resultValue = rawInput.split("");
    } else {
        // If an unrecognized conversion code is provided, log a warning and return the original input.
        logErrorMessage(`Unrecognized conversion code '${conversionCode}'. Input remains unconverted.`);
        return rawInput;
    }

    return resultValue;
}

// --- Main Application Execution Logic ---

/**
 * This function encapsulates the primary business logic of the program.
 * It reads required input values, performs a conditional calculation,
 * and then outputs the final computed result.
 */
function executeMainProgramLogic() {
    let finalCalculatedOutcome = 0; // Initialize the variable to hold the program's result.

    // Read the first line of input, expecting it to contain two space-separated numbers.
    const inputArgumentsArray = getNextNumericCollection();

    // --- Input Validation ---
    // Ensure that the input array is valid and contains at least two elements.
    if (!Array.isArray(inputArgumentsArray) || inputArgumentsArray.length < 2) {
        logErrorMessage("Insufficient or invalid numeric parameters provided on the first input line. Program termination.");
        return; // Exit the function if input is malformed.
    }

    // Extract the two primary numerical values from the input array.
    const valuePrimary = inputArgumentsArray[0]; // Corresponds to original 'N'.
    const valueSecondary = inputArgumentsArray[1]; // Corresponds to original 'M'.

    // Further validation to ensure extracted values are actual non-negative numbers.
    if (typeof valuePrimary !== 'number' || valuePrimary < 0 ||
        typeof valueSecondary !== 'number' || valueSecondary < 0) {
        logErrorMessage(`Invalid numerical inputs: Primary=${valuePrimary}, Secondary=${valueSecondary}. Expected non-negative numbers.`);
        return; // Exit if validation fails.
    }

    // --- Core Calculation Process ---
    // The calculation logic determines the outcome based on a comparison between
    // `valuePrimary` and a derived value from `valueSecondary`.

    // Calculate double the primary value for comparison.
    const doublePrimaryValue = valuePrimary * 2;

    // Conditional logic: If `doublePrimaryValue` is greater than or equal to `valueSecondary`,
    // a simpler calculation is performed.
    if (doublePrimaryValue >= valueSecondary) {
        // The outcome is half of `valueSecondary`, rounded down to the nearest integer.
        finalCalculatedOutcome = Math.floor(valueSecondary / 2);
    } else {
        // If `doublePrimaryValue` is less than `valueSecondary`, a more complex formula applies.
        // Step 1: Determine the 'excess' part of `valueSecondary` that is not covered by `doublePrimaryValue`.
        const excessSecondaryValue = valueSecondary - doublePrimaryValue;
        // Step 2: Calculate an additional contribution based on quarters of the `excessSecondaryValue`.
        // Each 'quarter' effectively adds 1 to the result for every 4 units of excess.
        const quarterBasedAddition = Math.floor(excessSecondaryValue / 4);
        // Step 3: The final outcome is the `valuePrimary` plus this calculated additional contribution.
        finalCalculatedOutcome = valuePrimary + quarterBasedAddition;
    }

    // --- Output Result ---
    // Display the final computed numerical outcome to the user via standard output.
    displayOutputMessage(finalCalculatedOutcome);
}