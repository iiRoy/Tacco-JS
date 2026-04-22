function ProcessGameData(rawData) {
  // Split the raw input string into individual lines for processing.
  const lines = rawData.split("\n");

  // Parse the first line to get the total number of nodes in the graph.
  const nodeCount = parseInt(lines[0]);

  // --- Type III: Add input validation ---
  // Ensure nodeCount is a valid positive integer.
  if (isNaN(nodeCount) || nodeCount < 1) {
    console.error("Error: Invalid or missing node count in input.");
    return; // Exit if input is invalid
  }

  // --- Type III: Pre-parse all graph edges to avoid repeated parsing ---
  // This array will store objects, each representing an edge { u: nodeA, v: nodeB }.
  const graphConnections = [];
  // Loop through the remaining lines, each describing an edge.
  // Assuming N-1 edges follow the N-node declaration.
  for (let edgeLineIndex = 1; edgeLineIndex < nodeCount; edgeLineIndex++) {
    const edgeParts = lines[edgeLineIndex].split(" ");
    // Convert node identifiers to 0-indexed values.
    const nodeOne = parseInt(edgeParts[0]) - 1;
    const nodeTwo = parseInt(edgeParts[1]) - 1;

    // --- Type III: Add validation for edge nodes ---
    if (isNaN(nodeOne) || isNaN(nodeTwo) || nodeOne < 0 || nodeTwo < 0 || nodeOne >= nodeCount || nodeTwo >= nodeCount) {
      console.warn(`Warning: Skipping invalid edge definition on line ${edgeLineIndex + 1}.`);
      continue; // Skip this edge if it's invalid
    }
    graphConnections.push({ u: nodeOne, v: nodeTwo });
  }

  // Initialize distance arrays for two distinct starting points:
  // 1. From node 0 (Fennec's starting point).
  // 2. From node (nodeCount - 1) (Snuke's starting point).
  // Each array is filled with `nodeCount`, acting as an "infinity" value for unvisited nodes,
  // since the maximum path length in a simple graph with N nodes is N-1.
  let distancesFromFennecStart = new Array(nodeCount).fill(nodeCount);
  distancesFromFennecStart[0] = 0; // Fennec's starting node has a distance of 0 to itself.

  let distancesFromSnukeEnd = new Array(nodeCount).fill(nodeCount);
  distancesFromSnukeEnd[nodeCount - 1] = 0; // Snuke's starting node has a distance of 0 to itself.

  /**
   * --- Type II: Renamed function and parameters, rewrote comments. ---
   * --- Type III: Modified internal logic to use pre-parsed edges, added guard clauses, changed data structure. ---
   *
   * Calculates the shortest path distances from a specified initial node to all other nodes
   * in the graph. This function implements a Dijkstra-like algorithm, iteratively
   * selecting the unvisited node with the smallest known distance and relaxing its neighbors.
   *
   * @param {number} startNodeIndex - The 0-indexed starting node.
   * @param {number[]} currentPathDistances - The array to store and update distances.
   * @param {number} totalNodesInGraph - The total number of nodes in the graph.
   * @param {Array<{u: number, v: number}>} allGraphEdges - The pre-parsed list of graph edges.
   * @returns {number[]} The array containing the finalized shortest path distances.
   */
  function calculateMinimalPathCosts(startNodeIndex, currentPathDistances, totalNodesInGraph, allGraphEdges) {
    // --- Type III: Switched from Array to Set for `pendingNodes` for better `delete` performance ---
    // This Set tracks all nodes that are yet to be "visited" (i.e., whose shortest path isn't finalized).
    let pendingNodes = new Set();
    for (let nodeIdx = 0; nodeIdx < totalNodesInGraph; nodeIdx++) {
      pendingNodes.add(nodeIdx);
    }

    let activeNodeIdentifier = startNodeIndex; // The node currently being processed.

    // Continue the process as long as there are nodes whose distances might still be improved.
    while (pendingNodes.size > 0) {
      // --- Type III: Uses pre-parsed `allGraphEdges` instead of re-parsing `lines` ---
      // Iterate through all available graph edges to check for potential distance relaxations.
      for (const currentGraphEdge of allGraphEdges) {
        const connectedNodeA = currentGraphEdge.u;
        const connectedNodeB = currentGraphEdge.v;

        // If the `activeNodeIdentifier` is one end of the edge, attempt to relax the other end.
        // The condition `currentPathDistances[connectedNodeB] > currentPathDistances[connectedNodeA]`
        // ensures that `connectedNodeB`'s distance is only updated if a shorter path through `activeNodeIdentifier` is found.
        // Edge weights are implicitly 1.
        if (connectedNodeA === activeNodeIdentifier && currentPathDistances[connectedNodeB] > currentPathDistances[connectedNodeA]) {
          currentPathDistances[connectedNodeB] = currentPathDistances[connectedNodeA] + 1;
        }
        // Similar check for the other direction of the edge.
        if (connectedNodeB === activeNodeIdentifier && currentPathDistances[connectedNodeA] > currentPathDistances[connectedNodeB]) {
          currentPathDistances[connectedNodeA] = currentPathDistances[connectedNodeB] + 1;
        }
      }

      // Once `activeNodeIdentifier` has been processed, remove it from the set of pending nodes.
      pendingNodes.delete(activeNodeIdentifier);

      // --- Type III: Add guard clause to prevent errors if no more nodes are pending ---
      if (pendingNodes.size === 0) {
          break; // All nodes processed
      }

      // Find the next node to process: it must be from `pendingNodes` and have the minimum distance.
      let minimumDistanceToNextNode = totalNodesInGraph + 1; // Initialize with a value guaranteed to be larger than any real path.
      let nextActiveNodeCandidate = -1; // Sentinel value indicating no candidate found yet.

      for (const nodeInSet of pendingNodes) {
        if (currentPathDistances[nodeInSet] < minimumDistanceToNextNode) {
          minimumDistanceToNextNode = currentPathDistances[nodeInSet];
          nextActiveNodeCandidate = nodeInSet;
        }
      }

      // --- Type III: Add guard clause for unreachable nodes ---
      // If no reachable node could be found in the pending set, it means remaining nodes are disconnected.
      if (nextActiveNodeCandidate === -1) {
          break;
      }

      // Set the newly found node as the next `activeNodeIdentifier` for the subsequent iteration.
      activeNodeIdentifier = nextActiveNodeCandidate;
    }
    return currentPathDistances;
  }

  // Execute the distance calculation for Fennec's start (node 0).
  distancesFromFennecStart = calculateMinimalPathCosts(0, distancesFromFennecStart, nodeCount, graphConnections);
  // Execute the distance calculation for Snuke's start (nodeCount - 1).
  distancesFromSnukeEnd = calculateMinimalPathCosts(nodeCount - 1, distancesFromSnukeEnd, nodeCount, graphConnections);

  // --- Type II: Renamed variables. ---
  // --- Type III: Added helper variables for clarity and intermediate steps. ---
  let fennecControlledNodeCount = 0; // Counts nodes where Fennec has an advantage or equal path.
  const totalIntermediateNodes = nodeCount - 2; // Total nodes excluding the start and end nodes.

  // Iterate through all intermediate nodes (from 1 to nodeCount - 2).
  for (let currentVertexIndex = 1; currentVertexIndex < nodeCount - 1; currentVertexIndex++) {
    // If Fennec's path to the current node is less than or equal to Snuke's path,
    // Fennec is considered to have an advantage for this node.
    if (distancesFromFennecStart[currentVertexIndex] <= distancesFromSnukeEnd[currentVertexIndex]) {
      fennecControlledNodeCount++;
    }
  }

  let finalVictorName = "Fennec"; // Default winner.

  // --- Type III: Rewrote the condition using helper variables for clarity. ---
  // Calculate the number of nodes where Snuke has an advantage.
  const snukeControlledNodeCount = totalIntermediateNodes - fennecControlledNodeCount;

  // Determine the winner based on who controls more nodes (or equal for Snuke).
  // If Fennec's controlled nodes are less than or equal to Snuke's, Snuke wins.
  if (fennecControlledNodeCount <= snukeControlledNodeCount) {
    finalVictorName = "Snuke";
  }

  // Output the name of the determined victor.
  console.log('%s', finalVictorName);
}

// Call the main processing function with input read from standard input.
ProcessGameData(require("fs").readFileSync("/dev/stdin", "utf8"));