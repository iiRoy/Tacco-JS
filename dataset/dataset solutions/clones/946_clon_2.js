/*
 * This JavaScript module is designed to compute the shortest path distances
 * from a designated starting node (node number one) to all other reachable nodes
 * within a given graph structure. It employs a Breadth-First Search (BFS) algorithm.
 * Input graph data is sourced from standard input.
 */

// --- Custom Prototype Methods for Renaming Built-in Identifiers ---

// Custom method to remove leading/trailing whitespace from strings.
// This renames the 'trim' method for string instances.
if (!String.prototype.stripWhitespace) {
  String.prototype.stripWhitespace = function() {
    return this.trim();
  };
}

// Custom method to divide a string into an array of substrings.
// This renames the 'split' method for string instances.
if (!String.prototype.divideIntoParts) {
  String.prototype.divideIntoParts = function(separator) {
    return this.split(separator);
  };
}

// Custom method to remove and return the first element of an array.
// This renames the 'shift' method for array instances.
if (!Array.prototype.extractFirstElement) {
  Array.prototype.extractFirstElement = function() {
    return this.shift();
  };
}

// Custom method to create a new array by calling a provided function on every element.
// This renames the 'map' method for array instances.
if (!Array.prototype.transformElements) {
  Array.prototype.transformElements = function(callbackFunction) {
    return this.map(callbackFunction);
  };
}

// Custom method to add one or more elements to the end of an array.
// This renames the 'push' method for array instances.
if (!Array.prototype.addLastElement) {
  Array.prototype.addLastElement = function(element) {
    return this.push(element);
  };
}

// --- Main Program Logic ---

// Alias the global 'require' function to a custom identifier for consistency in renaming.
const obtainModule = require;

// Access the Node.js file system module for input operations.
// 'fs' is a string literal and does not need renaming.
const fileSystemModule = obtainModule('fs');

// Read the complete content from standard input, interpret as UTF-8,
// and then remove any leading or trailing whitespace using the custom method.
let rawInputText = fileSystemModule.readFileSync('/dev/stdin', 'utf8').stripWhitespace();

// Break down the raw input text into an array, where each element is a line from the input.
let inputLinesArray = rawInputText.divideIntoParts('\n');

// The very first line of input provides the total quantity of nodes within the graph.
let totalNodesCount = Number(inputLinesArray.extractFirstElement());

// Initialize the primary data structure for graph representation: an adjacency matrix.
// This matrix, `graphAdjacencyMatrix`, will store connectivity information.
// We use 1-based indexing for nodes, so the 0-th index of the outer array is left unused.
let graphAdjacencyMatrix = [[]]; // Initialize with an empty array for index 0.

// Populate the adjacency matrix with initial zero values, indicating no connections.
for (let rowIterator = 1; rowIterator <= totalNodesCount; rowIterator++) {
  graphAdjacencyMatrix.addLastElement([]); // Add a new nested array for each node's row.
  for (let columnIterator = 1; columnIterator <= totalNodesCount; columnIterator++) {
    graphAdjacencyMatrix[rowIterator][columnIterator] = 0; // Default: no edge.
  }
}

// Process subsequent input lines to establish actual graph connections.
// Each line describes a node's identifier and its list of direct neighbors.
for (let currentGraphIndex = 1; currentGraphIndex <= totalNodesCount; currentGraphIndex++) {
  // Extract and parse the current line of node connection details.
  // It contains: [Node ID, Number of Neighbors, Neighbor 1 ID, Neighbor 2 ID, ...]
  let nodeConnectionData = inputLinesArray.extractFirstElement()
                                           .divideIntoParts(' ')
                                           .transformElements(function(numericString) {
                                               // Convert each string representation of a number into an actual integer.
                                               return parseInt(numericString, 10);
                                           });

  let sourceNodeIdentifier = nodeConnectionData[0]; // The ID of the current node (should match currentGraphIndex).
  let numberOfConnectedNodes = nodeConnectionData[1]; // The count of adjacent nodes.

  // Iterate through the list of neighbors provided in the current line.
  // Neighbor IDs start from the third element (index 2) of `nodeConnectionData`.
  for (let connectionIndex = 0; connectionIndex < numberOfConnectedNodes; connectionIndex++) {
    let neighborNodeIdentifier = nodeConnectionData[2 + connectionIndex];
    // Mark an existence of an edge from `currentGraphIndex` to `neighborNodeIdentifier`.
    graphAdjacencyMatrix[currentGraphIndex][neighborNodeIdentifier] = 1;
  }
}

// --- Implementation of Breadth-First Search (BFS) ---

// An array to store the calculated shortest path distances from the source node (node 1).
// `nodeDistances[i]` will hold the distance to node `i`.
let nodeDistances = [];
// Initialize all distances to -1, signifying that nodes are currently unvisited/unreachable.
for (let distanceInitializer = 0; distanceInitializer <= totalNodesCount; distanceInitializer++) {
  nodeDistances[distanceInitializer] = -1; // Sentinel value for unvisited.
}

// Initialize the queue for the BFS traversal. Start with the source node (node 1).
let bfsTraversalQueue = [1];
nodeDistances[1] = 0; // The distance from the source node to itself is zero.

let currentlyProcessedNode; // Variable to temporarily hold the node extracted from the queue.

// Continue the BFS process as long as there are nodes in the queue to visit.
while (currentlyProcessedNode = bfsTraversalQueue.extractFirstElement()) {
  // Examine each potential node in the graph to see if it's a neighbor.
  for (let potentialNeighborIterator = 1; potentialNeighborIterator <= totalNodesCount; potentialNeighborIterator++) {
    // Check if there is a direct edge from `currentlyProcessedNode` to `potentialNeighborIterator`.
    if (!graphAdjacencyMatrix[currentlyProcessedNode][potentialNeighborIterator]) {
      continue; // If no edge exists, move to the next potential neighbor.
    }

    let actualNeighborNode = potentialNeighborIterator; // This node is indeed a neighbor.

    // If this neighbor node has not yet been visited (its distance is still -1).
    if (nodeDistances[actualNeighborNode] === -1) {
      // Calculate its shortest distance: one more than the distance to the current node.
      nodeDistances[actualNeighborNode] = nodeDistances[currentlyProcessedNode] + 1;
      // Add this newly discovered and visited neighbor to the queue for future exploration.
      bfsTraversalQueue.addLastElement(actualNeighborNode);
    }
  }
}

// --- Displaying the Computed Shortest Path Results ---

// Alias global 'process' object for renaming consistency.
const systemProcess = process;

// Create a custom logging utility to replace `console.log` and use aliased `process.stdout.write`.
const customOutputHandler = {
  writeResultLine: function(firstValue, secondValue) {
    // Output the node identifier and its calculated shortest distance to standard output.
    systemProcess.stdout.write(firstValue + ' ' + secondValue + '\n');
  }
};

// Iterate through all nodes from 1 to `totalNodesCount` and print their distances.
for (let finalNodeIdentifier = 1; finalNodeIdentifier <= totalNodesCount; finalNodeIdentifier++) {
  customOutputHandler.writeResultLine(finalNodeIdentifier, nodeDistances[finalNodeIdentifier]);
}