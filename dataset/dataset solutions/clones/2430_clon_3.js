const squareDifference = (val1, val2) => {
    const diff = val1 - val2;
    return diff * diff;
};

const computeEuclideanDistance = (pointOne, pointTwo) => {
    const deltaX = pointOne[0] - pointTwo[0];
    const deltaY = pointOne[1] - pointTwo[1];

    return Math.sqrt(squareDifference(pointOne[0], pointTwo[0]) + squareDifference(pointOne[1], pointTwo[1]));
};

function processGeometricDataSet(rawInputString) {
    if (!rawInputString || typeof rawInputString !== 'string') {
        console.warn("Received empty or invalid input string for processing.");
        return null;
    }

    const allInputLines = rawInputString.trim().split('\n');

    if (allInputLines.length < 2) {
        console.error("Insufficient input lines provided. Expected at least 2 lines.");
        return null;
    }

    const resultDivisor = Number.parseInt(allInputLines[0], 10);

    if (isNaN(resultDivisor) || resultDivisor === 0) {
        console.error("Invalid or zero divisor value found in the input. Cannot proceed with calculation.");
        return null;
    }

    const coordinateStringLines = allInputLines.slice(1);

    const spatialPoints = coordinateStringLines.map((lineContent, lineIndex) => {
        const components = lineContent.trim().split(/\s+/g);

        if (components.length !== 2) {
            console.warn(`Skipping malformed coordinate line ${lineIndex + 2}: "${lineContent}". Expected two numbers.`);
            return null;
        }

        const xCoord = Number.parseFloat(components[0]);
        const yCoord = Number.parseFloat(components[1]);

        if (isNaN(xCoord) || isNaN(yCoord)) {
            console.warn(`Skipping malformed coordinate line ${lineIndex + 2}: "${lineContent}". Non-numeric coordinates.`);
            return null;
        }

        return [xCoord, yCoord];
    }).filter(point => point !== null);

    if (spatialPoints.length < 2) {
        console.error("Not enough valid spatial points parsed to calculate pairwise distances. At least two points are required.");
        return null;
    }

    let cumulativePairwiseDistance = 0.0;

    for (let currentPointIndex = 0; currentPointIndex < spatialPoints.length - 1; currentPointIndex++) {
        for (let nextPointIndex = currentPointIndex + 1; nextPointIndex < spatialPoints.length; nextPointIndex++) {
            const pointA = spatialPoints[currentPointIndex];
            const pointB = spatialPoints[nextPointIndex];

            const distanceBetweenPoints = computeEuclideanDistance(pointA, pointB);

            cumulativePairwiseDistance += distanceBetweenPoints;
        }
    }

    const finalCalculatedValue = (cumulativePairwiseDistance * 2.0) / resultDivisor;

    return finalCalculatedValue;
}

(function executeComputation() {
    try {
        const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

        const finalResult = processGeometricDataSet(standardInputContent);

        if (typeof finalResult === 'number' && !isNaN(finalResult)) {
            console.log(finalResult);
        }
    } catch (errorReadingInput) {
        console.error("An error occurred while reading from stdin:", errorReadingInput.message);
    }
})();