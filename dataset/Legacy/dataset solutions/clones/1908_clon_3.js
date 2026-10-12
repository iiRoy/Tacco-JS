"use strict";
const fileSystem = require("fs");
const STDIN_SOURCE_PATH = "/dev/stdin";

const rawInputContent = fileSystem.readFileSync(STDIN_SOURCE_PATH, "utf8");
const inputTokens = rawInputContent.split(/ |\n/);

function findGroupEnd(dataArray, startIndex, totalLength) {
    let currentPointer = startIndex + 1;
    while (currentPointer < totalLength && dataArray[startIndex] === dataArray[currentPointer]) {
        currentPointer++;
    }
    return currentPointer;
}

function prepareSortedArray(sourceTokens, transformFunction) {
    return sourceTokens.map((itemValue, idx) => transformFunction(itemValue, idx)).sort((valA, valB) => valA - valB);
}

const computationResult = executeProcessing();
if (computationResult !== undefined) {
    console.log(computationResult);
}

function executeProcessing() {
    const elementCount = Number(inputTokens.shift());

    const transformFnA = (itemValue, idx) => Number(itemValue) + idx;
    const transformFnB = (itemValue, idx) => idx - Number(itemValue);

    const arrayOne = prepareSortedArray(inputTokens, transformFnA);
    const arrayTwo = prepareSortedArray(inputTokens, transformFnB);

    let pointerA = 0;
    let pointerB = 0;
    let totalMatches = 0;

    while (pointerA < elementCount && pointerB < elementCount) {
        const nextPointerA = findGroupEnd(arrayOne, pointerA, elementCount);
        const nextPointerB = findGroupEnd(arrayTwo, pointerB, elementCount);

        const groupSizeA = nextPointerA - pointerA;
        const groupSizeB = nextPointerB - pointerB;

        if (arrayOne[pointerA] === arrayTwo[pointerB]) {
            totalMatches += groupSizeA * groupSizeB;
            pointerA = nextPointerA;
            pointerB = nextPointerB;
        } else if (arrayOne[pointerA] < arrayTwo[pointerB]) {
            pointerA = nextPointerA;
        } else {
            pointerB = nextPointerB;
        }
    }

    return totalMatches;
}
