"use strict";

const MAXIMUM_OPERATION_ATTEMPTS = 1000000;

function retrieveRawInputData() {
    try {
        return require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (readError) {
        console.error("Input acquisition failed:", readError.message);
        process.exit(1);
    }
}

function processNumericStringIntoArray(numericStringSegment) {
    return numericStringSegment.split(' ').map(strValue => {
        const parsedNumber = parseInt(strValue.trim(), 10);
        if (isNaN(parsedNumber)) {
            throw new Error(`Non-numeric value encountered: '${strValue}'`);
        }
        return parsedNumber;
    });
}

function verifyArrayEquivalence(firstArr, secondArr) {
    if (firstArr.length !== secondArr.length) {
        return false;
    }
    for (let index = 0; index < firstArr.length; index++) {
        if (firstArr[index] !== secondArr[index]) {
            return false;
        }
    }
    return true;
}

function obtainElementNeighbors(targetArray, elementIdx) {
    const arrayLength = targetArray.length;
    let predecessor, successor;

    if (arrayLength < 2) {
        return { predecessorElement: 0, successorElement: 0 };
    }

    if (elementIdx === 0) {
        predecessor = targetArray[arrayLength - 1];
        successor = targetArray[1];
    } else if (elementIdx === arrayLength - 1) {
        predecessor = targetArray[arrayLength - 2];
        successor = targetArray[0];
    } else {
        predecessor = targetArray[elementIdx - 1];
        successor = targetArray[elementIdx + 1];
    }
    return { predecessorElement: predecessor, successorElement: successor };
}

function findIndexOfLargestValue(inputArray, largestValue) {
    for (let i = 0; i < inputArray.length; i++) {
        if (inputArray[i] === largestValue) {
            return i;
        }
    }
    return -1;
}

const fullInputBuffer = retrieveRawInputData();
const inputRecordLines = fullInputBuffer.split('\n');

const desiredFinalState = processNumericStringIntoArray(inputRecordLines[1]);
const initialWorkingVector = processNumericStringIntoArray(inputRecordLines[2]);

let currentTransformableVector = initialWorkingVector.slice();

let transformationCount = 0;

while (true) {
    if (transformationCount >= MAXIMUM_OPERATION_ATTEMPTS) {
        console.log("-1");
        break;
    }

    const currentPeakValue = Math.max(...currentTransformableVector);
    const peakElementPosition = findIndexOfLargestValue(currentTransformableVector, currentPeakValue);

    if (peakElementPosition === -1) {
        console.log("-1");
        break;
    }

    const { predecessorElement, successorElement } = obtainElementNeighbors(currentTransformableVector, peakElementPosition);

    currentTransformableVector[peakElementPosition] -= (predecessorElement + successorElement);

    transformationCount++;

    if (verifyArrayEquivalence(currentTransformableVector, desiredFinalState)) {
        console.log(transformationCount);
        break;
    }

    const anyElementBelowThreshold = currentTransformableVector.some(valueCheck => valueCheck < 1);
    if (anyElementBelowThreshold) {
        console.log("-1");
        break;
    }
}