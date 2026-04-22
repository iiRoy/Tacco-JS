// This module encapsulates the logic for processing graph connectivity queries.
// It reads graph data and reachability queries from standard input,
// then outputs whether a path exists between specified nodes for each query.
(function graphConnectivityResolver() {
  // Define an enumeration-like object for node visit states during graph traversal.
  // This enhances readability and makes the state transitions more explicit.
  const NodeVisitState = Object.freeze({
    UNDISCOVERED: 0, // Node has not yet been encountered or added to the queue.
    IN_PROGRESS: 1,  // Node is currently in the queue, waiting to be processed, or its neighbors are being explored.
    COMPLETED: 2     // Node has been fully processed; all its direct neighbors have been explored and added to the queue if undiscovered.
  });

  /**
   * Parses a string containing space-separated numbers into an array of integers.
   * Includes basic error handling for invalid input segments.
   * @param {string} lineContent The string line to parse.
   * @returns {number[]} An array of parsed integer values.
   * @throws {Error} If the line content is invalid or a segment cannot be parsed.
   */
  function parseNumericLine(lineContent) {
    if (typeof lineContent !== 'string' || lineContent.trim() === '') {
      throw new Error('Input line for numeric parsing must be a non-empty string.');
    }
    const numericSegments = lineContent.split(' ').map(segment => {
      const parsedValue = parseInt(segment, 10);
      if (isNaN(parsedValue)) {
        throw new Error(`Failed to convert segment "${segment}" to an integer.`);
      }
      return parsedValue;
    });
    return numericSegments;
  }

  // Obtain the file system module to read input.
  const fileSystemAccess = require('fs');
  // Read the entire standard input as a UTF-8 string.
  const entireInputContent = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');

  // Split the input content into individual lines.
  // We filter out any lines that are entirely empty or whitespace to ensure robust parsing.
  const processedInputLines = entireInputContent
    .split('\n')
    .filter(line => line.trim().length > 0);

  // The very first line of input provides the total number of vertices (nodes)
  // and the total number of edges (connections) in the graph.
  const [totalGraphVertices, totalGraphEdges] = parseNumericLine(processedInputLines.shift());

  // Initialize the graph using an adjacency list representation.
  // Each element in this array corresponds to a vertex, and its value is
  // another array containing the identifiers of vertices directly connected to it.
  const graphAdjacencyList = Array.from({ length: totalGraphVertices }, () => []);

  // Loop through the next `totalGraphEdges` lines to build the graph.
  // Each of these lines describes an edge (connection) between two vertices.
  for (let edgeIteration = 0; edgeIteration < totalGraphEdges; edgeIteration++) {
    const [sourceVertex, destinationVertex] = parseNumericLine(processedInputLines.shift());

    // Perform basic validation on vertex indices to prevent out-of-bounds errors
    // and ensure graph integrity.
    if (sourceVertex < 0 || sourceVertex >= totalGraphVertices ||
        destinationVertex < 0 || destinationVertex >= totalGraphVertices) {
      console.warn(`Skipping invalid edge: (${sourceVertex}, ${destinationVertex}). Vertex indices must be within [0, ${totalGraphVertices - 1}].`);
      continue; // Move to the next edge if the current one is invalid.
    }

    // Since the graph is undirected, add the connection in both directions.
    graphAdjacencyList[sourceVertex].push(destinationVertex);
    graphAdjacencyList[destinationVertex].push(sourceVertex);
  }

  /**
   * Conducts a Breadth-First Search (BFS) to ascertain if a path exists
   * from a specified starting node to a target node within the graph.
   *
   * @param {number} startNodeIdentifier The unique ID of the node from which to begin the search.
   * @param {number} targetNodeIdentifier The unique ID of the node being sought.
   * @param {Array<Array<number>>} currentGraphStructure The graph represented by its adjacency list.
   * @param {number} numNodesInGraph The total count of nodes present in the graph.
   * @returns {boolean} `true` if the target node is reachable from the start node; `false` otherwise.
   */
  function findPathExistenceBFS(startNodeIdentifier, targetNodeIdentifier, currentGraphStructure, numNodesInGraph) {
    // Edge case: If the start and target nodes are identical, a path trivially exists.
    if (startNodeIdentifier === targetNodeIdentifier) {
      return true;
    }

    // Validate node identifiers to ensure they are within the graph's bounds.
    if (startNodeIdentifier < 0 || startNodeIdentifier >= numNodesInGraph ||
        targetNodeIdentifier < 0 || targetNodeIdentifier >= numNodesInGraph) {
      // console.error(`Invalid node ID(s) provided for BFS: start=${startNodeIdentifier}, target=${targetNodeIdentifier}.`);
      return false; // Path cannot exist with invalid node IDs.
    }

    // Initialize an array to track the visitation status of each node.
    // All nodes are initially marked as undiscovered.
    const nodeStatusTracker = new Array(numNodesInGraph).fill(NodeVisitState.UNDISCOVERED);

    // The queue structure essential for BFS. It holds nodes awaiting exploration.
    const explorationQueue = [];

    // Start the BFS: add the initial node to the queue and mark it as in progress.
    explorationQueue.push(startNodeIdentifier);
    nodeStatusTracker[startNodeIdentifier] = NodeVisitState.IN_PROGRESS;

    // Optional: Counter to track the number of nodes visited during this specific BFS run.
    let nodesVisitedCounter = 0;

    // Continue the search as long as there are nodes in the queue to explore.
    while (explorationQueue.length > 0) {
      const currentProcessingNode = explorationQueue.shift(); // Dequeue the next node.
      nodesVisitedCounter++; // Increment the count of processed nodes.

      // Iterate over all direct neighbors of the current node.
      // Using a `for...of` loop for concise iteration over array elements.
      for (const neighborNodeIdentifier of currentGraphStructure[currentProcessingNode]) {
        // If the neighbor is the target node, we have successfully found a path.
        if (neighborNodeIdentifier === targetNodeIdentifier) {
          // console.log(`BFS completed. Path found to target node ${targetNodeIdentifier} after visiting ${nodesVisitedCounter} distinct nodes.`);
          return true;
        }

        // If the neighbor has not been discovered yet, add it to the queue
        // for future exploration and update its status.
        if (nodeStatusTracker[neighborNodeIdentifier] === NodeVisitState.UNDISCOVERED) {
          nodeStatusTracker[neighborNodeIdentifier] = NodeVisitState.IN_PROGRESS;
          explorationQueue.push(neighborNodeIdentifier);
        }
      }

      // Once all neighbors of the current node have been processed,
      // mark the current node's status as completed.
      nodeStatusTracker[currentProcessingNode] = NodeVisitState.COMPLETED;
    }

    // If the queue becomes empty and the target node was never reached,
    // it implies that no path exists from the start node to the target node.
    return false;
  }

  // The remaining lines in `processedInputLines` are interpreted as reachability queries.
  // Each query specifies a pair of nodes (start and end) for which to check connectivity.
  const collectedQueryOutcomes = []; // Array to store the 'yes' or 'no' result for each query.

  // Process each query line sequentially.
  for (const queryLineContent of processedInputLines) {
    const [queryStartNode, queryEndNode] = parseNumericLine(queryLineContent);
    // Execute the BFS algorithm to determine reachability for the current query.
    const isTargetReachable = findPathExistenceBFS(queryStartNode, queryEndNode, graphAdjacencyList, totalGraphVertices);
    // Store the result ('yes' or 'no') in the buffer.
    collectedQueryOutcomes.push(isTargetReachable ? 'yes' : 'no');
  }

  // Finally, print all the collected query outcomes, each on a new line, to standard output.
  console.log(collectedQueryOutcomes.join('\n'));

})();