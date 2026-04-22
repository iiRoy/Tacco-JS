/**
 * This script processes network connectivity data from standard input.
 * It identifies critical nodes based on a 'timeToLive' attribute and calculates
 * a minimum spanning tree cost for the relevant network components.
 * The logic involves iteratively pruning nodes and then building/updating an MST.
 */

// Import necessary modules using modern syntax and aliasing for clarity.
const fileSystemModule = require('fs');
const { Buffer: DataBuffer } = require('buffer');

// Helper function to parse strings to integers with radix 10.
const parseInteger = (inputString) => parseInt(inputString, 10);

// Synchronously read all input from standard input (stdin).
// First, determine the total byte size of the input stream.
const totalDataLength = fileSystemModule.fstatSync(process.stdin.fd).size;
// Allocate a buffer to store the raw input data.
const readBuffer = DataBuffer.alloc(totalDataLength);
// Read the entire content from stdin into the allocated buffer.
const bytesProcessed = fileSystemModule.readSync(process.stdin.fd, readBuffer, 0, totalDataLength, 0);
// Convert the buffer's content to a UTF-8 string and split it into an array of lines.
let rawInputLines = readBuffer.toString('utf8', 0, bytesProcessed).split('\n');

// Initiate the primary execution flow of the application.
processNetworkData();

/**
 * Creates and initializes a two-dimensional array (grid) with a specified default value.
 * This function serves as an alternative to manual nested loops for grid instantiation.
 * @param {number} numRows - The desired number of rows for the grid.
 * @param {number} numCols - The desired number of columns for the grid.
 * @param {*} initialValue - The value to assign to every cell in the grid.
 * @returns {Array<Array<*>>} A newly created 2D array.
 */
function createGrid(numRows, numCols, initialValue) {
  return Array.from({ length: numRows }, () => Array(numCols).fill(initialValue));
}

/**
 * Implements a Disjoint Set Union (DSU) data structure, often referred to as Union-Find.
 * This structure efficiently manages partitions of a set into disjoint subsets.
 * It supports operations to find the representative of an element's set and to merge two sets.
 * Uses path compression and union by size for optimized performance.
 * @param {number} elementCount - The total number of elements that will be managed by the DSU.
 * @returns {{uniteSets: function(number, number): boolean, findRepresentative: function(number): number, countActiveComponents: function(Array<boolean>): number}}
 *          An object exposing the DSU's core functionalities.
 */
function DisjointSetUnion(elementCount) {
  // 'parentArray' stores the parent of each element. If parentArray[i] is negative,
  // element 'i' is a root, and its absolute value represents the size of the set it roots.
  const parentArray = new Array(elementCount).fill(-1); // Initially, each element is its own set of size 1.

  /**
   * Discovers the representative (root) element of the set containing 'elementIndex'.
   * Applies path compression by making every visited node point directly to the root.
   * @param {number} elementIndex - The index of the element whose representative is sought.
   * @returns {number} The index of the representative element for the given 'elementIndex'.
   */
  const findRepresentative = (elementIndex) => {
    // If 'elementIndex' is a root (indicated by a negative parent value), return itself.
    if (parentArray[elementIndex] < 0) {
      return elementIndex;
    }
    // Otherwise, recursively find the root and compress the path.
    parentArray[elementIndex] = findRepresentative(parentArray[elementIndex]);
    return parentArray[elementIndex];
  };

  /**
   * Merges the sets containing 'firstElementIdx' and 'secondElementIdx'.
   * Uses the union by size heuristic: the smaller tree is attached under the root of the larger tree.
   * @param {number} firstElementIdx - The index of the first element.
   * @param {number} secondElementIdx - The index of the second element.
   * @returns {boolean} True if the two elements were in different sets and a union occurred, false otherwise.
   */
  const uniteSets = (firstElementIdx, secondElementIdx) => {
    let rootOfFirst = findRepresentative(firstElementIdx);
    let rootOfSecond = findRepresentative(secondElementIdx);

    // If both elements already belong to the same set, no union operation is needed.
    if (rootOfFirst === rootOfSecond) {
      return false;
    }

    // Apply union by size: attach the root of the smaller set to the root of the larger set.
    // The parent array stores negative values for roots, representing their set's size.
    if (parentArray[rootOfFirst] < parentArray[rootOfSecond]) { // rootOfFirst's set is larger (more negative value)
      parentArray[rootOfFirst] += parentArray[rootOfSecond]; // Update size of the new combined set.
      parentArray[rootOfSecond] = rootOfFirst; // Make rootOfFirst the parent of rootOfSecond.
    } else { // rootOfSecond's set is larger or equal in size.
      parentArray[rootOfSecond] += parentArray[rootOfFirst]; // Update size.
      parentArray[rootOfFirst] = rootOfSecond; // Make rootOfSecond the parent of rootOfFirst.
    }
    return true; // A successful merge was performed.
  };

  /**
   * Counts the number of distinct, active components (disjoint sets) within the DSU.
   * Only considers elements marked as 'true' in the provided 'activeNodesFlags' array.
   * @param {Array<boolean>} activeNodesFlags - A boolean array where true indicates an active element.
   * @returns {number} The total count of active, distinct components.
   */
  const countActiveComponents = (activeNodesFlags) => {
    let distinctComponentCount = 0;
    for (let nodeIndex = 0; nodeIndex < elementCount; nodeIndex++) {
      // An element contributes to the count if it's active AND it's a root of its set.
      if (activeNodesFlags[nodeIndex] && parentArray[nodeIndex] < 0) {
        distinctComponentCount++;
      }
    }
    return distinctComponentCount;
  };

  return {
    uniteSets,
    findRepresentative,
    countActiveComponents
  };
}

/**
 * Orchestrates the main logic for processing network data.
 * It handles multiple test cases, each involving node and edge data.
 * The core problem involves finding a minimum spanning tree under specific conditions
 * related to node 'timeToLive' values.
 */
function processNetworkData() {
  // A large number representing an unreachable path in the adjacency matrix.
  const NO_PATH_VALUE = Number.MAX_SAFE_INTEGER;

  // Process test cases until a termination condition (N=0, M=0) is met.
  while (true) {
    const currentLineParts = rawInputLines.shift().split(' ').map(parseInteger);
    let nodeCount = currentLineParts[0];
    let edgeCount = currentLineParts[1];

    // Check for the termination signal (0 0 for nodeCount and edgeCount).
    if (nodeCount === 0 && edgeCount === 0) {
      break;
    }

    // Initialize an array to store information about each node.
    // Each entry is an object containing the node's original identifier and its 'timeToLive'.
    const nodeDataList = [];
    // A boolean array to dynamically track which nodes are considered 'active' or 'used'
    // for connectivity calculations at different stages.
    const activeNodesFlags = new Array(nodeCount).fill(true); // Initially, all nodes are active.

    // Populate the 'nodeDataList' by reading 'timeToLive' values for each node.
    for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
      nodeDataList.push({
        identifier: nodeIdx, // Store the original 0-indexed identifier of the node.
        timeToLive: parseInteger(rawInputLines.shift()) // The 'days' attribute, renamed.
      });
    }

    // Initialize an adjacency matrix to represent the graph.
    // All paths are initially considered non-existent (NO_PATH_VALUE).
    const adjacencyMatrix = createGrid(nodeCount, nodeCount, NO_PATH_VALUE);
    // Set the cost of a node connecting to itself to 0.
    for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
      adjacencyMatrix[nodeIdx][nodeIdx] = 0;
    }

    // Read all edge data and populate both the 'allEdges' list and the 'adjacencyMatrix'.
    const allEdges = [];
    for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
      const edgeParts = rawInputLines.shift().split(' ').map(parseInteger);
      const fromNode = edgeParts[0] - 1; // Adjust to 0-indexed node identifiers.
      const toNode = edgeParts[1] - 1;   // Adjust to 0-indexed node identifiers.
      const edgeWeight = edgeParts[2];

      // Store edge as an object for better readability and extensibility.
      allEdges.push({ from: fromNode, to: toNode, weight: edgeWeight });
      // Update the adjacency matrix for an undirected graph.
      adjacencyMatrix[fromNode][toNode] = adjacencyMatrix[toNode][fromNode] = edgeWeight;
    }

    // Sort the 'nodeDataList' based on 'timeToLive' in ascending order.
    // This ordering is crucial for the subsequent node deactivation process.
    nodeDataList.sort((nodeA, nodeB) => nodeA.timeToLive - nodeB.timeToLive);

    // --- Initial Connectivity Check ---
    // Create a DSU instance to check if the graph is connected with all nodes active.
    let dsuInstance = DisjointSetUnion(nodeCount);
    for (let nodeAIdx = 0; nodeAIdx < nodeCount; nodeAIdx++) {
      for (let nodeBIdx = 0; nodeBIdx < nodeCount; nodeBIdx++) {
        // If an edge exists between two distinct nodes, unite their sets.
        if (nodeAIdx !== nodeBIdx && adjacencyMatrix[nodeAIdx][nodeBIdx] !== NO_PATH_VALUE) {
          dsuInstance.uniteSets(nodeAIdx, nodeBIdx);
        }
      }
    }

    // If the graph is not fully connected from the start,
    // a spanning tree cannot be formed across all nodes, so the cost is 0.
    if (dsuInstance.countActiveComponents(activeNodesFlags) > 1) {
      console.log(0);
      continue; // Move to the next test case.
    }

    // --- Phase 1: Determine the Critical 'timeToLive' Threshold ---
    // This phase identifies the highest 'timeToLive' value such that removing all
    // nodes with 'timeToLive' greater than this value breaks the connectivity
    // among the remaining nodes.
    let criticalNodeIndex = 0; // Stores the index in `nodeDataList` of the critical node.
    for (let currentSortedNodeIdx = 0; currentSortedNodeIdx < nodeCount; currentSortedNodeIdx++) {
      // Mark the current node (by its original identifier) as inactive.
      activeNodesFlags[nodeDataList[currentSortedNodeIdx].identifier] = false;

      // Group and deactivate all subsequent nodes that have the same 'timeToLive' value.
      // This ensures that nodes with identical thresholds are treated as a single unit.
      while (currentSortedNodeIdx < nodeCount - 1 &&
             nodeDataList[currentSortedNodeIdx].timeToLive === nodeDataList[currentSortedNodeIdx + 1].timeToLive) {
        currentSortedNodeIdx++;
        activeNodesFlags[nodeDataList[currentSortedNodeIdx].identifier] = false;
      }

      // Re-initialize DSU to check connectivity solely among the currently active nodes.
      dsuInstance = DisjointSetUnion(nodeCount);
      for (let nodeAIdx = 0; nodeAIdx < nodeCount; nodeAIdx++) {
        for (let nodeBIdx = 0; nodeBIdx < nodeCount; nodeBIdx++) {
          // Only consider edges between two nodes that are currently active.
          if (activeNodesFlags[nodeAIdx] && activeNodesFlags[nodeBIdx] &&
              nodeAIdx !== nodeBIdx && adjacencyMatrix[nodeAIdx][nodeBIdx] !== NO_PATH_VALUE) {
            dsuInstance.uniteSets(nodeAIdx, nodeBIdx);
          }
        }
      }

      // If deactivating the current group of nodes breaks connectivity (more than one component),
      // then this group represents the critical threshold.
      if (dsuInstance.countActiveComponents(activeNodesFlags) > 1) {
        // Re-activate the nodes that just broke connectivity.
        activeNodesFlags[nodeDataList[currentSortedNodeIdx].identifier] = true;
        // Also re-activate any previous nodes that were part of the same 'timeToLive' group.
        while (currentSortedNodeIdx > 0 &&
               nodeDataList[currentSortedNodeIdx].timeToLive === nodeDataList[currentSortedNodeIdx - 1].timeToLive) {
          currentSortedNodeIdx--;
          activeNodesFlags[nodeDataList[currentSortedNodeIdx].identifier] = true;
        }
        criticalNodeIndex = currentSortedNodeIdx; // Store the index of the first node in this critical group.
        break; // Exit the loop, the threshold has been identified.
      }
    }

    // --- Phase 2: Calculate Minimum Spanning Tree (MST) cost for the initially active set ---
    let minimumCost = 0; // Variable to accumulate the MST cost.
    // Re-initialize DSU for the Kruskal's algorithm application.
    dsuInstance = DisjointSetUnion(nodeCount);

    // Sort all available edges by their weight in ascending order.
    // This is a prerequisite for Kruskal's algorithm.
    allEdges.sort((edge1, edge2) => edge1.weight - edge2.weight);

    // Apply Kruskal's algorithm to find the MST among the currently active nodes.
    for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
      const currentEdge = allEdges[edgeIdx];
      // Only consider edges where both connected nodes are currently active.
      if (activeNodesFlags[currentEdge.from] && activeNodesFlags[currentEdge.to]) {
        // If adding this edge does not form a cycle (i.e., nodes are in different sets),
        // unite their sets and add the edge's weight to the total MST cost.
        if (dsuInstance.uniteSets(currentEdge.from, currentEdge.to)) {
          minimumCost += currentEdge.weight;
        }
      }
    }

    // --- Phase 3: Incrementally add back nodes with lower 'timeToLive' ---
    // Starting from the critical threshold and moving towards nodes with lower 'timeToLive',
    // re-activate nodes and update the MST cost by adding necessary edges.
    // The DSU state from the previous Kruskal's run is preserved here.
    for (let k = criticalNodeIndex - 1; k >= 0; k--) {
      const nodesToActivateInBatch = []; // Temporary array to group nodes with same 'timeToLive'.
      // Add the current node to the batch and mark it as active.
      nodesToActivateInBatch.push(nodeDataList[k].identifier);
      activeNodesFlags[nodeDataList[k].identifier] = true;

      // Continue grouping and activating nodes that share the same 'timeToLive' value.
      while (k > 0 && nodeDataList[k].timeToLive === nodeDataList[k - 1].timeToLive) {
        k--;
        nodesToActivateInBatch.push(nodeDataList[k].identifier);
        activeNodesFlags[nodeDataList[k].identifier] = true;
      }

      // Re-evaluate all edges for the updated set of active nodes.
      // This step effectively updates the MST by connecting newly active nodes
      // to existing components with the cheapest possible edges.
      // The `dsuInstance` carries the current connectivity state.
      for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
        const currentEdge = allEdges[edgeIdx];
        if (activeNodesFlags[currentEdge.from] && activeNodesFlags[currentEdge.to]) {
          // If uniting the sets of the edge's nodes causes a change (they were separate),
          // it means this edge is part of the updated MST.
          if (dsuInstance.uniteSets(currentEdge.from, currentEdge.to)) {
            minimumCost += currentEdge.weight;
          }
        }
      }
    }

    // Output the final calculated minimum spanning tree cost for the current test case.
    console.log(minimumCost);
  }
}