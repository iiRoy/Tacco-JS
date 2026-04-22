const fileUtility = require('fs'); // A module for file system operations.

// Determine the total byte size of the standard input stream.
let contentSize = fileUtility.fstatSync(process.stdin.fd).size;

// Allocate a new Buffer to hold the input data.
let dataBlock = Buffer.alloc(contentSize);

// Read data from standard input into the buffer, starting at offset 0.
let octetsProcessed = fileUtility.readSync(process.stdin.fd, dataBlock, 0, contentSize, 0);

// Convert the buffer to a UTF-8 string and split into lines for easier processing.
let dataSourceLines = dataBlock.toString('utf8', 0, octetsProcessed).split('\n');

/**
 * Recursively attempts to find a cyclic path that visits every node exactly once.
 * This is a variation of the Hamiltonian cycle problem.
 * @param {Array<Array<number>>} connectionMap - The adjacency list representing node connections.
 * @param {number} currentVertex - The index of the node currently being explored.
 * @param {Array<number>} visitedNodes - An ordered list of nodes visited so far in the current path.
 * @returns {boolean} True if a full cycle is found, false otherwise.
 */
function checkSequenceValidity(connectionMap, currentVertex, visitedNodes) {
    // Base case: If all nodes have been visited, check if the last node connects back to the starting node.
    if (visitedNodes.length === connectionMap.length) {
        // The '~' operator is used here as a quick check for indexOf returning -1 (not found).
        // If indexOf returns -1, ~(-1) is 0 (falsy). Otherwise, it's non-zero (truthy).
        return ~connectionMap[visitedNodes[visitedNodes.length - 1]].indexOf(visitedNodes[0]);
    }

    // Iterate through all possible next connections from the current vertex.
    for (let iteratorK = 0; iteratorK < connectionMap[currentVertex].length; iteratorK++) {
        const potentialNextNode = connectionMap[currentVertex][iteratorK];

        // If the potential next node has already been visited in the current path, skip it.
        if (~visitedNodes.indexOf(potentialNextNode)) {
            continue;
        }

        // Recursively try to extend the path with the potential next node.
        // 'concat' creates a new array, ensuring the 'visitedNodes' array is not mutated for other branches.
        if (checkSequenceValidity(connectionMap, potentialNextNode, visitedNodes.concat(potentialNextNode))) {
            return true; // A valid cycle was found through this branch.
        }
    }

    return false; // No valid path could be extended from this vertex.
}

// Main program logic encapsulated within an Immediately Invoked Function Expression (IIFE).
(function () {
    let nodeCount,          // Total number of elements/nodes.
        stringArray,        // Array to store input strings.
        adjacencyList,      // Graph represented as an adjacency list.
        currentWord,        // The string being processed in the inner loop.
        terminatingChar,    // The last character of 'currentWord'.
        minimumConnections, // Tracks the minimum number of outgoing connections from a node.
        loopIndexA,         // General loop counter for outer loops.
        loopIndexB;         // General loop counter for inner loops.

    // Process multiple test cases. The loop continues as long as the first line of input is not '0'.
    while (dataSourceLines[0] !== '0') {
        // Read the number of elements for the current test case and convert it to an integer.
        nodeCount = parseInt(dataSourceLines.shift(), 10);

        stringArray = [];    // Initialize array to store the words for this test case.
        adjacencyList = [];  // Initialize the adjacency list for the graph.

        // Populate the string array with 'nodeCount' strings from the input source.
        for (loopIndexA = 0; loopIndexA < nodeCount; loopIndexA++) {
            stringArray.push(dataSourceLines.shift());
        }

        // Build the adjacency list: connect nodes (strings) if the last character of one
        // matches the first character of another.
        for (loopIndexA = 0; loopIndexA < nodeCount; loopIndexA++) {
            currentWord = stringArray[loopIndexA];
            terminatingChar = currentWord[currentWord.length - 1]; // Get the last character of the current word.
            adjacencyList[loopIndexA] = []; // Initialize the list of connections for the current node.

            for (loopIndexB = 0; loopIndexB < nodeCount; loopIndexB++) {
                // A node cannot form a connection with itself for this problem's logic.
                if (loopIndexA === loopIndexB) {
                    continue;
                }

                // Check if the last character of 'currentWord' matches the first character of another word.
                if (terminatingChar === stringArray[loopIndexB][0]) {
                    adjacencyList[loopIndexA].push(loopIndexB); // Add a directed edge.
                }
            }
        }

        // Find a candidate starting node: the one with the fewest outgoing connections.
        // This is often a heuristic for path-finding problems.
        minimumConnections = Infinity; // Initialize with a very large value.
        let startingNodeCandidate = -1; // Index to store the chosen starting node.

        for (loopIndexA = 0; loopIndexA < nodeCount; loopIndexA++) {
            if (adjacencyList[loopIndexA].length < minimumConnections) {
                minimumConnections = adjacencyList[loopIndexA].length;
                startingNodeCandidate = loopIndexA; // Update the candidate.
            }
        }

        // Execute the cycle-finding algorithm starting from the selected node and print the result.
        // The initial 'visitedNodes' array contains only the starting node.
        console.log(checkSequenceValidity(adjacencyList, startingNodeCandidate, [startingNodeCandidate]) ? 'OK' : 'NG');
    }
})(); // End of the main IIFE.