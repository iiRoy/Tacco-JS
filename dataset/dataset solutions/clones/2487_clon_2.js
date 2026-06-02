var INPUT_PARSER = (function() {
    // Factory function to create an input reader instance.
    function createParser(sourceText) {
        return new InputReader(sourceText);
    }

    // Constructor for the InputReader class.
    function InputReader(sourceText) {
        // Store input lines, trimmed and split by newline.
        this._inputLines = sourceText.trim().split("\n");
        // Initialize current line index.
        this._currentLineIndex = 0;
    }

    // Prototype methods for InputReader.

    // Reads the next value from the current line.
    // If the current line is exhausted, moves to the next.
    // 'asString' parameter: if true, returns string; otherwise, converts to number.
    InputReader.prototype.readNextValue = function(asString) {
        var sourceLines = this._inputLines;
        var lineIdx = this._currentLineIndex;
        var parsedValue;

        // If the current line hasn't been processed into an array of values yet, do so.
        // Values are reversed so 'pop' can efficiently get the next value.
        if (typeof sourceLines[lineIdx] === "string") {
            sourceLines[lineIdx] = sourceLines[lineIdx].split(" ").reverse();
        }

        // Get the last element (which is the next value due to reversal).
        parsedValue = sourceLines[lineIdx].pop();

        // If the current line is now empty, advance to the next line.
        if (!sourceLines[lineIdx].length) {
            this._currentLineIndex++;
        }

        // Return the value, optionally as a string.
        return asString ? parsedValue : +parsedValue;
    };

    // Reads an entire line of space-separated values.
    // 'asStrings' parameter: if true, returns array of strings; otherwise, array of numbers.
    InputReader.prototype.readLineOfValues = function(asStrings) {
        var lineParts = this._inputLines[this._currentLineIndex++].split(" ");
        return asStrings ? lineParts : lineParts.map(item => +item);
    };

    // Reads a matrix (2D array) of values.
    // 'numRows' parameter: number of rows to read.
    // 'asStringsMatrix' parameter: if true, returns matrix of strings; otherwise, matrix of numbers.
    InputReader.prototype.readMatrix = function(numRows, asStringsMatrix) {
        var matrixData = this._inputLines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(rowStr => rowStr.split(" "));
        return asStringsMatrix ? matrixData : matrixData.map(row => row.map(item => +item));
    };

    // Reads a specified number of raw lines.
    // 'count' parameter: number of lines to read.
    // 'asStringsArray' parameter: if true, returns array of strings; otherwise, array of numbers.
    InputReader.prototype.readLines = function(count, asStringsArray) {
        var linesArray = this._inputLines.slice(this._currentLineIndex, this._currentLineIndex += count);
        return asStringsArray ? linesArray : linesArray.map(item => +item);
    };

    // Return the factory function.
    return createParser;
})();

// Initialize the input handler by reading from standard input.
var inputHandler = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Helper function to create multi-dimensional arrays.
function createMultiDimArray(initialValue) {
    var dimensions = arguments;
    var dimCount = dimensions.length;
    var arrayCreationString = "Array(dimensions[" + --dimCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--dimCount) {
        arrayCreationString = "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

// Output the result of the main problem-solving function.
console.log(solveProblem());

// Main function to solve the problem.
function solveProblem() {
    // Read two integer values from input.
    var firstVal = inputHandler.readNextValue();
    var secondVal = inputHandler.readNextValue();

    // Calculate the result based on the problem logic.
    // This is equivalent to max(0, a - 2*b).
    return Math.max(0, firstVal - (2 * secondVal));
}
