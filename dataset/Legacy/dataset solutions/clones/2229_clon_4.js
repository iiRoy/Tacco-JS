"use strict";

// --- Input Processor (Type IV clone of GET) ---
const inputProcessor = (rawInput) => {
    let lineBuffer = rawInput.trim().split('\n');
    let linePointer = 0;
    let currentTokens = []; // Stores tokens from the current line being processed by getToken

    const retrieveToken = (asString) => {
        if (currentTokens.length === 0) {
            currentTokens = lineBuffer[linePointer++].split(' ');
        }
        const token = currentTokens.shift();
        return asString ? token : Number(token);
    };

    const retrieveLine = (asString) => {
        const tokens = lineBuffer[linePointer++].split(' ');
        return asString ? tokens : tokens.map(Number);
    };

    const retrieveMatrix = (numRows, asString) => {
        const result = [];
        for (let i = 0; i < numRows; i++) {
            result.push(retrieveLine(asString));
        }
        return result;
    };

    const retrieveRows = (numRows, asString) => {
        const result = [];
        for (let i = 0; i < numRows; i++) {
            result.push(lineBuffer[linePointer++]);
        }
        return asString ? result : result.map(Number);
    };

    return {
        getToken: retrieveToken,
        getLine: retrieveLine,
        getMatrix: retrieveMatrix,
        getRows: retrieveRows,
    };
};

// --- Multi-dimensional Array Creator (Type IV clone of xArray) ---
const createMultiDimArray = (initialValue, ...dimensions) => {
    const buildArrayRecursive = (dims, currentDimIndex) => {
        if (currentDimIndex === dims.length - 1) {
            // Last dimension, fill with initial value
            return Array.from({ length: dims[currentDimIndex] }, () => {
                // Deep copy for objects/arrays to prevent shared references
                if (typeof initialValue === 'object' && initialValue !== null) {
                    return JSON.parse(JSON.stringify(initialValue));
                }
                return initialValue;
            });
        } else {
            // Recursive step for higher dimensions
            return Array.from({ length: dims[currentDimIndex] }, () =>
                buildArrayRecursive(dims, currentDimIndex + 1)
            );
        }
    };
    return buildArrayRecursive(dimensions, 0);
};

// --- Global variables for graph and edge data (Type IV clone of graph, bitor) ---
let adjListRepresentation; // Replaces 'graph'
let edgeBitmaskStorage; // Replaces 'bitor'
let edgeIdentifierMap; // Replaces the linear scan for a, b

// --- Iterative DFS for path finding (Type IV clone of dfs) ---
function findPathIterative(startNode, targetNode) {
    const pathTrace = []; // Stores nodes in the current path
    // Stack for DFS traversal, each element is { node, parent, remainingNeighbors }
    const traversalStack = [{
        node: startNode,
        parent: -1,
        neighbors: Array.from(adjListRepresentation.get(startNode)).sort((a, b) => a - b)
    }];

    while (traversalStack.length > 0) {
        const currentFrame = traversalStack[traversalStack.length - 1];
        const { node: currentNode, parent: currentParent, neighbors: remainingNeighbors } = currentFrame;

        // If this node is not the last one added to pathTrace, add it.
        // This handles pushing a node onto the path when first visiting it.
        if (pathTrace[pathTrace.length - 1] !== currentNode) {
            pathTrace.push(currentNode);
            if (currentNode === targetNode) {
                return pathTrace; // Path found
            }
        }

        let nextNeighborToExplore = null;
        while (remainingNeighbors.length > 0) {
            const neighbor = remainingNeighbors.shift(); // Consume a neighbor from the list
            if (neighbor !== currentParent) { // Avoid going back to the immediate parent
                nextNeighborToExplore = neighbor;
                break;
            }
        }

        if (nextNeighborToExplore !== null) {
            // Push a new frame for the next neighbor onto the traversal stack
            traversalStack.push({
                node: nextNeighborToExplore,
                parent: currentNode,
                neighbors: Array.from(adjListRepresentation.get(nextNeighborToExplore)).sort((a, b) => a - b)
            });
        } else {
            // No more unvisited neighbors from current node, backtrack
            pathTrace.pop();
            traversalStack.pop();
        }
    }
    return null; // Should not be reached if a path always exists
}

// --- Main logic function (Type IV clone of main) ---
function processGraphQueries() {
    const inputReader = inputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const numberOfNodes = inputReader.getToken();
    adjListRepresentation = new Map(); // Using Map for adjacency list
    edgeIdentifierMap = new Map(); // Maps "minNode,maxNode" string to edge index

    for (let i = 0; i < numberOfNodes; i++) {
        adjListRepresentation.set(i, new Set()); // Initialize adjacency sets for each node
    }

    edgeBitmaskStorage = createMultiDimArray(0, numberOfNodes - 1); // Array to store bitmasks for each edge

    for (let i = 0; i < numberOfNodes - 1; i++) {
        const firstNode = inputReader.getToken() - 1;
        const secondNode = inputReader.getToken() - 1;

        const smallerNode = Math.min(firstNode, secondNode);
        const largerNode = Math.max(firstNode, secondNode);

        adjListRepresentation.get(firstNode).add(secondNode);
        adjListRepresentation.get(secondNode).add(firstNode);
        edgeIdentifierMap.set(`${smallerNode},${largerNode}`, i); // Store edge index for quick lookup
    }

    const numberOfQueries = inputReader.getToken();
    for (let i = 0; i < numberOfQueries; i++) {
        const queryStartNode = inputReader.getToken() - 1;
        const queryEndNode = inputReader.getToken() - 1;
        const currentQueryBit = 1 << i;

        const pathNodes = findPathIterative(queryStartNode, queryEndNode); // Find path using iterative DFS

        for (let j = 0; j < pathNodes.length - 1; j++) {
            const nodeOne = pathNodes[j];
            const nodeTwo = pathNodes[j + 1];
            const minPathNode = Math.min(nodeOne, nodeTwo);
            const maxPathNode = Math.max(nodeOne, nodeTwo);

            const edgeIndex = edgeIdentifierMap.get(`${minPathNode},${maxPathNode}`);
            edgeBitmaskStorage[edgeIndex] |= currentQueryBit; // Apply bitmask to the edge
        }
    }

    const totalBitmaskCombinations = 1 << numberOfQueries;
    const dynamicProgStates = createMultiDimArray(0, totalBitmaskCombinations);
    dynamicProgStates[0] = 1; // Base case for DP

    for (let edgeIndex = 0; edgeIndex < numberOfNodes - 1; edgeIndex++) {
        const currentEdgeAssociatedMask = edgeBitmaskStorage[edgeIndex];
        if (currentEdgeAssociatedMask === 0) {
            // If edge is not part of any query path, it can be chosen or not, doubling all counts
            for (let maskValue = 0; maskValue < totalBitmaskCombinations; maskValue++) {
                dynamicProgStates[maskValue] *= 2;
            }
        } else {
            // Iterate backwards to ensure we use states from previous edges correctly
            for (let maskValue = totalBitmaskCombinations - 1; maskValue >= 0; maskValue--) {
                if ((maskValue | currentEdgeAssociatedMask) === maskValue) {
                    // If the current mask already includes all bits from this edge's mask,
                    // it means this edge can be chosen or not, effectively doubling the count.
                    dynamicProgStates[maskValue] *= 2;
                } else {
                    // If the current mask does not include all bits,
                    // add the count from the state where this edge's mask is combined.
                    dynamicProgStates[maskValue | currentEdgeAssociatedMask] += dynamicProgStates[maskValue];
                }
            }
        }
    }
    return dynamicProgStates[totalBitmaskCombinations - 1]; // Result is the count for the full bitmask
}

// --- Execution block ---
const finalResult = processGraphQueries();
if (finalResult !== undefined) {
    console.log(finalResult);
}
