'use strict';

// Main execution block, immediately invoked function expression (IIFE)
(function(rawDataInput) {
  // Process the raw input string: trim whitespace, then split into lines.
  rawDataInput = rawDataInput.trim().split(/\n/);

  // The first line contains the total number of vertices (N).
  // Convert it to a number.
  const totalVertices = rawDataInput.shift() - 0;

  // Map the remaining lines (edge definitions) into arrays of numbers.
  // Each line is split by whitespace, and each part is converted to a number.
  rawDataInput = rawDataInput.map(lineContent => lineContent.split(/\s+/).map(parsedNumber => parsedNumber - 0));

  /**
   * Represents a single vertex in the graph.
   * @param {number} vertexIdentifier - The unique ID of this vertex (not used internally by this constructor).
   */
  function GraphElement(vertexIdentifier) {
    // Use 'thisElement' as a self-reference within the constructor.
    let thisElement = this;
    // Array to store information about adjacent edges: [neighbor_id, edge_weight_parity]
    thisElement.adjacentEdges = [];
    // The parity group (0 or 1) this vertex belongs to. -1 indicates unassigned.
    thisElement.parityGroup = -1;
  }

  // Create an array to hold all graph vertex objects.
  // Array is 1-indexed, so size is totalVertices + 1.
  const vertexCollection = new Array(totalVertices + 1);

  // Initialize each vertex object in the collection.
  for (let vertexIdentifier = 1; vertexIdentifier <= totalVertices; vertexIdentifier++) {
    vertexCollection[vertexIdentifier] = new GraphElement(vertexIdentifier);
  }

  // Populate the adjacency lists for each vertex based on the input edge data.
  rawDataInput.forEach(function(edgeDescription) {
    // edgeDescription[0] is source, edgeDescription[1] is destination, edgeDescription[2] is weight.
    // We only care about the parity of the weight (0 or 1).
    vertexCollection[edgeDescription[0]].adjacentEdges.push([edgeDescription[1], edgeDescription[2] % 2]);
  });

  // Initialize a stack for Depth-First Search (DFS) traversal.
  // Start traversal from vertex 1.
  const traversalStack = [1];

  // Assign the initial parity group to the starting vertex (vertex 1).
  // This can be arbitrarily 0 or 1; 0 is chosen here.
  vertexCollection[1].parityGroup = 0;

  // Perform DFS to assign parity groups to all connected vertices.
  // This algorithm effectively performs a 2-coloring based on edge weights.
  while (traversalStack.length > 0) {
    // Get the ID of the current vertex from the top of the stack.
    let currentVertexId = traversalStack[traversalStack.length - 1];
    // Get the actual vertex object.
    let currentVertexObject = vertexCollection[currentVertexId];

    // If the current vertex has no more unvisited adjacent edges, pop it.
    if (currentVertexObject.adjacentEdges.length === 0) {
      traversalStack.pop();
    } else {
      // Get the last edge details from the current vertex's adjacency list.
      // We process edges from the end to allow easy removal (pop).
      let lastEdgeDetails = currentVertexObject.adjacentEdges[currentVertexObject.adjacentEdges.length - 1];
      // Get the neighbor vertex object.
      let neighborVertexObject = vertexCollection[lastEdgeDetails[0]];

      // If the neighbor has not yet been assigned a parity group (-1 indicates unassigned).
      if (neighborVertexObject.parityGroup === -1) {
        // Assign the neighbor's parity group.
        // The neighbor's group is the XOR sum of the current vertex's group and the edge weight parity.
        neighborVertexObject.parityGroup = (currentVertexObject.parityGroup ^ lastEdgeDetails[1]);
        // Push the neighbor onto the stack to visit it next.
        traversalStack.push(lastEdgeDetails[0]);
      } else {
        // If the neighbor has already been visited, this edge has been processed
        // (either from this vertex or the neighbor's side).
        // Remove this edge from the current vertex's adjacency list.
        currentVertexObject.adjacentEdges.pop();
      }
    }
  }

  // Collect the final parity group assignments for all vertices.
  const finalParityResults = [];
  for (let vertexIdentifier = 1; vertexIdentifier <= totalVertices; vertexIdentifier++) {
    finalParityResults.push(vertexCollection[vertexIdentifier].parityGroup);
  }

  // Output the results, with each vertex's parity group on a new line.
  console.log(finalParityResults.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
