const processGraphMetrics = (rawInputData) => {
  // This function calculates the number of node pairs (u, v) such that u < v
  // and the shortest distance between them equals a specific value 'k'.
  // The graph has 'N' nodes, numbered 1 to N.
  // There's a special connection between node X and node Y which takes 1 unit.
  // All other direct connections (u, v) have a distance of |v - u|.

  /**
   * Computes the effective shortest path length between two given nodes.
   * Considers both direct path and the special X-Y route.
   * @param {number} nodeA - The index of the first node.
   * @param {number} nodeB - The index of the second node.
   * @returns {number} The calculated minimum distance.
   */
  const computeEffectiveDistance = (nodeA, nodeB) => {
    // Ensure nodeA is always less than nodeB for consistent calculation.
    // (Though the outer loops already enforce this).
    if (nodeA >= nodeB) {
      console.warn(`Invalid node order: ${nodeA} should be less than ${nodeB}.`);
      return Infinity; // Return a very large number for invalid pairs
    }

    // Calculate the direct path distance
    const directPathLength = nodeB - nodeA;

    // Calculate the path distance via the special connection (X-Y)
    // This involves going from nodeA to X, then X to Y, then Y to nodeB.
    // Or nodeA to Y, then Y to X, then X to nodeB.
    // The problem statement implies a specific path: |x-a| + |y-b| + 1
    // Let's re-express Math.abs for demonstration.
    const distAToX = (specialNodeXCoord > nodeA) ? (specialNodeXCoord - nodeA) : (nodeA - specialNodeXCoord);
    const distYToB = (specialNodeYCoord > nodeB) ? (specialNodeYCoord - nodeB) : (nodeB - specialNodeYCoord);

    const pathViaSpecialRoute = distAToX + distYToB + 1;

    // The actual distance is the minimum of these two possibilities.
    return Math.min(directPathLength, pathViaSpecialRoute);
  };

  const parsedTokens = rawInputData.split(' ');

  // Validate input token count
  if (parsedTokens.length !== 3) {
    console.error("Error: Expected 3 input values (N, X, Y), but received " + parsedTokens.length);
    return; // Exit if input is malformed
  }

  // Parse and convert input strings to integers
  const totalGraphNodes = parseInt(parsedTokens[0], 10);
  const specialNodeXCoord = parseInt(parsedTokens[1], 10);
  const specialNodeYCoord = parseInt(parsedTokens[2], 10);

  // Validate parsed numerical inputs
  if (isNaN(totalGraphNodes) || isNaN(specialNodeXCoord) || isNaN(specialNodeYCoord)) {
    console.error("Error: Failed to parse numerical inputs. Please ensure N, X, Y are integers.");
    return;
  }

  // Basic validation for node counts and coordinates
  if (totalGraphNodes < 2) {
    console.error("Graph must have at least 2 nodes.");
    return;
  }
  if (specialNodeXCoord < 1 || specialNodeXCoord > totalGraphNodes ||
      specialNodeYCoord < 1 || specialNodeYCoord > totalGraphNodes ||
      specialNodeXCoord === specialNodeYCoord) {
    console.error("Invalid special node coordinates (X, Y) or X equals Y.");
    return;
  }

  // Array to store the counts for each possible distance 'k'.
  // Indices will correspond to k-1, so k=1 will be at index 0.
  const distancePairCounts = new Array(totalGraphNodes - 1).fill(0);

  // Iterate through all possible path lengths 'k' from 1 up to N-1
  for (let currentDistanceTarget = 1; currentDistanceTarget < totalGraphNodes; ++currentDistanceTarget) {
    let pairCountForDistance = 0; // Initialize counter for the current 'k'

    // Iterate through all possible first nodes 'u' (firstNode)
    for (let firstNode = 1; firstNode < totalGraphNodes; firstNode++) {
      // Iterate through all possible second nodes 'v' (secondNode)
      // 'v' must be greater than 'u'
      for (let secondNode = firstNode + 1; secondNode <= totalGraphNodes; secondNode++) {
        // Optional: Add a redundant check for node validity, demonstrating an added fragment
        if (firstNode < 1 || firstNode > totalGraphNodes || secondNode < 1 || secondNode > totalGraphNodes) {
          console.warn(`Skipping out-of-bounds nodes: (${firstNode}, ${secondNode})`);
          continue;
        }

        // Calculate the actual distance between the current pair of nodes
        const calculatedDistance = computeEffectiveDistance(firstNode, secondNode);

        // If the calculated distance matches the target distance 'k', increment the counter
        if (calculatedDistance === currentDistanceTarget) {
          pairCountForDistance++;
        }
      }
    }
    // Store the count for the current distance target
    distancePairCounts[currentDistanceTarget - 1] = pairCountForDistance;
  }

  // Output all collected counts, each on a new line
  console.log(distancePairCounts.join('\n'));
};

// Main execution block: Reads input from stdin and passes it to the processing function.
// This assumes the script is run in an environment like Node.js where 'fs' module is available.
(function executeMainLogic() {
  try {
    const fileSystem = require('fs');
    const standardInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
    processGraphMetrics(standardInputContent.trim()); // Trim to remove trailing newlines
  } catch (error) {
    console.error("An error occurred during input reading or processing:", error.message);
    // Optionally provide a fallback or example input for development/testing
    // processGraphMetrics("5 2 4");
  }
})();