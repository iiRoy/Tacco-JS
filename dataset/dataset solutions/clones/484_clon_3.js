const fileSystemModule = require('fs');

// Helper function to read all input from stdin synchronously
function readAllStdinSync() {
    const standardInputFd = process.stdin.fd;
    const fileStats = fileSystemModule.fstatSync(standardInputFd);
    const fileSize = fileStats.size;
    // Allocate buffer with the exact size
    const dataBuffer = Buffer.alloc(fileSize);
    // Read all bytes from stdin into the buffer
    const actualBytesRead = fileSystemModule.readSync(standardInputFd, dataBuffer, 0, fileSize, 0);
    // Convert buffer to string and split into lines
    return dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');
}

let inputLines = readAllStdinSync();

// Renamed and slightly refactored 'solve' function
function checkHamiltonianCycle(adjacencyList, currentNodeIndex, currentPath) {
    // Base case: If all nodes have been visited, we have a potential cycle
    if (currentPath.length === adjacencyList.length) {
        // Check if the last node in the path connects back to the first node to complete the cycle
        const lastNodeInPath = currentPath[currentPath.length - 1];
        const firstNodeInPath = currentPath[0];
        return adjacencyList[lastNodeInPath].includes(firstNodeInPath);
    }

    // Iterate through all neighbors of the current node
    const neighborsOfCurrentNode = adjacencyList[currentNodeIndex];
    for (let k = 0; k < neighborsOfCurrentNode.length; k++) {
        const nextNeighborIndex = neighborsOfCurrentNode[k];

        // If the neighbor has already been visited in the current path, skip it
        if (currentPath.includes(nextNeighborIndex)) {
            continue;
        }

        // Recursively call for the next unvisited neighbor
        // Create a new path array by concatenating the current path with the next neighbor
        const extendedPath = currentPath.concat(nextNeighborIndex);
        if (checkHamiltonianCycle(adjacencyList, nextNeighborIndex, extendedPath)) {
            return true; // Found a cycle
        }
    }

    return false; // No cycle found from this path
}

// Helper function to build the adjacency list (graph) from the word array
function buildAdjacencyList(wordArray, stringCount) {
    const graphAdjacencyList = Array.from({ length: stringCount }, () => []);

    for (let outerIdx = 0; outerIdx < stringCount; outerIdx++) {
        const currentWord = wordArray[outerIdx];
        const lastCharOfCurrentWord = currentWord[currentWord.length - 1]; // Get the last character

        for (let innerIdx = 0; innerIdx < stringCount; innerIdx++) {
            // A node cannot connect to itself in this problem's context
            if (outerIdx === innerIdx) {
                continue;
            }
            // Check if the last character of currentWord matches the first character of another word
            if (lastCharOfCurrentWord === wordArray[innerIdx][0]) {
                graphAdjacencyList[outerIdx].push(innerIdx);
            }
        }
    }
    return graphAdjacencyList;
}

// Helper function to find the node with the minimum degree (fewest outgoing edges)
// This node is used as a starting point for the cycle search heuristic
function findMinDegreeNode(graphAdjacencyList) {
    let minDegree = Infinity; // Initialize with a very large number
    let startNodeIdx = -1;

    for (let nodeIdx = 0; nodeIdx < graphAdjacencyList.length; nodeIdx++) {
        const currentDegree = graphAdjacencyList[nodeIdx].length;
        if (currentDegree < minDegree) {
            minDegree = currentDegree;
            startNodeIdx = nodeIdx;
        }
    }
    return startNodeIdx;
}

// Main execution block, replacing the original IIFE
function processInputSets() {
    while (inputLines[0] !== '0') {
        const stringCount = parseInt(inputLines.shift(), 10); // Convert N to number
        const wordArray = [];

        // Read 'stringCount' number of words into the array
        for (let outerIdx = 0; outerIdx < stringCount; outerIdx++) {
            wordArray.push(inputLines.shift());
        }

        // Build the graph based on word connections
        const adjacencyList = buildAdjacencyList(wordArray, stringCount);

        // Find the starting node for the cycle search (node with minimum outgoing edges)
        const initialNodeIndex = findMinDegreeNode(adjacencyList);

        // Perform the Hamiltonian cycle check starting from the chosen node
        const hasCycle = checkHamiltonianCycle(adjacencyList, initialNodeIndex, [initialNodeIndex]);

        // Output the result based on whether a cycle was found
        console.log(hasCycle ? 'OK' : 'NG');
    }
}

// Execute the main processing function to handle all input sets
processInputSets();
