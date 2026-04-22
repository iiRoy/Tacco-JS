const outputLogger = console.log; // Renamed print to outputLogger for clearer intent

/**
 * Manages the sequential reading of lines from a multi-line string.
 * @param {string} entireContent - The full string content to be processed, typically from a file.
 * @returns {object} An object with methods to access lines.
 */
function createContentReader(entireContent) {
    // Splits the input into individual lines, removing any empty strings from trailing newlines.
    const contentRows = entireContent.split("\n").filter(line => line.length > 0);
    let currentLineIndex = 0; // Tracks the current position in the array.

    return {
        /**
         * Retrieves the next available line from the content.
         * @returns {string|null} The next line as a string, or null if no more lines are available.
         */
        retrieveNextLine: function () {
            if (currentLineIndex < contentRows.length) {
                return contentRows[currentLineIndex++];
            }
            return null; // Indicates end of content
        },
        /**
         * Checks if there are more lines left to read.
         * @returns {boolean} True if more lines exist, false otherwise.
         */
        hasMoreLines: function () {
            return currentLineIndex < contentRows.length;
        },
        /**
         * Provides the total number of lines initially loaded.
         * @returns {number} The total count of lines.
         */
        getTotalLineCount: function() {
            return contentRows.length;
        }
    };
}

// Global constants for formatting and array dimensions
const DEFAULT_PADDING_CHAR = ' ';
const FIXED_COLUMN_WIDTH = 5;
const MAX_CUMULATIVE_COLUMNS = 11; // Based on original csum array size

/**
 * Extends String prototype to replicate a string a given number of times.
 * This is an alternative to String.prototype.repeat for older environments or specific implementation needs.
 * @param {number} numReplications - The number of times to repeat the string.
 * @returns {string} The replicated string.
 */
String.prototype.replicate = function (numReplications) {
    if (numReplications <= 0) {
        return "";
    }
    // Using Array.join for a different implementation than a simple loop.
    return Array(numReplications + 1).join(this.toString());
};

/**
 * Parses a string of space-separated numbers into an array of integers.
 * Optionally applies an offset to each parsed number.
 * @param {string} textRow - The input string containing space-separated numbers.
 * @param {boolean} applyOffsetFlag - If true, decrements each number by 1.
 * @returns {number[]} An array of parsed integer values.
 */
function parseNumericLine(textRow, applyOffsetFlag) {
    if (typeof textRow !== 'string' || textRow.trim() === '') {
        // Guard clause for invalid input
        return [];
    }
    const stringTokens = textRow.split(' ');
    const valueAdjustment = applyOffsetFlag ? -1 : 0;
    
    // Using map for a more functional transformation.
    const numericalResults = stringTokens.map(token => {
        const parsedInt = parseInt(token, 10);
        // Basic validation for NaN results from parseInt
        if (isNaN(parsedInt)) {
            outputLogger(`Warning: Non-numeric token found and ignored: "${token}"`);
            return 0; // Default to 0 or handle error appropriately
        }
        return parsedInt + valueAdjustment;
    });
    return numericalResults;
}

/**
 * Generates an array of integers within a specified range.
 * @param {number} startValue - The starting integer (inclusive).
 * @param {number} endValueExclusive - The ending integer (exclusive).
 * @returns {number[]} An array containing the sequence of integers.
 */
function generateIntegerSequence(startValue, endValueExclusive) {
    if (startValue >= endValueExclusive) {
        return []; // Return empty array for invalid ranges
    }
    // Using Array.from with a callback for a concise range generation.
    return Array.from({ length: endValueExclusive - startValue }, (_, idx) => idx + startValue);
}

/**
 * Determines the larger of two given numbers.
 * @param {number} valA - The first number.
 * @param {number} valB - The second number.
 * @returns {number} The larger of the two numbers.
 */
const findMaximum = (valA, valB) => Math.max(valA, valB); // Using Math.max directly

/**
 * Determines the smaller of two given numbers.
 * @param {number} valA - The first number.
 * @param {number} valB - The second number.
 * @returns {number} The smaller of the two numbers.
 */
const findMinimum = (valA, valB) => Math.min(valA, valB); // Using Math.min directly

/**
 * Creates a comparison function suitable for sorting arrays of objects
 * based on a specified property.
 * @param {string} propertyName - The name of the property to compare.
 * @returns {function(object, object): number} A comparison function.
 */
function createObjectPropertyComparator(propertyName) {
    return (objectA, objectB) => {
        // Added checks for property existence for robustness.
        const propA = objectA ? objectA[propertyName] : undefined;
        const propB = objectB ? objectB[propertyName] : undefined;

        if (propA < propB) return -1;
        if (propA > propB) return 1;
        return 0;
    };
}

/**
 * Extends Array prototype to calculate the sum of its numeric elements.
 * @returns {number} The total sum of array elements.
 */
Array.prototype.calculateTotal = function () {
    // Using reduce for a more idiomatic way to sum array elements.
    return this.reduce((accumulator, currentElement) => {
        // Added a check to ensure only numbers are summed.
        if (typeof currentElement === 'number' && !isNaN(currentElement)) {
            return accumulator + currentElement;
        }
        outputLogger(`Warning: Non-numeric element "${currentElement}" encountered in sum calculation.`);
        return accumulator; // Skip non-numeric values
    }, 0);
};

/**
 * Extends Array prototype to format its elements into fixed-width, right-aligned strings.
 * @returns {string[]} An array of formatted strings.
 */
Array.prototype.formatPaddedStrings = function () {
    return this.map(valueToPad => {
        // Convert to string first to handle various types gracefully.
        const stringValue = String(valueToPad);
        // Create padding string and slice to ensure fixed width.
        const padding = DEFAULT_PADDING_CHAR.replicate(FIXED_COLUMN_WIDTH - stringValue.length);
        return padding + stringValue;
    });
};

/**
 * The main processing logic for handling input data batches.
 * It reads numerical matrices, calculates row and column sums, and prints formatted output.
 * @param {string} rawInputString - The entire raw input as a single string.
 */
function executeMatrixOperations(rawInputString) {
    const dataLineReader = createContentReader(rawInputString);

    // Continue processing as long as there are lines to read.
    while (dataLineReader.hasMoreLines()) {
        // Initialize an array to hold cumulative sums for columns, up to a predefined max.
        // This array is reset for each new batch.
        let cumulativeColumnTotals = new Array(MAX_CUMULATIVE_COLUMNS).fill(0);

        const rowCountStr = dataLineReader.retrieveNextLine();
        if (rowCountStr === null) {
            // Unexpected end of input, exit gracefully.
            outputLogger("End of input reached unexpectedly.");
            break;
        }

        const currentBatchSize = parseInt(rowCountStr, 10);

        // Guard clause: If batch size is 0, it signifies the end of all processing.
        if (isNaN(currentBatchSize) || currentBatchSize === 0) {
            // outputLogger("Batch size is zero or invalid, terminating processing.");
            return; // Exit the main function.
        }

        // Optional: Add a check for excessively large batch sizes to prevent memory issues.
        if (currentBatchSize < 0 || currentBatchSize > 1000) { // Example limit
            outputLogger(`Warning: Unusual batch size detected: ${currentBatchSize}. Skipping this batch.`);
            // Skip lines related to this invalid batch
            for (let skipIdx = 0; skipIdx < currentBatchSize; skipIdx++) {
                dataLineReader.retrieveNextLine(); // Consume the lines without processing
            }
            continue; // Move to the next potential batch.
        }

        // Process each row within the current batch.
        for (let rowIndex = 0; rowIndex < currentBatchSize; rowIndex++) {
            const currentDataLine = dataLineReader.retrieveNextLine();
            if (currentDataLine === null) {
                outputLogger(`Error: Expected ${currentBatchSize} rows, but input ended after ${rowIndex} rows.`);
                return; // Exit if input runs out prematurely.
            }

            // Parse the line into an array of numbers.
            const parsedRowData = parseNumericLine(currentDataLine);
            
            // Calculate the sum of the current row and append it to the row data.
            const rowSum = parsedRowData.calculateTotal();
            parsedRowData.push(rowSum);

            // Output the formatted current row.
            outputLogger(parsedRowData.formatPaddedStrings().join(''));

            // Accumulate column totals. Ensure we don't exceed our predefined max columns.
            for (let colIndex = 0; colIndex < parsedRowData.length && colIndex < MAX_CUMULATIVE_COLUMNS; colIndex++) {
                cumulativeColumnTotals[colIndex] += parsedRowData[colIndex];
            }
        }

        // After processing all rows in the batch, output the formatted cumulative column totals.
        // Use slice to get only the relevant part of the cumulative totals array,
        // then format and join for display.
        const relevantColumnTotals = cumulativeColumnTotals.slice(0, currentBatchSize + 1);
        outputLogger(relevantColumnTotals.formatPaddedStrings().join(''));
    }
}

// --- Execution Start ---
// This section reads the input file and passes it to the main processing function.
// Using 'fs' module for file system operations.
try {
    const fileSystem = require("fs"); // Using const for module import
    // Specify the input file path relative to the script or an absolute path.
    const inputFilePath = "input.txt"; 
    const fileContent = fileSystem.readFileSync(inputFilePath, "utf8");
    executeMatrixOperations(fileContent);
} catch (error) {
    outputLogger(`An error occurred during file processing: ${error.message}`);
    // Optionally, log the full stack trace for debugging.
    // console.error(error);
}