// This module provides a graph analysis utility to determine a winner
// based on shortest path distances from two distinct starting points.

/**
 * Executes a comprehensive graph analysis based on provided input data.
 * It calculates shortest path distances from two specific nodes (0 and N-1)
 * and then determines a winner ("Fennec" or "Snuke") by comparing these distances.
 *
 * @param {string} rawInputData - The raw input string, typically from stdin,
 *                                 where the first line is the number of vertices (N),
 *                                 and subsequent N-1 lines define graph edges (u v).
 */
function ProcessGraphGame(rawInputData) {
  // Input validation: Ensure data exists before processing.
  if (!rawInputData || typeof rawInputData !== 'string' || rawInputData.trim() === '') {
    console.error("Error: No input data provided or data is empty.");
    return;
  }

  // Split the input string into individual lines for easier parsing.
  const inputLines = rawInputData.split('\n');

  // Parse the total number of vertices (nodes) from the first line.
  const totalVertices = parseInt(inputLines[0], 10);

  // Validate the parsed number of vertices.
  if (isNaN(totalVertices) || totalVertices < 1) {
    console.error("Error: Invalid or insufficient number of vertices specified.");
    return;
  }
  if (totalVertices === 1) {
    // Edge case: A single node graph. No intermediate nodes to compare.
    // Fennec (node 0) and Snuke (node N-1, which is also 0) are at the same spot.
    // The problem implies N >= 2 for meaningful comparison.
    console.log("Snuke"); // Arbitrary decision for single node, based on problem constraints.
    return;
  }

  // Initialize distance arrays for two competing entities:
  // 'distancesFromFirst' for paths originating from vertex 0.
  // 'distancesFromLast' for paths originating from vertex (totalVertices - 1).
  // Each element is initially set to 'totalVertices' (representing infinity in this context).
  const distancesFromFirst = new Array(totalVertices).fill(totalVertices);
  distancesFromFirst[0] = 0; // Distance from vertex 0 to itself is 0.

  const distancesFromLast = new Array(totalVertices).fill(totalVertices);
  distancesFromLast[totalVertices - 1] = 0; // Distance from vertex (N-1) to itself is 0.

  // Construct the graph's adjacency list.
  // Each element in 'graphAdjacencies' is an array holding the indices of its neighbors.
  // Using `Array.from` with a mapping function ensures each inner array is a distinct object.
  const graphAdjacencies = Array.from({ length: totalVertices }, () => []);

  // Iterate through the remaining input lines to add edges to the graph.
  // Edges start from the second line (index 1) up to `totalVertices - 1` edges.
  for (let lineIdx = 1; lineIdx < inputLines.length; lineIdx++) {
    const currentLine = inputLines[lineIdx];
    if (!currentLine) continue; // Skip empty lines

    const nodePair = currentLine.split(' ').map(str => parseInt(str, 10));

    // Input validation for edge data.
    if (nodePair.length !== 2 || isNaN(nodePair[0]) || isNaN(nodePair[1])) {
      console.warn(`Warning: Malformed edge data on line ${lineIdx + 1}. Skipping.`);
      continue;
    }

    // Convert 1-based node indices from input to 0-based for array access.
    const nodeA = nodePair[0] - 1;
    const nodeB = nodePair[1] - 1;

    // Validate node indices against graph boundaries.
    if (nodeA < 0 || nodeA >= totalVertices || nodeB < 0 || nodeB >= totalVertices) {
      console.warn(`Warning: Edge on line ${lineIdx + 1} contains out-of-bounds node indices (${nodeA + 1}, ${nodeB + 1}). Skipping.`);
      continue;
    }

    // Add bidirectional connections to the adjacency list.
    // Check for existence to prevent duplicate entries for robustness,
    // though for simple graphs, this might be optional.
    if (!graphAdjacencies[nodeA].includes(nodeB)) {
      graphAdjacencies[nodeA].push(nodeB);
    }
    if (!graphAdjacencies[nodeB].includes(nodeA)) {
      graphAdjacencies[nodeB].push(nodeA);
    }
  }

  /**
   * Performs a Breadth-First Search (BFS) to compute shortest path distances
   * from a specified starting node to all other reachable nodes in an unweighted graph.
   *
   * @param {number} initialNode - The index of the node to start the BFS from.
   * @param {number[]} distArrayRef - A reference to the distance array to be updated.
   * @param {number[][]} adjacencies - The graph's adjacency list.
   * @returns {number[]} The updated distance array after BFS completion.
   */
  const computeBFSShortestPaths = (initialNode, distArrayRef, adjacencies) => {
    const bfsQueue = [];
    bfsQueue.push(initialNode); // Enqueue the starting node.

    let currentQueueHead = 0; // Pointer to simulate efficient dequeuing.

    // Continue as long as there are nodes in the queue to process.
    while (currentQueueHead < bfsQueue.length) {
      const activeNode = bfsQueue[currentQueueHead++]; // Dequeue the current node.

      // Explore all neighbors of the active node.
      for (const neighborNode of adjacencies[activeNode]) {
        // If a shorter path to the neighbor is discovered, update its distance
        // and add it to the queue for further exploration.
        if (distArrayRef[neighborNode] > distArrayRef[activeNode] + 1) {
          distArrayRef[neighborNode] = distArrayRef[activeNode] + 1;
          bfsQueue.push(neighborNode);
        }
      }
    }
    return distArrayRef;
  };

  // Calculate shortest distances from node 0 (Fennec's starting point).
  const fennecPathDistances = computeBFSShortestPaths(0, distancesFromFirst, graphAdjacencies);

  // Calculate shortest distances from node (totalVertices - 1) (Snuke's starting point).
  const snukePathDistances = computeBFSShortestPaths(totalVertices - 1, distancesFromLast, graphAdjacencies);

  // Determine the number of "intermediate" nodes (excluding start and end)
  // that are closer to Fennec's starting point (node 0).
  let fennecCloserCount = 0;
  const countOfIntermediateNodes = totalVertices - 2;

  // Iterate through all nodes *except* the two designated start/end nodes.
  for (let nodeIdx = 1; nodeIdx < totalVertices - 1; nodeIdx++) {
    // If a node is closer to or equidistant from Fennec's start than Snuke's.
    if (fennecPathDistances[nodeIdx] <= snukePathDistances[nodeIdx]) {
      fennecCloserCount++;
    }
  }

  // Decide the winner based on the count of nodes Fennec controls.
  // Fennec wins if they control strictly more than half of the intermediate nodes.
  // Snuke wins if Fennec controls half or fewer.
  // The original condition `x <= n-2-x` translates to `2 * x <= n-2`.
  // Here, `fennecCloserCount <= countOfIntermediateNodes - fennecCloserCount`
  // is the equivalent logic.
  let finalResult = "Fennec"; // Assume Fennec wins by default.

  if (fennecCloserCount <= countOfIntermediateNodes - fennecCloserCount) {
    finalResult = "Snuke";
  }

  // Output the final winner to standard output.
  console.log(`${finalResult}`);
}

// Entry point for execution: Read input from standard input and pass to the main function.
ProcessGraphGame(require("fs").readFileSync("/dev/stdin", "utf8"));