function determineGameOutcome(inputPayload) {
  // Constants representing the players in the game
  const PLAYER_FENNEC_IDENTIFIER = "Fennec";
  const PLAYER_SNUKE_IDENTIFIER = "Snuke";

  // Pre-process the raw input string: remove leading/trailing whitespace and split into lines
  const graphDescriptionLines = inputPayload.trim().split('\n');

  // Extract the total number of vertices (nodes) in the graph from the first line
  const totalVerticesCount = parseInt(graphDescriptionLines[0], 10);

  // Initialize two arrays to store the shortest path costs (distances)
  // One for Fennec's perspective (starting from vertex 0)
  // And another for Snuke's perspective (starting from the last vertex)
  // Using Number.MAX_SAFE_INTEGER to represent an unreachable or unvisited state
  const fennecPathCosts = new Array(totalVerticesCount).fill(Number.MAX_SAFE_INTEGER);
  const snukePathCosts = new Array(totalVerticesCount).fill(Number.MAX_SAFE_INTEGER);

  // Define the fixed starting vertices for each player
  const FENNEC_INITIAL_VERTEX = 0;
  const SNUKE_INITIAL_VERTEX = totalVerticesCount - 1;

  // Set the initial cost for each player's starting vertex to zero
  fennecPathCosts[FENNEC_INITIAL_VERTEX] = 0;
  snukePathCosts[SNUKE_INITIAL_VERTEX] = 0;

  // Construct the graph's adjacency list, where each index represents a vertex
  // Each element is an array containing the indices of its directly connected neighbors
  const graphAdjacencyStructure = Array.from({ length: totalVerticesCount }, () => []);

  // Iterate through the remaining input lines to define the graph's edges
  // (skipping the first line which only contains the total number of vertices)
  for (let edgeLineIdx = 1; edgeLineIdx < graphDescriptionLines.length; edgeLineIdx++) {
    const edgeNodes = graphDescriptionLines[edgeLineIdx].split(' ');
    // Parse vertex indices and adjust to be 0-based
    const vertexA = parseInt(edgeNodes[0], 10) - 1;
    const vertexB = parseInt(edgeNodes[1], 10) - 1;

    // Add bidirectional connections to the adjacency list
    graphAdjacencyStructure[vertexA].push(vertexB);
    graphAdjacencyStructure[vertexB].push(vertexA);
  }

  /**
   * Conducts a Breadth-First Search (BFS) to determine the minimum path costs
   * from a specified starting vertex throughout the graph.
   * @param {number} startNodeIndex The index of the vertex from which to begin the BFS.
   * @param {number[]} distancesArray The array to be populated with shortest path costs.
   * @param {Array<number[]>} adjacencyGraph The graph's adjacency list representation.
   * @returns {number[]} The updated distancesArray with calculated shortest paths.
   */
  function executeGraphBFS(startNodeIndex, distancesArray, adjacencyGraph) {
    const bfsTraversalQueue = [startNodeIndex]; // Initialize BFS queue with the starting node
    let queueReadPointer = 0; // Pointer to efficiently manage the front of the queue

    // Continue the traversal as long as there are nodes in the queue to process
    while (queueReadPointer < bfsTraversalQueue.length) {
      const currentProcessedNode = bfsTraversalQueue[queueReadPointer++]; // Dequeue the next node

      // Examine all direct neighbors of the current node
      for (const neighborNode of adjacencyGraph[currentProcessedNode]) {
        // If a shorter path to the neighbor is discovered via the current node
        if (distancesArray[neighborNode] > distancesArray[currentProcessedNode] + 1) {
          distancesArray[neighborNode] = distancesArray[currentProcessedNode] + 1; // Update the path cost
          bfsTraversalQueue.push(neighborNode); // Enqueue the neighbor for subsequent processing
        }
      }
    }
    return distancesArray; // Return the array containing all calculated shortest path costs
  }

  // Calculate Fennec's shortest path costs to all vertices from their starting point
  const finalFennecDistances = executeGraphBFS(FENNEC_INITIAL_VERTEX, fennecPathCosts, graphAdjacencyStructure);
  // Calculate Snuke's shortest path costs to all vertices from their starting point
  const finalSnukeDistances = executeGraphBFS(SNUKE_INITIAL_VERTEX, snukePathCosts, graphAdjacencyStructure);

  let fennecControlledNodeCount = 0; // Counter for nodes where Fennec has a shorter or equal path

  // Iterate through all "contestable" vertices (excluding the players' starting points)
  // These are nodes 1 through totalVerticesCount - 2
  for (let currentContestableNode = 1; currentContestableNode < totalVerticesCount - 1; currentContestableNode++) {
    // If Fennec's path to this node is not longer than Snuke's path
    if (finalFennecDistances[currentContestableNode] <= finalSnukeDistances[currentContestableNode]) {
      fennecControlledNodeCount++; // Increment Fennec's control count
    }
  }

  // Calculate the total number of nodes that are "contestable" (not start/end nodes)
  const totalContestableNodes = totalVerticesCount - 2;
  // Calculate the number of nodes Snuke controls
  const snukeControlledNodeCount = totalContestableNodes - fennecControlledNodeCount;

  let declaredWinner = PLAYER_FENNEC_IDENTIFIER; // Fennec is the default winner

  // If Snuke controls an equal or greater number of contestable nodes, Snuke wins
  if (fennecControlledNodeCount <= snukeControlledNodeCount) {
    declaredWinner = PLAYER_SNUKE_IDENTIFIER;
  }

  // Output the name of the determined winner
  console.log(declaredWinner);
}

// Helper function to safely retrieve input data from standard input
function retrieveProgramInput() {
  try {
    // Check for Node.js environment to read from /dev/stdin
    if (typeof require === 'function' && typeof process === 'object' && process.stdin && typeof process.stdin.fd === 'number') {
      const fileSystem = require("fs");
      return fileSystem.readFileSync("/dev/stdin", "utf8");
    } else {
      // Fallback for non-Node.js environments or if stdin is unavailable
      console.warn("Could not read from /dev/stdin. Returning mock input for testing purposes.");
      return "4\n1 2\n2 3\n3 4"; // Example mock input
    }
  } catch (error) {
    console.error("An error occurred while reading input:", error.message);
    // Provide a default or throw an error depending on desired behavior
    return "2\n1 2"; // Minimal valid graph as fallback
  }
}

// Execute the main game logic with the acquired input data
determineGameOutcome(retrieveProgramInput());