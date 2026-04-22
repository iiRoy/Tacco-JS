"use strict";

/**
 * Calculates the total deviation cost for a given sequence of numbers.
 * The goal is to find a 'b' such that sum(|A[i] - (b + i + 1)|) is minimized.
 * This is achieved by finding the median of the transformed sequence B[i] = A[i] - i - 1.
 *
 * @param {string} rawDataInput - The raw input string containing numbers.
 */
function CalculateMedianAbsoluteDeviation(rawDataInput) {
    if (!rawDataInput || typeof rawDataInput !== 'string' || rawDataInput.trim().length === 0) {
        console.error("Error: Input data is empty or invalid.");
        return; // Early exit for invalid input
    }

    // Initialize a utility to parse input tokens
    const inputTokenizer = new TokenStreamReader(rawDataInput);

    // Read the size of the dataset
    const datasetSize = inputTokenizer.retrieveNextInteger();

    // Guard against invalid dataset size
    if (datasetSize <= 0) {
        console.log(0); // If no elements, cost is 0
        return;
    }

    // Read the array of original numbers
    const originalNumbers = inputTokenizer.retrieveIntegerArray(datasetSize);

    // Define a helper function for the transformation
    const transformElement = (value, index) => value - index - 1;

    // Transform the original numbers into a new sequence
    // transformedNumbers[i] = originalNumbers[i] - i - 1
    const transformedNumbers = originalNumbers.map(transformElement);

    // Sort the transformed sequence to find its median
    transformedNumbers.sort((valA, valB) => valA - valB);

    // Determine the median position. For even N, this takes the lower median index.
    const medianPosition = Math.floor(datasetSize / 2);

    // The median value from the transformed sequence determines the optimal 'b'
    const medianShiftValue = transformedNumbers[medianPosition];

    // Calculate the total deviation cost using the optimal 'b'
    let totalDeviationCost = 0;
    for (let indexPos = 0; indexPos < datasetSize; indexPos++) {
        // The value to compare against is (medianShiftValue + indexPos + 1)
        const targetValue = medianShiftValue + indexPos + 1;
        // The deviation for the current element
        const currentDeviation = Math.abs(originalNumbers[indexPos] - targetValue);
        totalDeviationCost += currentDeviation;
    }

    // Output the final calculated cost
    console.log(totalDeviationCost);
}

/**
 * A utility class to parse tokens from a raw input string.
 * It handles splitting the string into tokens and converting them to desired types.
 */
class TokenStreamReader {
    /**
     * Initializes the reader with the raw input text.
     * @param {string} rawInputText - The raw string input, typically from stdin.
     */
    constructor(rawInputText) {
        if (typeof rawInputText !== 'string' || rawInputText === null || rawInputText.trim().length === 0) {
            throw new Error('Input text for TokenStreamReader cannot be empty or non-string.');
        }
        // Split the input text by any whitespace characters (newline, space, tab)
        // .trim() ensures no leading/trailing empty tokens from extra whitespace
        this.parsedTokens = rawInputText.trim().split(/\s+/);
        this.currentReadPosition = 0; // Pointer to the next token to be read
    }

    /**
     * Checks if there are more tokens available to read.
     * @returns {boolean} True if more tokens exist, false otherwise.
     */
    hasMoreTokens() {
        return this.currentReadPosition < this.parsedTokens.length;
    }

    /**
     * Retrieves the next token as an integer.
     * Throws an error if no more tokens or if the token is not a valid integer.
     * @returns {number} The next integer token.
     */
    retrieveNextInteger() {
        if (!this.hasMoreTokens()) {
            throw new Error('No more tokens to read as integer.');
        }
        const token = this.parsedTokens[this.currentReadPosition++];
        const parsedInt = Number.parseInt(token, 10);
        if (Number.isNaN(parsedInt)) {
            throw new Error(`Expected an integer, but received: "${token}"`);
        }
        return parsedInt;
    }

    /**
     * Retrieves an array of integers of a specified count.
     * @param {number} count - The number of integers to retrieve.
     * @returns {number[]} An array of integers.
     */
    retrieveIntegerArray(count) {
        if (typeof count !== 'number' || !Number.isInteger(count) || count < 0) {
            throw new Error('Invalid count provided for retrieveIntegerArray: must be a non-negative integer.');
        }
        if (count === 0) return []; // Return empty array if count is 0

        const collectedElements = new Array(count);
        for (let elemIndex = 0; elemIndex < count; elemIndex++) {
            collectedElements[elemIndex] = this.retrieveNextInteger();
        }
        return collectedElements;
    }

    /**
     * Retrieves the next token as a string.
     * Throws an error if no more tokens.
     * @returns {string} The next string token.
     */
    retrieveNextString() {
        if (!this.hasMoreTokens()) {
            throw new Error('No more tokens to read as string.');
        }
        return this.parsedTokens[this.currentReadPosition++];
    }

    /**
     * Retrieves an array of strings of a specified count.
     * @param {number} count - The number of strings to retrieve.
     * @returns {string[]} An array of strings.
     */
    retrieveStringArray(count) {
        if (typeof count !== 'number' || !Number.isInteger(count) || count < 0) {
            throw new Error('Invalid count provided for retrieveStringArray: must be a non-negative integer.');
        }
        if (count === 0) return [];

        const collectedElements = new Array(count);
        for (let elemIndex = 0; elemIndex < count; elemIndex++) {
            collectedElements[elemIndex] = this.retrieveNextString();
        }
        return collectedElements;
    }
}

/**
 * Entry point for the application.
 * Determines the execution environment (Node.js or browser) and
 * reads input accordingly before calling the main processing function.
 */
function initializeAndRun() {
    // Check if running in a Node.js environment
    if (typeof process !== 'undefined' && process.versions != null && process.versions.node != null) {
        const fs = require("fs");
        let inputData;
        try {
            // Read from /dev/stdin for competitive programming platforms
            inputData = fs.readFileSync("/dev/stdin", "utf8");
        } catch (error) {
            // Fallback for local testing or if /dev/stdin is not available
            console.error("Could not read from /dev/stdin. Checking for command line arguments or default input.");
            // Example: Allow passing input as a command line argument for local testing
            if (process.argv.length > 2) {
                inputData = process.argv[2]; // e.g., node script.js "5\n1 2 3 4 5"
            } else {
                // Default fallback input for development/testing
                // inputData = "3\n1 2 3"; // Example default
                console.error("No input provided via /dev/stdin or command line argument. Please provide input.");
                return;
            }
        }
        CalculateMedianAbsoluteDeviation(inputData);
    } else if (typeof window !== 'undefined') {
        // Browser environment (not typical for this kind of problem, but good for completeness)
        console.warn("Running in a browser environment. Input should be provided via a global variable 'browserInput' if available.");
        if (window.browserInput) {
            CalculateMedianAbsoluteDeviation(window.browserInput);
        } else {
            console.error("No 'browserInput' global variable found. Cannot proceed.");
        }
    } else {
        console.error("Unknown execution environment. Cannot determine input source.");
    }
}

// Execute the application setup
initializeAndRun();