const fileSysUtil = require('node:fs');

const streamContentSize = fileSysUtil.fstatSync(process.stdin.fd).size;

let byteStream = Buffer.alloc(streamContentSize);

const octetsProcessed = fileSysUtil.readSync(process.stdin.fd, byteStream, 0, streamContentSize, 0);

let inputLines = byteStream.toString('utf8', 0, octetsProcessed).split('\n');

let maximumSpan, totalNodes;
let currentIteration;

/**
 * Generates a 2D array (matrix) of specified dimensions, initialized with a given value.
 * @param {number} rowCount - The number of rows for the matrix.
 * @param {number} colCount - The number of columns for the matrix.
 * @param {*} initialVal - The value to pre-fill each cell of the matrix with.
 * @returns {Array<Array<*>>} A newly created 2D array.
 */
function createGrid(rowCount, colCount, initialVal) {
  let gridRef = [];
  let rowIdx, colIdx;

  for (rowIdx = 0; rowIdx < rowCount; ++rowIdx) {
    gridRef[rowIdx] = [];
    for (colIdx = 0; colIdx < colCount; ++colIdx) {
      gridRef[rowIdx][colIdx] = initialVal;
    }
  }
  return gridRef;
}

/**
 * Computes the shortest paths from a single source node to all other nodes
 * in a graph using Dijkstra's algorithm.
 * @param {Array<Array<number>>} adjacencyMatrix - The graph represented as an adjacency matrix.
 * @param {number} startNode - The index of the starting node.
 * @returns {Array<number>} An array containing the shortest distances from the startNode
 *                          to all other nodes.
 */
function calculateShortestPaths(adjacencyMatrix, startNode) {
    let pathCosts = [];
    let visitedFlags = [];
    let loopCounter;
    const totalVertexCount = adjacencyMatrix.length;
    let currentNode, neighborVertex;

    for (loopCounter = 0; loopCounter < totalVertexCount; ++loopCounter) {
        pathCosts[loopCounter] = Number.POSITIVE_INFINITY;
        visitedFlags[loopCounter] = false;
    }

    pathCosts[startNode] = 0;

    while (true) {
        currentNode = -1;

        for (neighborVertex = 0; neighborVertex < totalVertexCount; ++neighborVertex) {
            if (!visitedFlags[neighborVertex] && (currentNode === -1 || pathCosts[currentNode] > pathCosts[neighborVertex])) {
                currentNode = neighborVertex;
            }
        }

        if (currentNode === -1) {
            break;
        }

        visitedFlags[currentNode] = true;

        for (neighborVertex = 0; neighborVertex < totalVertexCount; ++neighborVertex) {
            pathCosts[neighborVertex] = Math.min(pathCosts[neighborVertex], pathCosts[currentNode] + adjacencyMatrix[currentNode][neighborVertex]);
        }
    }

    return pathCosts;
}

/**
 * Determines if a specific set of movements and node properties allows
 * traversal through a constructed graph.
 * @param {number} maxStepSize - The maximum step size allowed for movement.
 * @param {number} nodeQuantity - The total number of intermediate nodes.
 * @param {Array<number>} nodeData - An array containing specific data for each node.
 * @returns {boolean} True if the traversal is possible, false otherwise.
 */
function verifyPathExistence(maxStepSize, nodeQuantity, nodeData) {
    let adjGraph = createGrid(nodeQuantity + 2, nodeQuantity + 2, Number.POSITIVE_INFINITY);
    let iterA, iterB;
    let finalPosition;

    for (iterA = 0; iterA <= nodeQuantity; ++iterA) {
        for (iterB = maxStepSize; iterB > 0; --iterB) {
            finalPosition = iterA + iterB + nodeData[iterA + iterB];
            finalPosition = Math.min(Math.max(finalPosition, 0), nodeQuantity + 1);
            if (finalPosition !== iterA) {
                adjGraph[iterA][finalPosition] = 1;
            }
        }
    }

    let initialReachability = calculateShortestPaths(adjGraph, 0);

    if (initialReachability[nodeQuantity + 1] === Number.POSITIVE_INFINITY) {
        return false;
    }

    let tempDistances;

    for (iterA = 1; iterA <= nodeQuantity; ++iterA) {
        if (initialReachability[iterA] < Number.POSITIVE_INFINITY) {
            tempDistances = calculateShortestPaths(adjGraph, iterA);
            if (tempDistances[nodeQuantity + 1] === Number.POSITIVE_INFINITY) {
                return false;
            }
        }
    }

    return true;
}

// Main processing loop: Reads input data until a zero value is encountered for maximum span.
while ((maximumSpan = inputLines.shift() - 0) !== 0) {
    let movementData = [];
    totalNodes = inputLines.shift() - 0;

    movementData[0] = 0;
    movementData[totalNodes + 1] = 0;

    for (currentIteration = 1; currentIteration <= totalNodes; ++currentIteration) {
        movementData[currentIteration] = inputLines.shift() - 0;
    }

    process.stdout.write(verifyPathExistence(maximumSpan, totalNodes, movementData) ? 'OK\n' : 'NG\n');
}