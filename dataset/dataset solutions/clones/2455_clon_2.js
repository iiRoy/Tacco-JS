"use strict"; // Enforce strict mode for better code quality and error checking

// This module provides a utility for parsing input data from a string.
var INPUT_PARSER = (function() {
    /**
     * Creates a new input parser instance.
     * @param {string} inputString - The raw input string, typically from a file.
     * @returns {DataProcessor} A new DataProcessor object.
     */
    function createParser(inputString) {
        return new DataProcessor(inputString);
    }

    /**
     * DataProcessor class handles parsing lines and values from the input.
     * @param {string} rawInput - The raw input string.
     */
    function DataProcessor(rawInput) {
        // Split the input into individual lines and remove any leading/trailing whitespace.
        this.lines = rawInput.trim().split("\n");
        // Initialize the current line index to track parsing progress.
        this.currentLineIndex = 0;
    }

    /**
     * Reads the next value from the current line, processing values from right to left.
     * @param {boolean} asString - If true, returns the value as a string; otherwise, attempts to convert to a number.
     * @returns {string|number} The parsed value.
     */
    DataProcessor.prototype.readNextValue = function(asString) {
        var lineArray = this.lines,
            lineIdx = this.currentLineIndex,
            extractedValue;

        // If the current line hasn't been tokenized into an array of values yet, do so.
        if (typeof lineArray[lineIdx] === "string") {
            lineArray[lineIdx] = lineArray[lineIdx].split(" ").reverse(); // Split by space and reverse for pop() efficiency.
        }

        // Extract the last element (which is the first in original order due to reversal).
        extractedValue = lineArray[lineIdx].pop();

        // If the current line is now empty, advance to the next line for subsequent reads.
        if (!lineArray[lineIdx].length) {
            this.currentLineIndex++;
        }

        // Return the value, either as a string or converted to a number.
        return asString ? extractedValue : +extractedValue;
    };

    /**
     * Reads an entire line and splits it into space-separated values.
     * @param {boolean} returnStrings - If true, returns values as strings; otherwise, converts them to numbers.
     * @returns {Array<string|number>} An array of parsed values from the line.
     */
    DataProcessor.prototype.readLine = function(returnStrings) {
        // Get the current line, increment the index, and split it by spaces.
        var lineParts = this.lines[this.currentLineIndex++].split(" ");
        // Return the parts, either as strings or mapped to numbers.
        return returnStrings ? lineParts : lineParts.map(item => +item);
    };

    /**
     * Reads a specified number of rows, treating each row as a space-separated list of values.
     * @param {number} numRows - The number of rows to read.
     * @param {boolean} asStrings - If true, returns values as strings; otherwise, converts them to numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of parsed values.
     */
    DataProcessor.prototype.readMatrix = function(numRows, asStrings) {
        // Extract the relevant rows and split each row into an array of strings.
        var matrixRows = this.lines.slice(this.currentLineIndex, this.currentLineIndex += numRows).map(row => row.split(" "));
        // Return the matrix, either with string values or with all elements converted to numbers.
        return asStrings ? matrixRows : matrixRows.map(row => row.map(item => +item));
    };

    /**
     * Reads a specified number of rows, treating each row as a single value.
     * @param {number} count - The number of rows to read.
     * @param {boolean} asStringArray - If true, returns values as strings; otherwise, converts them to numbers.
     * @returns {Array<string|number>} An array of parsed values, one per row.
     */
    DataProcessor.prototype.readRows = function(count, asStringArray) {
        // Extract the specified number of rows.
        var rowStrings = this.lines.slice(this.currentLineIndex, this.currentLineIndex += count);
        // Return the rows, either as strings or mapped to numbers.
        return asStringArray ? rowStrings : rowStrings.map(val => +val);
    };

    return createParser;
})();

// Initialize the input reader by reading the entire content of standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * This function constructs and evaluates a string to create the array structure.
 * @param {*} initialValue - The value to fill all elements of the array with.
 * @param {...number} dimensions - The sizes of each dimension of the array (e.g., dim1, dim2, ...).
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var args = arguments,
        argLength = args.length,
        // Start building the string for the innermost array dimension.
        arrayCreationString = "Array(args[" + --argLength + "]).fill(0).map(x=>{return " + initialValue + ";})";

    // Iteratively build the string for the outer array dimensions.
    while (--argLength) {
        arrayCreationString = "Array(args[" + argLength + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }

    // Evaluate the constructed string to create and return the multi-dimensional array.
    return eval(arrayCreationString);
}

// Define a large numeric constant to represent infinity in calculations.
var MAX_VALUE = 1000000000000000; // Represents 1e15

// Execute the main problem-solving logic and output the result to the console.
console.log(solveProblem());

/**
 * Main function to solve the problem using dynamic programming.
 * It calculates the minimum cost to traverse a sequence of heights with a skip constraint.
 * @returns {number} The minimum calculated cost.
 */
function solveProblem() {
    // Read the total number of items (N) and the maximum allowed skip (X).
    var numItems = inputReader.readNextValue();
    var maxAllowedSkip = inputReader.readNextValue();

    // Read the sequence of heights, prepending a zero for 1-based indexing convenience.
    var heights = [0].concat(inputReader.readLine());

    // Initialize a 2D dynamic programming table.
    // dynamicProgrammingTable[k][j] stores the minimum cost to reach the current item 'i',
    // where 'k' is the number of items skipped from the current position 'i' (relative to 'i-1'),
    // and 'j' is the number of items skipped from the previous position 'i-1' (relative to 'i-2').
    // The dimensions are (maxAllowedSkip + 1) x (maxAllowedSkip + 1).
    var dynamicProgrammingTable = createMultiDimArray(MAX_VALUE, 2, 2);

    // Set initial base cases for the DP table.
    // Cost to reach the first actual item (heights[1]) without skipping.
    dynamicProgrammingTable[0][0] = heights[1];
    // Cost to reach the first actual item by skipping it (effectively starting from the next).
    dynamicProgrammingTable[1][1] = 0;

    // Iterate through the items from the second one up to (N-1).
    for (var idx = 1; idx < numItems; idx++) {
        // Determine the maximum possible skip for the current item, limited by 'idx' and 'maxAllowedSkip'.
        var currentMaxSkip = Math.min(idx, maxAllowedSkip) + 1;
        // Create a new DP table for the current iteration to store intermediate results.
        var nextDpTable = createMultiDimArray(MAX_VALUE, currentMaxSkip + 1, currentMaxSkip + 1);

        // Iterate through all possible previous skip counts (j).
        for (var prevSkip = 0; prevSkip < currentMaxSkip; prevSkip++) {
            // Iterate through all possible current skip counts (k), ensuring k >= j.
            for (var currentSkip = prevSkip; currentSkip < currentMaxSkip; currentSkip++) {
                // Calculate the cost increase if the current item (idx+1) is NOT skipped.
                // This cost is the difference between current height and the height of the item 'prevSkip' steps back,
                // ensuring the cost is non-negative.
                var costIncrease = Math.max(0, heights[idx + 1] - heights[idx - prevSkip]);

                // Update the next DP table for the case where the current item is NOT skipped (j=0 in next state).
                if (dynamicProgrammingTable[currentSkip][prevSkip] + costIncrease < nextDpTable[currentSkip][0]) {
                    nextDpTable[currentSkip][0] = dynamicProgrammingTable[currentSkip][prevSkip] + costIncrease;
                }
            }

            // If the previous skip count is less than the overall maximum allowed skip (X).
            if (prevSkip < maxAllowedSkip) {
                // Iterate through possible current skip counts (k) again.
                for (var currentSkip = prevSkip; currentSkip < currentMaxSkip; currentSkip++) {
                    // Update the next DP table for the case where the current item IS skipped.
                    // This means incrementing both currentSkip and prevSkip for the next state.
                    if (dynamicProgrammingTable[currentSkip][prevSkip] < nextDpTable[currentSkip + 1][prevSkip + 1]) {
                        nextDpTable[currentSkip + 1][prevSkip + 1] = dynamicProgrammingTable[currentSkip][prevSkip];
                    }
                }
            }
        }
        // Replace the old DP table with the newly calculated one for the next iteration.
        dynamicProgrammingTable = nextDpTable;
    }

    // After iterating through all items, find the minimum cost from the final DP table.
    var minimumCost = MAX_VALUE;
    for (var idx = 0; idx <= maxAllowedSkip; idx++) {
        // The minimum cost will be in the row corresponding to 'maxAllowedSkip' skips,
        // considering all possible previous skip counts 'idx'.
        if (dynamicProgrammingTable[maxAllowedSkip][idx] < minimumCost) {
            minimumCost = dynamicProgrammingTable[maxAllowedSkip][idx];
        }
    }

    // Return the overall minimum cost found.
    return minimumCost;
}
