'use strict';

/**
 * Processes the input data to find the number of connected components
 * in a directed graph where each node has at most one outgoing edge.
 * @param {string} rawInputData The raw input string from stdin.
 */
function processInput(rawInputData) {
  // Split the input string into individual lines
  const dataRows = rawInputData.split('\n');

  // Extract the first line containing N (number of nodes) and M (number of edges)
  const initialValues = dataRows.shift().split(' ').map(valStr => parseInt(valStr, 10));
  const totalNodes = initialValues[0]; // N
  const totalEdges = initialValues[1]; // M (not directly used in this specific algorithm, but part of input)

  // Parse the remaining lines into an array of edge pairs
  const connections = dataRows.map(lineItem => lineItem.split(' ').map(numStr => parseInt(numStr, 10)));

  // Initialize data structures for graph traversal
  // visitedNodes: Tracks whether a node has been visited during a traversal
  const visitedNodes = [];
  // adjacencyList: Stores the outgoing edges for each node
  const adjacencyList = [];

  // Initialize all nodes as unvisited and their adjacency lists as empty
  for (let nodeIdx = 1; nodeIdx <= totalNodes; ++nodeIdx) {
    visitedNodes[nodeIdx] = false;
    adjacencyList[nodeIdx] = [];
  }

  // Populate the adjacency list based on the input connections
  connections.forEach(currentEdge => {
    // For each edge [u, v], add v to u's adjacency list
    adjacencyList[currentEdge[0]].push(currentEdge[1]);
  });

  /**
   * Performs a depth-first search (DFS) like traversal starting from a given node.
   * This specific search follows a single path as each node has at most one outgoing edge.
   * @param {number} currentVertex The starting node for the traversal.
   * @returns {boolean} Always returns true if the path is successfully traversed.
   */
  function explorePath(currentVertex) {
    // Mark the current node as visited
    visitedNodes[currentVertex] = true;

    // If the current node has no outgoing edges, the path ends here
    if (!adjacencyList[currentVertex].length) {
      return true;
    }

    // Follow the single outgoing edge (if any)
    // The .shift() method removes and returns the first element, effectively consuming the edge.
    explorePath(adjacencyList[currentVertex].shift());
  }

  // Initialize variables for counting components
  let nodeIterator = 1; // Start checking from the first node
  let componentCount = 0; // Counter for the number of distinct components

  // Iterate through all nodes to find unvisited ones and start new traversals
  while (nodeIterator <= totalNodes) {
    // If we reach an unvisited node, it means it's the start of a new component
    // Increment the component counter
    ++componentCount;
    // Traverse the path starting from this node
    explorePath(nodeIterator);
    // After traversing, advance the iterator past all nodes that were visited in this component
    while (visitedNodes[nodeIterator]) {
      ++nodeIterator;
    }
  }

  // Output the final count of components
  console.log(componentCount);
}

// Read the input from stdin and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
