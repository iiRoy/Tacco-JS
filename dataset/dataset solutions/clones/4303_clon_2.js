"use strict";
// Resume standard input stream processing
process.stdin.resume();

// Set the encoding for incoming data to UTF-8
process.stdin.setEncoding('utf8');

// Declare a variable to accumulate all incoming data
let incomingTextBuffer = '';

// Attach a 'data' event listener to process.stdin
// This function appends each received data segment to the buffer
process.stdin.on('data',
  function (dataSegment) {
    incomingTextBuffer += dataSegment;
  });

// Function to parse a string line into an array of numbers
// It removes leading/trailing whitespace and splits by spaces.
const parseIntegerSequence = function (inputLineString) {
  // Trim whitespace and split the line into string parts
  let numArray = inputLineString.replace(/(^\s+)|(\s+$)/g, "").split(" ");

  // Convert each string part to a number
  for (let itemIndex = 0; itemIndex < numArray.length; ++itemIndex) {
    numArray[itemIndex] = +numArray[itemIndex];
  }
  return numArray;
};

// Function to parse a string line into an array of strings
// It removes leading/trailing whitespace and splits by spaces.
// This version keeps elements as strings.
const parseStringSequence = function (textRow) {
  // Trim whitespace and split the row into string parts
  let strArray = textRow.replace(/(^\s+)|(\s+$)/g, "").split(" ");

  // No type conversion needed, elements remain strings
  for (let charIndex = 0; charIndex < strArray.length; ++charIndex) {
    // This line is effectively a no-op but maintains structure
    strArray[charIndex] = strArray[charIndex];
  }
  return strArray;
};

// Attach an 'end' event listener to process.stdin
// This function executes once all input data has been received
process.stdin.on('end', () => {
  // Split the entire accumulated buffer into individual lines
  const allInputLines = incomingTextBuffer.split('\n');

  // Parse the first line to get graph dimensions (nodeTotal and edgeTotal)
  const graphDimensions = parseIntegerSequence(allInputLines[0]);
  const nodeTotal = graphDimensions[0]; // Number of nodes (vertices)
  const edgeTotal = graphDimensions[1]; // Number of edges (connections)

  // Process subsequent lines to get the list of connections (edges)
  // `splice(1)` removes the first line (dimensions) and `map` processes each remaining line.
  let connectionRecords = allInputLines.splice(1).map(currentInputRow => parseIntegerSequence(currentInputRow));

  // Initialize an adjacency list representation for the graph
  // `nodeTotal + 1` to handle 1-based indexing if necessary, or simply for array size.
  let adjacencyMatrix = new Array(nodeTotal + 1);
  for (let nodeIdx = 0; nodeIdx < nodeTotal + 1; ++nodeIdx) {
    adjacencyMatrix[nodeIdx] = []; // Each node has an empty list of neighbors
  }

  // Populate the adjacency list based on the connection records
  for (let currentConnection of connectionRecords) {
    // Adjust node indices to be 0-based
    currentConnection[0]--;
    currentConnection[1]--;

    // Add connections to both nodes' lists (undirected graph)
    adjacencyMatrix[currentConnection[0]].push(currentConnection[1]);
    adjacencyMatrix[currentConnection[1]].push(currentConnection[0]);
  }

  // Initialize a list to store all detected cycles
  let detectedCycles = [];

  // Iterate through each node to find cycles starting from it
  for (let startVertex = 0; startVertex < nodeTotal; ++startVertex) {
    // Initialize paths to explore, starting with each neighbor of the startVertex
    // Each path is an array: [neighbor]
    let pathsToExplore = [].concat(adjacencyMatrix[startVertex].map(neighborVertex => [neighborVertex]));

    // Keep track of visited nodes within the current exploration scope to prevent infinite loops
    let visitedNodesSet = new Set();

    // Perform a Breadth-First Search (BFS)-like traversal to find paths
    while (pathsToExplore.length > 0) {
      let nextIterationPaths = []; // Paths found in the next level of traversal
      visitedNodesSet.add(startVertex); // Mark the starting vertex as visited for this traversal

      // Process each active path segment
      for (let activePathSegment of pathsToExplore) {
        const pathEndNode = activePathSegment[activePathSegment.length - 1]; // The last node in the current path
        let previousNodeInPath = -1; // The second to last node in the path

        // If the path has at least two nodes, identify the previous node
        if (activePathSegment.length >= 2) {
          previousNodeInPath = activePathSegment[activePathSegment.length - 2];
        }

        // Find potential next nodes from the pathEndNode's neighbors
        // Conditions:
        // 1. Not already in the current path (to avoid immediate backtracking)
        // 2. Not the pathEndNode itself (self-loop)
        // 3. Not visited, or if visited, it must be the startVertex (closing a cycle)
        const potentialNextSegments = adjacencyMatrix[pathEndNode].filter(candidateNeighbor =>
          activePathSegment.indexOf(candidateNeighbor) < 0 &&
          candidateNeighbor !== pathEndNode &&
          (!visitedNodesSet.has(candidateNeighbor) || candidateNeighbor === startVertex)
        );

        // For each valid next node, extend the current path
        potentialNextSegments.forEach(nextNodeCandidate => {
          visitedNodesSet.add(nextNodeCandidate); // Mark the candidate as visited
          let extendedPath = [].concat(activePathSegment); // Create a new path by copying the current one
          extendedPath.push(nextNodeCandidate); // Add the new node to the extended path

          // If the extended path leads back to the startVertex, it's a cycle
          if (nextNodeCandidate !== startVertex) {
            nextIterationPaths.push(extendedPath); // Continue exploring this path
          } else {
            detectedCycles.push(extendedPath); // Add the cycle to the list
          }
        });
      }
      pathsToExplore = nextIterationPaths; // Move to the next level of paths
    }
  }

  // Filter out cycles that are too short (e.g., A-B-A, which is not a proper cycle for this context)
  detectedCycles = detectedCycles.filter(cyclePathEntry => cyclePathEntry.length > 2);

  // Remove edges that are part of any detected cycle
  for (let currentCyclePath of detectedCycles) {
    // Iterate through the nodes in the cycle
    for (let pathSegmentIndex = 0; pathSegmentIndex < currentCyclePath.length; ++pathSegmentIndex) { // Corrected from `++l` to `++pathSegmentIndex`
      // Filter out edges that form part of the current cycle path
      connectionRecords = connectionRecords.filter(remainingEdge => {
        // Get the current node and the next node in the cycle (wrapping around for the last segment)
        const nodeA = currentCyclePath[pathSegmentIndex];
        const nodeB = currentCyclePath[(pathSegmentIndex + 1) % currentCyclePath.length];

        // Check if the current edge matches the segment (either direction)
        const isForwardMatch = (remainingEdge[1] === nodeA && remainingEdge[0] === nodeB);
        const isBackwardMatch = (remainingEdge[0] === nodeA && remainingEdge[1] === nodeB);

        // Keep the edge if it's NOT part of the cycle segment
        return !(isForwardMatch || isBackwardMatch);
      });
    }
  }

  // Output the count of remaining edges after removing those involved in cycles
  console.log(connectionRecords.length);
});