"use strict";

var dataSource = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenBuffer = dataSource.split(/ |\n/), currentPointer = 0;


function fetchInteger() {
    return +tokenBuffer[currentPointer++];
}

function fetchString() {
    return tokenBuffer[currentPointer++];
}

function fetchLargeInteger() {
    return BigInt(tokenBuffer[currentPointer++]);
}

function fetchSequence(countItems, asStrings) {
    return asStrings
        ? tokenBuffer.slice(currentPointer, currentPointer += countItems)
        : tokenBuffer.slice(currentPointer, currentPointer += countItems).map(element => +element);
}

function fetchMatrix(matrixRows, matrixCols, asStrings) {
    var matrixResult = [], rowIndex = 0;

    if (asStrings) {
        for (; rowIndex < matrixRows; rowIndex++) {
            matrixResult.push(tokenBuffer.slice(currentPointer, currentPointer += matrixCols));
        }
    } else {
        for (; rowIndex < matrixRows; rowIndex++) {
            matrixResult.push(tokenBuffer.slice(currentPointer, currentPointer += matrixCols).map(element => +element));
        }
    }
    return matrixResult;
}

function createMultiDimArray(initialFillValue) {
    var dimensionsArguments = arguments, dimensionIndex = dimensionsArguments.length,
        arrayConstructionCode = "Array(dimensionsArguments[" + --dimensionIndex + "]).fill().map(entry => { return " + initialFillValue + "; })";
    while (--dimensionIndex) {
        arrayConstructionCode = "Array(dimensionsArguments[" + dimensionIndex + "]).fill().map(entry => " + arrayConstructionCode + ")";
    }
    return eval(arrayConstructionCode);
}


var programResult = executeProgram();
if (programResult !== undefined) {
    console.log(String(programResult));
}


function executeProgram() {
    var elementCount = fetchInteger();
    var memoTable = createMultiDimArray(-1, elementCount + 1, elementCount + 1), incrementor = 0;
    var tempArr = fetchSequence(2), processingQueue;

    memoTable[0][0] = memoTable[0][tempArr[0]] = memoTable[0][tempArr[1]] = memoTable[tempArr[0]][tempArr[1]] = 0;

    for (var loopCounter = 1; loopCounter < elementCount; loopCounter++) {
        tempArr = fetchSequence(3).sort((val1, val2) => val1 - val2);
        processStep(...tempArr);
    }

    tempArr = fetchInteger();
    return Math.max(memoTable[0][0], memoTable[tempArr][tempArr] + 1) + incrementor;


    function processStep(firstVal, secondVal, thirdVal) {
        if (firstVal === thirdVal) {
            return incrementor++;
        }
        processingQueue = [];

        handleStage1(firstVal);
        if (firstVal < secondVal) {
            handleStage1(secondVal);
        }
        if (secondVal < thirdVal) {
            handleStage1(thirdVal);
        }

        handleStage2(firstVal, secondVal);
        if (secondVal < thirdVal) {
            handleStage2(firstVal, thirdVal);
        }
        if (firstVal < secondVal) {
            handleStage2(secondVal, thirdVal);
        }

        handleStage3(firstVal, secondVal, thirdVal);

        while (processingQueue.length) {
            var valX = processingQueue.pop(), valY = processingQueue.pop(), valZ = processingQueue.pop();
            if (memoTable[valX][valY] < valZ) {
                memoTable[valX][valY] = valZ;
            }
        }
    }

    function handleStage1(firstVal) {
        updateAndIncrementIfGreater(0, 0, firstVal, firstVal);
        for (var loopCounter = 0; loopCounter < firstVal; loopCounter++) {
            updateValueIfGreater(loopCounter, firstVal, 0, loopCounter);
        }
        for (var loopCounter = firstVal; loopCounter <= elementCount; loopCounter++) {
            updateValueIfGreater(firstVal, loopCounter, 0, loopCounter);
        }
    }

    function handleStage2(firstVal, secondVal) {
        updateValueIfGreater(firstVal, secondVal, 0, 0);
        updateAndIncrementIfGreater(0, secondVal, firstVal, firstVal);

        if (firstVal < secondVal) {
            updateAndIncrementIfGreater(0, firstVal, secondVal, secondVal);
        } else { // firstVal = secondVal
            for (var loopCounter = 0; loopCounter < firstVal; loopCounter++) {
                updateAndIncrementIfGreater(0, loopCounter, loopCounter, firstVal);
            }
            for (var loopCounter = firstVal; loopCounter <= elementCount; loopCounter++) {
                updateAndIncrementIfGreater(0, loopCounter, firstVal, loopCounter);
            }
        }
    }

    function handleStage3(firstVal, secondVal, thirdVal) {
        updateAndIncrementIfGreater(secondVal, thirdVal, firstVal, firstVal);

        if (firstVal < secondVal) {
            updateAndIncrementIfGreater(firstVal, thirdVal, secondVal, secondVal);
            if (secondVal < thirdVal) {
                updateAndIncrementIfGreater(firstVal, secondVal, thirdVal, thirdVal);
            } else { // secondVal = thirdVal
                for (var loopCounter = 0; loopCounter < firstVal; loopCounter++) {
                    updateAndIncrementIfGreater(loopCounter, firstVal, loopCounter, thirdVal);
                }
                for (var loopCounter = firstVal; loopCounter < thirdVal; loopCounter++) {
                    updateAndIncrementIfGreater(firstVal, loopCounter, loopCounter, thirdVal);
                }
                for (var loopCounter = thirdVal; loopCounter <= elementCount; loopCounter++) {
                    updateAndIncrementIfGreater(firstVal, loopCounter, thirdVal, loopCounter);
                }
            }
        } else { // firstVal = secondVal
            updateAndIncrementIfGreater(firstVal, firstVal, thirdVal, thirdVal);
            for (var loopCounter = 0; loopCounter < firstVal; loopCounter++) {
                updateAndIncrementIfGreater(loopCounter, thirdVal, loopCounter, firstVal);
            }
            for (var loopCounter = firstVal; loopCounter < thirdVal; loopCounter++) {
                updateAndIncrementIfGreater(loopCounter, thirdVal, firstVal, loopCounter);
            }
            for (var loopCounter = thirdVal; loopCounter <= elementCount; loopCounter++) {
                updateAndIncrementIfGreater(thirdVal, loopCounter, firstVal, loopCounter);
            }
        }
    }

    function updateValueIfGreater(idxA, idxB, idxC, idxD) {
        if (memoTable[idxA][idxB] < memoTable[idxC][idxD]) {
            processingQueue.push(memoTable[idxC][idxD], idxB, idxA);
        }
    }

    function updateAndIncrementIfGreater(idxA, idxB, idxC, idxD) {
        if (memoTable[idxA][idxB] < memoTable[idxC][idxD] + 1) {
            processingQueue.push(memoTable[idxC][idxD] + 1, idxB, idxA);
        }
    }
}