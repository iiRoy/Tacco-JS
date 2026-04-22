function ProcessInputData(rawDataString) {
  // Split the entire input string into individual lines for processing
  const lineSegments = rawDataString.split('\n');

  // Parse the first line to get graph dimensions: node count and constraint count
  const graphDimensions = lineSegments[0].split(' ').map(strVal => parseInt(strVal, 10));
  const nodeCount = graphDimensions[0];
  const constraintCount = graphDimensions[1];

  // Declare arrays to store the left indices, right indices, and difference values for each constraint
  let leftConstraintNodes = new Array();
  let rightConstraintNodes = new Array();
  let valueDifferences = new Array();

  // Initialize an array to hold the calculated values for each node, all starting at zero
  let nodeCalculatedValues = Array.from({ length: nodeCount }, () => 0);

  // Create an adjacency list-like structure to store relationships between nodes
  // Each element will be an array of [connected_node_index, difference_to_connected_node]
  let connectionMatrix = Array.from({ length: nodeCount });

  // The final result string, initially assuming consistency
  let resultStatus = "Yes";

  // Initialize each entry in the connectionMatrix as an empty array
  for (let vertexIndex = 0; vertexIndex < nodeCount; vertexIndex++) {
    connectionMatrix[vertexIndex] = new Array();
  }

  // Loop through each constraint line to populate the data structures
  for (let currentConstraintIndex = 0; currentConstraintIndex < constraintCount; currentConstraintIndex++) {
    // Parse the current constraint line: [source_node, target_node, difference]
    const currentConstraintDetails = lineSegments[currentConstraintIndex + 1].split(' ').map(numericString => parseInt(numericString, 10));

    // Store the 0-indexed right node and difference value
    rightConstraintNodes[currentConstraintIndex] = currentConstraintDetails[1] - 1;
    valueDifferences[currentConstraintIndex] = currentConstraintDetails[2];

    // Store the 0-indexed left node
    leftConstraintNodes[currentConstraintIndex] = currentConstraintDetails[0] - 1;

    // Add the constraint to the connection matrix:
    // From left node to right node with the specified difference
    connectionMatrix[leftConstraintNodes[currentConstraintIndex]].push(rightConstraintNodes[currentConstraintIndex], valueDifferences[currentConstraintIndex]);
    // From right node to left node with the negative of the difference (for inverse relationship)
    connectionMatrix[rightConstraintNodes[currentConstraintIndex]].push(leftConstraintNodes[currentConstraintIndex], -valueDifferences[currentConstraintIndex]);
  }

  // Iterate through each node to propagate values
  for (let currentVertex = 0; currentVertex < nodeCount; currentVertex++) {
    // Calculate the starting offset for processing pairs in the connection matrix for the current vertex
    let processingOffset = connectionMatrix[currentVertex].length - 2;
    // A queue to hold nodes that need further value propagation
    const propagationQueue = new Array();

    // If there are connections for the current vertex, start propagation
    if (processingOffset >= 0) {
      propagateNodeValue(currentVertex, processingOffset, propagationQueue, nodeCalculatedValues, connectionMatrix);
    }

    // Process nodes added to the propagation queue
    for (let queuePosition = 0; queuePosition < propagationQueue.length; queuePosition++) {
      // Recalculate offset for the node from the queue
      processingOffset = connectionMatrix[propagationQueue[queuePosition]].length - 2;
      // If connections exist for this queued node, propagate its values
      if (processingOffset >= 0) {
        propagateNodeValue(propagationQueue[queuePosition], processingOffset, propagationQueue, nodeCalculatedValues, connectionMatrix);
      }
    }
  }

  // Final check: verify all constraints using the calculated node values
  for (let verificationIndex = 0; verificationIndex < constraintCount; verificationIndex++) {
    // If a constraint is not satisfied, set the result to "No" and stop
    if (nodeCalculatedValues[rightConstraintNodes[verificationIndex]] - nodeCalculatedValues[leftConstraintNodes[verificationIndex]] !== valueDifferences[verificationIndex]) {
      resultStatus = "No";
      break;
    }
  }

  // Output the final consistency status
  console.log(resultStatus);

  // Helper function to propagate values from a source node to its connected nodes
  // It takes the source node index, an offset into its connection data,
  // references to the propagation queue, node values, and connection matrix
  function propagateNodeValue(sourceNode, offsetIndex, queueRef, valuesRef, adjRef) {
    do {
      // Get the target node index from the connection matrix
      const targetNode = adjRef[sourceNode][offsetIndex];
      // If the target node has connections, add it to the queue for future propagation
      if (adjRef[targetNode].length > 0) {
        queueRef.push(targetNode);
      }
      // Calculate the value of the target node based on the source node's value and the difference
      valuesRef[targetNode] = valuesRef[sourceNode] + adjRef[sourceNode][offsetIndex + 1];
      // Move to the next pair of [connected_node, difference] in the connection data
      offsetIndex -= 2;
    } while (offsetIndex >= 0); // Continue as long as there are pairs to process

    // Clear the connection data for the source node after it has been processed
    // This prevents redundant processing and marks the node as "visited" for this propagation phase
    adjRef[sourceNode] = new Array();
  }
}

// Read input from standard input and pass it to the main processing function
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));