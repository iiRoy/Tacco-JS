'use strict'

const processInputData = (inputString) => {
    const MAX_INITIAL_DISTANCE = 1_000_000_000;

    const inputLines = inputString.trim().split("\n");

    const headerParts = inputLines[0].split(" ");

    const numCoordSets = Number(headerParts[0]);
    const numReferencePoints = Number(headerParts[1]);

    const rawCoordSetStrings = inputLines.slice(1, numCoordSets + 1);
    const rawReferencePointStrings = inputLines.slice(numCoordSets + 1, numReferencePoints + numCoordSets + 1);

    const parseCoordinatePair = (coordinateString) => {
        const stringComponents = coordinateString.split(" ").map(component => parseInt(component, 10));
        return {
            x: stringComponents[0],
            y: stringComponents[1]
        };
    };

    const coordinateSets = rawCoordSetStrings.map(parseCoordinatePair);
    const referencePoints = rawReferencePointStrings.map(parseCoordinatePair);

    const closestPointResultIndices = [];

    for (const currentCoordSet of coordinateSets) {
        let minimumAchievedDistance = MAX_INITIAL_DISTANCE;
        let currentClosestPointIndex = 0;

        for (let refPointIdx = 0; refPointIdx < referencePoints.length; refPointIdx++) {
            const currentReferencePoint = referencePoints[refPointIdx];

            const calculatedManhattanDistance = Math.abs(currentCoordSet.x - currentReferencePoint.x) + Math.abs(currentCoordSet.y - currentReferencePoint.y);

            if (calculatedManhattanDistance < minimumAchievedDistance) {
                minimumAchievedDistance = calculatedManhattanDistance;
                currentClosestPointIndex = refPointIdx;
            }
        }
        closestPointResultIndices.push(currentClosestPointIndex);
    }

    closestPointResultIndices.forEach(resultIdx => console.log(resultIdx + 1));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf-8'));
