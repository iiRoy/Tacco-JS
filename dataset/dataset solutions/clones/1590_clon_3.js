"use strict";
var fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenArray = fileContent.split(/ |\n/);
var tokenIndex = 0;

function readNumber() {
    return +tokenArray[tokenIndex++];
}

function readString() {
    return tokenArray[tokenIndex++];
}

function readBigIntVal() {
    return BigInt(tokenArray[tokenIndex++]);
}

function readNumbersOrStrings(count, returnStrings = false) {
    const slice = tokenArray.slice(tokenIndex, tokenIndex + count);
    tokenIndex += count;
    if (returnStrings) {
        return slice;
    } else {
        return slice.map(val => +val);
    }
}

function readMatrixData(height, width, returnStrings = false) {
    const resultMatrix = [];
    for (let i = 0; i < height; i++) {
        const rowSlice = tokenArray.slice(tokenIndex, tokenIndex + width);
        tokenIndex += width;
        if (returnStrings) {
            resultMatrix.push(rowSlice);
        } else {
            resultMatrix.push(rowSlice.map(val => +val));
        }
    }
    return resultMatrix;
}

function initializeMultiDimArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimSize = dimensions[0];
    const remainingDims = dimensions.slice(1);
    const newArray = new Array(currentDimSize);
    for (let i = 0; i < currentDimSize; i++) {
        newArray[i] = initializeMultiDimArray(initialValue, ...remainingDims);
    }
    return newArray;
}

var finalResult = main();
if (finalResult !== undefined) {
    console.log(String(finalResult));
}

function main() {
    var dimensionSize = readNumber();
    var memoizationTable = initializeMultiDimArray(-1, dimensionSize + 1, dimensionSize + 1);
    var offsetCounter = 0;
    var initialPair = readNumbersOrStrings(2).sort((val1, val2) => val1 - val2);
    var pendingUpdates;

    memoizationTable[0][0] = 0;
    memoizationTable[0][initialPair[0]] = 0;
    memoizationTable[0][initialPair[1]] = 0;
    memoizationTable[initialPair[0]][initialPair[1]] = 0;

    for (var iterationIndex = 1; iterationIndex < dimensionSize; iterationIndex++) {
        var currentTriple = readNumbersOrStrings(3).sort((val1, val2) => val1 - val2);
        processTriple(...currentTriple);
    }

    var finalCheckValue = readNumber();
    const baseCaseResult = memoizationTable[0][0];
    const finalCaseResult = memoizationTable[finalCheckValue][finalCheckValue] + 1;
    const maxCalculatedValue = Math.max(baseCaseResult, finalCaseResult);
    return maxCalculatedValue + offsetCounter;

    function processTriple(valU, valV, valW) {
        if (valU === valW) {
            offsetCounter++;
            return;
        }
        pendingUpdates = [];

        handleSingleValueUpdates(valU);
        if (valU < valV) handleSingleValueUpdates(valV);
        if (valV < valW) handleSingleValueUpdates(valW);

        handlePairValueUpdates(valU, valV);
        if (valV < valW) handlePairValueUpdates(valU, valW);
        if (valU < valV) handlePairValueUpdates(valV, valW);

        handleTripleValueUpdates(valU, valV, valW);

        while (pendingUpdates.length > 0) {
            const updateValue = pendingUpdates.pop();
            const updateCol = pendingUpdates.pop();
            const updateRow = pendingUpdates.pop();
            if (memoizationTable[updateRow][updateCol] < updateValue) {
                memoizationTable[updateRow][updateCol] = updateValue;
            }
        }
    }

    function handleSingleValueUpdates(currentVal) {
        enqueueIncrementedUpdate(0, 0, currentVal, currentVal);
        for (var idx = 0; idx < currentVal; idx++) {
            enqueueSimpleUpdate(idx, currentVal, 0, idx);
        }
        for (var idx = currentVal; idx <= dimensionSize; idx++) {
            enqueueSimpleUpdate(currentVal, idx, 0, idx);
        }
    }

    function handlePairValueUpdates(valX, valY) {
        enqueueSimpleUpdate(valX, valY, 0, 0);
        enqueueIncrementedUpdate(0, valY, valX, valX);
        if (valX < valY) {
            enqueueIncrementedUpdate(0, valX, valY, valY);
        } else { // valX === valY
            for (var idx = 0; idx < valX; idx++) {
                enqueueIncrementedUpdate(0, idx, idx, valX);
            }
            for (var idx = valX; idx <= dimensionSize; idx++) {
                enqueueIncrementedUpdate(0, idx, valX, idx);
            }
        }
    }

    function handleTripleValueUpdates(valX, valY, valZ) {
        enqueueIncrementedUpdate(valY, valZ, valX, valX);
        if (valX < valY) {
            enqueueIncrementedUpdate(valX, valZ, valY, valY);
            if (valY < valZ) {
                enqueueIncrementedUpdate(valX, valY, valZ, valZ);
            } else { // valY === valZ
                for (var idx = 0; idx < valX; idx++) {
                    enqueueIncrementedUpdate(idx, valX, idx, valZ);
                }
                for (var idx = valX; idx < valZ; idx++) {
                    enqueueIncrementedUpdate(valX, idx, idx, valZ);
                }
                for (var idx = valZ; idx <= dimensionSize; idx++) {
                    enqueueIncrementedUpdate(valX, idx, valZ, idx);
                }
            }
        } else { // valX === valY
            enqueueIncrementedUpdate(valX, valX, valZ, valZ);
            for (var idx = 0; idx < valX; idx++) {
                enqueueIncrementedUpdate(idx, valZ, idx, valX);
            }
            for (var idx = valX; idx < valZ; idx++) {
                enqueueIncrementedUpdate(idx, valZ, valX, idx);
            }
            for (var idx = valZ; idx <= dimensionSize; idx++) {
                enqueueIncrementedUpdate(valZ, idx, valX, idx);
            }
        }
    }

    function enqueueSimpleUpdate(idxA, idxB, idxC, idxD) {
        if (memoizationTable[idxA][idxB] < memoizationTable[idxC][idxD]) {
            pendingUpdates.push(memoizationTable[idxC][idxD], idxB, idxA);
        }
    }

    function enqueueIncrementedUpdate(idxA, idxB, idxC, idxD) {
        if (memoizationTable[idxA][idxB] < memoizationTable[idxC][idxD] + 1) {
            pendingUpdates.push(memoizationTable[idxC][idxD] + 1, idxB, idxA);
        }
    }
}
