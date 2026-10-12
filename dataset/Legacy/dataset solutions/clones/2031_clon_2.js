function processInput(rawData) {
  // This section parses the initial input string into numerical values.
  const parsedData = rawData.split(' ');
  const totalNodes = Number(parsedData[0]); // Represents the total number of nodes 'n'.
  const nodeX = Number(parsedData[1]);      // Represents the special node 'x'.
  const nodeY = Number(parsedData[2]);      // Represents the special node 'y'.

  // Helper function to compute the shortest distance between two given nodes.
  // It considers two paths: a direct path and a path potentially involving nodes 'x' and 'y'.
  function calculateDistance(startNode, endNode) {
    // The distance is the minimum of:
    // 1. The direct path length (endNode - startNode).
    // 2. The path length through nodeX and nodeY:
    //    |nodeX - startNode| (distance from startNode to nodeX)
    //    + |nodeY - endNode| (distance from nodeY to endNode)
    //    + 1 (distance between nodeX and nodeY).
    return Math.min(endNode - startNode, Math.abs(nodeX - startNode) + Math.abs(nodeY - endNode) + 1);
  }

  // Iterate through all possible distances 'currentDistance' from 1 up to 'totalNodes - 1'.
  for (let currentDistance = 1; currentDistance < totalNodes; currentDistance++) {
    // Initialize a counter for pairs of nodes that have the 'currentDistance' as their shortest path.
    let countPairs = 0;

    // Iterate through all possible starting nodes 'startNode'.
    // The loop ensures that 'startNode + currentDistance' does not exceed 'totalNodes'.
    for (let startNode = 1; startNode <= totalNodes - currentDistance; startNode++) {
      // Determine the potential target node if the path is a simple direct one.
      const targetNode = startNode + currentDistance;

      // Check if the 'targetNode' is within the valid range and if its calculated distance from 'startNode'
      // is exactly 'currentDistance'.
      if (targetNode <= totalNodes && calculateDistance(startNode, targetNode) === currentDistance) {
        countPairs++; // Increment the counter if a valid pair is found.
      }

      // Calculate the 'remainingDistance' needed if the path goes from 'startNode' to 'nodeX',
      // then to 'nodeY', and then to some other node.
      const remainingDistance = currentDistance - 1 - Math.abs(nodeX - startNode);

      // If 'remainingDistance' is positive, it means there's room to explore paths via 'nodeY'.
      if (remainingDistance > 0) {
        // Check for a 'previousNode' relative to 'nodeY' that could be 'currentDistance' away.
        const previousNode = nodeY - remainingDistance;
        // Ensure this 'previousNode' is not the same as 'targetNode' and its distance matches.
        if (previousNode !== targetNode && calculateDistance(startNode, previousNode) === currentDistance) {
          countPairs++;
        }

        // Check for a 'nextNode' relative to 'nodeY' that could be 'currentDistance' away.
        const nextNode = nodeY + remainingDistance;
        // Ensure this 'nextNode' is not the same as 'targetNode', is within bounds, and its distance matches.
        if (nextNode !== targetNode && nextNode <= totalNodes && calculateDistance(startNode, nextNode) === currentDistance) {
          countPairs++;
        }
      }
      // Special case: if 'remainingDistance' is zero, check if 'nodeY' itself is the target.
      else if (remainingDistance === 0 && nodeY !== targetNode && calculateDistance(startNode, nodeY) === currentDistance) {
        countPairs++;
      }
    }

    // Output the total number of pairs found for the current distance.
    console.log(countPairs);
  }
}

// Read the input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
