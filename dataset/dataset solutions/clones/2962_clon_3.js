'use strict';
(function(rawInputString) {
  // Define a constant for an unassigned label, making the code more readable.
  const UNASSIGNED_LABEL = -1;

  // Process the raw input string: trim whitespace, split into lines.
  let processedLines = rawInputString.trim().split('\n');

  // Extract the total number of vertices from the first line.
  // Using parseInt for explicit type conversion.
  const totalVertices = parseInt(processedLines.shift(), 10);

  // Validate the number of vertices. If invalid, terminate early or handle error.
  // This is an added guard clause.
  if (isNaN(totalVertices) || totalVertices <= 0) {
    console.error("Error: Invalid number of vertices provided.");
    return; // Exit the IIFE
  }

  // Map the remaining lines to an array of edge details.
  // Each edge detail is an array [source, destination, weight].
  // Using Number() for type conversion instead of `x-0`.
  const edgeDefinitions = processedLines.map(line =>
    line.split(/\s+/).map(Number)
  );

  // Define a class for a graph vertex.
  // This is a structural change from a function constructor to a class.
  class GraphVertex {
    // A constructor that takes an optional identifier, though not strictly used in the original.
    constructor(vertexIdentifier) {
      this.vertexIdentifier = vertexIdentifier; // Added for completeness, though not central to logic.
      this.adjacencies = []; // List of connected vertices and their modified edge weights.
      this.partitionLabel = UNASSIGNED_LABEL; // The 'group' or 'color' assigned to the vertex.
      this.currentEdgePointer = 0; // New property for iterative DFS traversal.
    }
  }

  // Initialize an array to hold all graph vertices.
  // Using Array.from with a length and then filling it.
  const vertexRegister = Array.from({
    length: totalVertices + 1
  }, (_, idx) => new GraphVertex(idx));

  // Populate the adjacency lists for each vertex based on edge definitions.
  // Iterate using a for...of loop for modern JS style.
  for (const connectionDetails of edgeDefinitions) {
    const sourceVertexIdx = connectionDetails[0];
    const targetVertexIdx = connectionDetails[1];
    const originalWeight = connectionDetails[2];

    // Store the target vertex index and the parity of the edge weight.
    // The modulo operation simplifies the weight to 0 or 1.
    vertexRegister[sourceVertexIdx].adjacencies.push([targetVertexIdx, originalWeight % 2]);
  }

  // Initialize the traversal stack for a depth-first search (DFS) like algorithm.
  // Start the traversal from vertex 1.
  const traversalStack = [1];
  vertexRegister[1].partitionLabel = 0; // Assign an initial label to the starting vertex.

  // Perform the graph traversal.
  // This loop implements an iterative DFS variant using an explicit stack
  // and an internal pointer for each node's adjacency list.
  while (traversalStack.length > 0) {
    // Get the index of the vertex currently at the top of the stack.
    const currentVertexIndex = traversalStack[traversalStack.length - 1];
    const currentVertex = vertexRegister[currentVertexIndex];

    // Check if there are still unexplored edges from the current vertex.
    if (currentVertex.currentEdgePointer < currentVertex.adjacencies.length) {
      // Get the next edge to process.
      const edgeLinkDetails = currentVertex.adjacencies[currentVertex.currentEdgePointer];
      const neighborIndex = edgeLinkDetails[0];
      const edgeParity = edgeLinkDetails[1];

      // Move the pointer to the next edge for this vertex.
      currentVertex.currentEdgePointer++;

      const neighborVertex = vertexRegister[neighborIndex];

      // If the neighbor hasn't been visited (partitionLabel is UNASSIGNED_LABEL).
      if (neighborVertex.partitionLabel === UNASSIGNED_LABEL) {
        // Calculate the neighbor's label based on current vertex's label XOR edge parity.
        // This is a key step in the 2-coloring/bipartite graph logic.
        neighborVertex.partitionLabel = currentVertex.partitionLabel ^ edgeParity;
        traversalStack.push(neighborIndex); // Push the neighbor onto the stack to explore it next.
      }
      // If the neighbor has already been visited, we just skip this edge for now.
      // The original logic would pop the edge from the adjacencies array;
      // here, advancing currentEdgePointer achieves a similar effect without modifying adjacencies.
    } else {
      // If all edges from the current vertex have been explored, pop it from the stack.
      traversalStack.pop();
    }
  }

  // Collect the final partition labels for all vertices (from 1 to totalVertices).
  const finalPartitionLabels = [];
  for (let idx = 1; idx <= totalVertices; idx++) {
    finalPartitionLabels.push(vertexRegister[idx].partitionLabel);
  }

  // Output the results, joining them with newline characters.
  console.log(finalPartitionLabels.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));