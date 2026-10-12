"use strict";

// Helper function to parse the raw input string into structured data
function parseInputData(rawInputString) {
    const trimmedLines = rawInputString.trim().split("\n");

    const firstLineParts = trimmedLines.shift().split(' ').map(Number);
    const numPoints = firstLineParts[0];
    const numDimensions = firstLineParts[1];

    const pointCoordinates = trimmedLines.map(line => line.split(' ').map(Number));

    return {
        numPoints: numPoints,
        numDimensions: numDimensions,
        pointCoordinates: pointCoordinates
    };
}

// Helper function to calculate the Euclidean distance between two points
function calculateEuclideanDistance(point1, point2, dimensions) {
    let sumOfSquaredDifferences = 0;
    for (let dimensionIndex = 0; dimensionIndex < dimensions; dimensionIndex++) {
        const coordinateDifference = point1[dimensionIndex] - point2[dimensionIndex];
        sumOfSquaredDifferences += coordinateDifference * coordinateDifference;
    }
    return Math.sqrt(sumOfSquaredDifferences);
}

function processInput(rawInputString) {
    const parsedData = parseInputData(rawInputString);
    const numPoints = parsedData.numPoints;
    const numDimensions = parsedData.numDimensions;
    const allPoints = parsedData.pointCoordinates;

    let integerDistancePairs = 0;

    // Iterate through all unique pairs of points
    for (let pointIndexA = 0; pointIndexA < numPoints; pointIndexA++) {
        for (let pointIndexB = pointIndexA; pointIndexB < numPoints; pointIndexB++) {
            // Skip comparing a point with itself
            if (pointIndexA === pointIndexB) {
                continue;
            }

            const currentPointA = allPoints[pointIndexA];
            const currentPointB = allPoints[pointIndexB];

            const euclideanDistance = calculateEuclideanDistance(currentPointA, currentPointB, numDimensions);

            // Check if the calculated distance is an integer
            if (Number.isInteger(euclideanDistance)) {
                integerDistancePairs++;
            }
        }
    }
    console.log(integerDistancePairs);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
