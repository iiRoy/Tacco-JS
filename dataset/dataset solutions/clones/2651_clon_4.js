"use strict";

const fileSystem = require('fs');

const inputDataString = fileSystem.readFileSync('/dev/stdin', 'UTF-8');
const inputLines = inputDataString.split('\n');

const arraySize = parseInt(inputLines[0]);
const targetArray = inputLines[1].split(' ').map(val => parseInt(val));
const initialArray = inputLines[2].split(' ').map(val => parseInt(val));

const checkArrayEquivalence = (arrA, arrB) => {
    if (arrA.length !== arrB.length) return false;
    let currentIdx = 0;
    while (currentIdx < arrA.length) {
        if (arrA[currentIdx] !== arrB[currentIdx]) return false;
        currentIdx++;
    }
    return true;
};

const computeTransformationSteps = (currentArrState, desiredArrState, arrLen, currentStep) => {
    if (checkArrayEquivalence(currentArrState, desiredArrState)) {
        return currentStep;
    }

    let maximumValue = -Infinity;
    let peakIndex = -1;
    let iterationIndex = 0;
    while (iterationIndex < arrLen) {
        if (currentArrState[iterationIndex] > maximumValue) {
            maximumValue = currentArrState[iterationIndex];
            peakIndex = iterationIndex;
        }
        iterationIndex++;
    }

    const nextArrState = [...currentArrState];

    const previousIndex = (peakIndex - 1 + arrLen) % arrLen;
    const subsequentIndex = (peakIndex + 1) % arrLen;

    nextArrState[peakIndex] = nextArrState[peakIndex] - nextArrState[previousIndex] - nextArrState[subsequentIndex];

    return computeTransformationSteps(nextArrState, desiredArrState, arrLen, currentStep + 1);
};

const finalCount = computeTransformationSteps(initialArray, targetArray, arraySize, 0);

console.log(finalCount);
