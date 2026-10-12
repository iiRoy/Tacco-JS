const fileSystemModule = require('fs');

// --- Input Processing ---
// Reads input from stdin, treating each line as a separate entry.
// Uses synchronous file system operations for simplicity in this context.
const standardInputFileDescriptor = process.stdin.fd;
const inputFileSize = fileSystemModule.fstatSync(standardInputFileDescriptor).size;

// Handle potential empty input or errors gracefully
if (inputFileSize === 0) {
    console.error("Error: Standard input is empty.");
    process.exit(1);
}

const rawInputBuffer = Buffer.alloc(inputFileSize); // Use Buffer.alloc for safety
const bytesReadFromStdin = fileSystemModule.readSync(standardInputFileDescriptor, rawInputBuffer, 0, inputFileSize, 0);

// Basic validation: ensure we read some data
if (bytesReadFromStdin === 0) {
    console.error("Error: Failed to read any bytes from stdin.");
    process.exit(1);
}

const rawDataLines = rawInputBuffer.toString('utf8', 0, bytesReadFromStdin).trim().split('\n');

// --- Graph Manipulation Utilities ---

/**
 * Creates a new adjacency list representation of a graph by removing a specified edge.
 * The original graph remains unchanged.
 * @param {Array<Array<number>>} originalAdjacencyList - The original graph's adjacency list.
 * @param {[number, number]} edgeToRemove - An array [source, target] representing the edge to remove.
 * @returns {Array<Array<number>>} A new adjacency list with the edge removed.
 */
function removeEdgeFromGraph(originalAdjacencyList, edgeToRemove) {
    const [sourceNodeId, targetNodeId] = edgeToRemove;

    // Create a deep copy of the adjacency list to avoid modifying the original
    const modifiedAdjacencyList = originalAdjacencyList.map(neighbors => [...neighbors]);

    // Find the source node's adjacency list and filter out the target node
    if (modifiedAdjacencyList[sourceNodeId]) {
        modifiedAdjacencyList[sourceNodeId] = modifiedAdjacencyList[sourceNodeId].filter(
            neighbor => neighbor !== targetNodeId
        );
    }
    // Note: This assumes a directed graph where only the source's outgoing edge is removed.
    // For an undirected graph, you'd also remove the reverse edge if it exists.
    return modifiedAdjacencyList;
}

/**
 * Calculates the longest path in a directed acyclic graph (DAG) for a specific set of nodes
 * within a larger graph component. Uses a dynamic programming approach.
 * @param {Array<Array<number>>} graphAdjacencyList - The overall graph's adjacency list.
 * @param {Array<number>} nodesInComponent - A list of node IDs belonging to the current connected component.
 * @returns {number} The maximum path length found among the specified nodes.
 */
function calculateLongestPathInSubgraph(graphAdjacencyList, nodesInComponent) {
    // Initialize path lengths for all nodes. Only nodes in the component will be updated.
    const pathLengths = new Array(graphAdjacencyList.length).fill(1); // Minimum path length is 1 for a single node

    let maxPathFound = 1; // Tracks the maximum path length encountered

    // Iterate through nodes in the specified component to calculate their longest paths
    for (const currentNode of nodesInComponent) {
        // Ensure the path length for the current node is at least 1 (the node itself)
        pathLengths[currentNode] = Math.max(pathLengths[currentNode], 1);

        // Process neighbors (outgoing edges) from the current node
        const neighborsOfCurrentNode = graphAdjacencyList[currentNode] || []; // Handle cases where a node might not have outgoing edges

        for (const neighborNode of neighborsOfCurrentNode) {
            // Update the neighbor's path length if a longer path is found through the current node
            const potentialNewPathLength = pathLengths[currentNode] + 1;
            pathLengths[neighborNode] = Math.max(pathLengths[neighborNode], potentialNewPathLength);
        }
        // Update the overall maximum path length found so far
        maxPathFound = Math.max(maxPathFound, pathLengths[currentNode]);
    }
    return maxPathFound;
}

// --- Main Program Logic ---

// Parse initial graph dimensions
const firstLineParts = rawDataLines.shift().split(' ').map(Number);
const numNodes = firstLineParts[0];
const numEdges = firstLineParts[1];

// Basic input validation
if (isNaN(numNodes) || isNaN(numEdges) || numNodes <= 0 || numEdges < 0) {
    console.error("Error: Invalid number of nodes or edges specified.");
    process.exit(1);
}
if (rawDataLines.length < numEdges) {
    console.error(`Error: Expected ${numEdges} edge definitions, but found ${rawDataLines.length}.`);
    process.exit(1);
}

const allEdges = []; // Stores all edges as [source, target]
const adjacencyList = Array.from({ length: numNodes }, () => []); // Graph represented as adjacency list

// --- Union-Find Data Structure ---
// Encapsulates Union-Find operations for tracking connected components.
const createUnionFindStructure = function() {
    const parentArray = Array.from({ length: numNodes }, (_, i) => -1); // Negative value indicates root and size of component

    /**
     * Finds the representative (root) of the set containing the given node.
     * Applies path compression for efficiency.
     * @param {number} nodeIndex - The node for which to find the representative.
     * @returns {number} The representative (root) node.
     */
    function findRepresentative(nodeIndex) {
        if (parentArray[nodeIndex] < 0) {
            return nodeIndex; // 'nodeIndex' is a root
        }
        // Path compression: set parent to root directly
        parentArray[nodeIndex] = findRepresentative(parentArray[nodeIndex]);
        return parentArray[nodeIndex];
    }

    /**
     * Unites the sets containing two nodes, if they are not already in the same set.
     * Uses union by size/rank heuristic.
     * @param {number} nodeA - The first node.
     * @param {number} nodeB - The second node.
     * @returns {boolean} True if the sets were united, false if they were already in the same set.
     */
    function uniteComponents(nodeA, nodeB) {
        let rootA = findRepresentative(nodeA);
        let rootB = findRepresentative(nodeB);

        if (rootA !== rootB) {
            // Union by size: attach smaller tree to root of larger tree
            if (parentArray[rootA] < parentArray[rootB]) { // parentArray stores negative size
                parentArray[rootA] += parentArray[rootB];
                parentArray[rootB] = rootA;
            } else {
                parentArray[rootB] += parentArray[rootA];
                parentArray[rootA] = rootB;
            }
            return true; // Components were united
        }
        return false; // Already in the same component
    }

    /**
     * Gathers all nodes into their respective connected components.
     * @returns {Array<Array<number>>} An array where each element is a sorted list of node IDs
     *                                 belonging to a distinct connected component.
     */
    function getComponentNodeLists() {
        const tempComponentGroups = Array.from({ length: numNodes }, () => []);
        for (let i = 0; i < numNodes; i++) {
            tempComponentGroups[findRepresentative(i)].push(i);
        }
        // Filter out empty arrays (representing non-root indices) and sort nodes within each component
        return tempComponentGroups
            .filter(component => component.length > 0)
            .map(component => component.sort((a, b) => a - b));
    }

    return {
        unite: uniteComponents,
        find: findRepresentative,
        getComponents: getComponentNodeLists
    };
}(); // Immediately Invoked Function Expression for the Union-Find object

// --- Graph Construction and Union-Find Population ---
// Populate the adjacency list and the Union-Find structure based on input edges.
for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
    const edgeParts = rawDataLines[edgeIndex].split(' ').map(Number);
    const sourceNode = edgeParts[0] - 1; // Adjust to 0-indexed
    const targetNode = edgeParts[1] - 1; // Adjust to 0-indexed

    // Basic edge validation
    if (sourceNode < 0 || sourceNode >= numNodes || targetNode < 0 || targetNode >= numNodes) {
        console.error(`Warning: Edge ${edgeIndex + 1} (${sourceNode + 1}, ${targetNode + 1}) contains invalid node IDs. Skipping.`);
        continue;
    }

    allEdges.push([sourceNode, targetNode]); // Store the 0-indexed edge
    adjacencyList[sourceNode].push(targetNode); // Add to directed graph
    createUnionFindStructure.unite(sourceNode, targetNode); // Unite nodes in the Union-Find structure
}

// --- Analyze Connected Components ---
const connectedComponents = createUnionFindStructure.getComponents();
// console.log("Identified Connected Components:", connectedComponents); // Debugging output

// Calculate the longest path for each connected component
const componentMaxPathLengths = connectedComponents.map(componentNodeList => {
    return calculateLongestPathInSubgraph(adjacencyList, componentNodeList);
});

// console.log("Max path lengths per component:", componentMaxPathLengths); // Debugging output

// Identify the component(s) with the overall maximum path length
const overallMaxPathLength = Math.max(...componentMaxPathLengths);
const criticalComponentIndex = componentMaxPathLengths.indexOf(overallMaxPathLength);
const criticalComponentNodes = connectedComponents[criticalComponentIndex];

// --- Early Exit Condition: Multiple Critical Components ---
// If there's more than one component sharing the same overall maximum path length,
// it's impossible to reduce it by removing a single edge from one component.
const hasAnotherCriticalComponent = componentMaxPathLengths
    .slice(criticalComponentIndex + 1)
    .includes(overallMaxPathLength);

if (hasAnotherCriticalComponent) {
    console.log(-1);
    process.exit(0); // Exit early as no single edge removal can solve this
}

// --- Main Search for Critical Edge ---
// Iterate through all original edges to find one whose removal reduces the
// longest path in the critical component.
let edgeFoundToBreakLongestPath = false;
let criticalEdgeIdentifier = -1; // Stores the 1-indexed identifier of the edge

for (let currentEdgeIndex = 0; currentEdgeIndex < numEdges; currentEdgeIndex++) {
    const currentEdge = allEdges[currentEdgeIndex];
    const [edgeSource, edgeTarget] = currentEdge;

    // Optimization: Only consider edges that originate from a node within the critical component.
    // An edge *not* originating from the critical component cannot affect its path length directly.
    if (!criticalComponentNodes.includes(edgeSource)) {
        continue;
    }

    // Create a temporary graph with the current edge removed
    const graphWithoutCurrentEdge = removeEdgeFromGraph(adjacencyList, currentEdge);

    // Recalculate the longest path for the critical component in the modified graph
    const resultantPathLength = calculateLongestPathInSubgraph(graphWithoutCurrentEdge, criticalComponentNodes);

    // If removing this edge reduced the longest path in the critical component, we found our answer.
    if (resultantPathLength < overallMaxPathLength) {
        criticalEdgeIdentifier = currentEdgeIndex + 1; // Output 1-indexed edge number
        edgeFoundToBreakLongestPath = true;
        break; // Found the first such edge, no need to check further
    }
}

// --- Final Output ---
if (edgeFoundToBreakLongestPath) {
    console.log(criticalEdgeIdentifier);
} else {
    // If no single edge removal reduced the max path length, output -1.
    console.log(-1);
}