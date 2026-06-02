"use strict";

const inputSourceReader = (sourceContent) => {
    let contentLines = sourceContent.trim().split('\n');
    let currentLinePointer = 0;
    let currentLineTokens = [];

    const ensureTokensAvailable = () => {
        if (currentLineTokens.length === 0 && currentLinePointer < contentLines.length) {
            currentLineTokens = contentLines[currentLinePointer].split(' ').reverse();
            currentLinePointer++;
        }
    };

    const retrieveToken = (asString) => {
        ensureTokensAvailable();
        if (currentLineTokens.length === 0) return undefined;
        const tokenValue = currentLineTokens.pop();
        return asString ? tokenValue : Number(tokenValue);
    };

    const retrieveLineTokens = (asString) => {
        if (currentLinePointer >= contentLines.length) return undefined;
        const lineContent = contentLines[currentLinePointer++];
        const parts = lineContent.split(' ');
        return asString ? parts : parts.map(Number);
    };

    const retrieveTokenMatrix = (rowCount, asString) => {
        return Array.from({ length: rowCount }, () => retrieveLineTokens(asString));
    };

    const retrieveRawLines = (rowCount, asString) => {
        return Array.from({ length: rowCount }, () => {
            if (currentLinePointer >= contentLines.length) return undefined;
            const line = contentLines[currentLinePointer++];
            return asString ? line : Number(line);
        });
    };

    return {
        fetchValue: retrieveToken,
        fetchLine: retrieveLineTokens,
        fetchMatrix: retrieveTokenMatrix,
        fetchLines: retrieveRawLines
    };
};

const generateMultiDimensionalArray = (initialFillValue, ...dimensions) => {
    const constructRecursive = (dims) => {
        if (dims.length === 0) {
            return initialFillValue;
        }
        const currentDimensionSize = dims[0];
        const remainingDimensions = dims.slice(1);
        return Array.from({ length: currentDimensionSize }, () => constructRecursive(remainingDimensions));
    };
    return constructRecursive(dimensions);
};

const inputReader = inputSourceReader(require("fs").readFileSync("/dev/stdin", "utf8"));
const MAX_VALUE = 1e15;

console.log(calculateMinCost());

function calculateMinCost() {
    const countN = inputReader.fetchValue();
    const limitX = inputReader.fetchValue();
    const heights = [0].concat(inputReader.fetchLine());

    let currentDpTable = generateMultiDimensionalArray(MAX_VALUE, 2, 2);
    currentDpTable[0][0] = heights[1];
    currentDpTable[1][1] = 0;

    const finalDpState = Array.from({ length: countN - 1 }, (_, iterationIndex) => iterationIndex + 1)
        .reduce((previousDpTable, currentIterationI) => {
            const effectiveMin = Math.min(currentIterationI, limitX) + 1;
            let nextDpTable = generateMultiDimensionalArray(MAX_VALUE, effectiveMin + 1, effectiveMin + 1);

            Array.from({ length: effectiveMin }, (_, jIndex) => jIndex).forEach(jIndex => {
                Array.from({ length: effectiveMin - jIndex }, (_, kOffset) => jIndex + kOffset).forEach(kIndex => {
                    const heightDifference = Math.max(0, heights[currentIterationI + 1] - heights[currentIterationI - jIndex]);
                    
                    if (previousDpTable[kIndex][jIndex] + heightDifference < nextDpTable[kIndex][0]) {
                        nextDpTable[kIndex][0] = previousDpTable[kIndex][jIndex] + heightDifference;
                    }

                    if (jIndex < limitX) {
                        if (previousDpTable[kIndex][jIndex] < nextDpTable[kIndex + 1][jIndex + 1]) {
                            nextDpTable[kIndex + 1][jIndex + 1] = previousDpTable[kIndex][jIndex];
                        }
                    }
                });
            });
            return nextDpTable;
        }, currentDpTable);

    const minimumResult = Array.from({ length: limitX + 1 }, (_, idx) => idx)
        .reduce((minAccumulator, currentIdx) => Math.min(minAccumulator, finalDpState[limitX][currentIdx]), MAX_VALUE);

    return minimumResult;
}
