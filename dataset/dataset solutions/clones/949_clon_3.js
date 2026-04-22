const dataProcessingConfig = {
    sourcePath: '/dev/stdin',
    lineDelimiter: '\n'
};

// Helper function to read and parse the input file into a 2D array of numbers.
// It handles file reading, line splitting, and converting string tokens to numbers.
const readAndParseInputMatrix = (configObject) => {
    // Synchronously read the entire file content using Node.js 'fs' module.
    // The 'utf8' encoding is specified for text interpretation.
    const fileContent = require('fs').readFileSync(configObject.sourcePath, 'utf8');

    // Process the raw file content:
    // 1. trim(): Removes any leading or trailing whitespace from the entire content.
    // 2. split(configObject.lineDelimiter): Breaks the content into an array of strings,
    //    where each string represents a line from the input file.
    // 3. filter(lineText => lineText.length > 0): Removes any empty lines that might
    //    result from the split operation or trailing newlines.
    // 4. map(singleLine => singleLine.split(' ').map(Number)):
    //    For each valid line string, it splits it by spaces into an array of string tokens.
    //    Then, it transforms each string token into its numerical representation.
    // This produces a 2D array where each inner array corresponds to a line of numbers.
    return fileContent
        .trim()
        .split(configObject.lineDelimiter)
        .filter(lineText => lineText.length > 0)
        .map(singleLine => singleLine.split(' ').map(Number));
};

// Execute the input parsing process.
const parsedInputMatrix = readAndParseInputMatrix(dataProcessingConfig);

// Extract primary graph parameters from the first line of the input.
const initialParameters = parsedInputMatrix[0];
const totalNodes = initialParameters[0]; // N: Represents the total number of nodes in the graph (1-indexed).
const totalEdges = initialParameters[1]; // M: Represents the total number of edges to be processed.

// The number of connectivity queries (Q) is located on a specific line after all edge definitions.
// Edges are typically on lines 1 through 'totalEdges'. The query count is on the line immediately following.
const queryCount = parsedInputMatrix[totalEdges + 1][0];

// --- Disjoint Set Union (DSU) Data Structure Setup ---

// 'parentComponentTracker' serves as the parent array for the DSU structure.
// 'parentComponentTracker[i]' stores the parent of node 'i'.
// An initial value of -1 indicates that the node is currently a root of its own set.
// The array is sized 'totalNodes + 1' to accommodate 1-indexed node identifiers.
const parentComponentTracker = Array.from({ length: totalNodes + 1 }, () => -1);

// Function to find the representative (root) of the set to which 'nodeIdentifier' belongs.
// This implementation incorporates path compression for improved efficiency.
const findSetRepresentative = (nodeIdentifier, currentParentArray) => {
    // If the node's parent is -1, it means the node itself is the root of its component.
    if (currentParentArray[nodeIdentifier] === -1) {
        return nodeIdentifier;
    }
    // Recursively find the root and, during the return path, update the parent of
    // 'nodeIdentifier' to point directly to the found root (path compression).
    currentParentArray[nodeIdentifier] = findSetRepresentative(currentParentArray[nodeIdentifier], currentParentArray);
    return currentParentArray[nodeIdentifier];
};

// --- Processing Edge Definitions to Establish Connectivity ---

// Iterate through the input lines that define edges.
// Edge data starts from line 1 and continues up to 'totalEdges'.
for (let edgeIndex = 1; edgeIndex <= totalEdges; ++edgeIndex) {
    const currentEdgeData = parsedInputMatrix[edgeIndex];
    const nodeValueA = currentEdgeData[0];
    const nodeValueB = currentEdgeData[1];

    // Determine the numerically smaller and larger nodes in the current edge.
    // This mimics the original code's approach of always linking 'max' to 'min_root'.
    const smallerNodeVal = Math.min(nodeValueA, nodeValueB);
    const largerNodeVal = Math.max(nodeValueA, nodeValueB);

    // Find the root of the component containing 'smallerNodeVal'.
    // Path compression is applied here via 'findSetRepresentative'.
    const rootOfSmallerComponent = findSetRepresentative(smallerNodeVal, parentComponentTracker);

    // Link the 'largerNodeVal' directly to the root of the 'smallerNodeVal's component.
    // This is the specific union operation as implemented in the original code.
    parentComponentTracker[largerNodeVal] = rootOfSmallerComponent;
}

// --- Processing Connectivity Queries ---

// Determine the starting line index for the queries in the parsed input matrix.
// Queries begin after the initial parameters (line 0), all edges (lines 1 to totalEdges),
// and the line containing the query count (line totalEdges + 1).
const firstQueryInputLine = totalEdges + 2;

// Iterate through each connectivity query.
for (let queryIteration = 0; queryIteration < queryCount; ++queryIteration) {
    const currentQueryLineIndex = firstQueryInputLine + queryIteration;
    const queryPairData = parsedInputMatrix[currentQueryLineIndex];

    const targetNode1 = queryPairData[0];
    const targetNode2 = queryPairData[1];

    // Find the representative (root) for each target node using the DSU structure.
    // Path compression is utilized here for efficient root discovery.
    const representativeOfNode1 = findSetRepresentative(targetNode1, parentComponentTracker);
    const representativeOfNode2 = findSetRepresentative(targetNode2, parentComponentTracker);

    // Check if both nodes share the same representative, indicating they are in the same connected component.
    const areNodesInterconnected = (representativeOfNode1 === representativeOfNode2);

    // Output the result of the connectivity check to standard output.
    // Using process.stdout.write for potentially faster output in competitive programming contexts.
    if (areNodesInterconnected) {
        process.stdout.write('yes' + dataProcessingConfig.lineDelimiter);
    } else {
        process.stdout.write('no' + dataProcessingConfig.lineDelimiter);
    }
}