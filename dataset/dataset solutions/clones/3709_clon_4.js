"use strict";

const processInput = (textSource) => {
    const contentTokens = textSource.split(/\n|\s/).filter(segment => segment.length > 0);
    let tokenPointer = 0;
    const retrieveNextInteger = () => parseInt(contentTokens[tokenPointer++], 10);
    const retrieveIntegerCollection = (quantity) => {
        const collection = new Array(quantity);
        for (let idx = 0; idx < quantity; ++idx) {
            collection[idx] = retrieveNextInteger();
        }
        return collection;
    };
    return { retrieveNextInteger, retrieveIntegerCollection };
};

const swapElements = (dataArray, indexA, indexB) => {
    const temporary = dataArray[indexA];
    dataArray[indexA] = dataArray[indexB];
    dataArray[indexB] = temporary;
};

const partitionArray = (dataArray, startIdx, endIdx, pivotSourceIdx) => {
    const pivotValue = dataArray[pivotSourceIdx];
    swapElements(dataArray, pivotSourceIdx, endIdx); // Move pivot to end
    let storePosition = startIdx;
    for (let currentIdx = startIdx; currentIdx < endIdx; ++currentIdx) {
        if (dataArray[currentIdx] < pivotValue) {
            swapElements(dataArray, storePosition, currentIdx);
            storePosition++;
        }
    }
    swapElements(dataArray, endIdx, storePosition); // Move pivot to its final sorted position
    return storePosition;
};

const selectKthElement = (dataArray, targetK) => {
    let workingList = [...dataArray]; // Operate on a copy
    let currentLeft = 0;
    let currentRight = workingList.length - 1;

    while (currentLeft <= currentRight) {
        const pivotRandIdx = Math.floor(Math.random() * (currentRight - currentLeft + 1)) + currentLeft;
        const finalPivotPosition = partitionArray(workingList, currentLeft, currentRight, pivotRandIdx);

        if (finalPivotPosition === targetK) {
            return workingList[finalPivotPosition];
        } else if (finalPivotPosition < targetK) {
            currentLeft = finalPivotPosition + 1;
        } else {
            currentRight = finalPivotPosition - 1;
        }
    }
    return null; // Should not be reached for valid k
};

const computeTotalDiscrepancy = (inputPayload) => {
    const inputProcessor = processInput(inputPayload);
    const itemQuantity = inputProcessor.retrieveNextInteger();
    const originalNumbers = inputProcessor.retrieveIntegerCollection(itemQuantity);

    const modifiedValues = new Array(itemQuantity);
    for (let elementId = 0; elementId < itemQuantity; ++elementId) {
        modifiedValues[elementId] = originalNumbers[elementId] - elementId - 1;
    }

    const medianOrdinal = Math.floor(itemQuantity / 2);
    const optimalBaseValue = selectKthElement(modifiedValues, medianOrdinal);

    let accumulatedDiscrepancy = 0;
    for (let elementId = 0; elementId < itemQuantity; ++elementId) {
        accumulatedDiscrepancy += Math.abs(originalNumbers[elementId] - (optimalBaseValue + elementId + 1));
    }
    console.log(accumulatedDiscrepancy);
};

if (typeof globalThis.check_for_browser_env === "undefined") {
    const fileSystemHandler = require("node:fs");
    const standardInputPath = "/dev/stdin";
    const entireInputContent = fileSystemHandler.readFileSync(standardInputPath, "utf8");
    computeTotalDiscrepancy(entireInputContent);
}