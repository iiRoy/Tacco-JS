"use strict"; // Enforce strict JavaScript syntax and behavior

/**
 * Utility class for parsing input text into various data types.
 */
class TextInputProcessor {
    // Internal counter for tracking the current read position in the token list.
    #readPosition = 0;
    // Array holding all parsed tokens from the input string.
    #tokenSegments = [];

    /**
     * Initializes the TextInputProcessor with the raw input string.
     * @param {string} sourceContent - The raw string input to be processed.
     * @throws {Error} If no source content is provided.
     */
    constructor(sourceContent) {
        if (typeof sourceContent === 'undefined' || sourceContent === null) {
            throw new Error('Input source content must be provided for processing!');
        }
        // Split the input by any whitespace characters (including newlines)
        // .trim() ensures leading/trailing whitespace doesn't create empty tokens.
        this.#tokenSegments = sourceContent.trim().split(/\s+/);
    }

    /**
     * Reads and returns the next integer from the input stream.
     * Advances the internal read position.
     * @returns {number} The parsed integer.
     * @throws {Error} If no more tokens are available or if the token is not a valid integer.
     */
    readNextInt() {
        if (!this.hasMoreTokens()) {
            throw new Error('Attempted to read beyond end of input stream.');
        }
        const currentToken = this.#tokenSegments[this.#readPosition++];
        const parsedValue = parseInt(currentToken, 10);
        if (isNaN(parsedValue)) {
            throw new Error(`Invalid integer format encountered: "${currentToken}"`);
        }
        return parsedValue;
    }

    /**
     * Reads a specified number of integers into an array.
     * @param {number} arraySize - The number of integers to read.
     * @returns {number[]} An array containing the read integers.
     * @throws {Error} If arraySize is not a non-negative number or if not enough tokens are available.
     */
    readIntArray(arraySize) {
        if (typeof arraySize !== 'number' || arraySize < 0) {
            throw new Error('Array size must be a non-negative number.');
        }
        if (arraySize === 0) {
            return [];
        }
        const resultingArray = new Array(arraySize);
        for (let i = 0; i < arraySize; ++i) {
            resultingArray[i] = this.readNextInt();
        }
        return resultingArray;
    }

    /**
     * Checks if there are more tokens available to be read.
     * @returns {boolean} True if more tokens exist, false otherwise.
     */
    hasMoreTokens() {
        return this.#readPosition < this.#tokenSegments.length;
    }

    /**
     * Resets the internal read position to the beginning of the token stream.
     * This allows reprocessing the same input if needed.
     */
    resetStream() {
        this.#readPosition = 0;
    }
}

/**
 * Executes the core problem-solving logic.
 * Reads numerical data from the provided input string, calculates
 * the sum of positive differences between corresponding value and cost elements,
 * and prints the final result to the console.
 * @param {string} problemInput - The raw string input containing N, V values, and C values.
 */
function calculateProfit(problemInput) {
    // Initialize an input parser to handle the raw data string.
    const inputReader = new TextInputProcessor(problemInput);

    // Read the number of elements from the first token. This determines array sizes.
    const elementCount = inputReader.readNextInt();

    // Guard clause: If there are no elements or a negative count, the total profit is zero.
    // This prevents errors with empty arrays or invalid counts.
    if (elementCount <= 0) {
        console.log(0);
        return;
    }

    // Retrieve the array of individual item values.
    const itemValues = inputReader.readIntArray(elementCount);
    // Retrieve the array of corresponding item costs.
    const itemCosts = inputReader.readIntArray(elementCount);

    let accumulatedProfit = 0; // Variable to store the sum of positive profits.

    // Iterate through the items to calculate the net profit for each.
    // We assume itemValues and itemCosts are of the same length, 'elementCount'.
    for (let index = 0; index < elementCount; ++index) {
        const currentValue = itemValues[index];
        const currentCost = itemCosts[index];

        // Calculate the difference for the current item.
        // A positive difference indicates a potential profit.
        const difference = currentValue - currentCost;

        // If the difference is positive, it contributes to the total profit.
        if (difference > 0) {
            accumulatedProfit += difference;
        }
    }

    // Output the final calculated accumulated profit to standard output.
    console.log(accumulatedProfit);
}

// Entry point for execution, typically in a Node.js environment.
// Checks if 'window' object is undefined, indicating a server-side (Node.js) context.
if (typeof window === "undefined") {
    try {
        // Attempt to read input from standard input (/dev/stdin) using Node.js fs module.
        const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
        // Execute the main calculation function with the read content.
        calculateProfit(fileContent);
    } catch (error) {
        // Log any errors that occur during file reading or processing.
        console.error("An error occurred during program execution:", error.message);
        // In a production environment, you might want to exit with a non-zero status code:
        // process.exit(1);
    }
}