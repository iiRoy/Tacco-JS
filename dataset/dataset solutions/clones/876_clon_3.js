const ioHandler = require('fs'); // Renamed `fs` to `ioHandler` for clarity

// Determine the total byte size of the standard input stream.
const streamContentSize = ioHandler.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the incoming data. Using `Buffer.alloc` is a modern and safer approach.
const readDataBuffer = Buffer.alloc(streamContentSize);

// Read the entire standard input into the buffer.
const actualBytesProcessed = ioHandler.readSync(process.stdin.fd, readDataBuffer, 0, streamContentSize, 0);

// Convert the buffer content to a UTF-8 string, split by newlines, and store for processing.
const inputLineSegments = readDataBuffer.toString('utf8', 0, actualBytesProcessed).split('\n');

// Initialize and execute the main program logic.
executeMainAlgorithm();

/**
 * Parses a string to an integer, providing a default value if parsing fails or result is NaN.
 * This helper function enhances robustness for input processing.
 * @param {string} strValue The string representation of a number.
 * @param {number} [defaultValue=0] The value to return if parsing fails.
 * @returns {number} The parsed integer or the specified default value.
 */
function parseNumericValue(strValue, defaultValue = 0) {
    const parsedResult = parseInt(strValue, 10);
    return isNaN(parsedResult) ? defaultValue : parsedResult;
}

/**
 * Implements a Disjoint Set Union (DSU) data structure, commonly known as Union-Find.
 * This structure efficiently manages a collection of disjoint sets.
 * It uses path compression and union by size/rank optimizations for performance.
 *
 * @param {number} totalElements The initial number of elements, each starting in its own set.
 * @returns {object} An object exposing methods for DSU operations.
 */
function DisjointSet(totalElements) {
    // The parent array: parentArray[k] holds the parent of element k.
    // If parentArray[k] is negative, k is a root, and its absolute value indicates the set's size.
    const parentArray = new Array(totalElements).fill(-1); // All elements initially are roots of singleton sets.

    /**
     * Finds the representative (root) of the set that `elementIdentifier` belongs to.
     * Applies path compression to flatten the tree structure for faster subsequent lookups.
     *
     * @param {number} elementIdentifier The ID of the element to find the set representative for.
     * @returns {number} The root element ID of the set.
     */
    function findSetRepresentative(elementIdentifier) {
        // If the element is a root (indicated by a negative parent value), it is its own representative.
        if (parentArray[elementIdentifier] < 0) {
            return elementIdentifier;
        } else {
            // Otherwise, recursively find the root and update the parent for path compression.
            const actualRoot = findSetRepresentative(parentArray[elementIdentifier]);
            parentArray[elementIdentifier] = actualRoot; // Path compression step
            return actualRoot;
        }
    }

    /**
     * Merges the sets containing `nodeA` and `nodeB`.
     * Employs the union by size heuristic: the smaller set's root points to the larger set's root.
     *
     * @param {number} nodeA The identifier of the first node.
     * @param {number} nodeB The identifier of the second node.
     * @returns {boolean} True if the two nodes were in different sets and were successfully united; false otherwise.
     */
    function uniteComponents(nodeA, nodeB) {
        let rootOfA = findSetRepresentative(nodeA);
        let rootOfB = findSetRepresentative(nodeB);

        // If both nodes are already in the same set, no union operation is needed.
        if (rootOfA === rootOfB) {
            return false;
        }

        // Union by size/rank: attach the smaller tree under the root of the larger tree.
        // The negative value in parentArray represents the size (absolute value).
        // A smaller negative number means a larger set.
        if (parentArray[rootOfA] <= parentArray[rootOfB]) { // If set A is larger or equal in size
            parentArray[rootOfA] += parentArray[rootOfB]; // Update size of the new combined set (at rootOfA)
            parentArray[rootOfB] = rootOfA;               // Make rootOfA the parent of rootOfB
        } else { // If set B is larger
            parentArray[rootOfB] += parentArray[rootOfA]; // Update size of the new combined set (at rootOfB)
            parentArray[rootOfA] = rootOfB;               // Make rootOfB the parent of rootOfA
        }
        return true; // The sets were distinct and have been merged.
    }

    /**
     * Checks if two elements belong to the same disjoint set.
     *
     * @param {number} elemX The identifier of the first element.
     * @param {number} elemY The identifier of the second element.
     * @returns {boolean} True if `elemX` and `elemY` are in the same set; false otherwise.
     */
    function checkConnectivity(elemX, elemY) {
        return findSetRepresentative(elemX) === findSetRepresentative(elemY);
    }

    /**
     * Counts the number of distinct connected components among a specific subset of elements.
     *
     * @param {boolean[]} activeElementFlags A boolean array indicating which elements are currently 'active' or 'in use'.
     *                                       Only active elements that are also roots of a set are counted.
     * @returns {number} The total count of active, distinct connected components.
     */
    function tallyActiveComponents(activeElementFlags) {
        let componentCounter = 0;
        for (let elementIdx = 0; elementIdx < totalElements; ++elementIdx) {
            // A component is counted if its root is an active element.
            // A root is identified by its parentArray value being negative.
            if (activeElementFlags[elementIdx] && parentArray[elementIdx] < 0) {
                componentCounter++;
            }
        }
        return componentCounter;
    }

    // Return an object exposing the DSU functionalities.
    return {
        unite: uniteComponents,
        getLeader: findSetRepresentative,
        countGroups: tallyActiveComponents,
        areConnected: checkConnectivity
    };
}

/**
 * The primary algorithm execution function.
 * It reads graph data, processes nodes based on their activity durations,
 * and calculates a specific sum of edge weights using the Disjoint Set Union structure.
 */
function executeMainAlgorithm() {
    let currentLineTokens;
    let nodeCount, edgeCount;
    let primaryLoopIndex, secondaryLoopIndex; // Renamed loop variables for clarity
    let vertexDataRecords; // Stores node ID and activity duration
    let graphConnections; // Stores edges as [source, target, weight]
    let currentEdgeTuple;
    let componentManagerInstance; // Instance of the DisjointSet structure
    let finalAccumulatedWeight; // The result variable
    let nodeInclusionStatus; // Boolean array indicating if a node is currently 'active'

    // The main processing loop continues until a specific termination signal ("0 0") is read.
    while (true) {
        currentLineTokens = inputLineSegments.shift().split(' ');
        nodeCount = parseNumericValue(currentLineTokens[0]);
        edgeCount = parseNumericValue(currentLineTokens[1]);

        // Break condition: if both nodeCount and edgeCount are zero, terminate the program.
        if (nodeCount === 0 && edgeCount === 0) {
            break;
        }

        // Initialize data structures for the current test case.
        vertexDataRecords = [];
        nodeInclusionStatus = new Array(nodeCount).fill(false); // All nodes are initially inactive.

        // Read and store node-specific data (activity duration).
        for (primaryLoopIndex = 0; primaryLoopIndex < nodeCount; ++primaryLoopIndex) {
            const durationValue = parseNumericValue(inputLineSegments.shift());
            vertexDataRecords.push({
                vertexIdentifier: primaryLoopIndex, // Original node index (0-based)
                activityDuration: durationValue
            });
        }

        // Read and store graph edge data.
        graphConnections = [];
        for (primaryLoopIndex = 0; primaryLoopIndex < edgeCount; ++primaryLoopIndex) {
            const edgeComponents = inputLineSegments.shift().split(' ');
            const sourceNodeId = parseNumericValue(edgeComponents[0]) - 1; // Convert to 0-indexed
            const targetNodeId = parseNumericValue(edgeComponents[1]) - 1; // Convert to 0-indexed
            const edgeWeightValue = parseNumericValue(edgeComponents[2]);
            graphConnections.push([sourceNodeId, targetNodeId, edgeWeightValue]);
        }

        // Sort the node records by their activity duration in ascending order.
        vertexDataRecords.sort((recordA, recordB) => {
            const durationA = recordA.activityDuration;
            const durationB = recordB.activityDuration;
            if (durationA < durationB) return -1;
            if (durationA > durationB) return 1;
            return 0; // If durations are equal, their relative order doesn't matter for this sort.
        });

        // Sort the graph edges by their weight in ascending order.
        graphConnections.sort((connectionA, connectionB) => connectionA[2] - connectionB[2]);

        // Initialize the Disjoint Set Union structure for managing connected components.
        componentManagerInstance = DisjointSet(nodeCount);
        finalAccumulatedWeight = 0;

        // Iterate through nodes in reverse order of activity duration (from longest duration to shortest).
        // This simulates a process where nodes become "available" or "active" over time.
        for (primaryLoopIndex = nodeCount - 1; primaryLoopIndex >= 0; --primaryLoopIndex) {
            const currentVertexRecord = vertexDataRecords[primaryLoopIndex];
            const currentVertexId = currentVertexRecord.vertexIdentifier;

            // Mark the current node as active.
            nodeInclusionStatus[currentVertexId] = true;

            // Activate all other nodes that have the exact same activity duration as the current node.
            // This ensures nodes with identical 'days' are processed together.
            let lookAheadIndex = primaryLoopIndex;
            while (lookAheadIndex > 0 && vertexDataRecords[lookAheadIndex].activityDuration === vertexDataRecords[lookAheadIndex - 1].activityDuration) {
                lookAheadIndex--;
                nodeInclusionStatus[vertexDataRecords[lookAheadIndex].vertexIdentifier] = true;
            }
            primaryLoopIndex = lookAheadIndex; // Adjust the main loop index to skip already processed same-duration nodes.

            // Iterate through all edges, attempting to unite components among active nodes.
            // Edges are considered in increasing order of weight, similar to Kruskal's algorithm.
            for (secondaryLoopIndex = 0; secondaryLoopIndex < edgeCount; ++secondaryLoopIndex) {
                currentEdgeTuple = graphConnections[secondaryLoopIndex];
                const nodeEndpointA = currentEdgeTuple[0];
                const nodeEndpointB = currentEdgeTuple[1];
                const edgeValue = currentEdgeTuple[2];

                // An edge is considered for union only if both its endpoints are currently active
                // and they are not already part of the same connected component.
                if (nodeInclusionStatus[nodeEndpointA] && nodeInclusionStatus[nodeEndpointB] && !componentManagerInstance.areConnected(nodeEndpointA, nodeEndpointB)) {
                    // If uniting these components, add the edge's weight to the total.
                    componentManagerInstance.unite(nodeEndpointA, nodeEndpointB);
                    finalAccumulatedWeight += edgeValue;
                }
            }

            // After processing all edges for the current set of active nodes,
            // check if all active nodes form a single connected component.
            // If there's more than one component among the active nodes, it means a condition is not met.
            // In this specific problem context, this implies resetting the accumulated weight and the DSU state.
            if (componentManagerInstance.countGroups(nodeInclusionStatus) > 1) {
                finalAccumulatedWeight = 0; // Reset the result for this scenario.
                // Re-initialize the DSU structure to effectively discard all previous unions for this "day" iteration.
                componentManagerInstance = DisjointSet(nodeCount);
                // The original code had a commented-out 'break' here. Without it, the loop continues,
                // implying a reset and re-evaluation for subsequent 'day' thresholds.
            }
        }
        // Output the calculated result for the current test case.
        console.log(finalAccumulatedWeight);
    }
}