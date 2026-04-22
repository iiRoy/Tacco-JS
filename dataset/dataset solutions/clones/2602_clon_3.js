"use strict";

// Helper function to safely process raw input lines, ensuring it's a string.
const processRawInput = (rawDataContent) => {
    if (typeof rawDataContent !== 'string') {
        // If input is not a string, it's an unexpected format.
        console.error("Invalid raw input data type received; expected string.");
        return []; // Return an empty array to prevent further errors.
    }
    // Trim leading/trailing whitespace from the entire content, then split into lines.
    return rawDataContent.trim().split("\n");
};

/**
 * Initializes a robust input stream reader from standard input.
 * This function handles file system interactions and sets up an iterable structure.
 * @returns {object} An object providing methods to fetch and inspect input lines.
 */
const setupInputStream = () => {
    // Attempt to load the Node.js 'fs' (file system) module.
    let fsModule;
    try {
        fsModule = require("fs");
    } catch (moduleLoadError) {
        // This catch block is primarily for non-Node.js environments or broken installations.
        console.error("Critical Error: Node.js 'fs' module could not be loaded.", moduleLoadError.message);
        // Fail fast if the fundamental input mechanism isn't available.
        throw new Error("Filesystem access is required but unavailable.");
    }

    // Define the path for standard input, which is consistent across Unix-like systems.
    const standardInputTarget = "/dev/stdin";
    let bufferedInputLines; // Variable to hold all lines read from stdin.

    try {
        // Read the entire content of stdin synchronously, specifying UTF-8 encoding.
        const fileData = fsModule.readFileSync(standardInputTarget, { encoding: "utf8" });
        bufferedInputLines = processRawInput(fileData);
    } catch (fileReadError) {
        // Handle potential errors during file reading (e.g., file not found, permission issues).
        console.warn(`Warning: Could not read from ${standardInputTarget}. Error: ${fileReadError.message}`);
        // In case of read failure, initialize with an empty array to allow the program to run
        // without crashing immediately, though subsequent reads will fail.
        bufferedInputLines = [];
    }

    // Construct the input stream object with its state and methods.
    const streamHandler = {
        // The array containing all lines read from the input source.
        lineStore: bufferedInputLines,
        // Pointer indicating the index of the next line to be read.
        currentReadPointer: 0,
        // The total count of lines available in the buffer.
        totalLineCount: bufferedInputLines.length,

        /**
         * Checks if there are more lines available to be fetched from the stream.
         * @returns {boolean} True if more lines exist, false otherwise.
         */
        hasMoreData: function() {
            return this.currentReadPointer < this.totalLineCount;
        },

        /**
         * Fetches the next line from the input stream and advances the read pointer.
         * @returns {string} The next available line.
         * @throws {Error} If an attempt is made to read beyond the end of the stream.
         */
        fetchNextDataLine: function() {
            if (!this.hasMoreData()) {
                // Throw a custom error for clarity when input is exhausted.
                throw new Error("InputDataExhaustedError: Attempted to read past the end of the available input.");
            }
            // Retrieve the line at the current pointer and then increment the pointer.
            const nextLine = this.lineStore[this.currentReadPointer];
            this.currentReadPointer++; // Advance the pointer.
            return nextLine;
        },

        /**
         * Optionally allows peeking at the next line without advancing the read pointer.
         * (Not strictly used in this problem, but a useful Type III addition).
         * @returns {string|null} The next line if available, otherwise null.
         */
        peekAhead: function() {
            if (!this.hasMoreData()) {
                return null;
            }
            return this.lineStore[this.currentReadPointer];
        },

        /**
         * Resets the read pointer to the beginning of the input stream.
         * (Useful for multi-pass processing, though not required for this problem).
         */
        rewindStream: function() {
            this.currentReadPointer = 0;
        }
    };
    return streamHandler;
};

// Global instance of our input stream handler.
const mainInputIterator = setupInputStream();

// --- Input Parsing Helper Functions ---

/**
 * Retrieves the next line as a raw string.
 * @returns {string} The next raw input line.
 */
const getNextString = () => mainInputIterator.fetchNextDataLine();

/**
 * Parses and retrieves the next line as an integer. Includes validation.
 * @returns {number} The parsed integer value. Returns 0 if parsing fails.
 */
const retrieveAndParseInteger = () => {
    const rawStringValue = mainInputIterator.fetchNextDataLine();
    // Using `Number()` for type conversion, which handles various numeric formats.
    const numericValue = Number(rawStringValue);

    if (isNaN(numericValue)) {
        // Log a warning for non-numeric input and provide a default.
        console.warn(`Input Parsing Warning: "${rawStringValue}" could not be converted to a number. Defaulting to 0.`);
        return 0;
    }
    return numericValue;
};

/**
 * Retrieves the next line and splits it into an array of strings using space as a delimiter.
 * Filters out any empty strings resulting from multiple spaces.
 * @returns {string[]} An array of strings.
 */
const getSpaceSeparatedStrings = () => {
    // Split by space and then filter out any empty strings (e.g., from "a  b" -> ["a", "", "b"]).
    return mainInputIterator.fetchNextDataLine().split(" ").filter(element => element !== "");
};

/**
 * Retrieves the next line, splits it by space, and attempts to parse each part as an integer.
 * Non-numeric parts are skipped with a warning.
 * @returns {number[]} An array of integers.
 */
const getSpaceSeparatedIntegers = () => {
    const rawParts = mainInputIterator.fetchNextDataLine().split(" ");
    const integerArrayResult = [];
    // Iterate manually to allow for individual error handling and skipping.
    for (const segment of rawParts) {
        // Skip empty segments that might arise from `split(" ")` if there are multiple spaces.
        if (segment === "") continue;

        const parsedNum = Number(segment);
        if (!isNaN(parsedNum)) {
            integerArrayResult.push(parsedNum);
        } else {
            console.warn(`Input Parsing Warning: Skipping non-numeric element "${segment}" in integer array.`);
        }
    }
    return integerArrayResult;
};

/**
 * Retrieves the next line and converts it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
const getCharacterSequence = () => mainInputIterator.fetchNextDataLine().split("");

/**
 * Checks if the input stream still has data available.
 * @returns {boolean} True if more input lines exist, false otherwise.
 */
const checkStreamAvailability = () => mainInputIterator.hasMoreData();

// --- Output Utility Function ---

/**
 * Custom output function that logs messages to the console with a specific prefix.
 * @param {...any} itemsToDisplay - One or more items to be logged.
 */
const outputToConsole = (...itemsToDisplay) => {
    const logPrefix = "[Application Output]: "; // Adding a distinguishing prefix.
    console.log(logPrefix, ...itemsToDisplay);
};

// --- Main Program Execution Logic ---

/**
 * Contains the core business logic of the application.
 * Reads an integer N and calculates the sum of numbers from 1 to N-1.
 */
const runApplicationLogic = () => {
    // Attempt to retrieve the primary input number.
    let targetNumber = retrieveAndParseInteger();

    // Type III: Add a guard clause for invalid or unexpected input values.
    if (targetNumber < 1) {
        outputToConsole("Invalid input number detected. Expected a positive integer. Exiting.");
        return; // Terminate execution if input is not suitable.
    }

    let finalSumAccumulator = 0; // Variable to store the running sum.
    let loopIterator = 1;         // Counter for the summation loop, starting from 1.

    // Type III: Rewrite the `for` loop as a `while` loop for structural variation.
    while (loopIterator < targetNumber) {
        // Intermediate variable for clarity or simply as a structural change.
        const currentValueForSum = loopIterator;
        finalSumAccumulator = finalSumAccumulator + currentValueForSum; // Equivalent to `+=`
        loopIterator = loopIterator + 1; // Increment the iterator.
    }

    // Display the final computed sum.
    outputToConsole("Calculated Sum:", finalSumAccumulator);
};

// --- Program Entry Point ---

// Type III: Wrap the main execution call in an Immediately Invoked Function Expression (IIFE)
// to create a private scope and provide a top-level error handler.
(function() {
    try {
        runApplicationLogic();
    } catch (systemExecutionError) {
        // Catch any unhandled exceptions that propagate up to the main execution block.
        console.error("An unexpected error occurred during program execution:", systemExecutionError.message);
        outputToConsole("Program terminated prematurely due to an internal error.");
        // Optionally, provide more details for debugging.
        // console.error(systemExecutionError.stack);
    }
})();