function ProcessInput(rawData) {
  // Split the entire input string into individual lines for processing.
  let parsedLines = rawData.split("\n");

  // The first line contains the total number of nodes in the graph.
  const nodeCount = parseInt(parsedLines[0]);

  // Initialize an array to store distances from the starting node (node 0, Fennec's position).
  // All distances are initially set to a large value (nodeCount) to represent infinity.
  let distFromStart = new Array(nodeCount).fill(nodeCount);
  distFromStart[0] = 0; // The distance from the start node to itself is zero.

  // Initialize another array for distances from the ending node (node n-1, Snuke's position).
  let distFromEnd = new Array(nodeCount).fill(nodeCount);
  distFromEnd[nodeCount - 1] = 0; // The distance from the end node to itself is zero.

  /**
   * Computes the shortest path distances from a specified initial node to all other nodes
   * using a simplified Dijkstra-like approach.
   *
   * @param {number} initialNode - The starting node for distance calculation.
   * @param {number[]} distanceArray - The array to store and update distances.
   * @returns {number[]} The updated distance array.
   */
  function calculateDistances(initialNode, distanceArray) {
    // Create a list of all nodes, representing the set of unvisited nodes.
    let unvisitedNodes = new Array(nodeCount);
    for (let idx = 0; idx < nodeCount; idx++) {
      unvisitedNodes[idx] = idx;
    }

    // Continue as long as there are unvisited nodes in the queue.
    while (unvisitedNodes.length !== 0) {
      // Iterate through all given edges to potentially update distances.
      // The input format implies n-1 edges follow the first line.
      for (let idx = 0; idx < nodeCount - 1; idx++) {
        // Parse the two endpoints of the current edge.
        const edgeData = parsedLines[idx + 1].split(" ");
        const nodeA = parseInt(edgeData[0]) - 1; // Adjust to 0-indexed.
        const nodeB = parseInt(edgeData[1]) - 1; // Adjust to 0-indexed.

        // If nodeA is the current node being processed and nodeB's distance can be shortened
        if (nodeA === initialNode && distanceArray[nodeB] > distanceArray[nodeA]) {
          distanceArray[nodeB] = distanceArray[nodeA] + 1;
        }
        // If nodeB is the current node being processed and nodeA's distance can be shortened
        if (nodeB === initialNode && distanceArray[nodeA] > distanceArray[nodeB]) {
          distanceArray[nodeA] = distanceArray[nodeB] + 1;
        }
      }

      // Remove the current node from the set of unvisited nodes.
      unvisitedNodes.splice(unvisitedNodes.indexOf(initialNode), 1);

      // Find the next node to process: the unvisited node with the smallest known distance.
      let minDistance = nodeCount; // Initialize with a value greater than any possible path length.
      for (let idx = 0; idx < unvisitedNodes.length; idx++) {
        const candidateNode = unvisitedNodes[idx];
        if (distanceArray[candidateNode] < minDistance) {
          initialNode = candidateNode; // Update the current node to the one with the minimum distance.
          minDistance = distanceArray[candidateNode];
        }
      }
    }
    return distanceArray; // Return the array of calculated shortest distances.
  }

  // Calculate shortest distances from node 0 (Fennec's starting point).
  distFromStart = calculateDistances(0, distFromStart);
  // Calculate shortest distances from node n-1 (Snuke's starting point).
  distFromEnd = calculateDistances(nodeCount - 1, distFromEnd);

  // Count how many nodes are closer to Fennec's start (node 0) or equidistant,
  // excluding the start and end nodes themselves.
  let fennecScore = 0;
  for (let idx = 0; idx < nodeCount; idx++) {
    // Only consider intermediate nodes, not the fixed start (0) or end (n-1) points.
    if (idx !== 0 && idx !== nodeCount - 1) {
      if (distFromStart[idx] <= distFromEnd[idx]) {
        fennecScore++;
      }
    }
  }

  // Determine the winner based on the calculated scores.
  let winnerName = "Fennec";
  // The condition checks if Fennec's score is less than or equal to Snuke's score.
  // Snuke's score is (total intermediate nodes) - (Fennec's score).
  // Total intermediate nodes = n - 2.
  if (fennecScore <= (nodeCount - 2) - fennecScore) {
    winnerName = "Snuke";
  }

  // Output the name of the winner.
  console.log('%s', winnerName);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
