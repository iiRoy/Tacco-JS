"use strict";

// Type IV clone of the GET input parsing utility.
// Uses a class-based approach with explicit line and token pointers,
// avoiding the original's reverse-and-pop strategy for token reading.
const InputProcessor = (function() {
    class DataStreamHandler {
        constructor(rawInput) {
            this.inputLines = rawInput.trim().split("\n");
            this.currentLineIndex = 0;
            this.currentLineTokens = [];
            this.currentTokenIndex = 0;
        }

        // Internal method to prepare tokens for the current line
        _prepareLineTokens() {
            if (this.currentLineIndex >= this.inputLines.length) {
                throw new Error("Attempted to read past end of input.");
            }
            if (this.currentTokenIndex >= this.currentLineTokens.length) {
                this.currentLineTokens = this.inputLines[this.currentLineIndex].split(" ");
                this.currentTokenIndex = 0;
            }
        }

        // Advances to the next line, resetting token pointers
        _moveToNextLine() {
            this.currentLineIndex++;
            this.currentLineTokens = [];
            this.currentTokenIndex = 0;
        }

        // Reads a single value (number or string) from the current line
        readSingleValue(asString = false) {
            this._prepareLineTokens();
            const value = this.currentLineTokens[this.currentTokenIndex];
            this.currentTokenIndex++;
            if (this.currentTokenIndex >= this.currentLineTokens.length) {
                this._moveToNextLine();
            }
            return asString ? value : Number(value);
        }

        // Reads all values from the current line as an array
        readValuesFromLine(asStrings = false) {
            if (this.currentLineIndex >= this.inputLines.length) {
                throw new Error("Attempted to read past end of input.");
            }
            const lineValues = this.inputLines[this.currentLineIndex].split(" ");
            this._moveToNextLine();
            return asStrings ? lineValues : lineValues.map(Number);
        }

        // Reads 'count' lines, splitting each into values
        readMultiLineValues(count, asStrings = false) {
            const collectedMatrix = [];
            for (let i = 0; i < count; i++) {
                if (this.currentLineIndex >= this.inputLines.length) {
                    throw new Error("Attempted to read past end of input.");
                }
                const lineValues = this.inputLines[this.currentLineIndex].split(" ");
                collectedMatrix.push(asStrings ? lineValues : lineValues.map(Number));
                this._moveToNextLine();
            }
            return collectedMatrix;
        }

        // Reads 'count' lines as raw strings
        readRawLines(count) {
            const lines = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex + count);
            this.currentLineIndex += count;
            return lines;
        }
    }

    return (inputString) => new DataStreamHandler(inputString);
})();

// Type IV clone of xArray.
// Creates a multi-dimensional array using recursion and Array.from, avoiding eval.
function initializeMultiDimArray(fillValue, ...dimensions) {
    const createNestedArray = (dimIndex) => {
        if (dimIndex === dimensions.length - 1) {
            return Array.from({ length: dimensions[dimIndex] }, () => fillValue);
        }
        return Array.from({ length: dimensions[dimIndex] }, () => createNestedArray(dimIndex + 1));
    };
    return createNestedArray(0);
}

let outputGrid;
let inputHashGrid;

// Main execution function, Type IV clone of main.
console.log(executeGridPartition());

function executeGridPartition() {
    const dataReader = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const gridRows = dataReader.readSingleValue();
    const gridCols = dataReader.readSingleValue();
    const targetHashCount = dataReader.readSingleValue();
    inputHashGrid = dataReader.readRawLines(gridRows);

    outputGrid = initializeMultiDimArray(1, gridRows, gridCols);

    // Start the recursive partitioning process
    recursivelyPartition(0, 0, gridRows, gridCols, 1, targetHashCount);

    // Format the result for output
    return outputGrid.map(row => row.join(" ")).join("\n");
}

// Type IV clone of solve and f functions, merged into one recursive function
// with a helper for split decision logic.
function recursivelyPartition(startY, startX, endY, endX, currentRegionId, totalHashesInRegion) {
    // Base case: If only one hash is targeted, fill the entire region with the current ID.
    if (totalHashesInRegion === 1) {
        for (let r = startY; r < endY; r++) {
            for (let c = startX; c < endX; c++) {
                outputGrid[r][c] = currentRegionId;
            }
        }
        return;
    }

    const regionHeight = endY - startY;
    const regionWidth = endX - startX;

    // Calculate prefix sums for hash counts within the current sub-region.
    // These are relative to the sub-region's top-left corner.
    const rowHashPrefixSums = Array(regionHeight).fill(0); // Equivalent to original y2
    const colHashPrefixSums = Array(regionWidth).fill(0);  // Equivalent to original x2

    for (let r = 0; r < regionHeight; r++) {
        for (let c = 0; c < regionWidth; c++) {
            if (inputHashGrid[startY + r][startX + c] === "#") {
                rowHashPrefixSums[r]++;
                colHashPrefixSums[c]++;
            }
        }
    }

    // Convert counts to prefix sums
    for (let i = 1; i < regionHeight; i++) rowHashPrefixSums[i] += rowHashPrefixSums[i - 1];
    for (let i = 1; i < regionWidth; i++) colHashPrefixSums[i] += colHashPrefixSums[i - 1];

    // Determine the splitting strategy (horizontal or vertical) and the split point.
    // This helper encapsulates the complex conditional logic from the original `solve` and `f`.
    const splitStrategy = determinePartitionStrategy(
        startY, startX, endY, endX, totalHashesInRegion,
        rowHashPrefixSums, colHashPrefixSums
    );

    if (splitStrategy.type === 'vertical') {
        const splitYAbsolute = startY + splitStrategy.splitIndex + 1;
        recursivelyPartition(startY, startX, splitYAbsolute, endX, currentRegionId, splitStrategy.splitKValue);
        recursivelyPartition(splitYAbsolute, startX, endY, endX, currentRegionId + splitStrategy.splitKValue, totalHashesInRegion - splitStrategy.splitKValue);
    } else { // 'horizontal'
        const splitXAbsolute = startX + splitStrategy.splitIndex + 1;
        recursivelyPartition(startY, startX, endY, splitXAbsolute, currentRegionId, splitStrategy.splitKValue);
        recursivelyPartition(startY, splitXAbsolute, endY, endX, currentRegionId + splitStrategy.splitKValue, totalHashesInRegion - splitStrategy.splitKValue);
    }
}

// Helper function to replicate the original's complex split decision logic.
// It determines whether to split horizontally or vertically and at which point.
function determinePartitionStrategy(absYStart, absXStart, absYEnd, absXEnd, totalK, rowPrefixSums, colPrefixSums) {
    const currentRegionWidth = absXEnd - absXStart;
    const currentRegionHeight = absYEnd - absYStart;

    // Original condition: if (x + 1 === w) return f(...)
    // If the region width is 1, a horizontal split is impossible, so force vertical.
    if (currentRegionWidth === 1) {
        // Logic for vertical split (derived from original 'f' function)
        const midYRelative = Math.floor(currentRegionHeight / 2);
        let chosenYRelative = midYRelative;
        if (rowPrefixSums[chosenYRelative] === 0) {
            while (chosenYRelative < currentRegionHeight && rowPrefixSums[chosenYRelative] === 0) {
                chosenYRelative++;
            }
        } else if (rowPrefixSums[chosenYRelative] === totalK) {
            while (chosenYRelative >= 0 && rowPrefixSums[chosenYRelative] === totalK) {
                chosenYRelative--;
            }
        }
        return { type: 'vertical', splitIndex: chosenYRelative, splitKValue: rowPrefixSums[chosenYRelative] };
    }

    // Attempt horizontal split first (derived from original 'solve' function)
    const midXRelative = Math.floor(currentRegionWidth / 2);
    let candidateXRelative = midXRelative;
    let shouldForceVertical = false;

    if (colPrefixSums[candidateXRelative] === 0) {
        // Search forward for the first column with non-zero hash count
        while (candidateXRelative < currentRegionWidth && colPrefixSums[candidateXRelative] === 0) {
            candidateXRelative++;
        }
        // Original: if (x2[xf] === k) return f(...)
        // If we find a point where the cumulative hash count equals totalK, force vertical.
        if (candidateXRelative < currentRegionWidth && colPrefixSums[candidateXRelative] === totalK) {
            shouldForceVertical = true;
        }
    } else if (colPrefixSums[candidateXRelative] === totalK) {
        // Search backward for the last column where cumulative hash count is not totalK
        while (candidateXRelative >= 0 && colPrefixSums[candidateXRelative] === totalK) {
            candidateXRelative--;
        }
        // Original: if (x2[xf] === 0 || x2[xf] === k) return f(...)
        // If we reached the start, or found a point with 0 or totalK hashes, force vertical.
        if (candidateXRelative < 0 || colPrefixSums[candidateXRelative] === 0 || colPrefixSums[candidateXRelative] === totalK) {
            shouldForceVertical = true;
        }
    }

    if (!shouldForceVertical) {
        // If no condition forced a vertical split, proceed with horizontal split
        return { type: 'horizontal', splitIndex: candidateXRelative, splitKValue: colPrefixSums[candidateXRelative] };
    }

    // If a vertical split was forced by the horizontal split conditions,
    // apply the vertical split logic (same as the width=1 case).
    const midYRelative = Math.floor(currentRegionHeight / 2);
    let chosenYRelative = midYRelative;
    if (rowPrefixSums[chosenYRelative] === 0) {
        while (chosenYRelative < currentRegionHeight && rowPrefixSums[chosenYRelative] === 0) {
            chosenYRelative++;
        }
    } else if (rowPrefixSums[chosenYRelative] === totalK) {
        while (chosenYRelative >= 0 && rowPrefixSums[chosenYRelative] === totalK) {
            chosenYRelative--;
        }
    }
    return { type: 'vertical', splitIndex: chosenYRelative, splitKValue: rowPrefixSums[chosenYRelative] };
}
