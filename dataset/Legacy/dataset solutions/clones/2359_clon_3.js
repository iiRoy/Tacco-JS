"use strict";
var createInputReader = (function () {
    function readerFactory(sourceString) {
        return new InputDataProcessor(sourceString);
    }

    function InputDataProcessor(sourceString) {
        this._sourceLines = sourceString.trim().split("\n");
        this._currentLineIndex = 0;
    }

    function parseValue(val, asString) {
        return asString ? val : +val;
    }

    InputDataProcessor.prototype.readNextItem = function (asString) {
        var currentLineItems = this._sourceLines[this._currentLineIndex];
        var itemValue;

        if (typeof currentLineItems === "string") {
            this._sourceLines[this._currentLineIndex] = currentLineItems.split(" ").reverse();
        }
        
        itemValue = this._sourceLines[this._currentLineIndex].pop();

        if (!this._sourceLines[this._currentLineIndex].length) {
            this._currentLineIndex++;
        }
        return parseValue(itemValue, asString);
    };

    InputDataProcessor.prototype.readLineOfItems = function (asString) {
        var lineContent = this._sourceLines[this._currentLineIndex++];
        var items = lineContent.split(" ");
        return asString ? items : items.map(item => +item);
    };

    InputDataProcessor.prototype.readMatrixOfItems = function (numRows, asString) {
        var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
        var parsedMatrix = matrixRows.map(rowStr => rowStr.split(" "));
        return asString ? parsedMatrix : parsedMatrix.map(row => row.map(item => +item));
    };

    InputDataProcessor.prototype.readRawLines = function (numLines, asString) {
        var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        return asString ? rawLines : rawLines.map(line => +line);
    };

    return readerFactory;
})();

var inputReader = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function initializeMultiDimArray(initialValueCreator, ...dimensions) {
    const createRecursiveArray = (dimIndex) => {
        if (dimIndex === dimensions.length - 1) {
            return Array(dimensions[dimIndex]).fill(0).map(() => eval(initialValueCreator));
        } else {
            return Array(dimensions[dimIndex]).fill(0).map(() => createRecursiveArray(dimIndex + 1));
        }
    };
    return createRecursiveArray(0);
}

console.log(main());

function main() {
    var gridHeight = inputReader.readNextItem();
    var gridWidth = inputReader.readNextItem();

    var differenceSets = initializeMultiDimArray("new Set()", gridHeight, gridWidth);

    var matrixA = inputReader.readMatrixOfItems(gridHeight);
    var matrixB = inputReader.readMatrixOfItems(gridHeight);

    // Note: The original `xArray("[]",h)` creates `h` empty arrays.
    // Accessing `differenceMatrix[rowIdx][colIdx]` where `differenceMatrix[rowIdx]` is `[]`
    // will result in a TypeError if `colIdx > 0`.
    // This implementation preserves that exact behavior, including potential crashes.
    var differenceMatrix = initializeMultiDimArray("[]", gridHeight);

    const addAbsoluteDifferences = (targetSet, baseValue, currentDiffValue) => {
        targetSet.add(Math.abs(baseValue + currentDiffValue));
        targetSet.add(Math.abs(baseValue - currentDiffValue));
    };

    for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
            differenceMatrix[rowIdx][colIdx] = matrixA[rowIdx][colIdx] - matrixB[rowIdx][colIdx];
        }
    }
    
    // Initialize the first cell of the DP table
    // This line will only be reached if the above loop for differenceMatrix did not crash.
    differenceSets[0][0].add(Math.abs(differenceMatrix[0][0]));

    for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
            const currentCellDiff = differenceMatrix[rowIdx][colIdx];

            if (rowIdx > 0) {
                const prevRowSet = differenceSets[rowIdx - 1][colIdx];
                for (var currentDiff of prevRowSet) {
                    addAbsoluteDifferences(differenceSets[rowIdx][colIdx], currentDiff, currentCellDiff);
                }
            }
            if (colIdx > 0) {
                const prevColSet = differenceSets[rowIdx][colIdx - 1];
                for (var currentDiff of prevColSet) {
                    addAbsoluteDifferences(differenceSets[rowIdx][colIdx], currentDiff, currentCellDiff);
                }
            }
        }
    }

    const finalDiffSet = differenceSets[gridHeight - 1][gridWidth - 1];
    // If the final set is empty, return 1e9 as per original logic.
    var minimumAbsoluteDifference = finalDiffSet.size > 0 ? Math.min(...finalDiffSet) : 1e9;

    return minimumAbsoluteDifference;
}
