function ProcessInput(rawData) {
  // Split the raw input string into individual lines
  let processedLines = rawData.split("\n");

  // Parse the total number of nodes from the first line
  let nodeCount = parseInt(processedLines[0]);

  // Initialize arrays to store the edges of the graph
  // Each edge connects edgeStartNodes[idx] and edgeEndNodes[idx]
  let edgeStartNodes = new Array(nodeCount - 1).fill(0);
  let edgeEndNodes = new Array(nodeCount - 1).fill(0);

  // Populate the edge arrays from the input lines
  for (let idx = 0; idx < nodeCount - 1; idx++) {
    // Split each line to get the two connected nodes
    let lineParts = processedLines[idx + 1].split(" ");
    // Store nodes, adjusting to 0-based indexing
    edgeStartNodes[idx] = parseInt(lineParts[0]) - 1;
    edgeEndNodes[idx] = parseInt(lineParts[1]) - 1;
  }

  // Initialize distance arrays for two different starting points
  // distancesFromStart will store distances from node 0
  let distancesFromStart = new Array(nodeCount).fill(nodeCount);
  distancesFromStart[0] = 0; // Node 0 is 0 distance from itself

  // distancesFromEnd will store distances from node (nodeCount - 1)
  let distancesFromEnd = new Array(nodeCount).fill(nodeCount);
  distancesFromEnd[nodeCount - 1] = 0; // Node (nodeCount - 1) is 0 distance from itself

  /**
   * Calculates shortest path distances from a given starting node to all other nodes
   * using a custom Dijkstra-like approach.
   * @param {number} currentNode The current node being processed.
   * @param {number[]} pathDistances An array to store and update distances.
   * @returns {number[]} The updated pathDistances array.
   */
  function calculateShortestPaths(currentNode, pathDistances) {
    // Initialize a list of all unvisited nodes
    let unvisitedNodes = new Array(nodeCount);
    for (let idx = 0; idx < nodeCount; idx++) {
      unvisitedNodes[idx] = idx;
    }

    // Continue as long as there are unvisited nodes
    while (unvisitedNodes.length !== 0) {
      // Iterate through all edges to relax distances from the currentNode
      for (let idx = 0; idx < nodeCount - 1; idx++) {
        // If edgeStartNodes[idx] is the currentNode and a shorter path to edgeEndNodes[idx] is found
        if (edgeStartNodes[idx] === currentNode && pathDistances[edgeEndNodes[idx]] > pathDistances[edgeStartNodes[idx]]) {
          pathDistances[edgeEndNodes[idx]] = pathDistances[edgeStartNodes[idx]] + 1;
        }
        // If edgeEndNodes[idx] is the currentNode and a shorter path to edgeStartNodes[idx] is found
        if (edgeEndNodes[idx] === currentNode && pathDistances[edgeStartNodes[idx]] > pathDistances[edgeEndNodes[idx]]) {
          pathDistances[edgeStartNodes[idx]] = pathDistances[edgeEndNodes[idx]] + 1;
        }
      }

      // Remove the currentNode from the list of unvisited nodes
      unvisitedNodes.splice(unvisitedNodes.indexOf(currentNode), 1);

      // Find the next currentNode (node with the minimum distance) from the remaining unvisited nodes
      let minDistance = nodeCount; // Initialize with a value larger than any possible distance
      for (let idx = 0; idx < unvisitedNodes.length; idx++) {
        if (pathDistances[unvisitedNodes[idx]] < minDistance) {
          currentNode = unvisitedNodes[idx]; // Update currentNode to the node with minimum distance
          minDistance = pathDistances[unvisitedNodes[idx]]; // Update minimum distance
        }
      }
    }
    return pathDistances;
  }

  // Calculate distances from node 0
  distancesFromStart = calculateShortestPaths(0, distancesFromStart);
  // Calculate distances from node (nodeCount - 1)
  distancesFromEnd = calculateShortestPaths(nodeCount - 1, distancesFromEnd);

  // Count nodes that are closer to node 0 (Fennec's starting point)
  let fennecAdvantageCount = 0;
  for (let idx = 0; idx < nodeCount; idx++) {
    // Exclude the start and end nodes themselves from the comparison
    if (idx !== 0 && idx !== nodeCount - 1) {
      if (distancesFromStart[idx] <= distancesFromEnd[idx]) {
        fennecAdvantageCount++;
      }
    }
  }

  // Determine the winner based on the count of advantageous nodes
  let winnerName = "Fennec";
  // If Fennec's advantageous nodes are less than or equal to Snuke's
  if (fennecAdvantageCount <= (nodeCount - 2 - fennecAdvantageCount)) {
    winnerName = "Snuke";
  }

  // Output the winner's name
  console.log('%s', winnerName);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
