(function processGraphQueries() {
  // Read all input from standard input, decode as UTF-8, remove trailing whitespace, and split into lines.
  const inputDataRows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // Parse the first line to get the number of vertices (nodes) and edges.
  const [vertexCount, edgeCount] = inputDataRows.shift().split(' ').map(Number);

  // Initialize an adjacency list representation for the graph.
  // Each element in graphAdjacency will be an array representing the neighbors of a vertex.
  const graphAdjacency = Array.from(Array(vertexCount), () => []);

  // This variable is declared but not used in the original code.
  // It is preserved to maintain Type II clone rules (no deletion of executable logic).
  const unusedPlaceholder = [];

  // Variables to hold source and target vertices for edge processing.
  let startVertex, endVertex;

  // Loop through the next 'edgeCount' lines to build the graph.
  for (let edgeIterator = 0; edgeIterator < edgeCount; edgeIterator++) {
    // Parse each edge line to get the two connected vertices.
    [startVertex, endVertex] = inputDataRows.shift().split(' ').map(Number);
    // Add edges to the adjacency list (undirected graph).
    graphAdjacency[startVertex].push(endVertex);
    graphAdjacency[endVertex].push(startVertex);
  }

  // Define constants for node states during BFS traversal.
  const NODE_UNVISITED = 0, NODE_VISITING = 1, NODE_VISITED = 2;

  // Variables used globally for the BFS queue and current/neighbor nodes.
  let currentVertex, neighborVertex, bfsTraversalQueue;

  /**
   * Determines if a path exists between a source node and a target node using Breadth-First Search (BFS).
   * @param {number} sourceNodeIdentifier - The starting node for the path search.
   * @param {number} targetNodeIdentifier - The destination node for the path search.
   * @returns {boolean} - True if a path exists, false otherwise.
   */
  function determineReachability(sourceNodeIdentifier, targetNodeIdentifier) {
    // Initialize the state of all vertices to UNVISITED.
    const vertexState = Array.from(graphAdjacency, () => NODE_UNVISITED);
    // Start BFS from the source node.
    bfsTraversalQueue = [sourceNodeIdentifier];

    // Continue as long as there are nodes in the queue to visit.
    while ((currentVertex = bfsTraversalQueue.shift()) !== undefined) {
      // Iterate through all neighbors of the current vertex.
      for (let neighborIndex = 0; neighborIndex < graphAdjacency[currentVertex].length; neighborIndex++) {
        neighborVertex = graphAdjacency[currentVertex][neighborIndex];

        // If the neighbor is the target node, a path is found.
        if (neighborVertex === targetNodeIdentifier) {
          return true;
        }

        // If the neighbor has not been visited yet, mark it as VISITING and add to the queue.
        if (vertexState[neighborVertex] === NODE_UNVISITED) {
          vertexState[neighborVertex] = NODE_VISITING;
          bfsTraversalQueue.push(neighborVertex);
        }
      }
      // After processing all neighbors, mark the current vertex as VISITED.
      vertexState[currentVertex] = NODE_VISITED;
    }
    // If the queue becomes empty and the target was not reached, no path exists.
    return false;
  }

  // Discard the line separating graph definition from queries (it's an empty line or just a separator).
  inputDataRows.shift();

  // Process each remaining line as a query.
  // For each query, determine reachability and map the result to 'yes' or 'no'.
  // Finally, join all results with newline characters and print to console.
  console.log(inputDataRows.map(queryInputLine => {
    const [querySource, queryTarget] = queryInputLine.split(' ').map(Number);
    return determineReachability(querySource, queryTarget) ? 'yes' : 'no';
  }).join('\n'));

})();
