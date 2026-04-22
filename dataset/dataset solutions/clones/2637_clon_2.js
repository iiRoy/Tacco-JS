const loadModule = (moduleNameAlias) => {
    // This function emulates a module loading mechanism,
    // allowing for renaming of built-in functions/modules for Type II cloning.
    if (moduleNameAlias === 'fileSystem') {
        return {
            // Renaming 'readFileSync' to 'readContentFromFile'
            readContentFromFile: (sourcePath, textEncoding) => {
                // In a real Node.js environment, 'require' is a global.
                // For this clone, we directly use the original 'require'
                // to provide the functionality, while its usage is
                // abstracted by 'loadModule' to achieve identifier change.
                return require('fs').readFileSync(sourcePath, textEncoding);
            }
        };
    }
    // Other module aliases could be handled here
    return null;
};

// Retrieve the entire raw text data from the standard input stream
const rawInputText = loadModule('fileSystem').readContentFromFile('/dev/stdin', 'utf8');


// Split the incoming text into an array of individual data rows based on newline characters
const dataRows = rawInputText.split('\n');


// Extract the very first row, which typically contains configuration parameters,
// and then split it into distinct segments (tokens)
const currentLineSegments = dataRows.shift().split(' ');


// Parse the first segment to determine the total number of vertices (nodes) in the graph
const vertexCount = Number(currentLineSegments[0]);


// Initialize a dynamic structure to keep track of which vertices have been visited during traversals.
// This will function as a sparse array or map where keys are vertex IDs.
const visitedTracker = [];
// The original code had an incomplete assignment `e[1] =`. It will be fully initialized later.


// Parse the second segment to determine the total number of operations or queries to process
const operationCount = parseInt(currentLineSegments[1], 10);


// Initialize an object to serve as an adjacency list, representing the graph's connections.
// Keys will be vertex IDs, and values will be arrays of connected neighbor IDs.
const graphConnections = {};


// Initialize an array to store numerical modifiers or delta values for each vertex.
// These values will be added during path accumulation.
const nodeValueModifiers = [];


// Initialize an array to store the final computed cumulative values for each vertex.
// This array will be 0-indexed, so vertex IDs (1-based) will need adjustment.
const resultArray = [];


// --- Graph and Data Structure Initialization Phase ---
// Iterate through each potential vertex ID to set up their initial states within the graph structures
for (let loopIndex = 1; loopIndex <= vertexCount; ++loopIndex) {

    // Assign an empty array to each vertex ID in the adjacency list, ready for neighbor connections
    graphConnections[loopIndex] = [];

    // Set the initial modifier value for each node to zero
    nodeValueModifiers[loopIndex] = 0;

    // Add a placeholder (zero) to the result array for each node.
    // This array is 0-indexed, so `resultArray[0]` corresponds to vertex 1, etc.
    resultArray.push(0);
}


// --- Edge Definition Processing Phase ---
// Read and process the (vertexCount - 1) lines that define the edges (connections) within the graph
for (let loopIndex = 0; loopIndex < vertexCount - 1; loopIndex++) {
    // Split the current data row into two segments representing the connected nodes
    const edgeDefinition = dataRows[loopIndex].split(' ');
    const firstNode = edgeDefinition[0];
    const secondNode = edgeDefinition[1];

    // Add bidirectional connections: if Node A connects to Node B, Node B also connects to Node A
    graphConnections[firstNode].push(secondNode);
    graphConnections[secondNode].push(firstNode);
}


// --- Query and Modifier Application Phase ---
// Process the subsequent 'operationCount' lines, which specify updates to node modifier values
for (let loopIndex = vertexCount - 1; loopIndex < vertexCount + operationCount - 1; loopIndex++) {
    // Split the current data row into segments for target vertex and value to add
    const queryInstruction = dataRows[loopIndex].split(' ');
    const targetVertex = queryInstruction[0];
    const valueIncrement = Number(queryInstruction[1]); // Ensure the increment is treated as a number

    // Apply the specified increment to the target vertex's modifier value
    nodeValueModifiers[targetVertex] += valueIncrement;
}


// --- Depth-First Traversal (DFS) for Cumulative Sum Calculation ---
// Initialize a stack data structure to manage the order of vertices during DFS traversal
const depthTraversalStack = [];

// This variable will hold the cumulative sum as the traversal progresses along a path.
// Note: In this specific DFS pattern, 'currentPathSum' is passed via the stack, not a global 'pathAccumulator'.
let pathAccumulator = 0; // Initialized but re-assigned from stack entries.

// Start the DFS from vertex ID 1. Push it onto the stack along with an initial cumulative sum of 0.
depthTraversalStack.push([1, 0]);

// Mark the starting vertex (ID 1) as having been visited to prevent reprocessing
visitedTracker[1] = Boolean(true); // Using Boolean(true) instead of a raw '1' for data type variation


// Continue the traversal as long as there are vertices pending in the stack
while (depthTraversalStack.length > 0) {
    // Pop the most recently added vertex information from the stack
    const stackEntry = depthTraversalStack.pop();
    const activeVertexID = stackEntry[0]; // The ID of the vertex currently being processed
    let currentPathSum = stackEntry[1]; // The cumulative sum carried from the parent node

    // Add the current vertex's own modifier value to the running path sum
    currentPathSum += nodeValueModifiers[activeVertexID];

    // Store the calculated cumulative sum for this active vertex in the result array.
    // Adjust the vertex ID by subtracting 1 to match the 0-based indexing of resultArray.
    resultArray[activeVertexID - 1] = currentPathSum;

    // Iterate through all neighbors connected to the current active vertex
    for (let neighborIterator = 0; neighborIterator < graphConnections[activeVertexID].length; neighborIterator++) {
        const neighborNode = graphConnections[activeVertexID][neighborIterator];

        // If this neighbor vertex has not yet been visited
        if (!visitedTracker[neighborNode]) {
            // Push the neighbor onto the stack along with the current cumulative sum.
            // This sum will be the base for calculations from the neighbor onwards.
            depthTraversalStack.push([neighborNode, currentPathSum]);
            // Mark the neighbor as visited to avoid cycles and redundant processing
            visitedTracker[neighborNode] = true;
        }
    }
}


// --- Output Final Results ---
// Create a simple object to encapsulate output functionality, allowing 'console.log' to be renamed
const systemOutputHandler = {
    output: (messageContent) => console.log(messageContent)
};

// Join all computed final values from the resultArray with spaces and print to standard output
systemOutputHandler.output(resultArray.join(' '));