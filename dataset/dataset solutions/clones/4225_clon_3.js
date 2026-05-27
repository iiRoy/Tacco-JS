const fs = require('fs');

/**
 * Parses a space-separated string of numbers into an array of numbers.
 * @param {string} lineString - The input string line.
 * @returns {number[]} An array of parsed numbers.
 */
function parseLineOfNumbers(lineString) {
    return lineString.split(" ").map(Number);
}

/**
 * Implements the Floyd-Warshall algorithm to find all-pairs shortest paths
 * in a given adjacency matrix.
 * @param {number[][]} inputGraphMatrix - The initial adjacency matrix representing graph costs.
 * @returns {number[][]} A new matrix containing the shortest path costs between all pairs of nodes.
 */
function calculateAllPairsShortestPaths(inputGraphMatrix) {
    const numNodes = inputGraphMatrix.length;

    // Create a deep copy of the input matrix to store shortest paths
    const shortestPathsMatrix = new Array(numNodes);
    for (let nodeIndex = 0; nodeIndex < numNodes; nodeIndex++) {
        shortestPathsMatrix[nodeIndex] = inputGraphMatrix[nodeIndex].concat();
    }

    // Apply the Floyd-Warshall algorithm
    // k is the intermediate node
    for (let k = 0; k < numNodes; k++) {
        // i is the starting node
        for (let i = 0; i < numNodes; i++) {
            // j is the ending node
            for (let j = 0; j < numNodes; j++) {
                const pathThroughK = shortestPathsMatrix[i][k] + shortestPathsMatrix[k][j];
                // If a shorter path is found through intermediate node k
                if (shortestPathsMatrix[i][j] > pathThroughK) {
                    shortestPathsMatrix[i][j] = pathThroughK;
                }
            }
        }
    }
    return shortestPathsMatrix;
}

/**
 * Processes the input data from an array of lines, calculates total costs
 * based on shortest paths, and prints the result.
 * @param {string[]} inputLines - An array of strings, where each string is a line from stdin.
 */
function processInputData(inputLines) {
    // The first line contains N and M
    const dimensionsLineData = parseLineOfNumbers(inputLines[0]);
    const [numN, numM] = dimensionsLineData; // N: number of path segments, M: elements per segment

    // The next 10 lines form the 10x10 initial cost matrix
    const MATRIX_DIMENSION = 10;
    const initialCostMatrix = [];
    for (let matrixRowIndex = 0; matrixRowIndex < MATRIX_DIMENSION; matrixRowIndex++) {
        const currentRowValues = parseLineOfNumbers(inputLines[matrixRowIndex + 1]);
        initialCostMatrix.push(currentRowValues);
    }

    // Calculate all-pairs shortest paths for the initial cost matrix
    const finalShortestPaths = calculateAllPairsShortestPaths(initialCostMatrix);

    let accumulatedTotalCost = 0;
    // Path segments start after the N,M line (index 0) and the 10 matrix lines (indices 1-10).
    // So, the first path segment is at index 11.
    const PATH_SEGMENTS_START_LINE_INDEX = MATRIX_DIMENSION + 1;

    // Process N subsequent path segments
    for (let pathSegmentIndex = 0; pathSegmentIndex < numN; pathSegmentIndex++) {
        const currentPathSegmentLine = inputLines[pathSegmentIndex + PATH_SEGMENTS_START_LINE_INDEX];
        const currentPathSegment = parseLineOfNumbers(currentPathSegmentLine);

        // Iterate through elements in the current path segment
        for (let segmentElementIndex = 0; segmentElementIndex < numM; segmentElementIndex++) {
            const currentNodeIdentifier = currentPathSegment[segmentElementIndex];

            // If the node identifier is not -1, add the shortest path cost to node 1
            if (currentNodeIdentifier !== -1) {
                // The problem requires summing the shortest path cost from 'currentNodeIdentifier' to node '1' (index 1)
                accumulatedTotalCost += finalShortestPaths[currentNodeIdentifier][1];
            }
        }
    }

    // Output the final accumulated total cost
    console.log(accumulatedTotalCost);
}

// Read input from stdin, split into lines, and process
const rawInputContent = fs.readFileSync("/dev/stdin", "UTF-8");
const inputLinesArray = rawInputContent.split("\n");
processInputData(inputLinesArray);
