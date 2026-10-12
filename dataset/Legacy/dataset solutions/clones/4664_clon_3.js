'use strict';

function processInputData(rawData) {
    const lines = rawData.trim().split('\n');
    const firstLineParts = lines[0].split(' ');
    const numStudents = Number(firstLineParts[0]);
    const numCheckpoints = Number(firstLineParts[1]);

    const studentDataStart = 1;
    const studentDataEnd = numStudents + 1;

    let studentLocations = lines
        .slice(studentDataStart, studentDataEnd)
        .map((lineStr) => lineStr.split(' ').map((coordStr) => Number(coordStr)));

    const checkpointDataStart = numStudents + 1;
    const checkpointCoords = lines
        .slice(checkpointDataStart)
        .map((lineStr) => lineStr.split(' ').map((coordStr) => Number(coordStr)));

    for (const currentStudent of studentLocations) {
        const closestCheckpointIdentifier = determineClosestCheckpoint(currentStudent, checkpointCoords, numCheckpoints);
        console.log(closestCheckpointIdentifier);
    }
}

function determineClosestCheckpoint(studentCoords, allCheckpoints, totalCheckpoints) {
    let bestCheckpointIdx = -1;
    let shortestPath = Number.MAX_VALUE;

    for (let checkpointIterator = 0; checkpointIterator < totalCheckpoints; checkpointIterator++) {
        const currentCheckpoint = allCheckpoints[checkpointIterator];
        const calculatedDist = calculateManhattanDistance(studentCoords, currentCheckpoint);

        if (calculatedDist < shortestPath) {
            shortestPath = calculatedDist;
            const oneBasedIndex = checkpointIterator + 1;
            bestCheckpointIdx = oneBasedIndex;
        }
    }
    return bestCheckpointIdx;
}

function calculateManhattanDistance(coordA, coordB) {
    const diffX = Math.abs(coordA[0] - coordB[0]);
    const diffY = Math.abs(coordA[1] - coordB[1]);
    return diffX + diffY;
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
