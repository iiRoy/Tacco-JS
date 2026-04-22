"use strict";

const getMagnitude = (val) => (val < 0) ? -val : val;

function obtainIndex(dataCollection, soughtElement, lowBoundary, highBoundary) {
    if (lowBoundary > highBoundary) {
        return lowBoundary;
    }

    const midPoint = lowBoundary + ((highBoundary - lowBoundary) >>> 1);

    if (dataCollection[midPoint] < soughtElement) {
        return obtainIndex(dataCollection, soughtElement, midPoint + 1, highBoundary);
    } else {
        return obtainIndex(dataCollection, soughtElement, lowBoundary, midPoint - 1);
    }
}

function executeComputation(inputData) {
    const MAX_VALUE = Infinity;
    const MIN_VALUE = -Infinity;

    const allLines = inputData.split('\n');
    let currentLineIndex = 0;

    const readNumbersFromLine = () => allLines[currentLineIndex++].split(/\s/).map(Number);
    const readSingleNumberFromLine = () => Number(allLines[currentLineIndex++]);

    const initialParameters = readNumbersFromLine();
    const countPrimary = initialParameters[0];
    const countSecondary = initialParameters[1];
    const numberOfQueries = initialParameters[2];

    const primaryLocations = [MIN_VALUE];
    for (let i = 0; i < countPrimary; ++i) {
        primaryLocations.push(readSingleNumberFromLine());
    }
    primaryLocations.push(MAX_VALUE);

    const secondaryLocations = [MIN_VALUE];
    for (let i = 0; i < countSecondary; ++i) {
        secondaryLocations.push(readSingleNumberFromLine());
    }
    secondaryLocations.push(MAX_VALUE);

    const collectedResults = [];

    for (let qIdx = 0; qIdx < numberOfQueries; ++qIdx) {
        const currentQueryPoint = readSingleNumberFromLine();

        const primaryLocationIdx = obtainIndex(primaryLocations, currentQueryPoint, 0, primaryLocations.length - 1);
        const secondaryLocationIdx = obtainIndex(secondaryLocations, currentQueryPoint, 0, secondaryLocations.length - 1);

        let shortestPath = MAX_VALUE;

        const candidatePrimarySites = [
            primaryLocations[primaryLocationIdx - 1],
            primaryLocations[primaryLocationIdx]
        ];

        const candidateSecondarySites = [
            secondaryLocations[secondaryLocationIdx - 1],
            secondaryLocations[secondaryLocationIdx]
        ];

        for (const siteP of candidatePrimarySites) {
            for (const siteS of candidateSecondarySites) {
                const pathOptionOne = getMagnitude(siteP - currentQueryPoint) + getMagnitude(siteS - siteP);
                const pathOptionTwo = getMagnitude(siteS - currentQueryPoint) + getMagnitude(siteP - siteS);

                shortestPath = Math.min(shortestPath, pathOptionOne, pathOptionTwo);
            }
        }
        collectedResults.push(shortestPath);
    }

    console.log(collectedResults.join('\n'));
}

executeComputation(require("fs").readFileSync("/dev/stdin", "utf8"));