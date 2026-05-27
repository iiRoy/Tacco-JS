"use strict";

function parseLineOfNumbers(lineString) {
    return lineString.split(" ").map(Number);
}

function calculateSquaredEuclideanDistance(pointA, pointB) {
    let sumOfSquaredDifferences = 0;
    // Assuming both points have the same number of dimensions
    for (let dimIndex = 0; dimIndex < pointA.length; dimIndex++) {
        const coordinateDifference = pointA[dimIndex] - pointB[dimIndex];
        sumOfSquaredDifferences += coordinateDifference * coordinateDifference;
    }
    return sumOfSquaredDifferences;
}

function isPerfectSquare(value) {
    if (value < 0) {
        return false; // Square root of a negative number is not real
    }
    const sqrtResult = Math.sqrt(value);
    return sqrtResult % 1 === 0; // Check if the square root is an integer
}

const calculateIntegerDistances = (rawInputString) => {
    const inputLines = rawInputString.trim().split("\n");

    const [numPoints, dimensions] = parseLineOfNumbers(inputLines[0]);
    
    const pointDataStrings = inputLines.slice(1, numPoints + 1);
    const parsedPoints = pointDataStrings.map(parseLineOfNumbers);

    let integerDistancePairsCount = 0;
    
    for (let pointIndexA = 0; pointIndexA < numPoints; pointIndexA++) {
        const currentPointCoords = parsedPoints[pointIndexA];
        
        for (let pointIndexB = pointIndexA + 1; pointIndexB < numPoints; pointIndexB++) {
            const targetPointCoords = parsedPoints[pointIndexB];
            
            const squaredDist = calculateSquaredEuclideanDistance(currentPointCoords, targetPointCoords);
            
            if (isPerfectSquare(squaredDist)) {
                integerDistancePairsCount++;
            }
        }
    }
    
    console.log(integerDistancePairsCount);
};

calculateIntegerDistances(require('fs').readFileSync('/dev/stdin', 'utf8'));
