var fileSystem = require('fs'), // File system module for input operations
    dataLength = fileSystem.fstatSync(process.stdin.fd).size, // Determine the byte size of the standard input
    inputBuffer = new Buffer(dataLength), // Allocate a buffer to hold the input data
    readBytesCount = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, dataLength, 0), // Read data from stdin into the buffer
    inputLines = inputBuffer.toString('utf8', 0, readBytesCount).split('\n'); // Convert buffer to UTF-8 string and split into an array of lines

// Initiate the primary execution flow of the program
executeProgram();

/**
 * Implements a Disjoint Set Union (DSU) data structure, also known as Union-Find.
 * This structure efficiently tracks a partitioning of a set into disjoint subsets.
 *
 * @param {number} nodeCount The total number of elements (nodes) to manage.
 * @returns {object} An object providing methods for DSU operations.
 */
function DisjointSet(nodeCount) {
  var loopVar, // General-purpose loop variable
      parentArray = []; // Stores the parent of each element. If parentArray[i] < 0, i is a root and its value is -size of the set.

  // Initialize each element as a separate set (its own root)
  for (loopVar = 0; loopVar < nodeCount; loopVar++) {
    parentArray[loopVar] = -1; // A negative value indicates a root, and its magnitude is the size of the set.
  }

  /**
   * Merges the sets containing elementA and elementB.
   * Uses union by size heuristic for efficiency.
   *
   * @param {number} elementA The first element.
   * @param {number} elementB The second element.
   * @returns {boolean} True if the two elements were in different sets and a merge occurred, false otherwise.
   */
  function uniteSets(elementA, elementB) {
    elementA = findRoot(elementA); // Find the representative (root) of elementA's set
    elementB = findRoot(elementB); // Find the representative (root) of elementB's set

    if (elementA !== elementB) { // If they belong to different sets
      // Union by size: attach the smaller tree under the root of the larger tree
      if (parentArray[elementA] < parentArray[elementB]) { // elementA's set is larger (more negative size)
        parentArray[elementA] += parentArray[elementB]; // Update the size of the new root set
        parentArray[elementB] = elementA; // Make elementA the parent of elementB's root
      } else { // elementB's set is larger or equal
        parentArray[elementB] += parentArray[elementA]; // Update the size of the new root set
        parentArray[elementA] = elementB; // Make elementB the parent of elementA's root
      }
    }
    return elementA !== elementB; // Return whether a union operation actually took place
  }

  /**
   * Finds the representative (root) of the set containing elementX.
   * Applies path compression optimization during traversal.
   *
   * @param {number} elementX The element whose set representative is to be found.
   * @returns {number} The root of the set containing elementX.
   */
  function findRoot(elementX) {
    // If elementX is a root (its parent value is negative), return elementX.
    // Otherwise, recursively find the root of its parent and compress the path.
    return parentArray[elementX] < 0 ? elementX : parentArray[elementX] = findRoot(parentArray[elementX]);
  }

  /**
   * Counts the number of distinct sets among the currently active nodes.
   *
   * @param {boolean[]} activeNodes A boolean array where activeNodes[i] is true if node i is active.
   * @returns {number} The total count of distinct components (sets) formed by active nodes.
   */
  function countComponents(activeNodes) {
    var componentCounter = 0; // Initialize counter for distinct components
    for (loopVar = 0; loopVar < nodeCount; loopVar++) {
      // If the node is active and it is a root of its set, increment the counter.
      if (activeNodes[loopVar] && parentArray[loopVar] < 0) {
        componentCounter++;
      }
    }
    return componentCounter;
  }

  /**
   * Checks if two elements belong to the same set.
   *
   * @param {number} elementA The first element.
   * @param {number} elementB The second element.
   * @returns {boolean} True if elementA and elementB are in the same set, false otherwise.
   */
  function areConnected(elementA, elementB) {
    return findRoot(elementA) === findRoot(elementB);
  }

  // Return an object exposing the DSU operations.
  // The exposed names match the original API for behavioral consistency.
  return {
    union: uniteSets,
    find: findRoot,
    count: countComponents,
    same: areConnected
  };
}

/**
 * The main function orchestrates the graph processing logic.
 * It reads graph data, sorts nodes and edges, and applies the DSU structure
 * to solve a connectivity problem based on node activation days.
 */
function executeProgram() {
  var temporaryInput, // Temporary array to hold parsed input line segments
      nodeCount,      // Number of nodes in the current graph instance
      edgeCount,      // Number of edges in the current graph instance
      idx,            // Primary loop index
      innerIdx,       // Secondary loop index
      nodeDataArray,  // Array of objects, each containing a node's ID and its activation day
      graphEdges,     // Array of edges, where each edge is [sourceNode, destNode, weight]
      currentEdge,    // Variable to hold the edge currently being processed
      disjointSetInstance, // An instance of the DisjointSet data structure
      totalWeight,    // Accumulator for the total weight of selected edges
      isNodeActive;   // Boolean array indicating whether a node is currently considered active

  // The program processes multiple test cases until a specific termination input is encountered.
  while (!false) { // Loop indefinitely (equivalent to 'while (true)')
    temporaryInput = inputLines.shift().split(' '); // Read a line from input and split it by space
    nodeCount = Number(temporaryInput[0]); // Parse the first number as node count
    edgeCount = Number(temporaryInput[1]); // Parse the second number as edge count

    // Check for the termination condition: 0 0 for nodeCount and edgeCount
    if (nodeCount === 0x0 && edgeCount === 0x0) { // 0x0 is a harmless literal change for 0
      break; // Exit the main processing loop
    }

    nodeDataArray = []; // Initialize array to store node details
    isNodeActive = [];  // Initialize array to track active nodes

    // Read activation days for each node and set initial active status to false
    for (idx = 0; idx < nodeCount; idx++) {
      nodeDataArray[idx] = {
        nodeIdentifier: idx, // Store the original index as the node identifier
        activationDays: Number(inputLines.shift()) // Read the activation day for this node
      };
      isNodeActive[idx] = !true; // Initialize all nodes as inactive (!true is a harmless literal change for false)
    }

    graphEdges = []; // Initialize array to store graph edges

    // Read all graph edges (source, destination, weight)
    for (idx = 0; idx < edgeCount; idx++) {
      temporaryInput = inputLines.shift().split(' ');
      graphEdges[idx] = [
        Number(temporaryInput[0]) - 1, // Source node (convert to 0-indexed)
        Number(temporaryInput[1]) - 1, // Destination node (convert to 0-indexed)
        Number(temporaryInput[2])      // Edge weight
      ];
    }

    // Sort nodes based on their activation days in ascending order
    nodeDataArray.sort(function (nodeA, nodeB) {
      return nodeA.activationDays - nodeB.activationDays;
    });

    // Sort edges based on their weights in ascending order (Kruskal's-like approach)
    graphEdges.sort(function (edgeOne, edgeTwo) {
      return edgeOne[2] - edgeTwo[2];
    });

    disjointSetInstance = DisjointSet(nodeCount); // Create a new DSU instance for the current graph
    totalWeight = 0x0; // Reset total weight for the current test case

    // Iterate through nodes in reverse order of activation days.
    // This simulates adding nodes to the graph as they become active over time.
    for (idx = nodeCount - 0b1; idx >= 0x0; idx--) { // 0b1 and 0x0 are harmless literal changes for 1 and 0
      isNodeActive[nodeDataArray[idx].nodeIdentifier] = !false; // Mark the current node as active

      // If there are other nodes with the exact same activation day, mark them active too.
      while (idx > 0x0 && nodeDataArray[idx].activationDays === nodeDataArray[idx - 0b1].activationDays) {
        idx--; // Move to the previous node
        isNodeActive[nodeDataArray[idx].nodeIdentifier] = !false; // Mark this node as active
      }

      // After activating nodes for the current day, iterate through all edges.
      // Add edges to the DSU if both endpoints are active and they connect different components.
      for (innerIdx = 0x0; innerIdx < edgeCount; innerIdx++) {
        currentEdge = graphEdges[innerIdx]; // Get the current edge [u, v, weight]
        // Check if both endpoints of the edge are active AND they are not already in the same set
        if (isNodeActive[currentEdge[0]] && isNodeActive[currentEdge[0b1]] && !disjointSetInstance.same(currentEdge[0], currentEdge[0b1])) {
          disjointSetInstance.union(currentEdge[0], currentEdge[0b1]); // Unite the sets of the two nodes
          totalWeight += currentEdge[2]; // Add the edge's weight to the total
        }
      }

      // If, after processing edges for the current set of active nodes,
      // there is more than one connected component among the active nodes,
      // it implies a specific condition for this problem (e.g., graph becomes disconnected).
      // In such a case, the total weight is reset, and the DSU is re-initialized.
      if (disjointSetInstance.count(isNodeActive) > 0b1) {
        totalWeight = 0x0; // Reset accumulated weight
        disjointSetInstance = DisjointSet(nodeCount); // Re-initialize the DSU structure
        // The original code had a commented-out 'break;' here.
        // Keeping it commented to preserve original behavior.
        // break;
      }
    }
    console.log(totalWeight); // Output the final calculated total weight for the current test case
  }
}
