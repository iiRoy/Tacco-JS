"use strict";

// This module provides a utility for parsing input data from a string.
var DATA_PARSER = (function() {
    /**
     * Creates a new input parser instance.
     * @param {string} sourceString - The raw input string, typically from a file.
     * @returns {InputReader} A new InputReader object.
     */
    function createParser(sourceString) {
        return new InputReader(sourceString);
    }

    /**
     * InputReader constructor.
     * @param {string} sourceString - The raw input string.
     */
    function InputReader(sourceString) {
        // Store the input string, trimmed and split into individual lines.
        this._sourceLines = sourceString.trim().split("\n");
        // Initialize the current line index for sequential reading.
        this._currentLineIndex = 0;
    }

    /**
     * Reads the next single value from the current line.
     * Values on a line are assumed to be space-separated and read from right to left.
     * @param {boolean} [asString=false] - If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number} The next value.
     */
    InputReader.prototype.readNextValue = function(asString) {
        var lines = this._sourceLines;
        var currentLineIdx = this._currentLineIndex;
        var extractedValue;

        // If the current line hasn't been processed into an array of values yet,
        // split it by space and reverse it to facilitate popping from the end.
        if (typeof lines[currentLineIdx] === "string") {
            lines[currentLineIdx] = lines[currentLineIdx].split(" ").reverse();
        }

        // Extract the last element (which was the first before reversing).
        extractedValue = lines[currentLineIdx].pop();

        // If the current line is now empty after popping, advance to the next line.
        if (!lines[currentLineIdx].length) {
            this._currentLineIndex++;
        }

        // Return the value, optionally converted to a number.
        return asString ? extractedValue : +extractedValue;
    };

    /**
     * Reads all values from the current line.
     * @param {boolean} [asStrings=false] - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of values from the line.
     */
    InputReader.prototype.readLineValues = function(asStrings) {
        // Get the current line, split it by space, and then advance the line index.
        var lineParts = this._sourceLines[this._currentLineIndex++].split(" ");
        // Return the parts, optionally converted to numbers.
        return asStrings ? lineParts : lineParts.map(val => +val);
    };

    /**
     * Reads a matrix (multiple rows) of values.
     * @param {number} rowCount - The number of rows to read.
     * @param {boolean} [asStrings=false] - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    InputReader.prototype.readMatrix = function(rowCount, asStrings) {
        // Extract the specified number of raw lines.
        var rawRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += rowCount);
        // Process each raw line by splitting it into parts.
        var processedRows = rawRows.map(line => line.split(" "));
        // Return the processed rows, with values optionally converted to numbers.
        return asStrings ? processedRows : processedRows.map(row => row.map(val => +val));
    };

    /**
     * Reads a specified number of raw lines.
     * @param {number} count - The number of lines to read.
     * @param {boolean} [asStrings=false] - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array of raw lines.
     */
    InputReader.prototype.readRawLines = function(count, asStrings) {
        // Extract the specified number of raw lines.
        var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);
        // Return the lines, optionally converted to numbers.
        return asStrings ? rawLines : rawLines.map(line => +line);
    };

    return createParser;
})();

// Initialize the input data parser by reading from standard input.
var inputData = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value.
 * This function is not used in the main problem logic but is part of the original code.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., createMultiDimArray(0, 2, 3) for a 2x3 array).
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var args = arguments,
        argCount = args.length,
        // Start building the array creation expression from the innermost dimension.
        arrayExpression = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    // Wrap the expression for each outer dimension.
    while (--argCount) {
        arrayExpression = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayExpression + ")";
    }
    // Evaluate the dynamically constructed string to create the array.
    return eval(arrayExpression);
}

// Execute the main problem-solving function and print its result to the console.
console.log(solveProblem());

/**
 * Main function to solve the problem.
 * It determines how many items can be selected based on given criteria.
 * @returns {number} The count of selectable items.
 */
function solveProblem() {
    // Read problem parameters:
    // numItems: total number of items (n)
    // maxIncrease: maximum score increase an item can get (m)
    // minVotes: minimum votes required for an item to be considered (v)
    // numTopItems: number of items that are guaranteed to be selected (p)
    var numItems = inputData.readNextValue();
    var maxIncrease = inputData.readNextValue();
    var minVotes = inputData.readNextValue();
    var numTopItems = inputData.readNextValue();

    // Read the array of item scores.
    var itemScores = inputData.readLineValues();

    // Sort the item scores in ascending order.
    itemScores.sort((scoreA, scoreB) => scoreA - scoreB);

    // Perform a binary search to find the smallest index 'k' (upperBound)
    // such that itemScores[k] can be among the selected items.
    // 'upperBound' (ok) represents an index that *can* be selected.
    // 'lowerBound' (ng) represents an index that *cannot* be selected.
    // The initial 'upperBound' is the index of the (n-p)-th item (0-indexed),
    // which is the smallest score among the top 'p' items if all were selected.
    var upperBound = numItems - numTopItems;
    var lowerBound = -1; // An index definitely too low to be selected.

    // Binary search loop: continues as long as there's a gap between upperBound and lowerBound.
    while (upperBound - lowerBound > 1) {
        // Calculate the middle index. Using bitwise right shift for integer division.
        var midIndex = (upperBound + lowerBound + 1) >> 1;

        // Calculate the target score: itemScores[midIndex] after receiving maxIncrease.
        var targetScore = itemScores[midIndex] + maxIncrease;

        // Condition 1: Check if itemScores[midIndex] (even with maxIncrease) is too low.
        // If targetScore is less than the score of the (n-p)-th item,
        // it means itemScores[midIndex] cannot reach the threshold of the top 'p' items.
        if (targetScore < itemScores[numItems - numTopItems]) {
            lowerBound = midIndex; // This midIndex is not selectable.
        }
        // Condition 2: Check if itemScores[midIndex] is already high enough or can be easily promoted.
        // This condition `minVotes <= midIndex + numTopItems` implies that if the current item's index
        // plus the number of guaranteed top items is sufficient to meet the minimum vote requirement,
        // then this item is selectable.
        else if (minVotes <= midIndex + numTopItems) {
            upperBound = midIndex; // This midIndex is selectable.
        }
        // Condition 3: More complex check involving budget for other items.
        // If neither of the above, we need to see if we have enough 'budget' (maxIncrease)
        // to bring itemScores[midIndex] and enough other items up to targetScore.
        else {
            // Calculate the total 'score points' needed from other items.
            // This is based on the number of additional items required to meet 'minVotes'
            // beyond the current item and the 'numTopItems' already considered.
            var remainingBudget = (minVotes - midIndex - numTopItems) * maxIncrease;

            // Iterate through items that are greater than itemScores[midIndex] but not among the top 'p'
            // (i.e., from midIndex + 1 up to numItems - numTopItems).
            // Subtract the score difference needed for each of these items to reach targetScore.
            for (var idx = midIndex + 1; remainingBudget > 0 && idx < numItems - numTopItems + 1; idx++) {
                remainingBudget -= (targetScore - itemScores[idx]);
            }

            // If remainingBudget is zero or negative, it means we have enough 'budget'
            // to make itemScores[midIndex] a selectable item.
            if (remainingBudget <= 0) {
                upperBound = midIndex; // This midIndex is selectable.
            } else {
                lowerBound = midIndex; // This midIndex is not selectable.
            }
        }
    }

    // The result is the count of items from 'upperBound' to 'numItems - 1'.
    // This is equivalent to numItems - upperBound.
    return numItems - upperBound;
}
