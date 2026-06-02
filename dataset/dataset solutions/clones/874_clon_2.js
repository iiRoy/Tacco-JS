const fileSystem = require('fs'); // Import the Node.js file system module

// Determine the size of the standard input stream
const fileSize = fileSystem.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the entire standard input content
const dataBuffer = Buffer.alloc(fileSize);

// Read the standard input into the buffer
const readBytesCount = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);

// Convert the buffer content to a UTF-8 string and split it into an array of lines
const inputLines = dataBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Initiate the primary data processing routine
processInputData();

/**
 * Implements a Disjoint Set Union (DSU) data structure, also known as Union-Find.
 * This structure efficiently tracks a partitioning of a set into disjoint subsets.
 *
 * @param {number} elementCount - The total number of elements (nodes) in the set.
 * @returns {object} An object providing methods for DSU operations.
 */
function DisjointSet(elementCount) {
  let currentIdx; // Loop counter for internal use
  const parentArray = []; // Stores the parent of each element; negative value indicates a root and its set size.

  // Initialize each element as its own set. A negative value (-1) signifies a root
  // and implicitly a set of size 1.
  for (currentIdx = 0; currentIdx < elementCount; currentIdx++) {
    parentArray[currentIdx] = -1;
  }

  /**
   * Merges the sets containing two specified elements, `valA` and `valB`.
   * This operation uses the "union by size" heuristic to maintain a balanced tree structure.
   *
   * @param {number} valA - The first element.
   * @param {number} valB - The second element.
   * @returns {boolean} True if the two elements were in different sets and a merge occurred, false otherwise.
   */
  function uniteSets(valA, valB) {
    let rootA = findRoot(valA); // Find the representative (root) of `valA`'s set
    let rootB = findRoot(valB); // Find the representative (root) of `valB`'s set

    if (rootA !== rootB) { // If `valA` and `valB` are in different sets
      // Attach the smaller tree under the root of the larger tree.
      // `parentArray[root]` stores the negative of the set's size.
      if (parentArray[rootA] < parentArray[rootB]) { // `rootA`'s set is larger (more negative size)
        parentArray[rootA] += parentArray[rootB]; // Update the size of the new combined set
        parentArray[rootB] = rootA; // Make `rootA` the parent of `rootB`
      } else { // `rootB`'s set is larger or equal
        parentArray[rootB] += parentArray[rootA]; // Update the size of the new combined set
        parentArray[rootA] = rootB; // Make `rootB` the parent of `rootA`
      }
    }
    return rootA !== rootB; // Return true if a merge happened
  }

  /**
   * Finds the representative (root) of the set that contains the given element `val`.
   * This method employs path compression for optimization, flattening the tree structure
   * during each `find` operation.
   *
   * @param {number} val - The element for which to find the root.
   * @returns {number} The root element of the set containing `val`.
   */
  function findRoot(val) {
    // If `val` is a root (its parent value is negative), return `val`.
    // Otherwise, recursively find the root of its parent and perform path compression
    // by setting `val`'s parent directly to the found root.
    return parentArray[val] < 0 ? val : (parentArray[val] = findRoot(parentArray[val]));
  }

  /**
   * Counts the number of distinct connected components among the elements that are marked as active.
   *
   * @param {boolean[]} activeElements - A boolean array where `activeElements[i]` is true if element `i` is active.
   * @returns {number} The total count of distinct components formed by active elements.
   */
  function countComponents(activeElements) {
    let componentCounter = 0; // Initialize the counter for distinct components
    for (currentIdx = 0; currentIdx < elementCount; currentIdx++) {
      // If the current element is active AND it is a root of its set (parentArray[currentIdx] is negative)
      if (activeElements[currentIdx] && parentArray[currentIdx] < 0) {
        componentCounter++; // Increment the component count
      }
    }
    return componentCounter;
  }

  /**
   * Checks if two elements, `valA` and `valB`, belong to the same disjoint set.
   *
   * @param {number} valA - The first element.
   * @param {number} valB - The second element.
   * @returns {boolean} True if `valA` and `valB` are in the same set, false otherwise.
   */
  function areConnected(valA, valB) {
    return findRoot(valA) === findRoot(valB);
  }

  // Expose the DSU operations as a public interface
  return {
    unite: uniteSets,
    find: findRoot,
    getComponentCount: countComponents,
    areInSameSet: areConnected
  };
}

/**
 * The main function responsible for reading problem inputs, applying the algorithm,
 * and producing the required output. It processes multiple test cases until a
 * termination condition is met.
 */
function processInputData() {
  let lineParts; // Temporary array to store parts of a split input line
  let nodeCount; // Represents 'n', the number of nodes in the current graph
  let edgeCount; // Represents 'm', the number of edges in the current graph
  let loopIdxA, loopIdxB; // General-purpose loop indices

  let nodeDataArray; // Stores objects with node identifier and activation days
  let graphEdges; // Stores graph edges as [source, destination, weight]
  let currentEdge; // Holds the current edge being processed

  let disjointSetInstance; // An instance of the DisjointSet data structure
  let totalWeightResult; // Accumulates the total weight of the minimum spanning forest
  let isNodeActiveStatus; // A boolean array indicating if a node is currently considered active

  // Loop indefinitely to process multiple test cases
  while (true) {
    lineParts = inputLines.shift().split(' '); // Read the first line of the test case (nodeCount, edgeCount)
    nodeCount = Number(lineParts[0]); // Parse the number of nodes
    edgeCount = Number(lineParts[1]); // Parse the number of edges

    // Termination condition: if both nodeCount and edgeCount are zero, exit the loop
    if (nodeCount === 0 && edgeCount === 0) {
      break;
    }

    nodeDataArray = []; // Initialize array to store node-specific data
    isNodeActiveStatus = []; // Initialize array to track active nodes

    // Read activation days for each node and store them along with their original indices
    for (loopIdxA = 0; loopIdxA < nodeCount; loopIdxA++) {
      nodeDataArray[loopIdxA] = {
        nodeIdentifier: loopIdxA, // The original 0-indexed identifier of the node
        activationDays: Number(inputLines.shift()) // The number of days until this node becomes active
      };
      isNodeActiveStatus[loopIdxA] = false; // Initially, no nodes are active
    }

    graphEdges = []; // Initialize array to store all graph edges

    // Read all graph edges
    for (loopIdxA = 0; loopIdxA < edgeCount; loopIdxA++) {
      lineParts = inputLines.shift().split(' '); // Read edge details (source, destination, weight)
      graphEdges[loopIdxA] = [
        Number(lineParts[0]) - 1, // Source node (convert to 0-indexed)
        Number(lineParts[1]) - 1, // Destination node (convert to 0-indexed)
        Number(lineParts[2]) // Edge weight
      ];
    }

    // Sort nodes based on their activation days in ascending order.
    // This allows processing nodes from earliest activation to latest, or vice-versa.
    nodeDataArray.sort(function (nodeA, nodeB) {
      return nodeA.activationDays - nodeB.activationDays;
    });

    // Sort edges based on their weights in ascending order.
    // This is a crucial step for Kruskal's algorithm to find a Minimum Spanning Tree/Forest.
    graphEdges.sort(function (edgeOne, edgeTwo) {
      return edgeOne[2] - edgeTwo[2];
    });

    disjointSetInstance = DisjointSet(nodeCount); // Create a new DSU instance for the current graph
    totalWeightResult = 0; // Reset the total weight for the current test case

    // Iterate through the sorted nodes in reverse order of activation days.
    // This simulates adding nodes to the graph as they become active, starting from the latest activation day.
    for (loopIdxA = nodeCount - 1; loopIdxA >= 0; loopIdxA--) {
      // Mark the current node as active
      isNodeActiveStatus[nodeDataArray[loopIdxA].nodeIdentifier] = true;

      // If there are other nodes with the exact same activation day, mark them all active together.
      // This ensures all nodes that become active on the same day are processed simultaneously.
      while (loopIdxA > 0 && nodeDataArray[loopIdxA].activationDays === nodeDataArray[loopIdxA - 1].activationDays) {
        loopIdxA--; // Move to the previous node (which has the same activation day)
        isNodeActiveStatus[nodeDataArray[loopIdxA].nodeIdentifier] = true; // Mark it active
      }

      // After activating a set of nodes (those with the same activation day),
      // iterate through all sorted edges and add them to the MST if both their endpoints are active.
      for (loopIdxB = 0; loopIdxB < edgeCount; loopIdxB++) {
        currentEdge = graphEdges[loopIdxB]; // Get the current edge
        const sourceNode = currentEdge[0];
        const destNode = currentEdge[1];
        const edgeWeight = currentEdge[2];

        // If both the source and destination nodes of the edge are currently active
        if (isNodeActiveStatus[sourceNode] && isNodeActiveStatus[destNode]) {
          // If these two nodes are not already connected in the DSU structure
          if (!disjointSetInstance.areInSameSet(sourceNode, destNode)) {
            disjointSetInstance.unite(sourceNode, destNode); // Unite their sets
            totalWeightResult += edgeWeight; // Add the edge's weight to the total
          }
        }
      }

      // After processing all relevant edges for the current set of active nodes,
      // check if all currently active nodes form a single connected component.
      // If they do not (i.e., there's more than one component among active nodes),
      // it implies the graph formed by these active nodes is disconnected.
      // In such a case, the problem's logic dictates resetting the result to 0
      // and re-initializing the DSU for the next iteration. This effectively means
      // that if a graph of active nodes is ever disconnected, the cost for that
      // "day" is 0, and we restart the MST calculation for the next (earlier) day.
      if (disjointSetInstance.getComponentCount(isNodeActiveStatus) > 1) {
        totalWeightResult = 0; // Reset the accumulated weight
        disjointSetInstance = DisjointSet(nodeCount); // Re-initialize the DSU structure
      }
    }

    // Output the final calculated total weight for the current test case.
    // This will be the MST weight for the earliest activation day where all active nodes
    // formed a single component, or 0 if no such day resulted in a connected graph.
    console.log(totalWeightResult);
  }
}
