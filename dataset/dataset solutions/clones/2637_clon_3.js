const getValidatedInteger = (inputString) => {
    const parsedValue = parseInt(inputString, 10);
    // Basic validation to ensure the parsed value is a number
    if (isNaN(parsedValue)) {
        throw new Error(`Input parsing error: '${inputString}' is not a valid integer.`);
    }
    return parsedValue;
};

// Read all incoming data from the standard input stream
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the entire input content into an array of lines, removing any trailing newlines
const allInputLines = rawInputContent.trim().split('\n');

// A basic check to ensure there's at least some input
if (allInputLines.length === 0) {
    console.error("Fatal Error: No data received from standard input.");
    process.exit(1); // Exit with an error code
}

// Extract the first line which contains the graph's metadata
const metadataLineComponents = allInputLines.shift().split(' ');

// Parse the number of nodes in the graph (N in original)
const totalGraphNodes = getValidatedInteger(metadataLineComponents[0]);

// Parse the number of queries for node value updates (Q in original)
const numberOfValueQueries = getValidatedInteger(metadataLineComponents[1]);

// Initialize the primary data structures:
// 1. An adjacency list to represent the graph (using Map for numeric keys)
const graphConnections = new Map();
// 2. A map to store incremental values for each node, initialized to zero
const nodeDeltaValues = new Map();
// 3. An array to store the final accumulated sum for each node, 0-indexed for convenience
const computedNodeSums = new Array(totalGraphNodes).fill(0);

// Populate initial graph structure and delta values for all nodes
for (let nodeIndex = 1; nodeIndex <= totalGraphNodes; nodeIndex++) {
    graphConnections.set(nodeIndex, []); // Each node starts with an empty list of neighbors
    nodeDeltaValues.set(nodeIndex, 0);   // All nodes start with a zero delta value
}

// --- Phase 1: Constructing the Graph Edges ---
// The graph is assumed to be a tree or a connected graph, having (totalGraphNodes - 1) edges.
// We also need to account for the subsequent value update queries.
const expectedMinimumLines = (totalGraphNodes > 0 ? totalGraphNodes - 1 : 0) + numberOfValueQueries;
if (allInputLines.length < expectedMinimumLines) {
    console.error(`Error: Insufficient input lines. Expected at least ${expectedMinimumLines}, got ${allInputLines.length}.`);
    process.exit(1);
}

for (let edgeCount = 0; edgeCount < totalGraphNodes - 1; edgeCount++) {
    const edgeDefinition = allInputLines[edgeCount].split(' ');
    const nodeU = getValidatedInteger(edgeDefinition[0]);
    const nodeV = getValidatedInteger(edgeDefinition[1]);

    // Ensure nodes exist before adding connections
    if (graphConnections.has(nodeU) && graphConnections.has(nodeV)) {
        graphConnections.get(nodeU).push(nodeV); // Add V to U's neighbors
        graphConnections.get(nodeV).push(nodeU); // Add U to V's neighbors (undirected graph)
    } else {
        console.warn(`Warning: Edge definition involves non-existent node(s): ${nodeU}-${nodeV}. Skipping.`);
    }
}

// --- Phase 2: Processing Node Value Update Queries ---
// These queries start immediately after the graph edge definitions
const firstQueryLineIndex = totalGraphNodes - 1;

for (let queryCount = 0; queryCount < numberOfValueQueries; queryCount++) {
    const queryDetails = allInputLines[firstQueryLineIndex + queryCount].split(' ');
    const targetNodeIdentifier = getValidatedInteger(queryDetails[0]);
    const valueToAdd = getValidatedInteger(queryDetails[1]);

    // Apply the increment to the target node's delta value
    if (nodeDeltaValues.has(targetNodeIdentifier)) {
        nodeDeltaValues.set(targetNodeIdentifier, nodeDeltaValues.get(targetNodeIdentifier) + valueToAdd);
    } else {
        console.warn(`Warning: Query targets non-existent node: ${targetNodeIdentifier}. Skipping update.`);
    }
}

// --- Phase 3: Depth-First Traversal and Value Accumulation ---
// This stack will hold pairs of [currentNodeId, accumulatedSumFromParent]
const traversalProcessingStack = [];
// A Set for efficient tracking of visited nodes during traversal
const nodesAlreadyProcessed = new Set();

// The traversal typically starts from node 1 (root of the implicit tree)
const entryPointNode = 1;

// Initialize traversal if the graph is not empty and the entry point exists
if (totalGraphNodes > 0 && graphConnections.has(entryPointNode)) {
    traversalProcessingStack.push([entryPointNode, 0]); // Start with node 1, initial parent sum is 0
    nodesAlreadyProcessed.add(entryPointNode);          // Mark the starting node as visited
} else if (totalGraphNodes > 0) {
    console.error(`Error: Starting node ${entryPointNode} is not defined in the graph.`);
    process.exit(1);
}


// Perform DFS traversal
while (traversalProcessingStack.length > 0) {
    // Retrieve the current node and the sum accumulated up to its parent
    const [currentNodeIdentifier, inheritedSum] = traversalProcessingStack.pop();

    // Calculate the total sum for the current node: inherited sum + its own delta value
    const currentNodesFinalSum = inheritedSum + nodeDeltaValues.get(currentNodeIdentifier);

    // Store this final sum in the results array (adjusting for 0-based indexing)
    computedNodeSums[currentNodeIdentifier - 1] = currentNodesFinalSum;

    // Get the list of neighbors for the current node
    const adjacentNodes = graphConnections.get(currentNodeIdentifier);

    // Iterate over all neighbors to continue the traversal
    if (adjacentNodes) { // Ensure the node actually has an entry in the adjacency list
        for (const neighborId of adjacentNodes) {
            // If the neighbor has not been visited yet, process it
            if (!nodesAlreadyProcessed.has(neighborId)) {
                nodesAlreadyProcessed.add(neighborId); // Mark neighbor as visited
                // Push neighbor to stack, passing the current node's total sum as its 'inheritedSum'
                traversalProcessingStack.push([neighborId, currentNodesFinalSum]);
            }
        }
    }
}

// --- Final Output ---
// Join the computed sums for all nodes with spaces and print to console
console.log(computedNodeSums.join(' '));