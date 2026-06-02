const STDIN_PATH = '/dev/stdin';
const fs = require('fs');

// Helper function to parse a string to an integer
const parseNumericString = (str) => parseInt(str, 10);

// Helper function to create and initialize an adjacency matrix for 1-indexed nodes
function createAndInitializeAdjacencyMatrix(graphSize) {
    const matrix = [];
    for (let rowIdx = 0; rowIdx <= graphSize; rowIdx++) {
        matrix[rowIdx] = [];
        for (let colIdx = 0; colIdx <= graphSize; colIdx++) {
            matrix[rowIdx][colIdx] = 0;
        }
    }
    return matrix;
}

// Helper function to create and initialize a distance array for 1-indexed nodes
function createAndInitializeDistanceArray(arraySize, initialValue = -1) {
    const distances = [];
    for (let index = 0; index <= arraySize; index++) {
        distances[index] = initialValue;
    }
    return distances;
}

const rawInputData = fs.readFileSync(STDIN_PATH, 'utf8').trim();
const inputLines = rawInputData.split('\n');

const totalNodeCount = parseNumericString(inputLines.shift());

const graphAdjacencyMatrix = createAndInitializeAdjacencyMatrix(totalNodeCount);

// Populate the adjacency matrix based on input lines
for (let currentSourceNode = 1; currentSourceNode <= totalNodeCount; currentSourceNode++) {
    const nodeConnectionData = inputLines.shift().split(' ').map(parseNumericString);
    // nodeConnectionData[0] is the node ID itself, which is currentSourceNode
    const numberOfNeighbors = nodeConnectionData[1];

    for (let neighborIndexOffset = 0; neighborIndexOffset < numberOfNeighbors; neighborIndexOffset++) {
        const connectedNeighborId = nodeConnectionData[2 + neighborIndexOffset];
        graphAdjacencyMatrix[currentSourceNode][connectedNeighborId] = 1;
    }
}

// Perform Breadth-First Search (BFS) to find shortest distances
const shortestDistanceArray = createAndInitializeDistanceArray(totalNodeCount);
const bfsProcessingQueue = [];

const startingNodeForBFS = 1; // BFS typically starts from node 1 in this problem context
bfsProcessingQueue.push(startingNodeForBFS);
shortestDistanceArray[startingNodeForBFS] = 0;

let activeNodeInBFS;
while (bfsProcessingQueue.length > 0) {
    activeNodeInBFS = bfsProcessingQueue.shift();

    for (let potentialAdjacentNode = 1; potentialAdjacentNode <= totalNodeCount; potentialAdjacentNode++) {
        // Check if there is an edge from activeNodeInBFS to potentialAdjacentNode
        if (graphAdjacencyMatrix[activeNodeInBFS][potentialAdjacentNode] === 1) {
            // If the potentialAdjacentNode has not been visited yet
            if (shortestDistanceArray[potentialAdjacentNode] === -1) {
                shortestDistanceArray[potentialAdjacentNode] = shortestDistanceArray[activeNodeInBFS] + 1;
                bfsProcessingQueue.push(potentialAdjacentNode);
            }
        }
    }
}

// Output the results: node ID and its shortest distance from the starting node
for (let outputNodeIdentifier = 1; outputNodeIdentifier <= totalNodeCount; outputNodeIdentifier++) {
    console.log(outputNodeIdentifier, shortestDistanceArray[outputNodeIdentifier]);
}
