/*
 * This script processes graph data to determine node colors.
 * It reads input from standard input, constructs an adjacency list,
 * and then performs a graph traversal to assign colors based on edge weights.
 */
console.log(
  (function(inputStrData) { // Main anonymous function to process the input
    // Parse the input string into a structured format.
    // The first line contains the number of nodes, subsequent lines contain edge details.
    const [
      [nodeCount], // Extract the total number of vertices from the first line
      ...edgeInfoArr // Collect all subsequent lines as edge descriptions
    ] = inputStrData.trim()
      .split('\n')
      .map(
        (lineData) =>
        lineData.split(' ').map(
          (valParsed) => valParsed | 0 // Convert string parts to integers using bitwise OR
        )
      );

    // Initialize an adjacency list for the graph.
    // Each element in `adjList` will be an array representing connections for a node.
    const adjList = Array.from({
      length: nodeCount
    }, (_ignored) => []);

    // Populate the adjacency list with edges.
    // Edges are bidirectional, so add to both nodes' lists.
    for (
      let edgeIdx = 0; edgeIdx < nodeCount - 1; edgeIdx++
    ) {
      const [
        nodeA, // First vertex in the current edge
        nodeB, // Second vertex in the current edge
        edgeWeight // Weight associated with this edge
      ] = edgeInfoArr[edgeIdx];

      // Store neighbor and edge weight parity.
      // Node indices are 0-based, so subtract 1.
      adjList[nodeA - 1].push([nodeB - 1, edgeWeight & 1]);
      adjList[nodeB - 1].push([nodeA - 1, edgeWeight & 1]);
    }

    // Initialize an array to store the computed color for each node.
    // NaN indicates an unvisited node.
    const nodeColors = Array.from({
      length: nodeCount
    }, (_placeholder) => NaN);

    // Set the color of the starting node (node 0) to 0.
    nodeColors[0] = 0;

    // Initialize a stack for depth-first-like traversal.
    // Start traversal from node 0.
    const traversalStack = [0];

    // Perform graph traversal (similar to DFS) to assign colors.
    while (traversalStack.length > 0) {
      const currentVertex = traversalStack.pop(); // Get the next vertex to process

      // Iterate through all neighbors of the current vertex.
      for (
        const [
          neighborVertex, // Connected vertex
          linkParity // Parity of the edge weight (0 or 1)
        ] of adjList[currentVertex]
      ) {
        // If the neighbor has already been colored, skip it.
        if (Number.isFinite(nodeColors[neighborVertex])) {
          continue;
        }

        // Push the uncolored neighbor onto the stack for future processing.
        traversalStack.push(neighborVertex);

        // Assign color based on the edge weight parity.
        // If linkParity is 1, toggle the current vertex's color.
        // If linkParity is 0, assign the same color as the current vertex.
        if (linkParity === 1) {
          nodeColors[neighborVertex] = (~nodeColors[currentVertex]) & 1;
        } else {
          nodeColors[neighborVertex] = nodeColors[currentVertex];
        }
      }
    }

    // Join the computed node colors with newline characters for the final output.
    return nodeColors.join('\n');
  })(
    require('fs').readFileSync(
      '/dev/stdin', // Standard input file path
      'utf8' // Encoding for reading the file
    )
  )
);