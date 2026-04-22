'use strict';

// Main entry point for processing the graph data
function principalProcess(inputContentStream) {
  // Split the entire input stream into individual lines
  const dataLines = inputContentStream.split('\n');

  // Extract configuration settings from the first line
  // The 'shift()' method removes and returns the first element, modifying the array.
  const configSettings = dataLines.shift().split(' ').map(stringDigit => parseInt(stringDigit, 10));

  // Assign the total number of nodes (N) and edges (M)
  const nodeTotal = configSettings[0];
  const edgeQuantity = configSettings[1];

  // Parse remaining lines into a list of connection pairs
  const connectionRecords = dataLines.map(linkEntry =>
    linkEntry.split(' ').map(stringDigit => parseInt(stringDigit, 10))
  );

  // Initialize data structures for tracking node visitation and adjacency
  const visitedNodesStatus = []; // Keeps track of which nodes have been explored
  const neighborConnections = []; // Stores the adjacency list for each node

  // Prepare status and connection lists for all nodes, starting from 1
  for (let nodeIdentifier = 1; nodeIdentifier <= nodeTotal; ++nodeIdentifier) {
    visitedNodesStatus[nodeIdentifier] = false; // Initially, no node is visited
    neighborConnections[nodeIdentifier] = [];   // Each node starts with an empty list of neighbors
  }

  // Populate the adjacency list based on the connection records
  connectionRecords.forEach(linkEntry => {
    // Add the second node of the pair as a neighbor to the first node
    neighborConnections[linkEntry[0]].push(linkEntry[1]);
  });

  // Recursive function to explore a connected component starting from a given node
  function exploreComponent(currentPoint) {
    visitedNodesStatus[currentPoint] = true; // Mark the current node as visited

    // If the current node has no outgoing connections, it's a terminal point in this path
    if (!neighborConnections[currentPoint].length)
      return true;

    // Recursively explore the next connected node
    // 'shift()' removes and returns the first element from the neighbor list
    exploreComponent(neighborConnections[currentPoint].shift());
  }

  let nodeIdentifier = 1;      // Start checking from the first node
  let componentCount = 0;      // Counter for the number of distinct components found

  // Iterate through all nodes to find and count connected components
  while (nodeIdentifier <= nodeTotal) {
    ++componentCount;                  // Increment the component count for each new component found
    exploreComponent(nodeIdentifier);  // Explore the component starting from the current unvisited node

    // Advance the node identifier past all nodes already visited within the current component
    while (visitedNodesStatus[nodeIdentifier])
      ++nodeIdentifier;
  }

  // Output the total number of connected components
  console.log(componentCount);
}

// Read input from standard input and pass it to the main processing function
principalProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));