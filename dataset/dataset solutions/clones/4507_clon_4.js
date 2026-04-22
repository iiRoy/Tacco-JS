"use strict";

const parseInputData = (textualData) => {
    const dataLines = textualData.split('\n');
    const totalElements = Number(dataLines[0]);
    const jumpArray = new Array(totalElements);
    for (let k = 0; k < totalElements; ++k) {
        jumpArray[k] = Number(dataLines[k + 1]) - 1;
    }
    return { totalElements, jumpArray };
};

const tracePathLength = (currentPosition, finalPosition, connections, visitedPositions, currentDepth) => {
    if (currentPosition === finalPosition) {
        return currentDepth;
    }

    if (visitedPositions.has(currentPosition)) {
        return -1;
    }

    if (currentPosition < 0 || currentPosition >= connections.length) {
        return -1;
    }

    visitedPositions.add(currentPosition);

    const nextPosition = connections[currentPosition];
    const pathResult = tracePathLength(nextPosition, finalPosition, connections, visitedPositions, currentDepth + 1);
    
    return pathResult;
};

const processSequence = (inputString) => {
    const { totalElements, jumpArray } = parseInputData(inputString);

    const startPosition = 0;
    const targetPosition = 1;

    const visitedNodesTracker = new Set();
    const resultCount = tracePathLength(startPosition, targetPosition, jumpArray, visitedNodesTracker, 0);

    console.log(resultCount);
};

processSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));