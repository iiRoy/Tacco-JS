"use strict";
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenizedInput = rawData.split(/ |\n/), currentTokenIndex = 0;
function readNextInt() { return +tokenizedInput[currentTokenIndex++]; }
function readNextString() { return tokenizedInput[currentTokenIndex++]; }
function readNextBigInt() { return BigInt(tokenizedInput[currentTokenIndex++]); }
function readNInts(count, asStrings) {
    if (asStrings) {
        return tokenizedInput.slice(currentTokenIndex, currentTokenIndex += count);
    } else {
        return tokenizedInput.slice(currentTokenIndex, currentTokenIndex += count).map(val => +val);
    }
}
function readMatrix(height, width, asStrings) {
    var resultMatrix = [], rowIdx = 0;
    if (asStrings) {
        for (; rowIdx < height; rowIdx++) {
            resultMatrix.push(tokenizedInput.slice(currentTokenIndex, currentTokenIndex += width));
        }
    } else {
        for (; rowIdx < height; rowIdx++) {
            resultMatrix.push(tokenizedInput.slice(currentTokenIndex, currentTokenIndex += width).map(val => +val));
        }
    }
    return resultMatrix;
}
function createMultiDimArray(initialValue) {
    var args = arguments, argCount = args.length,
        expression = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        expression = "Array(args[" + argCount + "]).fill().map(x=>" + expression + ")";
    }
    return eval(expression);
}

var finalResult = processData();
if (finalResult !== undefined) console.log(String(finalResult));

function processData() {
    var arraySize = readNextInt();
    var dynamicProgTable = createMultiDimArray(Number.NEGATIVE_INFINITY, arraySize + 1, arraySize + 1);
    var incrementCounter = 0;

    var initialElements = readNInts(2).sort((valA, valB) => valA - valB);
    
    dynamicProgTable[0][0] = 0;
    dynamicProgTable[0][initialElements[0]] = 0;
    dynamicProgTable[0][initialElements[1]] = 0;
    dynamicProgTable[initialElements[0]][initialElements[1]] = 0;

    for (var loopIdx = 1; loopIdx < arraySize; loopIdx++) {
        var currentElements = readNInts(3).sort((valA, valB) => valA - valB);
        processTriple(currentElements[0], currentElements[1], currentElements[2]);
    }
    
    var finalElement = readNextInt();
    var maxValForFinalElement = dynamicProgTable[finalElement][finalElement] + 1;
    return Math.max(dynamicProgTable[0][0], maxValForFinalElement) + incrementCounter;

    function processTriple(valA, valB, valC) {
        if (valA === valC) {
            incrementCounter++;
            return;
        }
        var updateQueue = [];

        handleSingleElement(valA);
        if (valA < valB) handleSingleElement(valB);
        if (valB < valC) handleSingleElement(valC);

        handleTwoElements(valA, valB);
        if (valB < valC) handleTwoElements(valA, valC);
        if (valA < valB) handleTwoElements(valB, valC);

        handleThreeElements(valA, valB, valC);

        while (updateQueue.length) {
            var queuedValue = updateQueue.pop();
            var targetCol = updateQueue.pop();
            var targetRow = updateQueue.pop();
            if (dynamicProgTable[targetRow][targetCol] < queuedValue) {
                dynamicProgTable[targetRow][targetCol] = queuedValue;
            }
        }
    }

    function handleSingleElement(elementVal) {
        enqueueIfGreaterPlusOne(0, 0, elementVal, elementVal);
        for (var loopIdx = 0; loopIdx < elementVal; loopIdx++) {
            enqueueIfGreater(loopIdx, elementVal, 0, loopIdx);
        }
        for (var loopIdx = elementVal; loopIdx <= arraySize; loopIdx++) {
            enqueueIfGreater(elementVal, loopIdx, 0, loopIdx);
        }
    }

    function handleTwoElements(elementValA, elementValB) {
        enqueueIfGreater(elementValA, elementValB, 0, 0);
        enqueueIfGreaterPlusOne(0, elementValB, elementValA, elementValA);
        if (elementValA < elementValB) {
            enqueueIfGreaterPlusOne(0, elementValA, elementValB, elementValB);
        } else {
            for (var loopIdx = 0; loopIdx < elementValA; loopIdx++) {
                enqueueIfGreaterPlusOne(0, loopIdx, loopIdx, elementValA);
            }
            for (var loopIdx = elementValA; loopIdx <= arraySize; loopIdx++) {
                enqueueIfGreaterPlusOne(0, loopIdx, elementValA, loopIdx);
            }
        }
    }

    function handleThreeElements(elementValA, elementValB, elementValC) {
        enqueueIfGreaterPlusOne(elementValB, elementValC, elementValA, elementValA);
        if (elementValA < elementValB) {
            enqueueIfGreaterPlusOne(elementValA, elementValC, elementValB, elementValB);
            if (elementValB < elementValC) {
                enqueueIfGreaterPlusOne(elementValA, elementValB, elementValC, elementValC);
            } else {
                for (var loopIdx = 0; loopIdx < elementValA; loopIdx++) {
                    enqueueIfGreaterPlusOne(loopIdx, elementValA, loopIdx, elementValC);
                }
                for (var loopIdx = elementValA; loopIdx < elementValC; loopIdx++) {
                    enqueueIfGreaterPlusOne(elementValA, loopIdx, loopIdx, elementValC);
                }
                for (var loopIdx = elementValC; loopIdx <= arraySize; loopIdx++) {
                    enqueueIfGreaterPlusOne(elementValA, loopIdx, elementValC, loopIdx);
                }
            }
        } else {
            enqueueIfGreaterPlusOne(elementValA, elementValA, elementValC, elementValC);
            for (var loopIdx = 0; loopIdx < elementValA; loopIdx++) {
                enqueueIfGreaterPlusOne(loopIdx, elementValC, loopIdx, elementValA);
            }
            for (var loopIdx = elementValA; loopIdx < elementValC; loopIdx++) {
                enqueueIfGreaterPlusOne(loopIdx, elementValC, elementValA, loopIdx);
            }
            for (var loopIdx = elementValC; loopIdx <= arraySize; loopIdx++) {
                enqueueIfGreaterPlusOne(elementValC, loopIdx, elementValA, loopIdx);
            }
        }
    }

    function enqueueIfGreater(rowIdxA, colIdxB, rowIdxC, colIdxD) {
        if (dynamicProgTable[rowIdxA][colIdxB] < dynamicProgTable[rowIdxC][colIdxD]) {
            updateQueue.push(dynamicProgTable[rowIdxC][colIdxD], colIdxB, rowIdxA);
        }
    }

    function enqueueIfGreaterPlusOne(rowIdxA, colIdxB, rowIdxC, colIdxD) {
        var sourceValuePlusOne = dynamicProgTable[rowIdxC][colIdxD] + 1;
        if (dynamicProgTable[rowIdxA][colIdxB] < sourceValuePlusOne) {
            updateQueue.push(sourceValuePlusOne, colIdxB, rowIdxA);
        }
    }
}
