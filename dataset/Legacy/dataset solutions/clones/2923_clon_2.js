var InputParser = (function() {
    /**
     * Factory function to create a new parser instance.
     * @param {string} sourceString - The raw input string.
     * @returns {ParserInstance} A new parser object.
     */
    function createParser(sourceString) {
        return new ParserInstance(sourceString);
    }

    /**
     * Constructor for the ParserInstance.
     * @param {string} rawString - The raw input string to parse.
     */
    function ParserInstance(rawString) {
        // Store the input string, split into lines and trimmed.
        this._sourceLines = rawString.trim().split("\n");
        // Keep track of the current line being processed.
        this._currentLineIndex = 0;
    }

    /**
     * Reads a single value from the current line.
     * Values are read from right to left on the line.
     * @param {boolean} [asString=false] - If true, return as string; otherwise, as number.
     * @returns {string|number} The parsed value.
     */
    ParserInstance.prototype.readSingleValue = function(asString) {
        var lines = this._sourceLines;
        var currentIdx = this._currentLineIndex;
        var resultValue;

        // If the current line hasn't been split yet, split it and reverse for right-to-left popping.
        if (typeof lines[currentIdx] === "string") {
            lines[currentIdx] = lines[currentIdx].split(" ").reverse();
        }

        // Pop the last element (which is the first from the original line).
        resultValue = lines[currentIdx].pop();

        // If the current line is exhausted, move to the next line.
        if (!lines[currentIdx].length) {
            this._currentLineIndex++;
        }

        // Return as string or convert to number.
        return asString ? resultValue : +resultValue;
    };

    /**
     * Reads all values from the current line.
     * @param {boolean} [asStrings=false] - If true, return as array of strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of parsed values.
     */
    ParserInstance.prototype.readLineValues = function(asStrings) {
        // Get the current line, split it, and advance the line index.
        var lineData = this._sourceLines[this._currentLineIndex++].split(" ");
        // Return as strings or map to numbers.
        return asStrings ? lineData : lineData.map(val => +val);
    };

    /**
     * Reads a matrix (multiple lines, each split into values).
     * @param {number} numRows - The number of rows to read.
     * @param {boolean} [asStrings=false] - If true, return as matrix of strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} The parsed matrix.
     */
    ParserInstance.prototype.readMatrix = function(numRows, asStrings) {
        // Slice the required number of lines and advance the index.
        var rawRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
        // Split each row and then map to numbers if required.
        var processedRows = rawRows.map(row => row.split(" "));
        return asStrings ? processedRows : processedRows.map(row => row.map(val => +val));
    };

    /**
     * Reads a specified number of raw lines.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [asStrings=false] - If true, return as array of strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of raw lines.
     */
    ParserInstance.prototype.readRawLines = function(numLines, asStrings) {
        // Slice the required number of lines and advance the index.
        var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        // Return as strings or map to numbers.
        return asStrings ? rawLines : rawLines.map(val => +val);
    };

    return createParser;
})();

// Initialize the input reader by reading from standard input.
var inputReader = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var args = arguments;
    var argCount = args.length;
    var evalString = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        evalString = "Array(args[" + argCount + "]).fill(0).map(x=>" + evalString + ")";
    }
    return eval(evalString);
}

// Output the result of the main problem-solving function.
console.log(solveProblem());

/**
 * Main function to solve the problem.
 * It calculates the maximum sum of pairs in a sequence based on specific rules.
 * @returns {number} The maximum calculated sum.
 */
function solveProblem() {
    // Read the total count of elements from input.
    var countElements = inputReader.readSingleValue();
    // Read the sequence of numbers from input.
    var dataSequence = inputReader.readLineValues();

    // Initialize the maximum sum found so far.
    var maxSumResult = 0;
    // Calculate the midpoint for loop optimization.
    var halfCount = countElements >> 1; // Equivalent to Math.floor(countElements / 2)

    // Iterate through possible step sizes.
    for (var stepSize = 1; stepSize < halfCount; stepSize++) {
        // Use a Set to keep track of indices already included in the current sum calculation.
        var visitedIndices = new Set();
        // Initialize current pair sum for this stepSize.
        var currentPairSum = 0;

        // Iterate through the sequence with the current stepSize.
        for (var currentIndex = stepSize; currentIndex < countElements; currentIndex += stepSize) {
            // Check for conditions to break the inner loop:
            // 1. If 'currentIndex' has already been visited.
            // 2. If its symmetric counterpart 'countElements - currentIndex - 1' has been visited.
            // 3. If 'currentIndex' is its own symmetric counterpart (middle element).
            if (visitedIndices.has(currentIndex) || visitedIndices.has(countElements - currentIndex - 1) || currentIndex === countElements - currentIndex - 1) {
                break;
            }

            // Add the current element and its symmetric counterpart to the current sum.
            currentPairSum += dataSequence[currentIndex] + dataSequence[countElements - currentIndex - 1];

            // Update the overall maximum sum if the current sum is greater.
            if (maxSumResult < currentPairSum) {
                maxSumResult = currentPairSum;
            }

            // Mark both the current index and its symmetric counterpart as visited.
            visitedIndices.add(currentIndex);
            visitedIndices.add(countElements - currentIndex - 1);
        }
    }
    // Return the final maximum sum.
    return maxSumResult;
}
