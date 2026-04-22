"use strict"; // Enable strict mode for better code quality and error handling
(function(inputString) {
  // Parse the raw input string: remove leading/trailing whitespace, split by any whitespace,
  // and convert each resulting string segment into a numerical value.
  let processedData = inputString.trim().split(/\s+/).map(valStr => Number(valStr));

  // Extract the primary parameters for the graph problem.
  // numVertices: total number of nodes in the graph.
  // numColors: number of distinct colors available for assignment.
  // primeModulus: a large prime used for modular arithmetic to prevent overflow.
  const numVertices = processedData.shift();     // The first number is the vertex count
  const numColors = processedData.shift();       // The second number is the color count
  const primeModulus = 1_000_000_007;            // A common large prime modulus

  /**
   * Defines a constructor function for a GraphVertex.
   * Each vertex holds references to its neighbors and its calculated depth.
   */
  function GraphVertex() {
    let currentVertexRef = this;       // A self-reference for clarity
    currentVertexRef.connectedNodes = []; // An array to store references to adjacent vertices
    currentVertexRef.depthLevel = 0;      // The depth of this vertex from the root (initially zero)
  }

  // Create an array of GraphVertex objects. The array size is (numVertices + 1)
  // to allow for 1-based indexing if needed, though 0-based is used here.
  const allGraphVertices = new Array(numVertices + 1).fill(null).map(placeholder => new GraphVertex());

  // Establish initial connections between the first two vertices (node 0 and node 1).
  // This assumes a base connection for the problem's graph structure.
  allGraphVertices[0].connectedNodes.push(allGraphVertices[1]);
  allGraphVertices[1].connectedNodes.push(allGraphVertices[0]);

  // Process the remaining input data to construct the graph's edges.
  // Each pair of numbers in `processedData` represents an edge between two vertices.
  while (processedData.length > 0) {
    let endNodeB = processedData.pop(); // Get the second vertex index for the current edge
    let endNodeA = processedData.pop(); // Get the first vertex index for the current edge
    // Add bidirectional connections to represent an undirected edge.
    allGraphVertices[endNodeA].connectedNodes.push(allGraphVertices[endNodeB]);
    allGraphVertices[endNodeB].connectedNodes.push(allGraphVertices[endNodeA]);
  }

  // Perform the first graph traversal (similar to a BFS or DFS) to determine
  // the depth of each vertex from the root (vertex 0) and establish a tree structure.
  const traversalQueue = [allGraphVertices[0]]; // Initialize queue with the root vertex

  while (traversalQueue.length > 0) {
    let activeVertex = traversalQueue.pop(); // Retrieve the next vertex to process from the queue

    // Iterate over all connected nodes (neighbors) of the current active vertex.
    activeVertex.connectedNodes.forEach(function(neighborNode) {
      // Set the depth level of the neighbor node. It's one greater than the current node's depth.
      neighborNode.depthLevel = activeVertex.depthLevel + 1;
      // Obtain the list of connections for the neighbor node.
      let neighborConnections = neighborNode.connectedNodes;
      // Remove the parent link from the neighbor's connections to prevent cycles
      // in the tree structure and ensure correct depth calculation.
      neighborConnections.splice(neighborConnections.indexOf(activeVertex), 1);
      // Add the neighbor node to the queue for subsequent processing.
      traversalQueue.push(neighborNode);
    });
  }

  // Initialize the accumulator for the final result, representing the total number of ways to color.
  let totalCombinations = 1;

  // Perform the second graph traversal to calculate the number of valid colorings
  // based on the established tree structure and node depths.
  traversalQueue.push(allGraphVertices[0]); // Re-initialize the queue with the root vertex for the second traversal

  while (traversalQueue.length > 0) {
    let currentVertex = traversalQueue.pop(); // Get the next vertex from the queue for coloring calculation

    // Apply different coloring rules based on the depth level of the current vertex.
    if (currentVertex.depthLevel < 2) {
      // For vertices at depth 0 or 1, the available colors depend on depth and iteration.
      for (let iterationCount = 0, maxIterations = currentVertex.connectedNodes.length; iterationCount < maxIterations; iterationCount++) {
        totalCombinations = (totalCombinations * (numColors - currentVertex.depthLevel - iterationCount)) % primeModulus;
      }
    } else {
      // For vertices at depth 2 or greater, the available colors are simplified.
      for (let iterationCount = 0, maxIterations = currentVertex.connectedNodes.length; iterationCount < maxIterations; iterationCount++) {
        totalCombinations = (totalCombinations * (numColors - 2 - iterationCount)) % primeModulus;
      }
    }

    // Add all child nodes of the current vertex to the queue for the next iteration.
    currentVertex.connectedNodes.forEach(function(childVertex) {
      traversalQueue.push(childVertex);
    });
  }

  // Output the final computed number of total valid colorings.
  console.log(totalCombinations);

})(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input synchronously from standard input using Node.js fs module