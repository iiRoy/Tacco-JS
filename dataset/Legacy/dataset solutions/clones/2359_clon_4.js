"use strict";

class InputProcessor {
    constructor(sourceText) {
        this.lineSource = sourceText.trim().split('\n');
        this.currentLineIndex = 0;
        this.currentTokenBuffer = [];
    }

    _ensureTokens() {
        if (this.currentTokenBuffer.length === 0 && this.currentLineIndex < this.lineSource.length) {
            this.currentTokenBuffer = this.lineSource[this.currentLineIndex++].split(' ');
        }
    }

    extractToken(asString) {
        this._ensureTokens();
        if (this.currentTokenBuffer.length === 0) {
            return undefined;
        }
        const token = this.currentTokenBuffer.shift();
        return asString ? token : Number(token);
    }

    obtainLine(asString) {
        if (this.currentLineIndex >= this.lineSource.length) {
            return undefined;
        }
        const lineTokens = this.lineSource[this.currentLineIndex++].split(' ');
        return asString ? lineTokens : lineTokens.map(Number);
    }

    fetchMatrix(rowCount, asString) {
        const matrix = [];
        for (let i = 0; i < rowCount; i++) {
            matrix.push(this.obtainLine(asString));
        }
        return matrix;
    }

    retrieveLines(rowCount, asString) {
        const lines = this.lineSource.slice(this.currentLineIndex, this.currentLineIndex + rowCount);
        this.currentLineIndex += rowCount;
        return asString ? lines : lines.map(Number);
    }
}

const inputParser = (text) => new InputProcessor(text);

function createMultiDimArray(initialValueString, ...dimensions) {
    const generateLeaf = () => {
        if (initialValueString === "new Set()") {
            return new Set();
        } else if (initialValueString === "[]") {
            return [];
        }
        const numVal = Number(initialValueString);
        return isNaN(numVal) ? initialValueString : numVal;
    };

    const buildRecursive = (dims, currentDimIndex) => {
        if (currentDimIndex === dims.length) {
            return generateLeaf();
        }
        const currentDimSize = dims[currentDimIndex];
        const arr = new Array(currentDimSize);
        for (let i = 0; i < currentDimSize; i++) {
            arr[i] = buildRecursive(dims, currentDimIndex + 1);
        }
        return arr;
    };
    return buildRecursive(dimensions, 0);
}

const dataStream = inputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(solveProblem());

function solveProblem() {
    const gridHeight = dataStream.extractToken();
    const gridWidth = dataStream.extractToken();

    const matrixA = dataStream.fetchMatrix(gridHeight);
    const matrixB = dataStream.fetchMatrix(gridHeight);

    const diffMatrix = matrixA.map((rowA, rowIndex) =>
        rowA.map((valA, colIndex) => valA - matrixB[rowIndex][colIndex])
    );

    const dpMap = new Map();
    const getMapKey = (row, col) => `${row}_${col}`;

    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            const currentKey = getMapKey(rowIndex, colIndex);
            const currentDiffValue = diffMatrix[rowIndex][colIndex];
            const currentCellPossibleSums = new Set();

            if (rowIndex === 0 && colIndex === 0) {
                currentCellPossibleSums.add(Math.abs(currentDiffValue));
            } else {
                let combinedPredecessorSums = new Set();

                if (rowIndex > 0) {
                    const upKey = getMapKey(rowIndex - 1, colIndex);
                    const upStates = dpMap.get(upKey);
                    if (upStates) {
                        for (const val of upStates) {
                            combinedPredecessorSums.add(val);
                        }
                    }
                }
                if (colIndex > 0) {
                    const leftKey = getMapKey(rowIndex, colIndex - 1);
                    const leftStates = dpMap.get(leftKey);
                    if (leftStates) {
                        for (const val of leftStates) {
                            combinedPredecessorSums.add(val);
                        }
                    }
                }

                for (const prevSum of combinedPredecessorSums) {
                    currentCellPossibleSums.add(Math.abs(prevSum + currentDiffValue));
                    currentCellPossibleSums.add(Math.abs(prevSum - currentDiffValue));
                }
            }
            dpMap.set(currentKey, currentCellPossibleSums);
        }
    }

    const finalCellKey = getMapKey(gridHeight - 1, gridWidth - 1);
    const finalSums = dpMap.get(finalCellKey);

    let minimumAbsoluteSum = Infinity;
    if (finalSums && finalSums.size > 0) {
        minimumAbsoluteSum = Math.min(...finalSums);
    }
    
    return minimumAbsoluteSum;
}
