function ProcessInputData(rawDataString) {
  // Split the entire input string into an array of individual lines.
  const linesArray = rawDataString.split("\n");

  // Parse the first line to get the number of nodes and constraints.
  // The first line contains two space-separated integers.
  const dimensionsArray = linesArray[0].split(" ").map(currentElement => Number.parseInt(currentElement, 10));

  // Extract the total number of nodes (N) in the graph.
  const nodeCount = dimensionsArray[0];

  // Extract the total number of constraints (M) or edges.
  const constraintCount = dimensionsArray[1];

  // Initialize arrays to store details for each constraint.
  // leftIndices will hold the starting node for a constraint.
  const leftIndices = [];
  // rightIndices will hold the ending node for a constraint.
  const rightIndices = [];
  // differenceValues will store the required difference between right and left nodes.
  const differenceValues = [];

  // An array to store the calculated value for each node.
  // Initialized to zero, as this is a relative value problem.
  const nodeValues = new Array(nodeCount).fill(0);

  // An adjacency list to represent the graph, storing connections
  // and the associated differences. Each element is an array of [neighbor, diff].
  const adjacencyList = new Array(nodeCount);

  // Initialize the result string, assuming "Yes" until a contradiction is found.
  let resultStatus = "Yes";

  // Prepare each element of the adjacency list as an empty array.
  for (let idx = 0; idx < nodeCount; idx++) {
    adjacencyList[idx] = [];
  }

  // Iterate through each constraint line to populate graph data.
  // Constraints start from the second line of input (index 1).
  for (let idx = 0; idx < constraintCount; idx++) {
    // Parse the current constraint line into its components.
    const currentConstraintDetails = linesArray[idx + 1].split(" ").map(elementStr => Number.parseInt(elementStr, 10));

    // Store the right node index (0-based).
    rightIndices[idx] = currentConstraintDetails[1] - 1;
    // Store the required difference value.
    differenceValues[idx] = currentConstraintDetails[2];
    // Store the left node index (0-based).
    leftIndices[idx] = currentConstraintDetails[0] - 1;

    // Add connections to the adjacency list for both directions.
    // For L -> R, store [R, D].
    adjacencyList[leftIndices[idx]].push(rightIndices[idx], differenceValues[idx]);
    // For R -> L, store [L, -D] (reverse difference).
    adjacencyList[rightIndices[idx]].push(leftIndices[idx], -differenceValues[idx]);
  }

  // First pass: Propagate values from connected components.
  // Iterate over each node to start value propagation if it has connections.
  for (let idx = 0; idx < nodeCount; idx++) {
    // The adjacency list stores pairs [neighbor_idx, difference_value].
    // We need to process from the end, two elements at a time.
    let currentOffset = adjacencyList[idx].length - 2;

    // If there are connections for this node, initiate propagation.
    if (currentOffset >= 0) {
      propagateValues(adjacencyList[idx], idx, currentOffset);
    }
  }

  // Second pass: Verify all initial constraints against calculated node values.
  for (let idx = 0; idx < constraintCount; idx++) {
    // Check if the calculated difference between right and left nodes
    // matches the required difference for the current constraint.
    if (nodeValues[rightIndices[idx]] - nodeValues[leftIndices[idx]] !== differenceValues[idx]) {
      // If a mismatch is found, the constraints are inconsistent.
      resultStatus = "No";
      break; // No need to check further constraints.
    }
  }

  // Output the final consistency status.
  console.info(resultStatus);

  // Recursive helper function to propagate node values through connected components.
  // neighborData: The adjacency list for a specific source node, modified in place.
  // sourceNodeIdx: The index of the node whose value is already known or being set.
  // currentOffset: The current position in neighborData to process (points to a neighbor index).
  function propagateValues(neighborData, sourceNodeIdx, currentOffset) {
    // Get the index of the connected node.
    const connectedNodeIdx = neighborData[currentOffset];

    // Calculate the value for the connected node based on the source node's value
    // and the known difference.
    nodeValues[connectedNodeIdx] = nodeValues[sourceNodeIdx] + neighborData[currentOffset + 1];

    // Mark these two processed elements as "removed" by shortening the array.
    // This prevents reprocessing them in the same traversal.
    neighborData.length = currentOffset;

    // Move to the next pair of elements (previous in the original array).
    currentOffset -= 2;

    // Continue propagation within the current neighborData list if more elements exist.
    if (currentOffset >= 0) {
      propagateValues(neighborData, sourceNodeIdx, currentOffset);
    }

    // After processing direct neighbors, recursively propagate from the newly
    // valued connected node to its own neighbors.
    let nextPropagateOffset = adjacencyList[connectedNodeIdx].length - 2;
    if (nextPropagateOffset >= 0) {
      propagateValues(adjacencyList[connectedNodeIdx], connectedNodeIdx, nextPropagateOffset);
    }
  }
}

// Read input from standard input and pass it to the main processing function.
ProcessInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));