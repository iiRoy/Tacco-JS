const { readFileSync } = require('node:fs');

// Acquire all standard input content as a single string
const entireContent = readFileSync(0, 'utf8');

// Divide the content into individual lines
const sourceLines = entireContent.split('\n');

// Maintain an index to simulate consuming lines sequentially
let lineCursor = 0;

// Utility to retrieve the next available line from the input stream
function retrieveNextLine() {
    return sourceLines[lineCursor++];
}

// Function to determine if a Hamiltonian cycle exists within the constructed graph
// `adjacencyStructure`: The graph represented as a Map of Sets (node index -> Set of connected node indices)
// `currentNodeIdentifier`: The index of the node most recently added to the path
// `traversedNodesRegister`: A Set containing all node indices already in the current path
// `currentPathLength`: The number of nodes currently in the path
// `totalGraphNodes`: The total number of nodes in the graph (N)
// `startingPathNode`: The index of the node where the path originally began
function ascertainCycleExistence(adjacencyStructure, currentNodeIdentifier, traversedNodesRegister, currentPathLength, totalGraphNodes, startingPathNode) {
    // Base case: If all nodes have been visited in the current path
    if (currentPathLength === totalGraphNodes) {
        // Check if the last node in the path connects back to the very first node
        const connectionsFromLast = adjacencyStructure.get(currentNodeIdentifier);
        return connectionsFromLast && connectionsFromLast.has(startingPathNode);
    }

    const possibleConnections = adjacencyStructure.get(currentNodeIdentifier);
    // If there are no outgoing connections from the current node, and the path is not complete,
    // then this path cannot form a Hamiltonian cycle.
    if (!possibleConnections) {
        return false;
    }

    // Iterate through all nodes reachable from the current node
    for (const nextLinkedNode of possibleConnections) {
        // If the next node has not yet been visited in the current path
        if (!traversedNodesRegister.has(nextLinkedNode)) {
            // Create a new Set for the next recursive call to maintain path state immutability
            const nextTraversedRegister = new Set(traversedNodesRegister);
            nextTraversedRegister.add(nextLinkedNode); // Add the next node to the visited set

            // Recursively attempt to extend the path
            if (ascertainCycleExistence(adjacencyStructure, nextLinkedNode, nextTraversedRegister, currentPathLength + 1, totalGraphNodes, startingPathNode)) {
                return true; // A cycle was found
            }
        }
    }

    return false; // No cycle found from this path
}

// Main operational logic for processing multiple datasets
function orchestrateProcessing() {
    let countOfStrings;
    // Loop until an input of '0' is encountered, signaling the end of input
    while ((countOfStrings = parseInt(retrieveNextLine(), 10)) !== 0) {
        const stringCollection = [];
        // Read the specified number of strings for the current dataset
        for (let i = 0; i < countOfStrings; i++) {
            stringCollection.push(retrieveNextLine());
        }

        // Construct the graph based on string connections
        // Using a Map where keys are string indices and values are Sets of connected string indices
        const relationGraph = new Map();
        for (let i = 0; i < countOfStrings; i++) {
            relationGraph.set(i, new Set());
        }

        for (let currentStringIndex = 0; currentStringIndex < countOfStrings; currentStringIndex++) {
            const finalCharacter = stringCollection[currentStringIndex].slice(-1); // Get the last character
            for (let targetStringIndex = 0; targetStringIndex < countOfStrings; targetStringIndex++) {
                // Skip self-loops
                if (currentStringIndex === targetStringIndex) {
                    continue;
                }
                // If the final character of the current string matches the first character of the target string
                if (finalCharacter === stringCollection[targetStringIndex][0]) {
                    relationGraph.get(currentStringIndex).add(targetStringIndex); // Add an edge
                }
            }
        }

        // Determine the optimal starting node for the cycle search
        // The original code picks the node with the minimum number of outgoing edges
        const initialNodeSelection = Array.from({ length: countOfStrings }, (_, index) => index).reduce((accumulator, currentIndex) => {
            const outgoingEdgeCount = relationGraph.get(currentIndex).size;
            if (outgoingEdgeCount < accumulator.count) {
                return { node: currentIndex, count: outgoingEdgeCount };
            }
            return accumulator;
        }, { node: -1, count: Infinity });

        const designatedStartNode = initialNodeSelection.node;

        // Initialize the set of visited nodes for the first recursive call
        const initialPathRegister = new Set();
        initialPathRegister.add(designatedStartNode);

        // Execute the cycle detection algorithm
        const result = ascertainCycleExistence(relationGraph, designatedStartNode, initialPathRegister, 1, countOfStrings, designatedStartNode);

        // Output the result
        console.log(result ? 'OK' : 'NG');
    }
}

// Initiate the processing of input data
orchestrateProcessing();