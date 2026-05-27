'use strict'

const processInput = (inputString) => {
    const lines = inputString.trim().split('\n');

    const [numCoordStr, numPointStr] = lines[0].split(' ');
    const numCoords = +numCoordStr;
    const numPoints = +numPointStr;

    const extractCoordinates = (coordLine) => {
        const parts = coordLine.split(' ');
        return { x: +parts[0], y: +parts[1] };
    };

    const coordinateSet = lines.slice(1, numCoords + 1).map(extractCoordinates);
    const checkpointSet = lines.slice(numCoords + 1, numCoords + numPoints + 1).map(extractCoordinates);

    const finalIndices = coordinateSet.map(currentCoord => {
        return checkpointSet.reduce((accumulator, currentCheckpoint, checkpointIdx) => {
            const distanceX = Math.abs(currentCoord.x - currentCheckpoint.x);
            const distanceY = Math.abs(currentCoord.y - currentCheckpoint.y);
            const currentManhattanDistance = distanceX + distanceY;

            if (currentManhattanDistance < accumulator.shortestPath) {
                return { shortestPath: currentManhattanDistance, closestPointIndex: checkpointIdx };
            }
            return accumulator;
        }, { shortestPath: Infinity, closestPointIndex: -1 }).closestPointIndex;
    });

    console.log(finalIndices.map(idx => idx + 1).join('\n'));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
