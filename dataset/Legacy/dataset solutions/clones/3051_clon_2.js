var DATA_PARSER = (function() {
    /**
     * Factory function to create a new input parser instance.
     * @param {string} sourceInput - The complete raw input string to be parsed.
     * @returns {InputParser} A new instance of the InputParser.
     */
    function createParser(sourceInput) {
        return new InputParser(sourceInput);
    }

    /**
     * InputParser class responsible for reading various data types from a string input.
     * The input string is expected to be newline-separated.
     * @class
     * @param {string} rawInputString - The full string content received from input.
     */
    function InputParser(rawInputString) {
        // Internal storage for the input lines, trimmed and split by newline.
        this._sourceLines = rawInputString.trim().split("\n");
        // Current index indicating which line is being processed.
        this._currentLineIndex = 0;
    }

    /**
     * Reads the next individual value from the current line.
     * Values on a line are assumed to be space-separated.
     * This method processes values from right-to-left on a line for efficiency (using pop).
     * @param {boolean} [asString=false] - If true, returns the value as a string; otherwise, attempts to convert to a number.
     * @returns {string|number} The parsed value.
     */
    InputParser.prototype.readNextValue = function(asString) {
        var lineData = this._sourceLines;
        var lineIdx = this._currentLineIndex;
        var resultValue;

        // If the current line is still a string, split it into an array of values and reverse it.
        // Reversing allows popping from the end, which is more efficient than shifting from the beginning.
        if (typeof lineData[lineIdx] === "string") {
            lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
        }

        // Extract the last element (which was originally the first) from the current line's array.
        resultValue = lineData[lineIdx].pop();

        // If the current line's array is now empty, advance to the next line.
        if (!lineData[lineIdx].length) {
            this._currentLineIndex++;
        }

        // Return the value, converting to a number if 'asString' is not true.
        return asString ? resultValue : +resultValue;
    };

    /**
     * Reads an entire line and returns all its space-separated values as an array.
     * The line index is incremented after reading.
     * @param {boolean} [asString=false] - If true, returns values as strings; otherwise, attempts to convert each to a number.
     * @returns {Array<string|number>} An array containing the values from the read line.
     */
    InputParser.prototype.readLineValues = function(asString) {
        // Get the current line, increment the line index, and split it by spaces.
        var lineValues = this._sourceLines[this._currentLineIndex++].split(" ");
        // Map values to numbers if 'asString' is false, otherwise return as strings.
        return asString ? lineValues : lineValues.map(item => +item);
    };

    /**
     * Reads a specified number of lines and parses them into a 2D array (matrix).
     * Each line is split by spaces to form a row in the matrix.
     * @param {number} numLines - The count of lines to read for the matrix.
     * @param {boolean} [asString=false] - If true, returns values as strings; otherwise, attempts to convert each to a number.
     * @returns {Array<Array<string|number>>} The parsed matrix.
     */
    InputParser.prototype.readMatrix = function(numLines, asString) {
        // Slice the relevant lines from the source, updating the current line index.
        var resultMatrix = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines)
                                            .map(item => item.split(" ")); // Split each line into an array of strings.

        // If not 'asString', map all elements in the matrix to numbers.
        return asString ? resultMatrix : resultMatrix.map(row => row.map(element => +element));
    };

    /**
     * Reads a specified number of raw lines without further splitting.
     * @param {number} numLines - The count of lines to read.
     * @param {boolean} [asString=false] - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array of raw lines or numbers.
     */
    InputParser.prototype.readRawLines = function(numLines, asString) {
        // Slice the relevant lines from the source, updating the current line index.
        var resultValue = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        // If not 'asString', map each line to a number.
        return asString ? resultValue : resultValue.map(item => +item);
    };

    return createParser; // Return the factory function for external use.
})();

// Initialize the input reader by reading content from standard input.
var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * This function uses `eval`, which can be a security risk and is generally
 * discouraged in production environments.
 * @param {*} initialValue - The value to fill all elements of the array with.
 * @param {...number} dimensions - The dimensions of the array (e.g., 2, 3 for a 2x3 array).
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var argsList = arguments;
    var argLength = argsList.length;
    // Start building the string for the innermost array.
    var arrayCreationString = "Array(argsList[" + --argLength + "]).fill(initialValue)";

    // Loop to build the nested array creation string for higher dimensions.
    while (--argLength) {
        arrayCreationString = "Array(argsList[" + argLength + "]).fill(0).map(x => " + arrayCreationString + ")";
    }
    // Execute the constructed string to create the array.
    return eval(arrayCreationString);
}

// Call the main processing function and print its return value to the console.
console.log(calculateVisiblePeaks());

/**
 * Main function to solve the problem: count the number of visible peaks.
 * A peak is considered visible if its height is greater than or equal to
 * the maximum height of all preceding peaks.
 * @returns {number} The total count of visible peaks.
 */
function calculateVisiblePeaks() {
    // Read the total number of peaks from the input.
    var totalPeaks = inputReader.readNextValue();
    // Read all peak heights into an array.
    var peakHeights = inputReader.readLineValues();

    var visibleCount = 0; // Initialize counter for visible peaks.
    var maxHeightSeen = 0; // Keep track of the maximum height encountered so far.

    // Iterate through each peak to determine visibility.
    for (var peakIndex = 0; peakIndex < totalPeaks; peakIndex++) {
        // If the current peak's height is greater than or equal to the maximum height
        // seen up to this point, it means this peak is visible.
        if (maxHeightSeen <= peakHeights[peakIndex]) {
            maxHeightSeen = peakHeights[peakIndex]; // Update the maximum height.
            visibleCount++; // Increment the count of visible peaks.
        }
    }
    // Return the final count of visible peaks.
    return visibleCount;
}
