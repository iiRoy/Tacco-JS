let fileSystemModule = require('fs');

// Determine the size of the standard input stream
let dataLength = fileSystemModule.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data
let inputBuffer = new Buffer(dataLength);

// Read data from standard input into the buffer
let readBytesCount = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, dataLength, 0);

// Convert buffer to string, then split into lines
let rawInputLines = inputBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Start the main processing function
processGraphData();

/**
 * Implements a Disjoint Set Union (DSU) data structure.
 * @param {number} nodeCount - The total number of elements/nodes.
 * @returns {object} An object with DSU operations.
 */
function DisjointSet(nodeCount) {
  let loopVar;
  // parentArray stores the parent of each element, or a negative value if it's a root
  // The absolute value of a negative root indicates the size of the set.
  let parentArray = [];

  // Initialize each element as its own root (set size -1)
  for (loopVar = 0; loopVar < nodeCount; loopVar++) {
    parentArray[loopVar] = -1;
  }

  /**
   * Unites two sets containing nodeX and nodeY.
   * Uses union by size/rank heuristic.
   * @param {number} nodeX - The first element.
   * @param {number} nodeY - The second element.
   * @returns {boolean} True if the sets were different and merged, false otherwise.
   */
  function uniteSets(nodeX, nodeY) {
    nodeX = findRoot(nodeX); // Find the root of nodeX's set
    nodeY = findRoot(nodeY); // Find the root of nodeY's set

    if (nodeX !== nodeY) { // If they are in different sets
      // Attach the smaller tree under the root of the larger tree
      if (parentArray[nodeX] < parentArray[nodeY]) { // nodeX's tree is larger (more negative size)
        parentArray[nodeX] += parentArray[nodeY]; // Update size of new root
        parentArray[nodeY] = nodeX; // Make nodeX the parent of nodeY
      } else { // nodeY's tree is larger or equal
        parentArray[nodeY] += parentArray[nodeX]; // Update size of new root
        parentArray[nodeX] = nodeY; // Make nodeY the parent of nodeX
      }
    }
    return nodeX !== nodeY; // Return true if a merge occurred
  }

  /**
   * Finds the representative (root) of the set containing the given element.
   * Uses path compression optimization.
   * @param {number} nodeIdentifier - The element to find the root for.
   * @returns {number} The root of the element's set.
   */
  function findRoot(nodeIdentifier) {
    // If nodeIdentifier is a root (negative parent value), return itself
    // Otherwise, recursively find the root and perform path compression
    return parentArray[nodeIdentifier] < 0 ? nodeIdentifier : parentArray[nodeIdentifier] = findRoot(parentArray[nodeIdentifier]);
  }

  /**
   * Counts the number of distinct components (sets) among the active nodes.
   * @param {boolean[]} activeNodes - An array indicating which nodes are currently active.
   * @returns {number} The count of distinct components.
   */
  function countComponents(activeNodes) {
    let componentCounter = 0;
    for (loopVar = 0; loopVar < nodeCount; loopVar++) {
      // If a node is active and is a root (parentArray[loopVar] < 0), it represents a component
      if (activeNodes[loopVar] && parentArray[loopVar] < 0) {
        componentCounter++;
      }
    }
    return componentCounter;
  }

  /**
   * Checks if two elements belong to the same set.
   * @param {number} nodeA - The first element.
   * @param {number} nodeB - The second element.
   * @returns {boolean} True if they are in the same set, false otherwise.
   */
  function areConnected(nodeA, nodeB) {
    return findRoot(nodeA) === findRoot(nodeB);
  }

  // Public API for the DisjointSet structure
  return {
    unite: uniteSets,
    findRepresentative: findRoot,
    getComponentCount: countComponents,
    areInSameSet: areConnected
  };
}

/**
 * Main function to process graph data from standard input.
 * Reads graph configurations (nodes, edges) and performs calculations.
 */
function processGraphData() {
  let lineParts, nodeCount, edgeCount;
  let loopIndex, edgeIndex, unusedVar; // unusedVar corresponds to 'k' in original
  let nodeDetails;
  let graphEdges, currentEdge;
  let disjointSetInstance;
  let totalWeight;
  let nodeInUse;

  // Loop indefinitely until a termination condition is met
  while (true) {
    // Read the first line for node and edge counts
    lineParts = rawInputLines.shift().split(' ');
    nodeCount = +lineParts[0]; // Convert string to number
    edgeCount = +lineParts[1]; // Convert string to number

    // If nodeCount is 0, it's the termination signal
    if (nodeCount === 0) {
      break;
    }

    nodeDetails = []; // Array to store node objects (nodeIdentifier, activityDays)
    nodeInUse = [];   // Boolean array to track which nodes are considered 'in use'

    // Read node details (activity days) for each node
    for (loopIndex = 0; loopIndex < nodeCount; loopIndex++) {
      nodeDetails[loopIndex] = {
        nodeIdentifier: loopIndex,
        activityDays: +rawInputLines.shift() // Convert string to number
      };
      nodeInUse[loopIndex] = false; // Initialize all nodes as not in use
    }

    graphEdges = []; // Array to store graph edges

    // Read edge details (from_node, to_node, weight)
    for (loopIndex = 0; loopIndex < edgeCount; loopIndex++) {
      lineParts = rawInputLines.shift().split(' ');
      // Store edges as [from_node_idx, to_node_idx, weight]
      // Node indices are 0-based, so subtract 1 from input
      graphEdges[loopIndex] = [+lineParts[0] - 1, +lineParts[1] - 1, +lineParts[2] - 0];
    }

    // Sort nodes by their activity days in ascending order
    nodeDetails.sort(function (detailA, detailB) {
      return detailA.activityDays - detailB.activityDays;
    });

    // Sort edges by their weight in ascending order
    graphEdges.sort(function (edgeA, edgeB) {
      return edgeA[2] - edgeB[2];
    });

    // Initialize a new Disjoint Set Union structure for the current graph
    disjointSetInstance = DisjointSet(nodeCount);
    totalWeight = 0; // Initialize total weight for the result

    // The following block is commented out in the original code.
    // It represents a potential Kruskal-like algorithm or a specific graph processing logic.
    // For Type II cloning, its commented status must be preserved.
    //    for (loopIndex = nodeCount - 1; loopIndex >= 0; loopIndex--) {
    //      nodeInUse[nodeDetails[loopIndex].nodeIdentifier] = true;
    //      while (loopIndex > 0 && nodeDetails[loopIndex].activityDays === nodeDetails[loopIndex - 1].activityDays) {
    //        loopIndex--;
    //        nodeInUse[nodeDetails[loopIndex].nodeIdentifier] = true;
    //      }
    //      // Kruskal's algorithm logic (partially implemented/commented)
    //      for (edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    //        currentEdge = graphEdges[edgeIndex];
    //        if (nodeInUse[currentEdge[0]] && nodeInUse[currentEdge[1]] && !disjointSetInstance.areInSameSet(currentEdge[0], currentEdge[1])) {
    //          disjointSetInstance.unite(currentEdge[0], currentEdge[1]);
    //          totalWeight += currentEdge[2];
    //        }
    //      }
    //      if (disjointSetInstance.getComponentCount(nodeInUse) > 1) {
    //        totalWeight = 0;
    //        disjointSetInstance = DisjointSet(nodeCount);
    //      }
    //    }

    // Output the calculated total weight (which is always 0 due to the commented block)
    console.log(totalWeight);
  }
}
