"use strict";

/**
 * Main function to process the input and generate the grid output.
 * This function simulates a grid-based pattern generation based on two input counts.
 * @param {string} rawData - The raw input string containing numbers.
 */
function ProcessInput(rawData) {
    // Initialize a data parser utility to extract values from the input string.
    let dataParser = new DataExtractor(rawData);

    // Extract two integer values, representing counts for pattern generation.
    let countA = dataParser.getInt();
    let countB = dataParser.getInt();

    // Create a 2D array (grid) of size 100x100 to store characters.
    let gridMatrix = new Array(100);

    // Initialize the grid:
    // The first 50 rows are filled with '#' characters.
    // The next 50 rows (from index 50 to 99) are filled with '.' characters.
    for (let idx = 0; idx < 50; idx++) {
        gridMatrix[idx] = new Array(100).fill('#'); // Top half of the grid
        gridMatrix[idx + 50] = new Array(100).fill('.'); // Bottom half of the grid
    }

    // Modify the grid based on 'countA'.
    // This loop places '.' characters in the top half of the grid.
    let colPos = 1; // Starting column position
    let rowPos = 1; // Starting row position
    while (--countA > 0) { // Decrement countA and continue if it's still positive
        gridMatrix[rowPos][colPos] = '.'; // Place a '.' character at the current position
        colPos += 2; // Move two columns to the right
        // If the column position exceeds 100, reset column and move to the next row block.
        // Note: The original code has a potential bug here where 'gridMatrix' is reassigned to 1.
        // This behavior is preserved as per Type II cloning rules.
        if (colPos > 100) {
            gridMatrix = 1; // Preserving original code's behavior (potential bug)
            rowPos += 3; // Move three rows down
        }
    }

    // Reset positions for modifications based on 'countB'.
    // This loop places '#' characters in the bottom half of the grid.
    colPos = 1; // Reset column position
    rowPos = 51; // Starting row position in the bottom half
    while (--countB > 0) { // Decrement countB and continue if it's still positive
        gridMatrix[rowPos][colPos] = '#'; // Place a '#' character at the current position
        colPos += 2; // Move two columns to the right
        // If the column position exceeds 100, reset column and move to the next row block.
        // Note: The original code has a potential bug here where 'gridMatrix' is reassigned to 1.
        // This behavior is preserved as per Type II cloning rules.
        if (colPos > 100) {
            gridMatrix = 1; // Preserving original code's behavior (potential bug)
            rowPos += 3; // Move three rows down
        }
    }

    // Output the dimensions of the grid.
    console.log('100 100');

    // Iterate through each row of the grid and print it as a single string.
    for (let rowPosIter = 0; rowPosIter < 100; rowPosIter++) {
        let rowString = gridMatrix[rowPosIter].join(''); // Join characters in the row to form a string
        console.log(rowString); // Output the complete row string
    }
}

/**
 * Utility class for parsing input data from a string.
 * It splits the input into items and provides methods to retrieve them as integers or strings.
 */
class DataExtractor {
    /**
     * Constructs a new DataExtractor instance.
     * @param {string} sourceText - The raw text input to be parsed.
     */
    constructor(sourceText) {
        // Validate that the sourceText argument is provided.
        if (typeof sourceText === 'undefined') {
            throw new Error('Argument (stdin) cannot be omitted!');
        }
        // Initialize the current index for item retrieval and parse the input text.
        this.currentIndex = 0;
        // Split the input text by newlines or spaces to get individual items.
        this.parsedItems = sourceText.split(/\n|\s/);
    }

    /**
     * Retrieves the next item as an integer and advances the internal pointer.
     * @returns {number} The next integer from the parsed items.
     */
    getInt() {
        // Use unary plus operator to convert the string item to a number.
        return +this.parsedItems[this.currentIndex++];
    }

    /**
     * Retrieves an array of integers of a specified length.
     * @param {number} arrayLength - The desired length of the integer array.
     * @returns {number[]} An array containing the next 'arrayLength' integers.
     */
    getIntArray(arrayLength) {
        // Validate that arrayLength is provided.
        if (typeof arrayLength === 'undefined') {
            throw new Error('Argument (1 or more) cannot be omitted!');
        }
        // Create a new array and populate it by repeatedly calling getInt().
        let resultArray = new Array(arrayLength);
        for (let loopIndex = 0; loopIndex < arrayLength; loopIndex++) {
            resultArray[loopIndex] = this.getInt();
        }
        return resultArray;
    }

    /**
     * Retrieves the next item as a string and advances the internal pointer.
     * @returns {string} The next string from the parsed items.
     */
    getStr() {
        return this.parsedItems[this.currentIndex++];
    }

    /**
     * Retrieves an array of strings of a specified length.
     * @param {number} arrayLength - The desired length of the string array.
     * @returns {string[]} An array containing the next 'arrayLength' strings.
     */
    getStrArray(arrayLength) {
        // Validate that arrayLength is provided.
        if (typeof arrayLength === 'undefined') {
            throw new Error('Argument (1 or more) cannot be omitted!');
        }
        // Create a new array and populate it by repeatedly calling getStr().
        let resultArray = new Array(arrayLength);
        for (let loopIndex = 0; loopIndex < arrayLength; loopIndex++) {
            resultArray[loopIndex] = this.getStr();
        }
        return resultArray;
    }
}

// This block checks if the code is running in a Node.js-like environment (not a browser).
if (typeof window === "undefined") {
    // If in Node.js, read input from standard input (/dev/stdin) using the 'fs' module.
    // The input is read synchronously and decoded as UTF-8.
    // Then, the raw input is passed to the main processing function.
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
