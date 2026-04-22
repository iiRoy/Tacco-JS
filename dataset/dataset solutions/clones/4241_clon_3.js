// Start of auxiliary utilities and input management system.
// These components are designed for efficient handling of standard input/output operations
// within a competitive programming context, focusing on robust input parsing and debugging.

const readlineModule = require('readline'); // Module for reading input line by line
const utilityModule = require('util');    // Module for deep inspection of objects for debugging

// Global variables to manage the flow of input data throughout the application.
let inputReaderInstance;      // The readline interface instance
let capturedLines = [];       // An array to temporarily store all incoming lines of input
let inputProcessor;           // An instance of the InputBufferManager class for structured input access

// Initialize the readline interface to interact with standard input and output streams.
inputReaderInstance = readlineModule.createInterface({
  input: process.stdin,  // Standard input stream
  output: process.stdout // Standard output stream (used here for consistency, not direct user interaction)
});

// Register an event listener for each line of input received from the standard input.
// Each line is appended to the 'capturedLines' array for later processing.
inputReaderInstance.on('line', (currentLine) => {
  capturedLines.push(currentLine);
});

// Register an event listener for when the input stream signals its closure.
// This typically happens after all input has been provided.
inputReaderInstance.on('close', () => {
  // Once all input lines have been successfully captured,
  // initialize the dedicated input processing system using the collected data.
  inputProcessor = new InputBufferManager(capturedLines);
  // Output a clear separator to standard error, indicating the transition from
  // input processing phase to the main program execution and output display.
  console.error('\n--- Input Processing Complete | Application Output Below ---\n');
  ExecuteCoreLogic(); // Initiate the primary application logic.
});

// --- Input Buffer Management Class ---
// This class provides an encapsulated and robust way to manage a buffered list of input lines.
// It tracks the current reading position and offers methods to safely retrieve subsequent lines.
class InputBufferManager {
    #bufferedInput; // Private field: Stores all the input lines as an array.
    #currentIndex;  // Private field: Keeps track of the current line index being processed.
    #totalLines;    // Private field: Stores the total number of lines available in the buffer.

    /**
     * Constructs an InputBufferManager instance.
     * @param {Array<string>} initialLines - An array of strings, where each string represents an input line.
     */
    constructor(initialLines) {
        // Ensure that 'initialLines' is always an array; default to an empty array if not.
        this.#bufferedInput = Array.isArray(initialLines) ? initialLines : [];
        this.#currentIndex = 0;
        this.#totalLines = this.#bufferedInput.length;
    }

    /**
     * Checks if there are more lines available to be read from the buffer.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    hasMoreContent() {
        return this.#currentIndex < this.#totalLines;
    }

    /**
     * Retrieves the next line from the buffer and advances the internal pointer.
     * Throws an error if an attempt is made to read beyond the available input.
     * @returns {string} The next available line of input.
     * @throws {Error} If no more input lines are available.
     */
    fetchNextLine() {
        if (this.hasMoreContent()) {
            return this.#bufferedInput[this.#currentIndex++];
        } else {
            // Log a critical error to standard error before throwing an exception
            // to provide immediate feedback on input exhaustion.
            console.error('FATAL ERROR: Attempted to read past the end of the input buffer.');
            throw new Error('InputBufferExhaustedException: No further input lines are available for processing.');
        }
    }
}

// --- Helper Functions for Input Retrieval and Conversion ---
// These functions provide a simplified interface for fetching and transforming input data.

/**
 * Retrieves the very next raw line of input using the global input processor.
 * @returns {string} The raw string content of the next line.
 */
function getNextLine() {
    return inputProcessor.fetchNextLine();
}

/**
 * Checks if there are any more lines remaining to be read from the input buffer.
 * @returns {boolean} True if more lines are available, false otherwise.
 */
function hasMoreLines() {
    return inputProcessor.hasMoreContent();
}

/**
 * Retrieves the next line of input and attempts to convert it into an integer.
 * @returns {number} The integer representation of the input line.
 */
function retrieveInteger() {
    return transformInputElement(getNextLine(), 1);
}

/**
 * Retrieves the next line of input and splits it into an array of strings,
 * typically based on space delimiters.
 * @returns {Array<string>} An array of strings.
 */
function retrieveStringArray() {
    return transformInputElement(getNextLine(), 2);
}

/**
 * Retrieves the next line of input, splits it by spaces, and converts each part into an integer.
 * @returns {Array<number>} An array of numbers.
 */
function retrieveIntegerArray() {
    return transformInputElement(getNextLine(), 4);
}

/**
 * Retrieves the next line of input and splits it into an array of individual characters.
 * @returns {Array<string>} An array of single-character strings.
 */
function retrieveCharacterArray() {
    return transformInputElement(getNextLine(), 6);
}

// --- Utility for Deep Cloning ---
// Provides a mechanism to create a deep copy of a given value.
// It specifically handles Set objects and uses JSON serialization for other types.
// NOTE: JSON serialization has limitations (e.g., cannot clone functions, Dates, undefined, BigInt, circular references).
function deepCopyValue(originalValue) {
    // Special handling for Set objects to ensure all elements are copied into a new Set.
    if (originalValue instanceof Set) {
        return new Set(Array.from(originalValue));
    }
    try {
        // Attempt to perform a deep copy using JSON serialization.
        // This is effective for plain objects, arrays, and primitive types.
        return JSON.parse(JSON.stringify(originalValue));
    } catch (error) {
        // If JSON serialization fails (e.g., due to non-serializable properties or circular structures),
        // log a warning and return the original value as a fallback to prevent application crash.
        logDebugMessage(`Cloning Warning: Failed to deep copy object via JSON serialization. ` +
                        `Possibly non-serializable content or circular reference detected. ` +
                        `Returning original value. Error details: ${error.message}`);
        return originalValue;
    }
}

// --- Input Transformation Function ---
// A versatile function designed to transform an input value (string or array)
// into a desired format based on a specified conversion mode.
function transformInputElement(valueToConvert, conversionMode) {
    // Ensure the input value is treated as a string for operations like 'split'.
    const stringifiedValue = String(valueToConvert);

    // Apply transformation based on the 'conversionMode'.
    if (conversionMode === 1) { // Mode 1: Convert to an integer.
        return Number.parseInt(stringifiedValue, 10); // Explicit radix 10 for safety.
    } else if (conversionMode === 2) { // Mode 2: Split string by spaces into an array of strings.
        return stringifiedValue.split(' ');
    } else if (conversionMode === 4) { // Mode 4: Split string by spaces and convert each part to a number.
        return stringifiedValue.split(' ').map(Number);
    } else if (conversionMode === 6) { // Mode 6: Split string into an array of individual characters.
        return stringifiedValue.split('');
    } else if (conversionMode === 7) { // Mode 7: Split string into characters and convert each to a number.
        return stringifiedValue.split('').map(Number);
    } else if (conversionMode === 8) { // Mode 8: Join array elements with spaces.
        // Only perform join if the input is actually an array; otherwise, return stringified value.
        return Array.isArray(valueToConvert) ? valueToConvert.join(' ') : stringifiedValue;
    } else if (conversionMode === 9) { // Mode 9: Join array elements with newline characters.
        return Array.isArray(valueToConvert) ? valueToConvert.join('\n') : stringifiedValue;
    } else if (conversionMode === 0) { // Mode 0: Join array elements without any separator.
        return Array.isArray(valueToConvert) ? valueToConvert.join('') : stringifiedValue;
    } else { // Default case: For any unknown or unhandled mode, return the value as is.
        return valueToConvert;
    }
}

// --- Output Functions ---

/**
 * Displays the final result or any specified content to the standard output.
 * This is the primary function for emitting program results.
 * @param {*} content - The data to be logged to the console.
 */
function displayResult(content) {
    console.log(content);
}

/**
 * Logs detailed debug messages to the standard error stream.
 * This function is particularly useful for inspecting complex objects during development
 * without interfering with the main program's standard output.
 * @param {*} messageContent - The content to be debugged. Can be any JavaScript value.
 */
function logDebugMessage(messageContent) {
    console.error('DEBUG INFO: ' + utilityModule.inspect(messageContent, { showHidden: false, depth: null, colors: true }));
}
// End of auxiliary utilities and input management system.

// ----------------------------------------------------------------------------------------------------

// Main application logic function.
// This function encapsulates the primary business logic and orchestrates
// the reading of input, processing, and output of results.
function ExecuteCoreLogic() {
    // Phase 1: Input Acquisition
    // Read the first line of input, which is expected to contain three integer parameters:
    // 'totalElementsCount' (N), 'initialZValue' (Z), and 'initialWValue' (W).
    let primaryParameters = retrieveIntegerArray();
    let totalElementsCount;
    let initialZValue;
    let initialWValue;

    // --- Input Validation (Guard Clause for primary parameters) ---
    // Ensure that the 'primaryParameters' array is valid and contains at least three elements.
    if (!Array.isArray(primaryParameters) || primaryParameters.length < 3) {
        logDebugMessage("Critical Error: Insufficient parameters detected in the first input line. Expected 3 integers.");
        displayResult(-1); // Output an error code to signal a critical input failure.
        return; // Terminate execution as essential input is missing.
    } else {
        // Use array destructuring assignment for clear and concise extraction of parameters.
        [totalElementsCount, initialZValue, initialWValue] = primaryParameters;
    }

    // Read the second line of input, which represents the main sequence of numbers (the 'list').
    let numericSequence = retrieveIntegerArray();

    // --- Input Validation (Guard Clause for numeric sequence) ---
    // Verify that the 'numericSequence' array is valid and not empty.
    if (!Array.isArray(numericSequence) || numericSequence.length === 0) {
        logDebugMessage("Validation Error: The provided numeric sequence (second input line) is empty or invalid.");
        displayResult(0); // Output a default value or an error signal for an invalid sequence.
        return; // Terminate execution as the main data is unusable.
    }

    // Optional: Cross-check if the declared 'totalElementsCount' matches the actual length of 'numericSequence'.
    // If there's a mismatch, log a warning and adjust 'totalElementsCount' to the actual length for robustness.
    if (numericSequence.length !== totalElementsCount) {
        logDebugMessage(`Warning: Declared element count N (${totalElementsCount}) does not match ` +
                        `actual sequence length (${numericSequence.length}). Adjusting N to actual length for processing.`);
        totalElementsCount = numericSequence.length; // Prioritize actual data length.
    }

    // Phase 3: Core Logic Execution
    let computedOutcome; // A variable to store the final calculated result.

    // Implement the core decision-making logic based on the 'totalElementsCount'.
    if (totalElementsCount === 1) {
        // Scenario 1: The sequence contains only a single element.
        // The task is to calculate the absolute difference between this sole element and 'initialWValue'.
        let soleElement = numericSequence[0]; // Access the first (and only) element.
        computedOutcome = Math.abs(soleElement - initialWValue);
    } else {
        // Scenario 2: The sequence contains two or more elements.
        // This case requires comparing two different absolute differences and selecting the maximum.

        // Sub-calculation A: Determine the absolute difference between the second-to-last and the last element.
        // Access elements using 'totalElementsCount' to correctly target the last two.
        let penultimateElement = numericSequence[totalElementsCount - 2];
        let lastElement = numericSequence[totalElementsCount - 1];
        let diffBetweenLastTwo = Math.abs(penultimateElement - lastElement);

        // Sub-calculation B: Determine the absolute difference between the last element and 'initialWValue'.
        let diffLastElementWithW = Math.abs(lastElement - initialWValue);

        // The final computed outcome for this scenario is the maximum of the two calculated differences.
        computedOutcome = Math.max(diffBetweenLastTwo, diffLastElementWithW);
    }

    // Phase 4: Output Presentation
    // Display the final calculated outcome to the standard output.
    displayResult(computedOutcome);
}