"use strict";

const InputParserFactory = (function () {
    class InputReader {
        constructor(rawInput) {
            this.sourceLines = rawInput.trim().split("\n");
            this.currentLineIdx = 0;
        }

        _popNextTokenFromLine(lineTokens) {
            const token = lineTokens.pop();
            if (!lineTokens.length) {
                this.currentLineIdx++;
            }
            return token;
        }

        readToken(asString = false) {
            let currentLineData = this.sourceLines[this.currentLineIdx];
            if (typeof currentLineData === "string") {
                this.sourceLines[this.currentLineIdx] = currentLineData.split(" ").reverse();
            }
            const tokenValue = this._popNextTokenFromLine(this.sourceLines[this.currentLineIdx]);
            return asString ? tokenValue : +tokenValue;
        }

        readLineTokens(asStrings = false) {
            const line = this.sourceLines[this.currentLineIdx++].split(" ");
            return asStrings ? line : line.map(val => +val);
        }

        readMatrixTokens(numRows, asStrings = false) {
            const matrixRows = this.sourceLines.slice(this.currentLineIdx, this.currentLineIdx + numRows).map(row => row.split(" "));
            this.currentLineIdx += numRows;
            return asStrings ? matrixRows : matrixRows.map(row => row.map(val => +val));
        }

        readLinesAsTokens(numLines, asStrings = false) {
            const lines = this.sourceLines.slice(this.currentLineIdx, this.currentLineIdx + numLines);
            this.currentLineIdx += numLines;
            return asStrings ? lines : lines.map(val => +val);
        }
    }

    return function createInputReader(inputString) {
        return new InputReader(inputString);
    };
})();

const reader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function initializeMultiDimArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDimensionSize }, () => initializeMultiDimArray(initialValue, ...remainingDimensions));
}

let solve;
let performVerticalSplit;

console.log(executeSolution());

function executeSolution() {
    const gridHeight = reader.readToken();
    const gridWidth = reader.readToken();
    const targetSegments = reader.readToken();
    const charGrid = reader.readLinesAsTokens(gridHeight, true);

    const outputGrid = initializeMultiDimArray(1, gridHeight, gridWidth);

    const fillRemainingGridArea = (startY, startX, endY, endX, segmentIdToAssign) => {
        for (let r = startY; r < endY; r++) {
            for (let c = startX; c < endX; c++) {
                outputGrid[r][c] = segmentIdToAssign;
            }
        }
    };

    solve(0, 0, gridHeight, gridWidth, 1, targetSegments, outputGrid, charGrid, fillRemainingGridArea);

    return outputGrid.map(row => row.join(" ")).join("\n");
}

performVerticalSplit = function(currentY, currentX, endY, endX, segmentId, targetSegments, rowHashCounts, outputGrid, charGrid, fillRemainingGridArea) {
    const subGridHeight = endY - currentY;
    let verticalSplitOffset = Math.floor((currentY + endY) / 2) - currentY;

    if (rowHashCounts[verticalSplitOffset] === 0) {
        let tempOffset = verticalSplitOffset;
        while (tempOffset < subGridHeight - 1 && rowHashCounts[tempOffset] === 0) {
            tempOffset++;
        }
        verticalSplitOffset = tempOffset;
    } else if (rowHashCounts[verticalSplitOffset] === targetSegments) {
        let tempOffset = verticalSplitOffset;
        while (tempOffset > 0 && rowHashCounts[tempOffset] === targetSegments) {
            tempOffset--;
        }
        verticalSplitOffset = tempOffset;
    }

    const firstSegmentCount = rowHashCounts[verticalSplitOffset];
    const splitPointY = currentY + verticalSplitOffset + 1;

    solve(currentY, currentX, splitPointY, endX, segmentId, firstSegmentCount, outputGrid, charGrid, fillRemainingGridArea);
    solve(splitPointY, currentX, endY, endX, segmentId + firstSegmentCount, targetSegments - firstSegmentCount, outputGrid, charGrid, fillRemainingGridArea);
};

solve = function(currentY, currentX, endY, endX, segmentId, targetSegments, outputGrid, charGrid, fillRemainingGridArea) {
    if (targetSegments === 1) {
        fillRemainingGridArea(currentY, currentX, endY, endX, segmentId);
        return;
    }

    const subGridHeight = endY - currentY;
    const subGridWidth = endX - currentX;

    const rowHashCounts = initializeMultiDimArray(0, subGridHeight);
    const colHashCounts = initializeMultiDimArray(0, subGridWidth);

    const populateHashCounts = () => {
        for (let r = currentY; r < endY; r++) {
            for (let c = currentX; c < endX; c++) {
                if (charGrid[r][c] === "#") {
                    rowHashCounts[r - currentY]++;
                    colHashCounts[c - currentX]++;
                }
            }
        }
    };
    populateHashCounts();

    const calculatePrefixSums = (arr) => {
        for (let i = 1; i < arr.length; i++) {
            arr[i] += arr[i - 1];
        }
    };
    calculatePrefixSums(rowHashCounts);
    calculatePrefixSums(colHashCounts);

    if (currentX + 1 === endX) {
        performVerticalSplit(currentY, currentX, endY, endX, segmentId, targetSegments, rowHashCounts, outputGrid, charGrid, fillRemainingGridArea);
        return;
    }

    let horizontalSplitOffset = Math.floor((currentX + endX) / 2) - currentX;

    if (colHashCounts[horizontalSplitOffset] === 0) {
        let tempOffset = horizontalSplitOffset;
        while (tempOffset < subGridWidth - 1 && colHashCounts[tempOffset] === 0) {
            tempOffset++;
        }
        horizontalSplitOffset = tempOffset;
        if (colHashCounts[horizontalSplitOffset] === targetSegments) {
            performVerticalSplit(currentY, currentX, endY, endX, segmentId, targetSegments, rowHashCounts, outputGrid, charGrid, fillRemainingGridArea);
            return;
        }
    } else if (colHashCounts[horizontalSplitOffset] === targetSegments) {
        let tempOffset = horizontalSplitOffset;
        while (tempOffset > 0 && colHashCounts[tempOffset] === targetSegments) {
            tempOffset--;
        }
        horizontalSplitOffset = tempOffset;
        if (colHashCounts[horizontalSplitOffset] === 0 || colHashCounts[horizontalSplitOffset] === targetSegments) {
            performVerticalSplit(currentY, currentX, endY, endX, segmentId, targetSegments, rowHashCounts, outputGrid, charGrid, fillRemainingGridArea);
            return;
        }
    }

    const firstSegmentCount = colHashCounts[horizontalSplitOffset];
    const splitPointX = currentX + horizontalSplitOffset + 1;

    solve(currentY, currentX, endY, splitPointX, segmentId, firstSegmentCount, outputGrid, charGrid, fillRemainingGridArea);
    solve(currentY, splitPointX, endY, endX, segmentId + firstSegmentCount, targetSegments - firstSegmentCount, outputGrid, charGrid, fillRemainingGridArea);
};
