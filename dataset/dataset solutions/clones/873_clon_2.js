/*
 * This file processes graph data from standard input to calculate a minimum spanning tree cost
 * under specific conditions related to node activation periods.
 */

// Required module for file system operations
const fileSystemModule = require('fs');

// Determine the size of the input data from stdin
const inputDataSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data
const dataBuffer = new Buffer(inputDataSize);

// Read the input data from stdin into the buffer
const actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, inputDataSize, 0);

// Convert the buffer to a UTF-8 string and split it into an array of lines
const inputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// Begin the primary execution flow
processMainLogic();

/**
 * Creates a 2D array (matrix) with specified dimensions and initializes all elements.
 * @param {number} rowsCount - The number of rows in the matrix.
 * @param {number} colsCount - The number of columns in the matrix.
 * @param {*} initialValue - The value to initialize each element of the matrix with.
 * @returns {Array<Array<*>>} A new 2D array.
 */
function create2DArray(rowsCount, colsCount, initialValue) {
  const twoDArray = [];
  let rowIndex, colIndex;

  for (rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
    twoDArray[rowIndex] = [];
    for (colIndex = 0; colIndex < colsCount; colIndex++) {
      twoDArray[rowIndex][colIndex] = initialValue;
    }
  }
  return twoDArray;
}

/**
 * Implements a Union-Find (Disjoint Set) data structure.
 * Used for tracking connected components in a graph.
 * @param {number} numElements - The total number of elements (nodes) in the set.
 * @returns {object} An object containing `uniteSets`, `findRoot`, and `countComponents` methods.
 */
function UnionFindStructure(numElements) {
  let loopIdx;
  // parentArray stores the parent of each element, or a negative value if it's a root
  // The absolute value of a negative root indicates the size of the set.
  const parentArray = [];

  // Initialize each element as its own root (parent is -1, indicating a set of size 1)
  for (loopIdx = 0; loopIdx < numElements; loopIdx++) {
    parentArray[loopIdx] = -1;
  }

  /**
   * Unites the sets containing two elements, elementA and elementB.
   * Uses union by size/rank heuristic.
   * @param {number} elementA - The first element.
   * @param {number} elementB - The second element.
   * @returns {boolean} True if the sets were different and merged, false otherwise.
   */
  function uniteSets(elementA, elementB) {
    elementA = findRoot(elementA); // Find the root of elementA's set
    elementB = findRoot(elementB); // Find the root of elementB's set

    if (elementA !== elementB) {
      // If they are in different sets, merge them
      // Attach the smaller tree under the root of the larger tree
      if (parentArray[elementA] < parentArray[elementB]) {
        // elementA's tree is larger (more negative value)
        parentArray[elementA] += parentArray[elementB]; // Update size of new root
        parentArray[elementB] = elementA; // Make elementA the parent of elementB
      } else {
        // elementB's tree is larger or equal
        parentArray[elementB] += parentArray[elementA]; // Update size of new root
        parentArray[elementA] = elementB; // Make elementB the parent of elementA
      }
    }
    return elementA !== elementB; // Return true if a merge occurred
  }

  /**
   * Finds the root of the set containing the given element.
   * Uses path compression for optimization.
   * @param {number} element - The element to find the root for.
   * @returns {number} The root of the element's set.
   */
  function findRoot(element) {
    // If element is a root (parentArray[element] is negative), return element
    // Otherwise, recursively find the root and compress the path
    return parentArray[element] < 0 ? element : parentArray[element] = findRoot(parentArray[element]);
  }

  /**
   * Counts the number of distinct connected components among active nodes.
   * @param {Array<boolean>} activeNodes - A boolean array indicating which nodes are currently active.
   * @returns {number} The count of distinct components among active nodes.
   */
  function countComponents(activeNodes) {
    let componentCounter = 0;
    for (loopIdx = 0; loopIdx < numElements; loopIdx++) {
      // If a node is active and it is a root of its set, increment the counter
      if (activeNodes[loopIdx] && parentArray[loopIdx] < 0) {
        componentCounter++;
      }
    }
    return componentCounter;
  }

  // Expose the public methods of the Union-Find structure
  return {
    uniteSets: uniteSets,
    findRoot: findRoot,
    countComponents: countComponents
  };
}

/**
 * The main logic function that processes graph data.
 * Reads graph configurations, applies a specific algorithm, and prints results.
 */
function processMainLogic() {
  let temporaryInput, nodeCount, edgeCount;
  let outerLoopIdx, innerLoopIdx1, innerLoopIdx2;
  let nodeActivationData; // Stores node information (identifier, activationPeriod)
  let graphMatrix; // Adjacency matrix for graph connections
  let connectionList; // List of all edges
  let currentConnection; // A single edge from the connectionList
  let disjointSetStructure; // Instance of the Union-Find data structure
  let minimumSpanningCost; // The calculated minimum spanning tree cost
  let isNodeActive; // Boolean array indicating if a node is currently considered active

  // Loop indefinitely until a termination condition is met
  while (true) {
    // Read the first line for node and edge counts
    temporaryInput = inputLines.shift().split(' ');
    nodeCount = +temporaryInput[0]; // Number of nodes
    edgeCount = +temporaryInput[1]; // Number of edges

    // Termination condition: if both nodeCount and edgeCount are zero
    if (nodeCount === 0 && edgeCount === 0) {
      break; // Exit the main loop
    }

    nodeActivationData = []; // Initialize array for node data
    isNodeActive = []; // Initialize array for node activation status

    // Read activation periods for each node
    for (outerLoopIdx = 0; outerLoopIdx < nodeCount; outerLoopIdx++) {
      nodeActivationData[outerLoopIdx] = {
        identifier: outerLoopIdx, // Original node index
        activationPeriod: +inputLines.shift() // Activation period (days)
      };
      isNodeActive[outerLoopIdx] = true; // Initially, all nodes are active
    }

    connectionList = []; // Initialize array for edges
    graphMatrix = []; // Initialize adjacency matrix

    // Initialize adjacency matrix with Infinity for no connection, 0 for self-loops
    for (outerLoopIdx = 0; outerLoopIdx < nodeCount; outerLoopIdx++) {
      graphMatrix[outerLoopIdx] = [];
      for (innerLoopIdx1 = 0; innerLoopIdx1 < nodeCount; innerLoopIdx1++) {
        graphMatrix[outerLoopIdx][innerLoopIdx1] = outerLoopIdx === innerLoopIdx1 ? 0 : Infinity;
      }
    }

    // Read edge data and populate connectionList and adjacency matrix
    for (outerLoopIdx = 0; outerLoopIdx < edgeCount; outerLoopIdx++) {
      temporaryInput = inputLines.shift().split(' ');
      // Store edges as [source, destination, weight] (0-indexed)
      connectionList[outerLoopIdx] = [temporaryInput[0] - 1, temporaryInput[1] - 1, temporaryInput[2] - 0];
      // Update adjacency matrix for undirected graph
      graphMatrix[connectionList[outerLoopIdx][0]][connectionList[outerLoopIdx][1]] =
        graphMatrix[connectionList[outerLoopIdx][1]][connectionList[outerLoopIdx][0]] = connectionList[outerLoopIdx][2];
    }

    // Sort node activation data by activation period in ascending order
    nodeActivationData.sort(function (nodeA, nodeB) {
      return nodeA.activationPeriod - nodeB.activationPeriod;
    });

    // Initialize Union-Find structure for all nodes
    disjointSetStructure = UnionFindStructure(nodeCount);

    // Connect all nodes that have direct edges in the initial graph
    for (innerLoopIdx1 = 0; innerLoopIdx1 < nodeCount; innerLoopIdx1++) {
      for (innerLoopIdx2 = 0; innerLoopIdx2 < nodeCount; innerLoopIdx2++) {
        if (innerLoopIdx1 !== innerLoopIdx2 && graphMatrix[innerLoopIdx1][innerLoopIdx2] !== Infinity) {
          disjointSetStructure.uniteSets(innerLoopIdx1, innerLoopIdx2);
        }
      }
    }

    // If the initial graph (with all nodes active) is not connected, output 0
    if (disjointSetStructure.countComponents(isNodeActive) > 1) {
      console.log(0);
      continue; // Skip to the next test case
    }

    // Iterate through nodes sorted by activation period to find the critical point
    for (outerLoopIdx = 0; outerLoopIdx < nodeCount; outerLoopIdx++) {
      // Deactivate the current node
      isNodeActive[nodeActivationData[outerLoopIdx].identifier] = false;

      // Deactivate all subsequent nodes that have the same activation period
      while (outerLoopIdx < nodeCount - 1 &&
             nodeActivationData[outerLoopIdx].activationPeriod === nodeActivationData[outerLoopIdx + 1].activationPeriod) {
        outerLoopIdx++;
        isNodeActive[nodeActivationData[outerLoopIdx].identifier] = false;
      }

      // Re-initialize Union-Find for the current set of active nodes
      disjointSetStructure = UnionFindStructure(nodeCount);
      for (innerLoopIdx1 = 0; innerLoopIdx1 < nodeCount; innerLoopIdx1++) {
        for (innerLoopIdx2 = 0; innerLoopIdx2 < nodeCount; innerLoopIdx2++) {
          // If both nodes are active and connected, unite their sets
          if (isNodeActive[innerLoopIdx2] && isNodeActive[innerLoopIdx1] &&
              innerLoopIdx2 !== innerLoopIdx1 && graphMatrix[innerLoopIdx1][innerLoopIdx2] !== Infinity) {
            disjointSetStructure.uniteSets(innerLoopIdx1, innerLoopIdx2);
          }
        }
      }

      // If deactivating nodes up to this point causes the graph to become disconnected
      if (disjointSetStructure.countComponents(isNodeActive) > 1) {
        // Reactivate the current node and all preceding nodes with the same activation period
        isNodeActive[nodeActivationData[outerLoopIdx].identifier] = true;
        while (outerLoopIdx > 0 &&
               nodeActivationData[outerLoopIdx].activationPeriod === nodeActivationData[outerLoopIdx - 1].activationPeriod) {
          outerLoopIdx--;
          isNodeActive[nodeActivationData[outerLoopIdx].identifier] = true;
        }
        break; // Found the critical point, exit this loop
      }
    }

    // Kruskal's algorithm to find MST on the remaining active nodes
    minimumSpanningCost = 0;
    disjointSetStructure = UnionFindStructure(nodeCount); // Reset Union-Find

    // Sort edges by weight in ascending order
    connectionList.sort(function (edgeOne, edgeTwo) {
      return edgeOne[2] - edgeTwo[2];
    });

    // Iterate through sorted edges
    for (innerLoopIdx1 = 0; innerLoopIdx1 < edgeCount; innerLoopIdx1++) {
      currentConnection = connectionList[innerLoopIdx1];
      // If both endpoints of the edge are active
      if (isNodeActive[currentConnection[0]] && isNodeActive[currentConnection[1]]) {
        // If the endpoints are in different sets, unite them and add edge weight to cost
        if (disjointSetStructure.findRoot(currentConnection[0]) !== disjointSetStructure.findRoot(currentConnection[1])) {
          disjointSetStructure.uniteSets(currentConnection[0], currentConnection[1]);
          minimumSpanningCost += currentConnection[2];
        }
      }
    }

    // Process nodes that were deactivated but need to be re-evaluated for connection
    // This loop iterates backwards from the critical point found earlier
    let nodeStack, minDistance, currentNode;
    for (innerLoopIdx2 = outerLoopIdx - 1; innerLoopIdx2 >= 0; innerLoopIdx2--) {
      nodeStack = [];
      nodeStack.push(nodeActivationData[innerLoopIdx2].identifier);
      isNodeActive[nodeActivationData[innerLoopIdx2].identifier] = true; // Mark node as active

      // Add all nodes with the same activation period to the stack and mark them active
      while (innerLoopIdx2 > 0 &&
             nodeActivationData[innerLoopIdx2].activationPeriod === nodeActivationData[innerLoopIdx2 - 1].activationPeriod) {
        innerLoopIdx2--;
        nodeStack.push(nodeActivationData[innerLoopIdx2].identifier);
        isNodeActive[nodeActivationData[innerLoopIdx2].identifier] = true;
      }

      // While there are nodes in the stack (nodes that were just reactivated)
      while (nodeStack.length > 0) {
        currentNode = nodeStack.pop(); // Get a node from the stack
        minDistance = Infinity; // Initialize min distance to Infinity

        // Re-evaluate edges for the current set of active nodes
        // This part seems to re-run the Kruskal's logic for the current active set,
        // effectively adding edges as nodes become active.
        for (innerLoopIdx1 = 0; innerLoopIdx1 < edgeCount; innerLoopIdx1++) {
          currentConnection = connectionList[innerLoopIdx1];
          if (isNodeActive[currentConnection[0]] && isNodeActive[currentConnection[1]]) {
            if (disjointSetStructure.findRoot(currentConnection[0]) !== disjointSetStructure.findRoot(currentConnection[1])) {
              disjointSetStructure.uniteSets(currentConnection[0], currentConnection[1]);
              minimumSpanningCost += currentConnection[2];
            }
          }
        }
      }
    }
    // Output the final calculated minimum spanning cost
    console.log(minimumSpanningCost);
  }
}
