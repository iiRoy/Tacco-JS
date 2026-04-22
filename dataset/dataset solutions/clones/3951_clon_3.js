/**
 * This script processes input quantities to generate a visual grid pattern.
 * It initializes a 100x100 grid with two distinct background patterns
 * and then modifies specific cells based on the input values.
 */

/**
 * The main entry point for processing the application logic.
 * It takes raw input, parses it, manipulates a grid structure,
 * and outputs the final grid to the console.
 * @param {string} rawInputContent The complete string of input data.
 */
function initiatePatternGeneration(rawInputContent) {
    // Define the dimensions of the grid as constants for clarity and maintainability.
    const GRID_DIMENSION_SIZE = 100;
    const DIVIDING_LINE_INDEX = GRID_DIMENSION_SIZE / 2; // Marks the boundary between top and bottom halves.

    // Instantiate a dedicated utility for extracting data from the raw input string.
    let dataSource = new StreamedInputReader(rawInputContent);

    // Fetch the two primary integer values that dictate grid modifications.
    let primaryCount = dataSource.retrieveNextInteger();
    let secondaryCount = dataSource.retrieveNextInteger();

    // Create the two-dimensional array representing our display grid.
    // Initialize it with empty strings, which will be filled shortly.
    let visualGrid = Array.from({ length: GRID_DIMENSION_SIZE }, () => Array(GRID_DIMENSION_SIZE).fill(''));

    // Populate the upper section of the grid (rows 0 to 49) with the first default character.
    for (let currentGridRow = 0; currentGridRow < DIVIDING_LINE_INDEX; currentGridRow++) {
        visualGrid[currentGridRow].fill('#');
    }

    // Populate the lower section of the grid (rows 50 to 99) with the second default character.
    for (let currentGridRow = DIVIDING_LINE_INDEX; currentGridRow < GRID_DIMENSION_SIZE; currentGridRow++) {
        visualGrid[currentGridRow].fill('.');
    }

    // --- Apply modifications based on 'primaryCount' to the upper grid half ---
    // This loop places '.' characters in specific odd-numbered columns of the upper half.
    // The loop continues until one less than the primary count has been processed.
    let columnIndexForPrimary = 1; // Start at the second column (index 1) for modification.
    let rowIndexForPrimary = 1;    // Start at the second row (index 1).
    while (primaryCount > 1) { // Decrement primaryCount inside the loop, processing N-1 items.
        // Place the alternate character at the current grid position.
        visualGrid[rowIndexForPrimary][columnIndexForPrimary] = '.';
        columnIndexForPrimary += 2; // Move two columns to the right for the next placement.

        // Check if the column index has gone beyond the grid's right boundary.
        // If so, reset the column to the start and advance to the next block of rows.
        if (columnIndexForPrimary >= GRID_DIMENSION_SIZE) {
            columnIndexForPrimary = 1; // Reset column to the second position.
            rowIndexForPrimary += 3;   // Jump three rows down.
            // Safety break: if we've gone too far down into the upper half, stop.
            if (rowIndexForPrimary >= DIVIDING_LINE_INDEX) break;
        }
        primaryCount--; // Decrement the counter for processed items.
    }

    // --- Apply modifications based on 'secondaryCount' to the lower grid half ---
    // This loop places '#' characters in specific odd-numbered columns of the lower half.
    // Similar to the primary count, it processes N-1 items.
    let columnIndexForSecondary = 1; // Start at the second column (index 1) for modification.
    let rowIndexForSecondary = DIVIDING_LINE_INDEX + 1; // Start in the second row of the lower half (index 51).
    while (secondaryCount > 1) { // Decrement secondaryCount inside the loop, processing N-1 items.
        // Place the primary character at the current grid position.
        visualGrid[rowIndexForSecondary][columnIndexForSecondary] = '#';
        columnIndexForSecondary += 2; // Move two columns to the right.

        // Check if the column index has gone beyond the grid's right boundary.
        // If so, reset the column and advance to the next block of rows.
        if (columnIndexForSecondary >= GRID_DIMENSION_SIZE) {
            columnIndexForSecondary = 1; // Reset column to the second position.
            rowIndexForSecondary += 3;   // Jump three rows down.
            // Safety break: if we've gone too far down into the lower half, stop.
            if (rowIndexForSecondary >= GRID_DIMENSION_SIZE) break;
        }
        secondaryCount--; // Decrement the counter.
    }

    // First, output the dimensions of the generated grid.
    console.log(`${GRID_DIMENSION_SIZE} ${GRID_DIMENSION_SIZE}`);

    // Iterate through each row of the final grid and print its contents as a single string.
    for (let rowIterator = 0; rowIterator < GRID_DIMENSION_SIZE; rowIterator++) {
        let concatenatedRowString = visualGrid[rowIterator].join('');
        console.log(concatenatedRowString);
    }
}

/**
 * A robust utility class for sequential parsing of text data.
 * It tokenizes an input string and provides methods to retrieve
 * these tokens as various data types, advancing an internal pointer.
 */
class StreamedInputReader {
    // Private field to keep track of the current position in the token array.
    #currentReadPosition = 0;
    // Private field to store the parsed segments of the input string.
    #segmentTokens;

    /**
     * Initializes a new instance of the StreamedInputReader.
     * @param {string} sourceContent The string containing all data to be parsed.
     * @throws {Error} If the input source content is not provided or is invalid.
     */
    constructor(sourceContent) {
        if (typeof sourceContent === 'undefined' || sourceContent === null || sourceContent.trim() === '') {
            throw new Error('Initialization failed: Input content for parsing must be a non-empty string.');
        }
        // Split the source content into tokens using one or more newline or space characters as delimiters.
        this.#segmentTokens = sourceContent.split(/[\n\s]+/);
        // Filter out any empty strings that may result from multiple delimiters or leading/trailing whitespace.
        this.#segmentTokens = this.#segmentTokens.filter(token => token.length > 0);
    }

    /**
     * Retrieves the next available token as an integer.
     * Advances the internal reading pointer.
     * @returns {number} The parsed integer value. Returns NaN if parsing fails.
     */
    retrieveNextInteger() {
        // Attempt to convert the current token to a number.
        const numericValue = Number(this.#segmentTokens[this.#currentReadPosition]);
        this.#currentReadPosition++; // Move to the next token.

        // Provide a warning if the conversion results in a non-numeric value.
        if (isNaN(numericValue)) {
            console.warn(`Data parsing warning: Expected an integer but encountered a non-numeric value at index ${this.#currentReadPosition - 1}.`);
        }
        return numericValue;
    }

    /**
     * Retrieves an array of integers of a specified length from the input stream.
     * @param {number} desiredSize The number of integers to extract.
     * @returns {number[]} An array containing the extracted integers. Returns an empty array for invalid size.
     */
    fetchIntegerCollection(desiredSize) {
        if (typeof desiredSize !== 'number' || desiredSize <= 0) {
            console.error('Error: Invalid size requested for integer collection. Must be a positive number.');
            return [];
        }
        const integersCollected = [];
        for (let i = 0; i < desiredSize; i++) {
            integersCollected.push(this.retrieveNextInteger());
        }
        return integersCollected;
    }

    /**
     * Retrieves the next available token as a string.
     * Advances the internal reading pointer.
     * @returns {string} The parsed string token. Returns an empty string if no more tokens.
     */
    retrieveNextString() {
        const stringToken = this.#segmentTokens[this.#currentReadPosition];
        this.#currentReadPosition++; // Advance the pointer.

        if (typeof stringToken === 'undefined') {
            console.warn(`Data parsing warning: No more tokens available to read at index ${this.#currentReadPosition - 1}.`);
            return ''; // Return an empty string as a fallback.
        }
        return stringToken;
    }

    /**
     * Retrieves an array of strings of a specified length from the input stream.
     * @param {number} countOfStrings The number of strings to extract.
     * @returns {string[]} An array containing the extracted strings. Returns an empty array for invalid count.
     */
    fetchStringCollection(countOfStrings) {
        if (typeof countOfStrings !== 'number' || countOfStrings <= 0) {
            console.error('Error: Invalid count requested for string collection. Must be a positive number.');
            return [];
        }
        const stringsCollected = [];
        for (let i = 0; i < countOfStrings; i++) {
            stringsCollected.push(this.retrieveNextString());
        }
        return stringsCollected;
    }
}

// Self-executing anonymous function to kick off the application.
// This structure ensures that the main logic runs immediately when the script loads,
// specifically handling input from standard I/O in a Node.js environment.
(function executeApplicationOnLoad() {
    // Check if the current environment is Node.js by looking for the 'process' global object
    // and its 'versions.node' property.
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        const nodeFileSystemModule = require('fs');
        // Read all content from standard input synchronously and decode it as UTF-8.
        const stdinContent = nodeFileSystemModule.readFileSync('/dev/stdin', 'utf8');
        // Pass the read content to the primary solution function.
        initiatePatternGeneration(stdinContent);
    }
    // No explicit 'else' branch for browser environments or other contexts,
    // as this application is primarily designed for Node.js standard input.
    // A developer could add alternative input methods here for different environments.
})();