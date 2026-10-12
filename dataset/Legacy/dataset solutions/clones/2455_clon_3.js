"use strict";
const InputReaderFactory = (function () {
    function createReader(inputString) {
        return new InputReader(inputString);
    }

    function parseNumericValue(val) {
        return +val;
    }

    function InputReader(inputString) {
        this._inputLines = inputString.trim().split("\n");
        this._currentLineIndex = 0;
    }

    InputReader.prototype.readNextValue = function (asString) {
        let currentLineParts = this._inputLines;
        let lineIdx = this._currentLineIndex;
        let extractedValue;

        if (typeof currentLineParts[lineIdx] === "string") {
            currentLineParts[lineIdx] = currentLineParts[lineIdx].split(" ").reverse();
        }
        extractedValue = currentLineParts[lineIdx].pop();

        if (!currentLineParts[lineIdx].length) {
            this._currentLineIndex++;
        }
        return asString ? extractedValue : parseNumericValue(extractedValue);
    };

    InputReader.prototype.readLineValues = function (asString) {
        let lineParts = this._inputLines[this._currentLineIndex++].split(" ");
        return asString ? lineParts : lineParts.map(parseNumericValue);
    };

    InputReader.prototype.readMatrix = function (numRows, asString) {
        let resultRows = this._inputLines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(line => line.split(" "));
        return asString ? resultRows : resultRows.map(row => row.map(parseNumericValue));
    };

    InputReader.prototype.readLines = function (numRows, asString) {
        let resultRows = this._inputLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
        return asString ? resultRows : resultRows.map(parseNumericValue);
    };

    return createReader;
})();

const inputData = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue, ...dimensions) {
    const createRecursive = (dims, currentDimIndex) => {
        if (currentDimIndex === dims.length - 1) {
            return Array(dims[currentDimIndex]).fill(initialValue);
        }
        return Array(dims[currentDimIndex]).fill(0).map(() => createRecursive(dims, currentDimIndex + 1));
    };
    return createRecursive(dimensions, 0);
}

const INFINITY_VAL = 1e15;

console.log(solveProblem());

function solveProblem() {
    const numItems = inputData.readNextValue();
    const maxSkip = inputData.readNextValue();
    const heights = [0].concat(inputData.readLineValues());

    let currentDPTable = createMultiDimArray(INFINITY_VAL, 2, 2);
    currentDPTable[0][0] = heights[1];
    currentDPTable[1][1] = 0;

    const updateMin = (target, value) => Math.min(target, value);

    for (let itemIndex = 1; itemIndex < numItems; itemIndex++) {
        const maxPrevItemsConsidered = Math.min(itemIndex, maxSkip) + 1;
        let nextDPTable = createMultiDimArray(INFINITY_VAL, maxPrevItemsConsidered + 1, maxPrevItemsConsidered + 1);

        for (let prevItemCount = 0; prevItemCount < maxPrevItemsConsidered; prevItemCount++) {
            for (let skipCount = prevItemCount; skipCount < maxPrevItemsConsidered; skipCount++) {
                const prevHeightIndex = itemIndex - prevItemCount;
                const currentHeight = heights[itemIndex + 1];
                const costFromPrev = Math.max(0, currentHeight - heights[prevHeightIndex]);
                
                const costToBuildCurrent = currentDPTable[skipCount][prevItemCount] + costFromPrev;
                nextDPTable[skipCount][0] = updateMin(nextDPTable[skipCount][0], costToBuildCurrent);
            }

            if (prevItemCount < maxSkip) {
                for (let skipCount = prevItemCount; skipCount < maxPrevItemsConsidered; skipCount++) {
                    const costToSkipCurrent = currentDPTable[skipCount][prevItemCount];
                    nextDPTable[skipCount + 1][prevItemCount + 1] = updateMin(nextDPTable[skipCount + 1][prevItemCount + 1], costToSkipCurrent);
                }
            }
        }
        currentDPTable = nextDPTable;
    }

    let minCost = INFINITY_VAL;
    for (let finalSkipCount = 0; finalSkipCount <= maxSkip; finalSkipCount++) {
        const costAtFinalSkip = currentDPTable[maxSkip][finalSkipCount];
        if (costAtFinalSkip < minCost) {
            minCost = costAtFinalSkip;
        }
    }
    return minCost;
}
