'use strict'

let totalNodes, totalConnections;
let neighborLists; // Adjacency list representation
let entryTimestamps; // Corresponds to discoveryTimes
let lowestReachableTimestamps; // Corresponds to lowLinkValues
let timeCounter;
let identifiedBridges;

const visitAndEvaluate = (currentPoint, priorPoint) => {
    entryTimestamps[currentPoint] = lowestReachableTimestamps[currentPoint] = timeCounter++;
    
    for (const adjacentPoint of neighborLists[currentPoint]) {
        if (adjacentPoint === priorPoint) continue;

        if (entryTimestamps[adjacentPoint] !== -1) { // Back-edge to an already visited node
            lowestReachableTimestamps[currentPoint] = Math.min(lowestReachableTimestamps[currentPoint], entryTimestamps[adjacentPoint]);
        } else { // Tree-edge to an unvisited node
            visitAndEvaluate(adjacentPoint, currentPoint);
            lowestReachableTimestamps[currentPoint] = Math.min(lowestReachableTimestamps[currentPoint], lowestReachableTimestamps[adjacentPoint]);
            
            // Condition for a bridge
            if (lowestReachableTimestamps[adjacentPoint] > entryTimestamps[currentPoint]) {
                identifiedBridges++;
            }
        }
    }
};

const manageGraphOperations = incomingData => {
    const dataLines = incomingData.trim().split('\n');
    const [nc, lc] = dataLines[0].split(' ').map(Number);
    totalNodes = nc;
    totalConnections = lc;

    neighborLists = Array.from({ length: totalNodes }, () => []);

    for (let i = 1; i <= totalConnections; i++) {
        const [point1, point2] = dataLines[i].split(' ').map(Number);
        neighborLists[point1 - 1].push(point2 - 1);
        neighborLists[point2 - 1].push(point1 - 1);
    }

    entryTimestamps = Array(totalNodes).fill(-1);
    lowestReachableTimestamps = Array(totalNodes).fill(-1);
    timeCounter = 0;
    identifiedBridges = 0;

    for (let i = 0; i < totalNodes; i++) {
        if (entryTimestamps[i] === -1) {
            visitAndEvaluate(i, -1); // -1 indicates no parent for the root of a DFS tree
        }
    }

    console.log(identifiedBridges);
};

manageGraphOperations(require("fs").readFileSync("/dev/stdin", "utf8"));