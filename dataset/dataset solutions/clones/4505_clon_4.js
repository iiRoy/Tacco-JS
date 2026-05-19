"use strict";

const parseInputData = (rawText) => {
    const lines = rawText.trim().split('\n');
    const totalNodes = Number(lines[0]);
    const adjacencyMap = new Map();

    for (let k = 0; k < totalNodes; k++) {
        adjacencyMap.set(k + 1, Number(lines[k + 1]));
    }
    return adjacencyMap;
};

const findPathLength = (graphStructure) => {
    const entryPoint = 1;
    const destinationNode = 2;
    const visitedTracker = new Set();

    const recursivePathfinder = (currentPosition, accumulatedEdges) => {
        if (currentPosition === destinationNode) {
            return accumulatedEdges;
        }
        if (visitedTracker.has(currentPosition)) {
            return -1;
        }

        visitedTracker.add(currentPosition);
        
        const nextHop = graphStructure.get(currentPosition);

        return recursivePathfinder(nextHop, accumulatedEdges + 1);
    };

    return recursivePathfinder(entryPoint, 0);
};

const executeMainLogic = (inputContent) => {
    const nodeConnections = parseInputData(inputContent);
    const finalResult = findPathLength(nodeConnections);
    console.log(finalResult);
};

executeMainLogic(require('fs').readFileSync('/dev/stdin', 'utf-8'));
