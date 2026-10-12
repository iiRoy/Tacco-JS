"use strict";

const NEGATIVE_INFINITY_SHRINE = -1e14;
const POSITIVE_INFINITY_SHRINE = 1e14;
const NEGATIVE_INFINITY_TEMPLE = -1e15;
const POSITIVE_INFINITY_TEMPLE = 1e15;

function calculateTravelDistance(startPoint, intermediatePoint, endPoint) {
    return Math.abs(startPoint - intermediatePoint) + Math.abs(intermediatePoint - endPoint);
}

function findInsertionPoint(sortedIndexedArray, valueToInsert) {
    let lowIndex = 0;
    let highIndex = sortedIndexedArray.length - 1;

    while (lowIndex <= highIndex) {
        const midIndex = Math.floor((lowIndex + highIndex) / 2);
        if (sortedIndexedArray[midIndex][0] < valueToInsert) {
            lowIndex = midIndex + 1;
        } else {
            highIndex = midIndex - 1;
        }
    }
    return lowIndex;
}

function sortAndIndex(inputArray) {
    const arrayLength = inputArray.length;
    if (arrayLength === 0) {
        return [];
    }

    const indexedSortedArray = [[inputArray[0], 0]];

    for (let currentIdx = 1; currentIdx < arrayLength; currentIdx++) {
        const currentElement = inputArray[currentIdx];
        const insertionPosition = findInsertionPoint(indexedSortedArray, currentElement);
        indexedSortedArray.splice(insertionPosition, 0, [currentElement, currentIdx]);
    }
    return indexedSortedArray;
}

function processInputData(rawInputData) {
    const allNumbers = rawInputData.split(/\s+/).map(Number);
    let currentNumberIndex = 0;
    const getNextNumber = () => allNumbers[currentNumberIndex++];

    const countShrines = getNextNumber();
    const countTemples = getNextNumber();
    const numQueries = getNextNumber();

    const shrineLocations = allNumbers.slice(currentNumberIndex, currentNumberIndex + countShrines);
    currentNumberIndex += countShrines;
    const templeLocations = allNumbers.slice(currentNumberIndex, currentNumberIndex + countTemples);
    currentNumberIndex += countTemples;
    const queryValues = allNumbers.slice(currentNumberIndex, currentNumberIndex + numQueries);

    const sortedQueriesWithIndices = sortAndIndex(queryValues);

    const shrineBeforeQuery = new Array(numQueries);
    const shrineAfterQuery = new Array(numQueries);
    const templeBeforeQuery = new Array(numQueries);
    const templeAfterQuery = new Array(numQueries);

    let currentShrineSearchIndex = 0;
    let currentTempleSearchIndex = 0;

    for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
        const currentQueryVal = sortedQueriesWithIndices[queryIdx][0];

        while (currentShrineSearchIndex < countShrines && shrineLocations[currentShrineSearchIndex] < currentQueryVal) {
            currentShrineSearchIndex++;
        }
        shrineBeforeQuery[queryIdx] = (shrineLocations[currentShrineSearchIndex - 1] !== undefined) ? shrineLocations[currentShrineSearchIndex - 1] : NEGATIVE_INFINITY_SHRINE;
        shrineAfterQuery[queryIdx] = (shrineLocations[currentShrineSearchIndex] !== undefined) ? shrineLocations[currentShrineSearchIndex] : POSITIVE_INFINITY_SHRINE;

        while (currentTempleSearchIndex < countTemples && templeLocations[currentTempleSearchIndex] < currentQueryVal) {
            currentTempleSearchIndex++;
        }
        templeBeforeQuery[queryIdx] = (templeLocations[currentTempleSearchIndex - 1] !== undefined) ? templeLocations[currentTempleSearchIndex - 1] : NEGATIVE_INFINITY_TEMPLE;
        templeAfterQuery[queryIdx] = (templeLocations[currentTempleSearchIndex] !== undefined) ? templeLocations[currentTempleSearchIndex] : POSITIVE_INFINITY_TEMPLE;
    }

    const resultsArray = new Array(numQueries);
    for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
        const originalQueryIdx = sortedQueriesWithIndices[queryIdx][1];
        const currentQueryVal = sortedQueriesWithIndices[queryIdx][0];

        const currentShrineBefore = shrineBeforeQuery[queryIdx];
        const currentShrineAfter = shrineAfterQuery[queryIdx];
        const currentTempleBefore = templeBeforeQuery[queryIdx];
        const currentTempleAfter = templeAfterQuery[queryIdx];

        resultsArray[originalQueryIdx] = Math.min(
            calculateTravelDistance(currentQueryVal, currentShrineAfter, currentTempleAfter),
            calculateTravelDistance(currentQueryVal, currentShrineAfter, currentTempleBefore),
            calculateTravelDistance(currentQueryVal, currentShrineBefore, currentTempleAfter),
            calculateTravelDistance(currentQueryVal, currentShrineBefore, currentTempleBefore),
            calculateTravelDistance(currentQueryVal, currentTempleAfter, currentShrineAfter),
            calculateTravelDistance(currentQueryVal, currentTempleAfter, currentShrineBefore),
            calculateTravelDistance(currentQueryVal, currentTempleBefore, currentShrineAfter),
            calculateTravelDistance(currentQueryVal, currentTempleBefore, currentShrineBefore)
        ).toString();
    }

    console.log(resultsArray.join("\n").trim() + '\n');
}

processInputData(require('fs').readFileSync("/dev/stdin", "utf8"));
