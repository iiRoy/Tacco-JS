const fileSystemModule = require('fs');

// Helper function to read all content from stdin and split into lines
function readStdinContent() {
    const fileDescriptor = process.stdin.fd;
    const fileStats = fileSystemModule.fstatSync(fileDescriptor);
    const contentSize = fileStats.size;
    // Using Buffer.alloc for modern Node.js, equivalent to new Buffer(size)
    const contentBuffer = Buffer.alloc(contentSize); 
    const actualBytesReadCount = fileSystemModule.readSync(fileDescriptor, contentBuffer, 0, contentSize, 0);
    return contentBuffer.toString('utf8', 0, actualBytesReadCount).split('\n');
}

let inputLinesArray = readStdinContent();

// Function to initialize a 2D array (matrix) with a specified value
function initializeMatrix(rows, cols, initialValue) {
    const newMatrix = [];
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        const currentRow = []; // Intermediate variable for row construction
        for (let colIndex = 0; colIndex < cols; colIndex++) {
            currentRow.push(initialValue); // Using push for array population
        }
        newMatrix.push(currentRow);
    }
    return newMatrix;
}

// Dijkstra's algorithm to find shortest paths from a source node in a graph
function computeShortestPaths(adjacencyGraph, sourceNode) {
    const numVertices = adjacencyGraph.length;
    const distanceArray = Array(numVertices).fill(Infinity);
    const visitedStatus = Array(numVertices).fill(false);

    distanceArray[sourceNode] = 0;

    while (true) {
        let currentVertex = -1;
        let minCurrentDistance = Infinity; // Helper variable to track minimum distance

        // Find the unvisited vertex with the smallest distance
        for (let vertexIndex = 0; vertexIndex < numVertices; vertexIndex++) {
            if (!visitedStatus[vertexIndex] && distanceArray[vertexIndex] < minCurrentDistance) {
                minCurrentDistance = distanceArray[vertexIndex];
                currentVertex = vertexIndex;
            }
        }

        if (currentVertex === -1) {
            break; // No reachable unvisited vertices left
        }

        visitedStatus[currentVertex] = true;

        // Update distances of adjacent vertices
        for (let neighborVertex = 0; neighborVertex < numVertices; neighborVertex++) {
            const pathCostThroughCurrent = distanceArray[currentVertex] + adjacencyGraph[currentVertex][neighborVertex];
            distanceArray[neighborVertex] = Math.min(distanceArray[neighborVertex], pathCostThroughCurrent);
        }
    }
    return distanceArray;
}

// Main logic function to check if all paths are feasible according to problem rules
function checkAllPathsFeasible(maxAllowedJump, numLocations, locationOffsets) {
    const totalGraphNodes = numLocations + 2;
    const adjacencyGraph = initializeMatrix(totalGraphNodes, totalGraphNodes, Infinity);

    // Helper function for clamping position within graph bounds [0, totalGraphNodes - 1]
    const clampGraphPosition = (val) => Math.min(Math.max(val, 0), totalGraphNodes - 1);

    // Construct the graph based on jump rules
    for (let currentLocIdx = 0; currentLocIdx <= numLocations; currentLocIdx++) {
        // Iterate through possible jump distances from currentLocIdx
        // The original loop `for (var j = max; j--; )` iterates `max` times, with `j` taking values `max-1` down to `0`.
        // This is equivalent to iterating `jumpMagnitude` from `0` to `max-1`.
        for (let jumpMagnitude = 0; jumpMagnitude < maxAllowedJump; jumpMagnitude++) {
            const intermediatePointIndex = currentLocIdx + jumpMagnitude;
            const offsetAtIntermediatePoint = locationOffsets[intermediatePointIndex]; // Get offset for the specific jump point
            
            const potentialNextPosition = intermediatePointIndex + offsetAtIntermediatePoint;
            const actualNextPosition = clampGraphPosition(potentialNextPosition);

            // Add an edge if the jump leads to a different position
            if (actualNextPosition !== currentLocIdx) {
                adjacencyGraph[currentLocIdx][actualNextPosition] = 1;
            }
        }
    }

    // Calculate shortest paths from the starting point (node 0)
    const distancesFromOrigin = computeShortestPaths(adjacencyGraph, 0);

    // If the end node (numLocations + 1) is not reachable from the start, it's not feasible
    if (distancesFromOrigin[numLocations + 1] === Infinity) {
        return false;
    }

    // Check if all intermediate nodes (1 to numLocations) can reach the end node
    for (let intermediateNodeIdx = 1; intermediateNodeIdx <= numLocations; intermediateNodeIdx++) {
        // Only perform Dijkstra if the intermediate node itself is reachable from the origin
        if (distancesFromOrigin[intermediateNodeIdx] < Infinity) { 
            // Compute paths from this intermediate node to all others
            const tempDistancesFromIntermediate = computeShortestPaths(adjacencyGraph, intermediateNodeIdx);
            // If the end node is not reachable from this intermediate node, it's not feasible
            if (tempDistancesFromIntermediate[numLocations + 1] === Infinity) {
                return false;
            }
        }
    }
    return true; // All checks passed, paths are feasible
}

// Main loop to process multiple test cases from input
let maxAllowedJumpValue;
while ((maxAllowedJumpValue = parseInt(inputLinesArray.shift(), 10)) !== 0) {
    const locationOffsets = [];
    const currentNumLocations = parseInt(inputLinesArray.shift(), 10);

    // Initialize boundary conditions for location offsets
    locationOffsets[0] = 0;
    locationOffsets[currentNumLocations + 1] = 0;

    // Populate location offsets from input
    for (let idx = 1; idx <= currentNumLocations; idx++) {
        locationOffsets[idx] = parseInt(inputLinesArray.shift(), 10);
    }
    
    // Output the result of the feasibility check
    console.log(checkAllPathsFeasible(maxAllowedJumpValue, currentNumLocations, locationOffsets) ? 'OK' : 'NG');
}
