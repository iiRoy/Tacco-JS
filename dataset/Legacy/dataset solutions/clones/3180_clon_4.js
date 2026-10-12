"use strict";

const locatePosition = (sortedList, targetValue, lowBound, highBound) => {
    if (lowBound > highBound) {
        return lowBound;
    }

    const midPoint = Math.floor((lowBound + highBound) / 2);
    const midValue = sortedList[midPoint];

    if (midValue === targetValue) {
        return midPoint;
    } else if (midValue < targetValue) {
        return locatePosition(sortedList, targetValue, midPoint + 1, highBound);
    } else {
        return locatePosition(sortedList, targetValue, lowBound, midPoint - 1);
    }
};

const findMinimum = (...values) => Math.min(...values);

const processInputData = (rawData) => {
    const positiveSentinel = Number.MAX_SAFE_INTEGER;
    const negativeSentinel = -positiveSentinel;

    const inputLines = rawData.split("\n");

    const [configLine, ...dataLines] = inputLines;
    const [countA, countB, numQueries] = configLine.split(/\s/).map(Number);

    let currentLineOffset = 0;

    const shrineLocations = [
        negativeSentinel,
        ...dataLines.slice(currentLineOffset, currentLineOffset + countA).map(Number),
        positiveSentinel
    ];
    currentLineOffset += countA;

    const templeLocations = [
        negativeSentinel,
        ...dataLines.slice(currentLineOffset, currentLineOffset + countB).map(Number),
        positiveSentinel
    ];
    currentLineOffset += countB;

    const queryPositions = dataLines.slice(currentLineOffset, currentLineOffset + numQueries).map(Number);

    queryPositions.forEach((travelerPosition) => {
        const shrineIndex = locatePosition(shrineLocations, travelerPosition, 0, shrineLocations.length - 1);
        const templeIndex = locatePosition(templeLocations, travelerPosition, 0, templeLocations.length - 1);

        const candidateShrines = [shrineLocations[shrineIndex - 1], shrineLocations[shrineIndex]];
        const candidateTemples = [templeLocations[templeIndex - 1], templeLocations[templeIndex]];

        const currentOptimalDistance = candidateShrines.reduce((minAccumulator, currentShrine) => {
            return candidateTemples.reduce((innerMinAccumulator, currentTemple) => {
                const pathOneDistance = Math.abs(currentShrine - travelerPosition) + Math.abs(currentTemple - currentShrine);
                const pathTwoDistance = Math.abs(currentTemple - travelerPosition) + Math.abs(currentShrine - currentTemple);
                return findMinimum(innerMinAccumulator, pathOneDistance, pathTwoDistance);
            }, minAccumulator);
        }, positiveSentinel);

        console.log(currentOptimalDistance);
    });
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
