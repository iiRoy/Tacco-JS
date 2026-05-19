const appSettings = { input: '/dev/stdin', newline: '\n' };

const MAX_POSSIBLE_DISTANCE = Number.MAX_VALUE;

function readAndParseInput(settings) {
    const fileContent = require('fs').readFileSync(settings.input, 'ascii');
    return fileContent.trim().split(settings.newline);
}

const inputLines = readAndParseInput(appSettings);
const nodeCount = Number(inputLines.splice(0, 1)[0]);

const forwardEdges = {};
const backwardEdges = {};

function establishEdge(graphObject, sourceNode, targetNode, weight) {
    if (!graphObject.hasOwnProperty(sourceNode)) {
        graphObject[sourceNode] = {};
    }
    graphObject[sourceNode][targetNode] = weight;
}

for (let i = 0; i < inputLines.length; ++i) {
    const currentLineParts = inputLines[i].split(' ').map(Number);
    const uNode = currentLineParts[0];
    for (let j = 2; j < currentLineParts.length; j += 2) {
        const vNode = currentLineParts[j];
        const edgeWeight = currentLineParts[j + 1];
        establishEdge(forwardEdges, uNode, vNode, edgeWeight);
        establishEdge(backwardEdges, vNode, uNode, edgeWeight);
    }
}

// Initial BFS-like pass to find shortest paths from node 0
let currentLevel = 0;
const levelDepths = new Array(nodeCount);
const minDistances = new Array(nodeCount);

function initializeDistanceArrays(count, initialValue) {
    for (let k = 0; k < count; k++) {
        levelDepths[k] = null;
        minDistances[k] = initialValue;
    }
}

initializeDistanceArrays(nodeCount, MAX_POSSIBLE_DISTANCE);

levelDepths[0] = 0;
minDistances[0] = 0;

let hasUnvisitedNodesAtNextLevel;
while (true) {
    hasUnvisitedNodesAtNextLevel = false;
    for (const currentNodeIdxStr in forwardEdges) {
        const currentNodeIdx = Number(currentNodeIdxStr);
        if (levelDepths[currentNodeIdx] !== currentLevel) {
            continue;
        }

        const outgoingEdges = forwardEdges[currentNodeIdx];
        for (const neighborNodeIdxStr in outgoingEdges) {
            const neighborNodeIdx = Number(neighborNodeIdxStr);
            const edgeWeight = outgoingEdges[neighborNodeIdx];

            if (levelDepths[neighborNodeIdx] === null) {
                levelDepths[neighborNodeIdx] = currentLevel + 1;
                hasUnvisitedNodesAtNextLevel = true;
            }
            minDistances[neighborNodeIdx] = Math.min(minDistances[neighborNodeIdx], minDistances[currentNodeIdx] + edgeWeight);
        }
    }
    currentLevel++;
    if (!hasUnvisitedNodesAtNextLevel) {
        break;
    }
}

const sortedNodesByDistance = new Array(nodeCount);
for (let i = 0; i < nodeCount; i++) {
    sortedNodesByDistance[i] = i;
}
sortedNodesByDistance.sort((nodeA, nodeB) => minDistances[nodeA] - minDistances[nodeB]);

const nodeSortIndexMap = {};
for (let i = 0; i < nodeCount; i++) {
    nodeSortIndexMap[sortedNodesByDistance[i]] = i;
}

// Dynamic programming and DFS for refining shortest paths
const pathVisitedFlags = new Array(nodeCount);
const pathStack = new Array(nodeCount);
const remainingNeighborsStack = new Array(nodeCount);

function explorePathSegment(startNode, targetNode, initialMinPathValue) {
    let stackPointer = 0;
    let currentPathCost = 0;
    let segmentMinResult = initialMinPathValue;

    // Reset visited flags for this DFS run
    for (let i = 0; i < nodeCount; i++) {
        pathVisitedFlags[i] = false;
    }

    pathVisitedFlags[targetNode] = true; // Mark target as visited to avoid cycles back to it
    pathVisitedFlags[startNode] = true; // Mark start as visited for the current path

    pathStack[0] = startNode;
    remainingNeighborsStack[0] = Array.from(Object.keys(backwardEdges[startNode] || {})); // Ensure it's an array

    while (true) {
        const currentStackNode = pathStack[stackPointer];
        const neighborsToExplore = remainingNeighborsStack[stackPointer];

        if (neighborsToExplore.length === 0) {
            if (stackPointer === 0) {
                return segmentMinResult; // DFS segment complete
            }
            // Backtrack
            const prevNode = pathStack[stackPointer - 1];
            currentPathCost -= backwardEdges[prevNode][currentStackNode];
            pathVisitedFlags[currentStackNode] = false; // Unmark as we backtrack
            stackPointer--;
            continue;
        }

        const nextNodeIdStr = neighborsToExplore.pop();
        const nextNodeId = Number(nextNodeIdStr);

        if (pathVisitedFlags[nextNodeId]) {
            continue; // Skip if already in current path
        }

        const edgeWeightToNext = backwardEdges[currentStackNode][nextNodeId];
        const potentialNewCost = currentPathCost + edgeWeightToNext;

        if (potentialNewCost >= initialMinPathValue) {
            continue; // Pruning: path already too long
        }

        if (nodeSortIndexMap[nextNodeId] < nodeSortIndexMap[targetNode]) {
            // If nextNodeId is an "earlier" node in the sorted order,
            // its minDistances[nextNodeId] is considered final.
            segmentMinResult = Math.min(segmentMinResult, potentialNewCost + minDistances[nextNodeId]);
            continue;
        }

        // Proceed deeper into DFS
        currentPathCost = potentialNewCost;
        stackPointer++;
        pathStack[stackPointer] = nextNodeId;
        pathVisitedFlags[nextNodeId] = true;
        remainingNeighborsStack[stackPointer] = Array.from(Object.keys(backwardEdges[nextNodeId] || {}));
    }
}

for (let sortedIdx = 0; sortedIdx < nodeCount; ++sortedIdx) {
    const currentNode = sortedNodesByDistance[sortedIdx];

    // Phase 1: Update minDistances[currentNode] using neighbors 'v' that are already processed
    const incomingEdgesToCurrent = backwardEdges[currentNode] || {};
    for (const neighborNodeStr in incomingEdgesToCurrent) {
        const neighborNode = Number(neighborNodeStr);
        if (nodeSortIndexMap[neighborNode] < nodeSortIndexMap[currentNode]) {
            const weight = incomingEdgesToCurrent[neighborNode];
            minDistances[currentNode] = Math.min(minDistances[currentNode], minDistances[neighborNode] + weight);
        }
    }

    // Phase 2: Update minDistances[currentNode] using neighbors 'v' that are 'later' in the sorted order
    // This involves a DFS-like exploration
    for (const neighborNodeStr in incomingEdgesToCurrent) {
        const neighborNode = Number(neighborNodeStr);
        if (nodeSortIndexMap[neighborNode] > nodeSortIndexMap[currentNode]) {
            const weight = incomingEdgesToCurrent[neighborNode];
            const pathFromNeighbor = explorePathSegment(neighborNode, currentNode, minDistances[currentNode] - weight);
            minDistances[currentNode] = Math.min(minDistances[currentNode], pathFromNeighbor + weight);
        }
    }
}

for (let i = 0; i < nodeCount; i++) {
    console.log(i + ' ' + minDistances[i]);
}
