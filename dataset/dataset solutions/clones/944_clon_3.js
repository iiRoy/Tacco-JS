const fileSystem = require('fs'); // Import the Node.js file system module for I/O operations.

// Configuration object to manage input source and line termination characters.
// Defaults are set for a Unix-like environment (e.g., Linux, macOS).
const ioConfiguration = {
    inputSourcePath: '/dev/stdin', // Standard input path for Linux systems.
    lineDelimiter: '\n'            // Newline character for Unix-like systems.
};

// Optional: Conditional configuration for Windows environment.
/*
if (process.platform === 'win32') {
    ioConfiguration.inputSourcePath = 'temp_input.txt'; // Example for a local file on Windows.
    ioConfiguration.lineDelimiter = '\r\n';             // CRLF for Windows newlines.
}
*/

let rawDataLines; // Variable to hold an array of lines read from the input source.
try {
    // Attempt to synchronously read the entire content of the input file.
    // The content is treated as ASCII, trimmed of leading/trailing whitespace,
    // and then split into an array of strings based on the configured line delimiter.
    rawDataLines = fileSystem.readFileSync(ioConfiguration.inputSourcePath, 'ascii')
                             .trim()
                             .split(ioConfiguration.lineDelimiter);
} catch (inputReadError) {
    // If an error occurs during file reading (e.g., file not found, permissions issue),
    // log the error and terminate the process gracefully.
    console.error(`Fatal Error: Unable to read from ${ioConfiguration.inputSourcePath}. Details: ${inputReadError.message}`);
    process.exit(1); // Exit with a non-zero status code indicating an error.
}

// Extract the total number of nodes from the first line of the input data.
// Use parseInt for robust integer conversion and base 10 for safety.
const graphNodeCount = parseInt(rawDataLines.shift(), 10);

// Validate the extracted node count. It must be a positive integer.
if (isNaN(graphNodeCount) || graphNodeCount <= 0) {
    console.error("Input Error: The total number of graph nodes is invalid or missing.");
    process.exit(1);
}

// Initialize an adjacency list representation of the graph.
// Keys will be node identifiers (as strings), and values will be arrays of their numeric neighbors.
const adjacencyStructure = {};

// Iterate through the remaining lines to populate the adjacency structure.
// Each line represents a node and its connections.
for (const currentLineData of rawDataLines) {
    // Split each line by space to get individual components.
    const lineSegments = currentLineData.split(' ').filter(segment => segment !== ''); // Filter out empty strings from multiple spaces.

    // Basic validation: ensure there's at least a node ID and a neighbor count.
    if (lineSegments.length < 2) {
        // console.warn(`Skipping malformed input line (insufficient data): "${currentLineData}"`);
        continue; // Move to the next line if the current one is too short.
    }

    const mainNodeIdentifier = lineSegments.shift(); // The first element is the node's ID.
    const neighborCountStr = lineSegments.shift();   // The second element is the count of its neighbors (often redundant).

    // Further validation for the main node identifier.
    if (!mainNodeIdentifier || isNaN(parseInt(mainNodeIdentifier, 10))) {
        // console.warn(`Skipping line due to invalid main node identifier: "${mainNodeIdentifier}"`);
        continue;
    }
    // Validation for neighbor count, though its value is not strictly used for graph building.
    if (isNaN(parseInt(neighborCountStr, 10))) {
        // console.warn(`Skipping line due to invalid neighbor count for node ${mainNodeIdentifier}.`);
        continue;
    }

    // Convert the remaining segments (neighbor IDs) to numbers and filter out any invalid entries.
    const connectedNeighbors = lineSegments
                                .map(neighborIdStr => parseInt(neighborIdStr, 10))
                                .filter(neighborIdNum => !isNaN(neighborIdNum));

    // Assign the list of numeric neighbors to the main node's string identifier in the adjacency map.
    adjacencyStructure[mainNodeIdentifier] = connectedNeighbors;
}

// Sort each node's list of neighbors numerically.
// This ensures a deterministic traversal order for the DFS algorithm.
for (const nodeIdKey in adjacencyStructure) {
    // Ensure the property belongs to the object itself, not its prototype chain.
    if (Object.prototype.hasOwnProperty.call(adjacencyStructure, nodeIdKey)) {
        adjacencyStructure[nodeIdKey].sort((neighborA, neighborB) => neighborA - neighborB);
    }
}

// Data structures for Depth-First Search (DFS) algorithm.
const discoveryTimestamps = {}; // Stores the 'discovery time' for each node.
const finishTimestamps = {};    // Stores the 'finish time' for each node (when its subtree is fully explored).
let currentGlobalTime = 0;      // A monotonically increasing counter for time.
const dfsTraversalStack = [];   // An explicit stack to manage iterative DFS traversal.
let activeNodeIdentifier = '1'; // Start the DFS from node '1' (common convention).

// Iterative Depth-First Search (DFS) implementation.
// This `while(true)` loop continues until the entire connected component starting from `activeNodeIdentifier` is traversed.
while (true) {
    // Check if the current node has been visited (discovered) before.
    if (!discoveryTimestamps.hasOwnProperty(activeNodeIdentifier)) {
        currentGlobalTime++; // Increment time before recording discovery.
        discoveryTimestamps[activeNodeIdentifier] = currentGlobalTime;
    }

    let foundUndiscoveredNeighbor = false;
    // Retrieve the list of neighbors for the current active node. Handle cases where a node might not exist in the map.
    const neighborsOfActiveNode = adjacencyStructure[activeNodeIdentifier] || [];

    // Iterate through the neighbors to find an undiscovered one.
    for (let neighborIdx = 0; neighborIdx < neighborsOfActiveNode.length; neighborIdx++) {
        const potentialNeighborId = String(neighborsOfActiveNode[neighborIdx]); // Ensure string key for lookup.
        if (!discoveryTimestamps.hasOwnProperty(potentialNeighborId)) {
            // An undiscovered neighbor is found.
            dfsTraversalStack.push(activeNodeIdentifier); // Push the current node onto the stack to backtrack later.
            activeNodeIdentifier = potentialNeighborId;   // Move to the newly discovered neighbor.
            foundUndiscoveredNeighbor = true;
            break; // Stop searching for neighbors, proceed with the new node.
        }
    }

    if (foundUndiscoveredNeighbor) {
        // If a new neighbor was found, the loop will continue to process that neighbor
        // in the next iteration (its discovery time will be set then).
        continue;
    } else {
        // No undiscovered neighbors were found (all neighbors are visited or none exist).
        // This means the current node's subtree has been fully explored, so it's 'finished'.
        currentGlobalTime++; // Increment time before recording finish.
        finishTimestamps[activeNodeIdentifier] = currentGlobalTime;

        // If the stack is empty, it means the DFS has completed for the entire connected component.
        if (dfsTraversalStack.length === 0) {
            break; // Exit the main DFS loop.
        } else {
            // Otherwise, backtrack by popping the previous node from the stack.
            activeNodeIdentifier = dfsTraversalStack.pop();
        }
    }
}

// Output the discovery and finish times for each node from 1 up to graphNodeCount.
// Nodes that were not part of the connected component traversed from '1' will show default times (0).
for (let nodeIterator = 1; nodeIterator <= graphNodeCount; nodeIterator++) {
    const currentNodeKey = String(nodeIterator); // Use string keys for consistency with map lookups.
    const discoveryTime = discoveryTimestamps[currentNodeKey] || 0; // Default to 0 if node not visited.
    const finishTime = finishTimestamps[currentNodeKey] || 0;     // Default to 0 if node not visited.

    // Print the node ID, its discovery time, and its finish time using a template literal for formatting.
    console.log(`${nodeIterator} ${discoveryTime} ${finishTime}`);
}