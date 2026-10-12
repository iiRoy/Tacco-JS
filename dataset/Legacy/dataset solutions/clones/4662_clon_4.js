'use strict';

const processInput = (rawData) => {
    const inputLines = rawData.trim().split('\n');
    const [countA, countB] = inputLines[0].split(' ').map(Number);

    const extractCoordinates = (lineContent) => {
        return lineContent.split(' ').map(Number);
    };

    const coordinateSetA = inputLines.slice(1, countA + 1).map(extractCoordinates);
    const coordinateSetB = inputLines.slice(countA + 1, countB + countA + 1).map(extractCoordinates);

    const finalIndices = coordinateSetA.map((currentCoordA) => {
        const nearestPointDetails = coordinateSetB.reduce(
            (accumulator, currentCoordB, currentIdxB) => {
                const manhattanDistance =
                    Math.abs(currentCoordA[0] - currentCoordB[0]) + Math.abs(currentCoordA[1] - currentCoordB[1]);

                if (manhattanDistance < accumulator.distanceValue) {
                    return { distanceValue: manhattanDistance, bestMatchIndex: currentIdxB };
                }
                return accumulator;
            },
            { distanceValue: Infinity, bestMatchIndex: -1 }
        );
        return nearestPointDetails.bestMatchIndex;
    });

    console.log(finalIndices.map((idx) => idx + 1).join('\n'));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
