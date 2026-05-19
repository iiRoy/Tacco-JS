"use strict";

// This function processes the input data to calculate path counts in a graph.
function processInput(rawData) {
  // Parse the initial line of input, splitting by space and converting to integers.
  const parsedNumbers = rawData[0].trim().split(" ").map(currentVal => parseInt(currentVal, 10));

  // Extract the number of nodes (N), and the two special nodes (X and Y).
  const nodeCount = parsedNumbers[0];
  const specialNodeA = parsedNumbers[1];
  const specialNodeB = parsedNumbers[2];

  // Initialize an array to store the frequency of each path length.
  // The maximum possible distance is N-1, so we need N-1 slots (0 to N-2).
  let pathCounts = [];
  for (let idx = 0; idx < nodeCount - 1; idx++) {
    pathCounts[idx] = 0; // Set initial count for each distance to zero.
  }

  // Iterate through all possible pairs of distinct nodes (i, j) where i < j.
  for (let startNode = 1; startNode <= nodeCount; startNode++) {
    for (let endNode = startNode + 1; endNode <= nodeCount; endNode++) {
      // Calculate the standard Euclidean distance between nodes.
      let directDistance = Math.abs(endNode - startNode);

      // Calculate the alternative path distance using the special nodes X and Y.
      // This involves going from 'startNode' to 'specialNodeA', then to 'specialNodeB', then to 'endNode'.
      // The '+1' accounts for the edge between specialNodeA and specialNodeB.
      let alternativeDistance = Math.abs(specialNodeA - startNode) + Math.abs(specialNodeB - endNode) + 1;

      // Determine the shortest path length between the current pair of nodes.
      let calculatedPathLength = Math.min(directDistance, alternativeDistance);

      // Increment the counter for this specific path length.
      // Distances are 1-indexed, array is 0-indexed, so subtract 1.
      pathCounts[calculatedPathLength - 1]++;
    }
  }

  // Output the frequency of each path length from 1 to N-1.
  for (let outputIdx = 0; outputIdx < nodeCount - 1; outputIdx++) {
    console.log(pathCounts[outputIdx]);
  }
}

// Read input from standard input, process it, and pass it to the main function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
