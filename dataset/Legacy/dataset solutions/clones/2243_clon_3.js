"use strict";
var DATA_PARSER = (function() {
    // Factory function to create an InputParser instance
    function createParser(sourceString) {
        return new InputParser(sourceString);
    }

    // Class for parsing input lines
    function InputParser(sourceString) {
        this._lines = sourceString.trim().split("\n");
        this._lineIndex = 0;
    }

    // Helper for consistent number conversion
    const convertToNumber = (val) => +val;

    // Reads a single atom (number or string) from the current line
    InputParser.prototype.readAtom = function(asString) {
        let currentLines = this._lines;
        let currentIndex = this._lineIndex;
        let extractedAtom;

        // If the current line hasn't been split into parts yet, do so and reverse for easy popping
        if (typeof currentLines[currentIndex] === "string") {
            currentLines[currentIndex] = currentLines[currentIndex].split(" ").reverse();
        }

        // Extract the last atom from the current line's parts
        extractedAtom = currentLines[currentIndex].pop();

        // If the current line is now empty, advance to the next line
        if (!currentLines[currentIndex].length) {
            this._lineIndex++;
        }

        // Return the atom as a string or a number based on the 'asString' flag
        return asString ? extractedAtom : convertToNumber(extractedAtom);
    };

    // Reads an entire line and splits it into parts (numbers or strings)
    InputParser.prototype.readLine = function(asString) {
        let lineParts = this._lines[this._lineIndex++].split(" ");
        return asString ? lineParts : lineParts.map(convertToNumber);
    };

    // Reads a specified number of lines as a matrix
    InputParser.prototype.readMatrix = function(numRows, asString) {
        let matrixRows = this._lines.slice(this._lineIndex, this._lineIndex += numRows).map(line => line.split(" "));
        return asString ? matrixRows : matrixRows.map(row => row.map(convertToNumber));
    };

    // Reads a specified number of lines as a flat array
    InputParser.prototype.readLinesAsArray = function(count, asString) {
        let extractedRows = this._lines.slice(this._lineIndex, this._lineIndex += count);
        return asString ? extractedRows : extractedRows.map(convertToNumber);
    };

    return createParser;
})();

// Initialize the input reader by reading from stdin
var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Function to initialize a multi-dimensional array using eval
function initializeMultiDimArray(initialValue) {
    var args = arguments;
    var argLength = args.length;
    var arrayCreationString = "Array(args[" + --argLength + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argLength) {
        arrayCreationString = "Array(args[" + argLength + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

// Execute the main program logic and capture its output
var programOutput = executeProgram();
if (programOutput !== undefined) console.log(programOutput);

// Main program function
function executeProgram() {
    // Read input values
    const arraySize = inputReader.readAtom();
    const initialFillCount = inputReader.readAtom();
    const fillValue = inputReader.readAtom();

    // Create an array of the specified size.
    // The initial contents (undefined) will be fully overwritten.
    let resultArray = new Array(arraySize);
    let currentIdx = 0; // Helper variable to track current index

    // Fill the first 'initialFillCount' elements with 'fillValue'
    while (currentIdx < initialFillCount) {
        resultArray[currentIdx] = fillValue;
        currentIdx++;
    }

    // Define the value for the subsequent fill operation
    const nextFillValue = fillValue + 1;

    // If 'fillValue' is within the array's bounds, fill the remaining elements
    if (fillValue <= arraySize) {
        // Continue filling from where the previous loop left off
        for (; currentIdx < arraySize; currentIdx++) {
            resultArray[currentIdx] = nextFillValue;
        }
    }

    // Join the array elements into a space-separated string
    return resultArray.join(" ");
}
