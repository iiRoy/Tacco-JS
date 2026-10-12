"use strict";

// Helper function for binary search to find bounds within a sorted array.
// It returns an object containing two indices:
// 'before': The index of the largest element less than or equal to the target value.
//           Returns -1 if all elements are greater than the target.
// 'after': The index of the smallest element greater than or equal to the target value.
//          Returns array.length if all elements are less than the target.
function locateBoundaries(sortedCollection, targetValue) {
    let beforeIndex = -1; 
    let afterIndex = sortedCollection.length; 

    // Binary search to find the 'afterIndex' (first element >= targetValue)
    let leftCursor = 0;
    let rightCursor = sortedCollection.length - 1;
    while (leftCursor <= rightCursor) {
        let midPoint = Math.floor((leftCursor + rightCursor) / 2);
        if (sortedCollection[midPoint] >= targetValue) {
            afterIndex = midPoint;
            rightCursor = midPoint - 1;
        } else {
            leftCursor = midPoint + 1;
        }
    }

    // Binary search to find the 'beforeIndex' (last element <= targetValue)
    leftCursor = 0;
    rightCursor = sortedCollection.length - 1;
    while (leftCursor <= rightCursor) {
        let midPoint = Math.floor((leftCursor + rightCursor) / 2);
        if (sortedCollection[midPoint] <= targetValue) {
            beforeIndex = midPoint;
            leftCursor = midPoint + 1;
        } else {
            rightCursor = midPoint - 1;
        }
    }

    return { before: beforeIndex, after: afterIndex };
}

// Helper function to compute the minimum travel distance between a query point,
// a potential shrine location, and a potential temple location.
// It considers two distinct paths: Query -> Shrine -> Temple and Query -> Temple -> Shrine.
function determineMinimumTravel(queryPosition, shrineCandidatePosition, templeCandidatePosition) {
    const pathViaShrineFirst = Math.abs(queryPosition - shrineCandidatePosition) + Math.abs(shrineCandidatePosition - templeCandidatePosition);
    const pathViaTempleFirst = Math.abs(queryPosition - templeCandidatePosition) + Math.abs(templeCandidatePosition - shrineCandidatePosition);
    return Math.min(pathViaShrineFirst, pathViaTempleFirst);
}

function processInputAndGenerateSolution(rawInputData) {
    const numericValues = rawInputData.split(/\s+/).map(Number);

    let dataPointer = 0;
    const numShrines = numericValues[dataPointer++];
    const numTemples = numericValues[dataPointer++];
    const numQueries = numericValues[dataPointer++];

    // Extract shrine locations and sort them to enable efficient searching
    const shrineCoordinates = numericValues.slice(dataPointer, dataPointer + numShrines);
    shrineCoordinates.sort((a, b) => a - b);
    dataPointer += numShrines;

    // Extract temple locations and sort them to enable efficient searching
    const templeCoordinates = numericValues.slice(dataPointer, dataPointer + numTemples);
    templeCoordinates.sort((a, b) => a - b);
    dataPointer += numTemples;

    // Extract query points, associating each with its original index
    const queryRequests = numericValues.slice(dataPointer, dataPointer + numQueries).map((value, originalIdx) => ({
        pointValue: value,
        initialIndex: originalIdx
    }));

    // Sort query requests by their point value to optimize processing,
    // but store results based on their original index.
    queryRequests.sort((a, b) => a.pointValue - b.pointValue);

    const finalOutputArray = new Array(numQueries);

    for (const currentRequest of queryRequests) {
        const currentQueryPoint = currentRequest.pointValue;
        const originalResultIndex = currentRequest.initialIndex;

        // Determine the two nearest shrine locations (one less than, one greater than or equal to the query point)
        const shrineBoundaries = locateBoundaries(shrineCoordinates, currentQueryPoint);
        const closestShrineBefore = (shrineBoundaries.before !== -1) ? shrineCoordinates[shrineBoundaries.before] : -1e14;
        const closestShrineAfter = (shrineBoundaries.after !== shrineCoordinates.length) ? shrineCoordinates[shrineBoundaries.after] : 1e14;

        // Determine the two nearest temple locations (one less than, one greater than or equal to the query point)
        const templeBoundaries = locateBoundaries(templeCoordinates, currentQueryPoint);
        const closestTempleBefore = (templeBoundaries.before !== -1) ? templeCoordinates[templeBoundaries.before] : -1e15;
        const closestTempleAfter = (templeBoundaries.after !== templeCoordinates.length) ? templeCoordinates[templeBoundaries.after] : 1e15;

        // Calculate the overall minimum distance by considering all four combinations of closest shrines and temples.
        // Each combination involves two possible travel paths (via shrine first or via temple first).
        const overallMinimumDistance = Math.min(
            determineMinimumTravel(currentQueryPoint, closestShrineBefore, closestTempleBefore),
            determineMinimumTravel(currentQueryPoint, closestShrineBefore, closestTempleAfter),
            determineMinimumTravel(currentQueryPoint, closestShrineAfter, closestTempleBefore),
            determineMinimumTravel(currentQueryPoint, closestShrineAfter, closestTempleAfter)
        );
        
        finalOutputArray[originalResultIndex] = overallMinimumDistance.toString();
    }

    console.log(finalOutputArray.join("\n").trim() + '\n');
}

processInputAndGenerateSolution(require('fs').readFileSync("/dev/stdin", "utf8"));
