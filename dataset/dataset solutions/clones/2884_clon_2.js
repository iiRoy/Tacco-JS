// This module provides a flexible utility for parsing structured input data from a single string.
// It's designed to read lines, individual values, or blocks of data, converting them to numbers
// by default, or returning them as strings if specified.
var INPUT_PROCESSOR = (function() {

    /**
     * Factory function: Creates and returns a new data reader instance.
     * @param {string} sourceText - The entire input data as a single string.
     * @returns {InputSource} An instance of the InputSource parser.
     */
    function createReader(sourceText) {
        return new InputSource(sourceText);
    }

    /**
     * InputSource Constructor: Initializes the parser with raw input data.
     * @param {string} rawInputData - The raw string content to be parsed.
     */
    function InputSource(rawInputData) {
        // Internal array to store processed lines, splitting the input by newline characters.
        // Each line is trimmed of leading/trailing whitespace.
        this._sourceLines = rawInputData.trim().split("\n");
        // A pointer indicating the index of the current line being processed.
        this._linePointer = 0;
    }

    /**
     * Prototype Method: Reads and extracts a single value from the current line.
     * It processes the current line into parts if not already done, and then extracts one item.
     * @param {boolean} returnAsStringFlag - If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number} The extracted single value.
     */
    InputSource.prototype.fetchNextItem = function(returnAsStringFlag) {
        var linesReference = this._sourceLines;
        var pointerReference = this._linePointer;
        var extractedValue;

        // Check if the current line is still a raw string. If so, split it into parts
        // and reverse the order. Reversing allows 'pop()' to effectively read from the beginning of the line.
        if (typeof linesReference[pointerReference] === "string") {
            linesReference[pointerReference] = linesReference[pointerReference].split(" ").reverse();
        }

        // Extract the last element (which was originally the first due to reversal).
        extractedValue = linesReference[pointerReference].pop();

        // If the current line's parts array is now empty, it means all items on that line have been read.
        // Advance the line pointer to the next line.
        if (!linesReference[pointerReference].length) {
            this._linePointer++;
        }

        // Return the extracted value. If 'returnAsStringFlag' is true, return as is (string).
        // Otherwise, use the unary plus operator to convert it to a number.
        return returnAsStringFlag ? extractedValue : +extractedValue;
    };

    /**
     * Prototype Method: Reads all space-separated values from the current line.
     * Advances the line pointer after reading.
     * @param {boolean} asStringFlag - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>} An array containing all values from the line.
     */
    InputSource.prototype.getLineItems = function(asStringFlag) {
        // Retrieve the current line, split it by spaces, and then increment the line pointer.
        var currentLineParts = this._sourceLines[this._linePointer++].split(" ");

        // Return the parts. If 'asStringFlag' is true, return the array of strings.
        // Otherwise, map each string part to its numerical equivalent.
        return asStringFlag ? currentLineParts : currentLineParts.map(elementStr => +elementStr);
    };

    /**
     * Prototype Method: Reads a block of 'numRowsToRead' consecutive lines as a 2D matrix.
     * Each line within the block is split into an array of values.
     * @param {number} numRowsToRead - The number of lines (rows) to read for the matrix.
     * @param {boolean} asStringFlag - If true, returns a matrix of strings; otherwise, a matrix of numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix data.
     */
    InputSource.prototype.fetchBlockData = function(numRowsToRead, asStringFlag) {
        // Extract a slice of lines from the internal source array.
        // The line pointer is advanced by 'numRowsToRead' during this operation.
        // Each extracted line string is then split by spaces to form a row array.
        var resultMatrix = this._sourceLines.slice(this._linePointer, this._linePointer += numRowsToRead)
                                           .map(lineStrArray => lineStrArray.split(" "));

        // Return the resulting matrix. If 'asStringFlag' is true, return as is.
        // Otherwise, iterate through each row and then each item to convert all to numbers.
        return asStringFlag ? resultMatrix : resultMatrix.map(row => row.map(itemStr => +itemStr));
    };

    /**
     * Prototype Method: Reads a specified number of lines as a 1D array of values.
     * Each line is treated as a single value.
     * @param {number} numLines - The count of lines to read.
     * @param {boolean} asStringFlag - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>} An array of values, each corresponding to a line.
     */
    InputSource.prototype.getLinesAsValues = function(numLines, asStringFlag) {
        // Extract a slice of lines directly. The line pointer is advanced.
        var resultRows = this._sourceLines.slice(this._linePointer, this._linePointer += numLines);

        // Return the rows. If 'asStringFlag' is true, return the array of strings.
        // Otherwise, map each line string to its numerical equivalent.
        return asStringFlag ? resultRows : resultRows.map(lineContent => +lineContent);
    };

    // Expose the factory function, allowing external modules to create parser instances.
    return createReader;
})();

// Initialize the input parser by reading the entire content of standard input.
// The 'fs' module is used for file system operations, specifically reading from /dev/stdin.
var parserObject = INPUT_PROCESSOR(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Utility Function: Creates a multi-dimensional array initialized with a given expression.
 * This function dynamically constructs and evaluates JavaScript code to create nested arrays.
 * Example: initializeNestedArray(0, 2, 3) creates a 2x3 array filled with 0s.
 * @param {*} initialExpression - The value or expression to fill the innermost array elements with.
 * @param {...number} dimensions - Variable number of arguments specifying the size of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function initializeNestedArray(initialExpression) {
    var argsReference = arguments; // Reference to the arguments object.
    var dimensionIndex = argsReference.length; // Start with the total number of dimensions.
    // Construct the innermost array creation code: Array(size).fill(0).map(x => initialExpression).
    // Note: --dimensionIndex is used to get the last dimension size.
    var arrayCreationCode = "Array(argsReference[" + --dimensionIndex + "]).fill(0).map(_dummyVar=>{return " + initialExpression + ";})";

    // Loop backwards from the second-to-last dimension down to the first.
    // Each iteration wraps the existing 'arrayCreationCode' in another Array.map call.
    while (--dimensionIndex) {
        arrayCreationCode = "Array(argsReference[" + dimensionIndex + "]).fill(0).map(_dummyVar=>" + arrayCreationCode + ")";
    }
    // Evaluate the dynamically constructed string to create the actual array structure.
    return eval(arrayCreationCode);
}


// Execute the primary problem-solving function and output its result to the console.
console.log(solveProblem());

/**
 * Main function: Contains the core logic to solve the problem.
 * It processes input data, performs calculations, and determines a final result
 * through an iterative search process.
 * @returns {number} The final computed result.
 */
function solveProblem() {
    // Read two single numerical values from the input: numElements (n) and thresholdValue (x).
    var numElements = parserObject.fetchNextItem();
    var thresholdValue = parserObject.fetchNextItem();

    // Read a block of 'numElements' lines, parsing them into a 2D array (matrix).
    var dataMatrix = parserObject.fetchBlockData(numElements);

    // Initialize a variable to accumulate a total sum based on initial calculations.
    var accumulatedValue = 0;

    // First processing loop: Iterate through each row of the data matrix.
    // This loop calculates additional derived values for each item and appends them to its row.
    for (var idx = 0; idx < numElements; idx++) {
        // Calculate a temporary product from the first two elements of the current row.
        var tempProduct = dataMatrix[idx][0] * dataMatrix[idx][1];
        // Calculate an adjusted value using the threshold and the third element.
        var adjustedCalculation = (thresholdValue - dataMatrix[idx][0]) * dataMatrix[idx][2];

        // Add the temporary product to the overall accumulated sum.
        accumulatedValue += tempProduct;

        // Append the calculated adjusted value, temporary product, and their sum to the current row.
        // The row now contains more context-specific derived data.
        dataMatrix[idx].push(adjustedCalculation, tempProduct, adjustedCalculation + tempProduct);
    }

    // Sort the data matrix. The sorting criterion is the sixth element (index 5) of each row,
    // which represents the sum of 'adjustedCalculation + tempProduct'.
    // The sort order is descending (itemB[5] - itemA[5]).
    dataMatrix.sort((itemA, itemB) => itemB[5] - itemA[5]);

    // Initialize variables for a binary search algorithm.
    // 'upperBound' represents a known possible answer (n*x is a safe upper bound).
    // 'lowerBound' represents an impossible answer (typically -1 or 0).
    var upperBound = numElements * thresholdValue;
    var lowerBound = -1;

    // Binary search loop: Continues as long as there's a range greater than 1 between bounds.
    while (upperBound - lowerBound > 1) {
        // Calculate the midpoint of the current search range.
        var midPoint = Math.floor((upperBound + lowerBound) / 2);

        // Initialize variables for the inner simulation/check phase of the binary search.
        var currentBudget = accumulatedValue;    // A budget or total resource level, initialized with the accumulated sum.
        var remainingCapacity = midPoint;        // A capacity or quantity to be processed, initialized with the midpoint.
        var remainderAmount = midPoint % thresholdValue; // The remainder after dividing capacity by the threshold.
        var maxSubValue = 0;                     // Stores the maximum calculated partial sum found.
        var bestPartialIndex = 0;                // Stores the index where 'maxSubValue' was found.

        // Loop to determine the 'maxSubValue' and its index based on 'remainderAmount'.
        // This is a preliminary calculation phase before the main simulation.
        for (var idx = 0; idx < numElements; idx++) {
            var currentSubValue;
            // Conditional calculation based on 'remainderAmount' relative to the first element of the current row.
            if (remainderAmount < dataMatrix[idx][0]) {
                currentSubValue = dataMatrix[idx][1] * remainderAmount;
            } else {
                currentSubValue = dataMatrix[idx][4] + (remainderAmount - dataMatrix[idx][0]) * dataMatrix[idx][2];
            }

            // Update 'maxSubValue' and 'bestPartialIndex' if a new maximum is found.
            if (currentSubValue > maxSubValue) {
                maxSubValue = currentSubValue;
                bestPartialIndex = idx;
            }
        }

        // Second processing loop: Simulates the consumption of 'currentBudget' and 'remainingCapacity'.
        // This loop iterates through the sorted data matrix, attempting to deplete the capacity and budget.
        for (var idx = 0; idx < numElements && remainingCapacity > 0 && currentBudget > 0; idx++) {
            if (thresholdValue <= remainingCapacity) {
                // If there's enough 'remainingCapacity' to take a full 'thresholdValue' chunk.
                currentBudget -= dataMatrix[idx][5]; // Deduct the full cost (element at index 5).
                remainingCapacity -= thresholdValue;  // Reduce the capacity by the threshold.
            } else {
                // If 'remainingCapacity' is less than 'thresholdValue', special handling is required.
                if (idx <= bestPartialIndex) {
                    // If the current item's index is at or before the 'bestPartialIndex'.
                    currentBudget -= maxSubValue; // Deduct the pre-calculated maximum partial sum.
                    remainingCapacity = 0;        // All remaining capacity is considered used.
                } else {
                    // If the current item's index is after the 'bestPartialIndex'.
                    var tempBudget = currentBudget;
                    // Adjust 'tempBudget' based on the 'bestPartialIndex' item, current item, and 'maxSubValue'.
                    tempBudget += dataMatrix[bestPartialIndex][5] - dataMatrix[idx][5] - maxSubValue;

                    // If 'tempBudget' is already zero or negative, update 'currentBudget' and skip to next item.
                    if (tempBudget <= 0) {
                        currentBudget = tempBudget;
                        continue;
                    }

                    // Inner loop: Further refine budget consumption for the remaining 'remainingCapacity'.
                    // This loop recalculates 'tempBudget' for each item based on 'currentBudget'.
                    for (tempBudget = currentBudget; idx < numElements && tempBudget > 0; idx++) {
                        tempBudget = currentBudget; // Reset tempBudget to currentBudget at the start of each inner iteration.
                        if (remainingCapacity < dataMatrix[idx][0]) {
                            // Calculation if 'remainingCapacity' is less than the first element.
                            tempBudget -= dataMatrix[idx][1] * remainingCapacity;
                        } else {
                            // Calculation if 'remainingCapacity' is greater or equal.
                            tempBudget -= dataMatrix[idx][4] + (remainingCapacity - dataMatrix[idx][0]) * dataMatrix[idx][2];
                        }
                    }
                    currentBudget = tempBudget; // Update 'currentBudget' with the final 'tempBudget' from the inner loop.
                    remainingCapacity = 0;      // All remaining capacity is considered used.
                }
            }
        }

        // Update binary search bounds based on the outcome of the simulation.
        if (currentBudget > 0) {
            // If there's still budget left, it means 'midPoint' was too small.
            lowerBound = midPoint;
        } else {
            // If the budget was depleted or went negative, 'midPoint' is a possible (or too large) answer.
            upperBound = midPoint;
        }
    }

    // The 'upperBound' will contain the smallest value of 'midPoint' for which the condition was met.
    return upperBound;
}