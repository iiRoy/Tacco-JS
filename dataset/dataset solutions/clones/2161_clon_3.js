// This script is designed for processing numerical input sequences from standard input,
// performing a specific calculation involving digit manipulation and carry-overs.

// Importing the necessary Node.js module for file system operations.
const fileSystemInterface = require("fs");

// Defining the standard input path as a constant for clarity and potential reusability.
const SYSTEM_INPUT_STREAM_PATH = "/dev/stdin";

/**
 * Safely retrieves and processes raw data from the system's standard input stream.
 * It reads the file, decodes it, removes leading/trailing whitespace, and then
 * segments the content into an array of individual lines.
 * @returns {Array<string>} An array where each element is a line from the input.
 *                           Returns an empty array if input is empty or an error occurs.
 */
const acquireInputDataLines = () => {
    try {
        // Read the entire content of the standard input file as a buffer.
        const rawBufferContent = fileSystemInterface.readFileSync(SYSTEM_INPUT_STREAM_PATH);
        // Convert the buffer to a UTF-8 string.
        const decodedTextContent = rawBufferContent.toString("utf8");
        // Remove any surrounding whitespace from the entire text.
        const cleanedTextContent = decodedTextContent.trim();

        // If after trimming, the content is empty, return an empty array directly.
        // This prevents `split("\n")` from returning `[""]` for empty input.
        if (cleanedTextContent.length === 0) {
            return [];
        }
        // Split the cleaned text into an array of lines based on newline characters.
        return cleanedTextContent.split("\n");
    } catch (readOperationError) {
        // In case of any error during file reading (e.g., file not found, permission issues),
        // log the error details and return an empty array to allow the program to continue
        // gracefully, albeit without input.
        console.error(`ERROR: Failed to read from standard input. Reason: ${readOperationError.message}`);
        return [];
    }
};

// Immediately execute the input acquisition and store the result.
const receivedRawInput = acquireInputDataLines();

/**
 * An advanced iterator class providing sequential access to an array of data strings.
 * It encapsulates the state of iteration (current position, total elements).
 */
class InputSequenceNavigator {
    #elementCollection;     // Private field: Stores the array of strings to be iterated.
    #currentElementIndex;   // Private field: Tracks the current zero-based index.
    #totalElementCount;     // Private field: Stores the total number of elements in the collection.

    /**
     * Constructs a new InputSequenceNavigator instance.
     * @param {Array<string>} dataElements - The array of string data elements to navigate.
     */
    constructor(dataElements) {
        // Robustness check: ensure the input is an array. If not, initialize with an empty array.
        if (!Array.isArray(dataElements)) {
            console.warn("InputSequenceNavigator initialized with non-array data. Using an empty collection.");
            this.#elementCollection = [];
        } else {
            this.#elementCollection = dataElements;
        }
        this.#currentElementIndex = 0; // Start iteration from the first element.
        this.#totalElementCount = this.#elementCollection.length; // Cache the total count.
    }

    /**
     * Determines if there are more elements available for retrieval in the sequence.
     * @returns {boolean} `true` if `retrieveNextElement()` can be called, `false` otherwise.
     */
    hasFurtherElements() {
        return this.#currentElementIndex < this.#totalElementCount;
    }

    /**
     * Retrieves the next available element from the sequence and advances the internal pointer.
     * Throws a custom error if no more elements are present, ensuring explicit handling of end-of-sequence.
     * @returns {string} The next string element in the sequence.
     * @throws {Error} If attempting to retrieve an element beyond the end of the sequence.
     */
    retrieveNextElement() {
        if (!this.hasFurtherElements()) {
            throw new Error("SEQUENCE_EXHAUSTION_ERROR: Attempted to access element beyond end of sequence.");
        }
        // Retrieve the element at the current index, then increment the index for the next call.
        const elementToReturn = this.#elementCollection[this.#currentElementIndex];
        this.#currentElementIndex++;
        return elementToReturn;
    }

    /**
     * Resets the navigator's internal pointer to the beginning of the sequence,
     * allowing re-iteration from the start.
     */
    resetNavigation() {
        this.#currentElementIndex = 0;
    }

    /**
     * Returns the one-based index of the element that would be retrieved next.
     * Useful for debugging or displaying progress.
     * @returns {number} The 1-based index of the next element, or `totalElementCount + 1` if exhausted.
     */
    getUpcomingElementNumber() {
        return this.#currentElementIndex + 1;
    }
}

// Create a singleton instance of the navigator for global use across the application.
const globalInputNavigator = new InputSequenceNavigator(receivedRawInput);

/**
 * Global accessor function to fetch the next line from the input stream.
 * Simplifies calls to the navigator's `retrieveNextElement` method.
 * @returns {string} The next line of input.
 */
function fetchNextInputLine() {
    return globalInputNavigator.retrieveNextElement();
}

/**
 * Global accessor function to check for the availability of more input lines.
 * Simplifies calls to the navigator's `hasFurtherElements` method.
 * @returns {boolean} `true` if more lines exist, `false` otherwise.
 */
function checkInputAvailability() {
    return globalInputNavigator.hasFurtherElements();
}

/**
 * Displays a given message to the standard output stream.
 * This function serves as a wrapper for `console.log` for consistent output formatting.
 * @param {*} contentToDisplay - The data or message to be printed.
 */
function presentOutput(contentToDisplay) {
    console.log(contentToDisplay);
}

/**
 * Reports an error message to the standard error stream.
 * Provides a standardized prefix for all application-level error messages.
 * @param {*} errorDetails - The error information or message to be reported.
 */
function signalApplicationError(errorDetails) {
    console.error(`[RUNTIME_ERROR]: ${errorDetails}`);
}

// Define constants for various data transformation operations.
const OPERATION_PARSE_INTEGER = 1;
const OPERATION_SPLIT_BY_WHITESPACE = 2;
const OPERATION_SPLIT_AND_CONVERT_TO_NUMBERS = 4;
const OPERATION_SPLIT_INTO_CHARACTERS = 6;
const OPERATION_SPLIT_CHARS_AND_CONVERT_TO_NUMBERS = 7;
const OPERATION_JOIN_WITH_SPACES = 8;
const OPERATION_JOIN_WITH_NEWLINES = 9;
const OPERATION_JOIN_CONCATENATE = 0;
const OPERATION_TO_UPPERCASE = 100; // An additional, currently unused transformation operation.

/**
 * A versatile function to transform input data based on a specified operation mode.
 * It handles various data manipulations like parsing, splitting, and joining.
 * @param {string|Array<any>} sourceData - The data (string or array) to be transformed.
 * @param {number} operationMode - A numeric code indicating the desired transformation.
 * @returns {*} The result of the transformation, or the original data if an error occurs or mode is unknown.
 */
function dataTransformationUtility(sourceData, operationMode) {
    try {
        switch (operationMode) {
            case OPERATION_PARSE_INTEGER:
                // Parse a string to an integer with a specified radix (base 10).
                return Number.parseInt(String(sourceData), 10);
            case OPERATION_SPLIT_BY_WHITESPACE:
                // Convert to string and split by single space.
                return String(sourceData).split(" ");
            case OPERATION_SPLIT_AND_CONVERT_TO_NUMBERS:
                // Split by space, then map each part to a number.
                return String(sourceData).split(" ").map((item) => Number(item));
            case OPERATION_SPLIT_INTO_CHARACTERS:
                // Split a string into an array of individual characters.
                return String(sourceData).split("");
            case OPERATION_SPLIT_CHARS_AND_CONVERT_TO_NUMBERS:
                // Split into characters, then convert each character to a number.
                return String(sourceData).split("").map((item) => Number(item));
            case OPERATION_JOIN_WITH_SPACES:
                // Join array elements into a string, separated by spaces.
                return Array.isArray(sourceData) ? sourceData.join(" ") : String(sourceData);
            case OPERATION_JOIN_WITH_NEWLINES:
                // Join array elements into a string, separated by newlines.
                return Array.isArray(sourceData) ? sourceData.join("\n") : String(sourceData);
            case OPERATION_JOIN_CONCATENATE:
                // Join array elements into a single string without any delimiter.
                return Array.isArray(sourceData) ? sourceData.join("") : String(sourceData);
            case OPERATION_TO_UPPERCASE:
                // Convert the input string to uppercase. (New, illustrative operation)
                return String(sourceData).toUpperCase();
            default:
                // If an unrecognized operation mode is provided, log a warning and return the original data.
                console.warn(`NOTICE: Unrecognized transformation mode '${operationMode}'. Returning original data.`);
                return sourceData;
        }
    } catch (transformationIssue) {
        // Catch any errors during the transformation process, report them, and return the original data
        // to prevent application crash due to data malformation.
        signalApplicationError(`Data transformation failed for mode ${operationMode}: ${transformationIssue.message}`);
        return sourceData;
    }
}

/**
 * Implements the core logic of the application: processing a sequence of digits
 * from right to left, applying a custom carry-over rule, and summing the results.
 * This function effectively calculates the "cost" of converting a number
 * where digits 6-9 incur a carry-over penalty.
 */
function executePrimaryCalculation() {
    // Preliminary check: ensure there's at least one line of input to process.
    if (!checkInputAvailability()) {
        signalApplicationError("No input data lines were found for processing. Exiting calculation.");
        return; // Terminate execution if no input.
    }

    // Retrieve the first line of input and convert it into an array of numeric digits.
    const initialNumericString = fetchNextInputLine();
    const processedDigitSequence = dataTransformationUtility(
        initialNumericString,
        OPERATION_SPLIT_CHARS_AND_CONVERT_TO_NUMBERS
    );

    // Validate the transformed digit sequence.
    // Ensure it's an array and contains only valid numbers.
    if (!Array.isArray(processedDigitSequence) || processedDigitSequence.some(isNaN)) {
        signalApplicationError("Input sequence contains non-numeric values after initial transformation. Please check input format.");

        // Attempt to filter out invalid entries to proceed with partial data, or exit based on strictness.
        const validDigitsOnly = processedDigitSequence.filter(val => typeof val === 'number' && !isNaN(val));

        if (validDigitsOnly.length === 0) {
             presentOutput(0); // If no valid digits remain, the sum is 0.
             return;
        }
        // If some valid digits exist, proceed but warn about potential issues.
        signalApplicationError("Proceeding with a filtered sequence. Results may be incomplete or unexpected.");
        // Assign the cleaned array if strict processing is not required.
        // For this Type III clone, we'll proceed with the (potentially problematic) original array
        // and handle invalid digits inside the loop to demonstrate robustness.
    }

    let accumulatedResult = 0; // This variable will store the final computed sum.
    const sequenceLength = processedDigitSequence.length;

    /**
     * Internal helper function to manage the carry-over logic.
     * When a digit causes a carry, this function determines where the carry applies.
     * @param {number} currentDigitIndex - The index of the digit that caused the carry.
     */
    const applyCarryOperation = (currentDigitIndex) => {
        if (currentDigitIndex > 0) {
            // If not the first digit, increment the preceding digit.
            processedDigitSequence[currentDigitIndex - 1]++;
        } else {
            // If it's the first digit (most significant), the carry-over contributes directly to the total sum.
            accumulatedResult++;
        }
    };

    // Iterate through the digit sequence from the rightmost element to the leftmost.
    // This reverse iteration is crucial for correct carry-over propagation.
    for (let currentIdx = sequenceLength - 1; currentIdx >= 0; --currentIdx) {
        const digitValue = processedDigitSequence[currentIdx];

        // Robustness check: ensure the current item is a valid number.
        if (typeof digitValue !== 'number' || isNaN(digitValue)) {
            console.warn(`WARNING: Encountered invalid digit '${digitValue}' at index ${currentIdx}. Skipping this element.`);
            continue; // Skip this iteration if the value is not a valid number.
        }

        // Apply the core logic: if a digit is 6 or greater, it triggers a carry.
        if (digitValue >= 6) {
            // Add the "complement to 10" (e.g., for 6, add 4; for 9, add 1).
            accumulatedResult += (10 - digitValue);
            // Reset the current digit to 0 after its value has been accounted for and a carry generated.
            processedDigitSequence[currentIdx] = 0;
            // Execute the carry-over logic.
            applyCarryOperation(currentIdx);
        } else {
            // If the digit is less than 6, simply add its face value to the accumulated result.
            accumulatedResult += digitValue;
        }
    }

    // Display the final computed sum to the user.
    presentOutput(accumulatedResult);
}

// The main entry point for script execution.
// This line initiates the primary calculation process.
executePrimaryCalculation();