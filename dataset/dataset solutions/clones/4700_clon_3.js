"use strict"; // Enforce strict parsing and error handling for cleaner code.

/**
 * Utility module for file system operations.
 * This is used to read input from standard input.
 */
const fileSystemModule = require("fs");

/**
 * Establishes an input line processor to read data line by line from standard input.
 * It reads the entire input, splits it into lines, and provides methods to iterate over them.
 * @returns {object} An object with methods to access input lines and manage iteration state.
 */
const establishInputProcessor = () => {
    // Define the path for standard input.
    const standardInputPath = "/dev/stdin";

    let rawInputContent;
    try {
        // Read the entire content from standard input synchronously, decode as UTF-8,
        // remove leading/trailing whitespace, and split into an array of lines.
        rawInputContent = fileSystemModule.readFileSync(standardInputPath, "utf8").trim();
    } catch (readError) {
        // In a real application, more sophisticated error handling would be here.
        // For competitive programming, this usually assumes input exists.
        console.error("Failed to read from standard input:", readError.message);
        rawInputContent = ""; // Provide empty string to prevent further errors
    }

    // Split the raw content into individual lines. If rawInputContent was empty, this results in [''].
    const processedLines = rawInputContent.split("\n");

    /**
     * Internal state object for the line iterator.
     * Encapsulates the array of lines, the current position, and the total count.
     */
    const lineTraversalState = {
        sourceCollection: processedLines, // The array containing all input lines.
        currentPosition: 0,              // The zero-based index of the next line to be returned.
        totalLineCount: processedLines.length // The total number of lines available.
    };

    // Return an object that exposes controlled access to the lineTraversalState.
    return {
        /**
         * Checks if there are more lines available to read.
         * @returns {boolean} True if more lines exist, false otherwise.
         */
        moreInputAvailable: function () {
            // Compare the current index with the total count to determine availability.
            return this.currentPosition < this.totalLineCount;
        },

        /**
         * Retrieves the next line from the input.
         * Advances the internal line pointer.
         * @returns {string} The next line of input.
         * @throws {Error} If attempting to read beyond the available input.
         */
        fetchNextLine: function () {
            // Validate if there is an item to retrieve before accessing.
            if (!this.moreInputAvailable()) {
                // Throw a custom error indicating an attempt to access beyond bounds.
                throw new Error("InputTraversalError: Attempted to read beyond end of input stream.");
            }
            // Return the line at the current position and then increment the position.
            return this.sourceCollection[this.currentPosition++];
        }
    };
};

// Initialize the global input access utility once.
const inputAccessUtility = establishInputProcessor();

/**
 * Retrieves the next raw string line from the input stream.
 * @returns {string} The next line as a string.
 */
const fetchNextLine = () => inputAccessUtility.fetchNextLine();

/**
 * Retrieves the next line and parses it as an integer.
 * Uses radix 10 for consistent parsing.
 * @returns {number} The next line parsed as an integer.
 */
const retrieveNextInteger = () => {
    const lineContent = fetchNextLine();
    // Validate if the content is empty or non-numeric before parsing.
    if (!lineContent || !/^-?\d+$/.test(lineContent.trim())) {
        // Consider a default value or a more specific error for production code.
        console.warn(`Attempted to parse non-integer or empty string: "${lineContent}". Returning 0.`);
        return 0; // Or throw new Error("InvalidIntegerInput");
    }
    return parseInt(lineContent, 10);
};

/**
 * Retrieves the next line and splits it into an array of strings using space as a delimiter.
 * Handles potential empty lines by returning an empty array.
 * @returns {string[]} An array of strings.
 */
const obtainStringArray = () => {
    const line = fetchNextLine();
    return line ? line.split(" ") : [];
};

/**
 * Retrieves the next line, splits it into space-separated parts, and parses each part as an integer.
 * Includes a guard for non-numeric parts.
 * @returns {number[]} An array of integers.
 */
const acquireIntegerArray = () => {
    const stringParts = obtainStringArray();
    const integerArray = [];
    for (const part of stringParts) {
        const parsedValue = parseInt(part, 10);
        // Add a basic validation: ensure parsedValue is a number and not NaN.
        if (!isNaN(parsedValue)) {
            integerArray.push(parsedValue);
        } else {
            console.warn(`Skipping non-integer part in array: "${part}"`);
        }
    }
    return integerArray;
};

/**
 * Retrieves the next line and splits it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
const extractCharacterArray = () => {
    const line = fetchNextLine();
    return line ? line.split("") : [];
};

/**
 * Checks if there are more lines available in the input stream.
 * @returns {boolean} True if more input exists, false otherwise.
 */
const moreInputAvailable = () => inputAccessUtility.moreInputAvailable();

/**
 * A custom logging function to display results to the console.
 * Uses spread syntax to allow multiple arguments.
 * @param {...any} messages - One or more values to log.
 */
const outputMessage = (...messages) => console.log(...messages);

/**
 * Helper function to perform floor division.
 * @param {number} value - The number to floor.
 * @returns {number} The floored integer value.
 */
const performFloorDivision = (value) => Math.floor(value);

/**
 * The main logic execution block for the challenge.
 * Reads two integers, performs a conditional calculation, and outputs the result.
 */
const executeCoreLogic = () => {
    // Acquire the first line of integers, which should contain two values.
    const numericParameters = acquireIntegerArray();

    // Validate that exactly two parameters were provided.
    if (numericParameters.length < 2) {
        outputMessage("Error: Insufficient parameters provided. Expected 2, got", numericParameters.length);
        return; // Exit if input is invalid.
    }

    // Destructure the array into named variables for clarity.
    const parameterN = numericParameters[0];
    const parameterM = numericParameters[1];

    // Introduce an intermediate variable for a common sub-expression.
    const twiceN = 2 * parameterN;
    let finalCalculatedValue;

    // Apply the conditional logic based on the relationship between parameterM and twiceN.
    if (parameterM <= twiceN) {
        // If M is less than or equal to 2N, the result is M divided by 2, floored.
        finalCalculatedValue = performFloorDivision(parameterM / 2);
    } else {
        // Otherwise, the result is (2N + M) divided by 4, floored.
        const sumOfNAndM = twiceN + parameterM;
        finalCalculatedValue = performFloorDivision(sumOfNAndM / 4);
    }

    // Output the final computed result to the console.
    outputMessage(finalCalculatedValue);
};

// Entry point for the application.
// Encapsulate the main logic call in a try-catch block for robust execution.
try {
    executeCoreLogic();
} catch (applicationError) {
    // Log any unexpected errors that might occur during execution.
    console.error("An unexpected error occurred during application execution:", applicationError.message);
    // Optionally, output a user-friendly error message.
    outputMessage("Application encountered an error. Please check input and code.");
}