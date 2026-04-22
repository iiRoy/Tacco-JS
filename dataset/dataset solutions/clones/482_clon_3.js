const fileSystemMod = require('fs');

// Determine the total expected byte count from standard input's file descriptor.
// This is a preliminary step to size our buffer appropriately.
let totalBytesToRead = fileSystemMod.fstatSync(process.stdin.fd).size;

// Allocate a new buffer with the determined size to hold the incoming data.
// Using Buffer.alloc for newer Node.js versions, ensuring it's initialized.
let dataBuffer = Buffer.alloc(totalBytesToRead);

// Synchronously read data from standard input into the buffer, starting at offset 0.
let actualBytesCount = fileSystemMod.readSync(process.stdin.fd, dataBuffer, 0, totalBytesToRead, 0);

// Convert the buffer content to a UTF-8 string, considering only the bytes actually read,
// then split it into an array of lines. Each line is trimmed for consistency.
let rawInputLines = dataBuffer.toString('utf8', 0, actualBytesCount).split('\n').map(line => line.trim());

/**
 * Checks for the presence of a cycle in a directed graph starting from a given node,
 * ensuring that the cycle involves a node already visited in the current path.
 * This is a depth-first search (DFS) approach.
 *
 * @param {Array<Array<number>>} adjacencyList - The graph represented as an adjacency list,
 *   where each index `i` contains an array of nodes reachable from `i`.
 * @param {number} currentNodeIndex - The index of the current node being visited in the DFS.
 * @param {Array<number>} visitedNodesInCurrentPath - An array containing indices of nodes
 *   already visited in the current DFS path. This is crucial for detecting back-edges (cycles).
 * @returns {boolean} True if a cycle is detected involving a previously visited node in the current path, false otherwise.
 */
function checkPathForLoop(adjacencyList, currentNodeIndex, visitedNodesInCurrentPath) {
    // If the current node has no outgoing edges, it cannot be part of a cycle through this path.
    // This serves as a base case for the recursion.
    if (!adjacencyList[currentNodeIndex] || adjacencyList[currentNodeIndex].length === 0) {
        return false;
    }

    // Iterate through all neighbors (nodes reachable from the current node).
    for (let neighborIdx = 0; neighborIdx < adjacencyList[currentNodeIndex].length; neighborIdx++) {
        const nextNode = adjacencyList[currentNodeIndex][neighborIdx];

        // Core cycle detection logic: if the neighbor is already in the current path,
        // it means we've found a back-edge, thus a cycle.
        if (visitedNodesInCurrentPath.includes(nextNode)) {
            return true;
        }

        // Recursively call the function for the neighbor, extending the path history.
        // We create a new array for `extendedPath` to maintain immutable path history for each branch.
        const extendedPath = [...visitedNodesInCurrentPath, nextNode];
        if (checkPathForLoop(adjacencyList, nextNode, extendedPath)) {
            return true; // If a cycle is found in the recursive call, propagate 'true' upwards.
        }
    }
    // If the loop completes without finding a cycle from any neighbor, return false.
    return false;
}

/**
 * Constructs an adjacency list graph based on a collection of strings.
 * An edge exists from string 'i' to string 'j' if the last character of string 'i'
 * matches the first character of string 'j'. Self-loops (i.e., i -> i) are explicitly excluded.
 *
 * @param {Array<string>} stringCollection - An array of strings where each string corresponds to a node.
 * @param {number} numElements - The total number of strings in the collection, representing the number of nodes.
 * @returns {Array<Array<number>>} The constructed adjacency list, where each element `graphStructure[k]`
 *   is an array of indices of nodes reachable from node `k`.
 */
function buildCharacterLinkGraph(stringCollection, numElements) {
    // Initialize the graph structure with `numElements` empty arrays.
    const graphStructure = Array(numElements).fill(null).map(() => []);

    // Basic validation: if the collection is invalid or empty, return an empty graph.
    if (!stringCollection || numElements <= 0) {
        return graphStructure;
    }

    // Iterate through each string to determine its outgoing edges.
    for (let currentStrIndex = 0; currentStrIndex < numElements; currentStrIndex++) {
        const sourceString = stringCollection[currentStrIndex];
        // Ensure the source string exists and has at least one character to form a link.
        if (!sourceString || sourceString.length === 0) {
            continue; // Skip invalid or empty strings, as they cannot initiate a link.
        }
        const linkingChar = sourceString[sourceString.length - 1]; // The character that determines links.

        // Iterate through all other strings to find potential targets for an edge.
        for (let targetStrIndex = 0; targetStrIndex < numElements; targetStrIndex++) {
            // Self-loops are explicitly not allowed in this graph construction.
            if (currentStrIndex === targetStrIndex) {
                continue;
            }

            const targetString = stringCollection[targetStrIndex];
            // Ensure the target string exists and has at least one character to receive a link.
            if (!targetString || targetString.length === 0) {
                continue; // Cannot form a link to an invalid or empty target string.
            }

            // If the linking character (last char of source) matches the first character of the target string,
            // add an edge from `currentStrIndex` to `targetStrIndex`.
            if (linkingChar === targetString[0]) {
                graphStructure[currentStrIndex].push(targetStrIndex);
            }
        }
    }
    return graphStructure;
}

// --- Main Execution Block (Immediately Invoked Function Expression - IIFE) ---
// This pattern encapsulates the main program logic, preventing global variable pollution.
(function processInputSequences() {
    let linePointer = 0; // A pointer to keep track of the current line being read from `rawInputLines`.

    // The main loop continues as long as there are lines to process and the current line is not the '0' sentinel.
    while (linePointer < rawInputLines.length && rawInputLines[linePointer] !== '0') {
        const currentLine = rawInputLines[linePointer++]; // Get the current line and advance the pointer.
        const numberOfElements = parseInt(currentLine, 10); // Parse the first line as the count of elements (N).

        // Input validation for N: N must be a positive integer.
        if (isNaN(numberOfElements) || numberOfElements <= 0) {
            console.error("Error: Invalid number of elements (N) detected. Skipping this sequence.");
            // If N was positive but invalid (e.g., "abc"), we still need to consume the next N lines.
            // This is a basic error recovery; more robust handling might involve skipping the entire block.
            if (numberOfElements > 0) {
                 linePointer += numberOfElements;
            }
            continue; // Move to the next sequence of input.
        }

        const stringCollection = []; // Array to hold the N strings for the current test case.
        // Read the `numberOfElements` strings that follow the `N` value.
        for (let idx = 0; idx < numberOfElements; idx++) {
            // Check for premature end of input.
            if (linePointer >= rawInputLines.length) {
                console.error("Error: Unexpected end of input while reading strings. Exiting program.");
                return; // Exit the IIFE if input runs out.
            }
            stringCollection.push(rawInputLines[linePointer++]); // Add string and advance pointer.
        }

        // Construct the character-link graph based on the collected strings.
        const characterLinkGraph = buildCharacterLinkGraph(stringCollection, numberOfElements);

        let cycleDetectedOverall = false; // Flag to indicate if any cycle was found in the graph.
        let startingNodeForCycle = -1; // Optional: Stores the index of the node from which a cycle was first detected.

        // Iterate through each possible node as a starting point for cycle detection.
        for (let startNode = 0; startNode < numberOfElements; startNode++) {
            // Initiate the cycle detection DFS from `startNode`. The `visitedNodesInCurrentPath`
            // array is initialized with `startNode` itself to detect cycles returning to it.
            if (checkPathForLoop(characterLinkGraph, startNode, [startNode])) {
                cycleDetectedOverall = true; // Set flag to true if a cycle is found.
                startingNodeForCycle = startNode; // Record the starting node.
                break; // A cycle has been detected, no need to check further nodes.
            }
        }

        // Output the result based on whether a cycle was found in the graph.
        console.log(cycleDetectedOverall ? 'OK' : 'NG');
    }
})(); // End of IIFE execution.