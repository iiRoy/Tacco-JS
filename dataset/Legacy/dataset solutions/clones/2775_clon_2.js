"use strict";
(function(initialData) {
  // Process the raw input string into an array of numbers.
  let numericValues = initialData.trim().split(/\s+/).map(val => val - 0);

  // Extract problem parameters from the processed numbers.
  const totalNodes = numericValues.shift();
  const degreeLimit = numericValues.shift();
  const PRIME_MOD = 1e9 + 7; // A large prime number for modulo operations.

  /**
   * Represents a vertex in the graph structure.
   * Each vertex has a list of connected nodes and a depth level.
   */
  function GraphVertex() {
    let currentVertex = this; // Self-reference for clarity.
    currentVertex.adjacencies = []; // List of adjacent vertices.
    currentVertex.depthLevel = 0; // Distance from the root (node 0).
  }

  // Initialize an array of GraphVertex objects.
  // The size is totalNodes + 1 to accommodate 1-based indexing for nodes 1 to N.
  const allVertices = new Array(totalNodes + 1).fill(0).map(_ => new GraphVertex());

  // Establish initial connections for nodes 0 and 1 as per problem statement.
  allVertices[0].adjacencies.push(allVertices[1]);
  allVertices[1].adjacencies.push(allVertices[0]);

  // Read remaining pairs of connected nodes from input and build the graph.
  // The input is processed from the end using pop().
  while (numericValues.length) {
    let firstNodeIdx = numericValues.pop(); // Get the second node index.
    let secondNodeIdx = numericValues.pop(); // Get the first node index.
    allVertices[firstNodeIdx].adjacencies.push(allVertices[secondNodeIdx]);
    allVertices[secondNodeIdx].adjacencies.push(allVertices[firstNodeIdx]);
  }

  // First DFS traversal to calculate depth levels and remove parent references.
  // This effectively converts the graph into a tree rooted at node 0.
  const dfsStack = [allVertices[0]]; // Start DFS from node 0.
  while (dfsStack.length) {
    let nodeToProcess = dfsStack[dfsStack.length - 1]; // Peek at the top element.
    dfsStack.pop(); // Remove it from the stack.

    // Iterate over each neighbor of the current node.
    nodeToProcess.adjacencies.forEach(function(neighbor) {
      let neighborAdjacencies = neighbor.adjacencies;
      neighbor.depthLevel = nodeToProcess.depthLevel + 1; // Set depth level.
      // Remove the parent (nodeToProcess) from the neighbor's adjacency list
      // to prevent going back up the tree during subsequent traversals.
      neighborAdjacencies.splice(neighborAdjacencies.indexOf(nodeToProcess), 1);
      dfsStack.push(neighbor); // Add neighbor to stack for further processing.
    });
  }

  // Calculate the final product based on tree structure and degree limits.
  let resultProduct = 1; // Initialize the result.

  // Second DFS traversal to compute the product.
  dfsStack.push(allVertices[0]); // Restart DFS from the root.
  while (dfsStack.length) {
    let calcNode = dfsStack[dfsStack.length - 1]; // Get the current node.
    dfsStack.pop(); // Remove it.

    // Apply different calculation logic based on the node's depth level.
    if (calcNode.depthLevel < 2) {
      // For nodes at depth 0 or 1.
      for (let idx = 0, childrenCount = calcNode.adjacencies.length; idx < childrenCount; idx++) {
        resultProduct = (resultProduct * (degreeLimit - calcNode.depthLevel - idx)) % PRIME_MOD;
      }
    } else {
      // For nodes at depth 2 or greater.
      for (let idx = 0, childrenCount = calcNode.adjacencies.length; idx < childrenCount; idx++) {
        resultProduct = (resultProduct * (degreeLimit - 2 - idx)) % PRIME_MOD;
      }
    }

    // Add children to the stack for continued traversal.
    calcNode.adjacencies.forEach(function(nextVertex) {
      dfsStack.push(nextVertex);
    });
  }

  // Output the final calculated result.
  console.log(resultProduct);

})(require("fs").readFileSync("/dev/stdin", "utf8"));
