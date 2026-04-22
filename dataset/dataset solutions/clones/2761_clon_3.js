"use strict";

function isPerfectSquareRoot(val) {
    if (val < 0) return false;
    const root = Math.sqrt(val);
    return Number.isInteger(root);
}

function processInputData(rawInputContent) {
    if (!rawInputContent || rawInputContent.trim() === "") {
        return;
    }

    const trimmedInput = rawInputContent.trim();
    let processedLines = trimmedInput.split("\n");

    if (processedLines.length < 2) {
        return;
    }

    const configDimensionsStr = processedLines.shift();
    const configDimensionsArr = configDimensionsStr.split(' ');

    const numPoints = parseInt(configDimensionsArr[0], 10);
    const numDimensions = parseInt(configDimensionsArr[1], 10);

    if (isNaN(numPoints) || isNaN(numDimensions) || numPoints < 0 || numDimensions < 0) {
        return;
    }

    const coordinateSets = processedLines.map(lineStr =>
        lineStr.split(' ').map(valStr => parseInt(valStr, 10))
    );

    let integerDistanceCounter = 0;

    const MIN_PAIRS_REQUIRED = 2;

    if (numPoints < MIN_PAIRS_REQUIRED) {
        console.log(integerDistanceCounter);
        return;
    }

    for (let pointIndexA = 0; pointIndexA < numPoints; pointIndexA++) {
        const currentPointA = coordinateSets[pointIndexA];

        for (let pointIndexB = pointIndexA + 1; pointIndexB < numPoints; pointIndexB++) {
            const pointCoordsB = coordinateSets[pointIndexB];

            let sumOfSquaredDifferences = 0;

            for (let dimensionIterator = 0; dimensionIterator < numDimensions; dimensionIterator++) {
                const coordA_dim = currentPointA[dimensionIterator];
                const coordB_dim = pointCoordsB[dimensionIterator];

                const dimensionDifference = Math.abs(coordA_dim - coordB_dim);

                sumOfSquaredDifferences += dimensionDifference * dimensionDifference;
            }

            const euclideanDistance = Math.sqrt(sumOfSquaredDifferences);

            if (isPerfectSquareRoot(sumOfSquaredDifferences)) {
                integerDistanceCounter++;
            }
        }
    }

    console.log(integerDistanceCounter);
}

(function initializeAndRun() {
    const INPUT_FILE_PATH = '/dev/stdin';
    let fileContent;
    try {
        fileContent = require('fs').readFileSync(INPUT_FILE_PATH, 'utf8');
    } catch (error) {
        return;
    }

    processInputData(fileContent);
})();