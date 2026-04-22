// This module handles standard input processing and orchestrates the graph problem solution.
const fileSystemUtil = require('fs');
const standardInputFileDescriptor = process.stdin.fd;

// Determine the size of the input stream for buffer allocation.
const inputSizeInBytes = fileSystemUtil.fstatSync(standardInputFileDescriptor).size;

// Allocate a buffer to read the entire input.
const dataCaptureBuffer = Buffer.alloc(inputSizeInBytes);

// Read the input synchronously.
const actualBytesTransferred = fileSystemUtil.readSync(
    standardInputFileDescriptor,
    dataCaptureBuffer,
    0, // offset
    inputSizeInBytes,
    0  // position
);

// Convert the buffer content to a string, split by newline, and filter out empty lines.
const incomingDataLines = dataCaptureBuffer.toString('utf8', 0, actualBytesTransferred)
                                         .split('\n')
                                         .filter(line => line.trim() !== '');

// Begin processing the dataset.
processGraphChallenges();

/**
 * Implements a Disjoint Set Union (DSU) data structure, also known as Union-Find,
 * optimized with path compression and union by size.
 * This structure efficiently manages a collection of disjoint sets.
 */
class DisjointSetStructure {
    #parentArray; // Using private class fields (ES2022)
    #numElements;

    /**
     * Initializes the DSU structure for a given number of elements.
     * Each element starts in its own set.
     * @param {number} numberOfElements The total number of elements to manage.
     */
    constructor(numberOfElements) {
        if (numberOfElements < 0) {
            throw new Error("Number of elements cannot be negative.");
        }
        this.#numElements = numberOfElements;
        this.#parentArray = Array(numberOfElements).fill(-1); // -1 indicates a root and stores negative size.
    }

    /**
     * Resets the DSU structure, effectively making each element its own set again.
     */
    reset() {
        this.#parentArray.fill(-1);
    }

    /**
     * Finds the representative (root) of the set containing the given element.
     * Applies path compression for optimization.
     * @param {number} elementIndex The index of the element.
     * @returns {number} The representative (root) of the element's set.
     */
    findRepresentative(elementIndex) {
        // Basic bounds check to ensure elementIndex is within valid range.
        if (elementIndex < 0 || elementIndex >= this.#numElements) {
            // For this specific problem context, indices are expected to be valid.
            // Returning -1 to indicate an invalid element is a robust approach.
            return -1;
        }

        // If elementIndex is a root (parent value is negative), return itself.
        if (this.#parentArray[elementIndex] < 0) {
            return elementIndex;
        }
        // Otherwise, recursively find the root and apply path compression.
        return this.#parentArray[elementIndex] = this.findRepresentative(this.#parentArray[elementIndex]);
    }

    /**
     * Unites the sets containing two given elements.
     * Uses union by size heuristic. Returns true if a union occurred, false otherwise.
     * @param {number} elementA Index of the first element.
     * @param {number} elementB Index of the second element.
     * @returns {boolean} True if the sets were different and a union was performed, false if they were already in the same set.
     */
    uniteSets(elementA, elementB) {
        let rootA = this.findRepresentative(elementA);
        let rootB = this.findRepresentative(elementB);

        // If they are already in the same set, no union needed.
        if (rootA === rootB) {
            return false;
        }

        // Union by size: attach smaller tree to root of larger tree.
        // The parentArray stores the negative of the size for root elements.
        if (this.#parentArray[rootA] <= this.#parentArray[rootB]) { // rootA's tree is larger or equal size
            this.#parentArray[rootA] += this.#parentArray[rootB]; // Add size of rootB's tree to rootA's tree
            this.#parentArray[rootB] = rootA; // Make rootA the parent of rootB
        } else { // rootB's tree is larger
            this.#parentArray[rootB] += this.#parentArray[rootA]; // Add size of rootA's tree to rootB's tree
            this.#parentArray[rootA] = rootB; // Make rootB the parent of rootA
        }
        return true;
    }

    /**
     * Checks if two elements belong to the same set.
     * @param {number} elementA Index of the first element.
     * @param {number} elementB Index of the second element.
     * @returns {boolean} True if both elements are in the same set, false otherwise.
     */
    areConnected(elementA, elementB) {
        return this.findRepresentative(elementA) === this.findRepresentative(elementB);
    }

    /**
     * Counts the number of distinct components (disjoint sets) among a subset of active nodes.
     * @param {boolean[]} activeNodeFlags An array where activeNodeFlags[i] is true if node i is considered active.
     * @returns {number} The count of distinct components formed by the active nodes.
     */
    countActiveComponents(activeNodeFlags) {
        let componentCount = 0;
        for (let idx = 0; idx < this.#numElements; idx++) {
            // A node forms a component if it's active and it's a root of its set.
            if (activeNodeFlags[idx] && this.#parentArray[idx] < 0) {
                componentCount++;
            }
        }
        return componentCount;
    }
}

/**
 * Represents a node in the graph with its associated 'days' value.
 */
class GraphNodeInfo {
    constructor(originalIndex, activationDays) {
        this.identifier = originalIndex;
        this.activationDays = activationDays;
    }
}

/**
 * Represents an edge in the graph with its two connected vertices and weight.
 */
class GraphEdge {
    constructor(sourceVertex, targetVertex, edgeWeight) {
        this.u = sourceVertex;
        this.v = targetVertex;
        this.weight = edgeWeight;
    }
}

/**
 * Processes multiple graph challenge scenarios from the pre-loaded input lines.
 * Each scenario involves finding a specific type of minimum spanning forest/tree.
 */
function processGraphChallenges() {
    let currentLineIndex = 0;

    // Helper function to safely read and parse a line from the input.
    const getNextLineAndParse = () => {
        if (currentLineIndex >= incomingDataLines.length) {
            return null; // Indicates end of input or unexpected state.
        }
        const line = incomingDataLines[currentLineIndex++];
        return line.split(' ').map(Number); // Converts space-separated strings to numbers.
    };

    // Main loop to process each graph challenge.
    while (true) {
        const dimensions = getNextLineAndParse();
        if (!dimensions || dimensions.length < 2) { // Robust check for input validity.
            break; // No more valid input or unexpected format.
        }

        const numVertices = dimensions[0];
        const numEdges = dimensions[1];

        // Termination condition for the problem set: 0 0 indicates end.
        if (numVertices === 0 && numEdges === 0) {
            break;
        }

        // Basic validation for graph dimensions.
        if (numVertices < 0 || numEdges < 0) {
            console.error(`Error: Invalid number of vertices (${numVertices}) or edges (${numEdges}). Skipping this challenge.`);
            continue; // Proceed to the next challenge if input is malformed.
        }

        // Store information about each node, including its activation 'days'.
        const vertexActivationData = new Array(numVertices);
        // Tracks which nodes are currently 'active' in the Kruskal-like process.
        const isActiveNode = new Array(numVertices).fill(false);

        for (let i = 0; i < numVertices; i++) {
            // Read node activation days for each vertex.
            const daysValue = parseInt(incomingDataLines[currentLineIndex++], 10);
            vertexActivationData[i] = new GraphNodeInfo(i, daysValue);
        }

        // Store graph edges with adjusted 0-based vertex indices.
        const graphEdges = new Array(numEdges);
        for (let i = 0; i < numEdges; i++) {
            const edgeParts = getNextLineAndParse();
            if (!edgeParts || edgeParts.length < 3) {
                 console.error(`Error: Malformed edge data on line ${currentLineIndex}. Skipping challenge.`);
                 currentLineIndex = incomingDataLines.length; // Force break outer loop
                 break;
            }
            graphEdges[i] = new GraphEdge(edgeParts[0] - 1, edgeParts[1] - 1, edgeParts[2]);
        }
        if (currentLineIndex === incomingDataLines.length && (numVertices !== 0 || numEdges !== 0)) {
            continue; // Skip if malformed edge data caused early termination of inner loop
        }


        // Sort nodes by their activation days in ascending order.
        // This order is crucial for the problem's specific Kruskal-like iteration.
        vertexActivationData.sort((nodeA, nodeB) => nodeA.activationDays - nodeB.activationDays);

        // Sort edges by weight in ascending order. This is a standard step for Kruskal's algorithm.
        graphEdges.sort((edgeA, edgeB) => edgeA.weight - edgeB.weight);

        // Initialize the Disjoint Set Union structure for the current graph scenario.
        const dsuManager = new DisjointSetStructure(numVertices);
        let accumulatedEdgeWeight = 0; // Stores the sum of weights of selected edges.

        // The core logic iterates through nodes in reverse sorted order of activation days.
        // This corresponds to activating nodes from those with highest 'days' to lowest 'days'.
        // When a node (or group of nodes with same 'days') is activated, all previously activated nodes
        // must form a single connected component using only edges whose endpoints are also activated.
        for (let i = numVertices - 1; i >= 0; i--) {
            const currentNode = vertexActivationData[i];
            isActiveNode[currentNode.identifier] = true;

            // Activate all nodes that have the same 'activationDays' value as the current node.
            // This ensures all nodes with the same 'days' value are considered simultaneously.
            while (i > 0 && vertexActivationData[i].activationDays === vertexActivationData[i - 1].activationDays) {
                i--; // Move to the previous node (which has the same activation days).
                isActiveNode[vertexActivationData[i].identifier] = true;
            }

            // Attempt to connect all currently active nodes using available edges.
            // Iterate through sorted edges and add them if both endpoints are active and they connect different components.
            for (const edge of graphEdges) {
                if (isActiveNode[edge.u] && isActiveNode[edge.v]) {
                    if (!dsuManager.areConnected(edge.u, edge.v)) {
                        dsuManager.uniteSets(edge.u, edge.v);
                        accumulatedEdgeWeight += edge.weight;
                    }
                }
            }

            // After processing a set of activated nodes, check if all active nodes form a single component.
            // If they don't, it means it's impossible to connect all current active nodes
            // into one component at this stage. The problem's logic requires resetting the accumulated
            // weight and the DSU state, effectively starting over for the next 'day' group.
            if (dsuManager.countActiveComponents(isActiveNode) > 1) {
                accumulatedEdgeWeight = 0; // Reset result for this specific 'day' configuration.
                dsuManager.reset();       // Reset DSU for the next iteration (important for the problem logic).
                // The loop continues, which is the original problem's specified behavior.
            }
        }

        // Output the final accumulated weight for the current scenario.
        console.log(accumulatedEdgeWeight);
    }
}