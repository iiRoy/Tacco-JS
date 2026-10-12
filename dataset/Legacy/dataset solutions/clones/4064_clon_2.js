function ProcessInputData(rawData) {
  // Split the entire input string into individual lines for easier processing.
  rawData = rawData.split("\n");

  // Parse the first line of input, which contains two space-separated integers.
  // The first integer represents the total number of nodes, and the second is the count of constraints.
  var firstLineValues = rawData[0].split(" ").map(strVal => parseInt(strVal, 10));

  // Extract the total number of nodes from the parsed values.
  var nodeCount = firstLineValues[0];
  // Extract the total number of constraints from the parsed values.
  var constraintCount = firstLineValues[1];

  // Initialize arrays to store the left-hand side indices, right-hand side indices,
  // and the difference values for each constraint.
  var leftIndices = [], rightIndices = [], diffValues = [];

  // Create an array to hold the calculated position or value for each node.
  // All node positions are initially set to zero.
  var nodePositions = new Array(nodeCount).fill(0x0);

  // Initialize an array of arrays to represent the connections between nodes.
  // This acts as an adjacency list where each element `nodeConnections[i]`
  // stores pairs of `[targetNodeIndex, differenceValue]` for connections originating from node `i`.
  var nodeConnections = new Array(nodeCount);

  // The variable to store the final outcome, initially assuming consistency.
  var finalResult = "Yes";

  // Populate the `nodeConnections` array with empty arrays for each node.
  for (var idx = 0x0; idx < nodeCount; idx++) {
    nodeConnections[idx] = [];
  }

  // Iterate through each constraint line in the input, starting from the second line.
  for (idx = 0x0; idx < constraintCount; idx++) {
    // Parse the current constraint line, converting string values to integers.
    // A constraint is given as L R D, meaning position[R] - position[L] = D.
    var currentConstraint = rawData[idx + 0x1].split(" ").map(strVal => parseInt(strVal, 10));

    // Store the 0-based right index of the current constraint.
    rightIndices[idx] = currentConstraint[0x1] - 0x1;
    // Store the difference value for the current constraint.
    diffValues[idx] = currentConstraint[0x2];
    // Store the 0-based left index of the current constraint.
    leftIndices[idx] = currentConstraint[0x0] - 0x1;

    // Add a directed connection from the left node to the right node with the given difference.
    // This implies: position[right] = position[left] + difference.
    nodeConnections[leftIndices[idx]].push(rightIndices[idx], diffValues[idx]);
    // Add a reverse directed connection from the right node to the left node with the negative difference.
    // This implies: position[left] = position[right] - difference.
    nodeConnections[rightIndices[idx]].push(leftIndices[idx], -diffValues[idx]);
  }

  // This array serves as a queue for nodes whose connections need to be processed
  // to propagate position calculations.
  var processingQueue = [];

  // Iterate through all nodes to ensure that every connected component is processed.
  for (idx = 0x0; idx < nodeCount; idx++) {
    // Determine the starting index for iterating through the connection pairs for the current node.
    // Each connection consists of two elements: target index and difference.
    var connIdx = nodeConnections[idx].length - 0x2;

    // If the current node has any connections, initiate the position calculation and propagation.
    if (connIdx >= 0x0) {
      calculateNodePosition(idx, connIdx);
    }

    // After processing the initial connections for `idx`, process any nodes that were added
    // to the `processingQueue` during the `calculateNodePosition` call.
    for (var queueIdx = 0x0; queueIdx < processingQueue.length; queueIdx++) {
      // Get the starting index for connections of the node from the queue.
      connIdx = nodeConnections[processingQueue[queueIdx]].length - 0x2;
      // If the queued node has connections, process them.
      if (connIdx >= 0x0) {
        calculateNodePosition(processingQueue[queueIdx], connIdx);
      }
    }
  }

  // After all possible node positions have been calculated, verify if all original constraints are met.
  for (idx = 0x0; idx < constraintCount; idx++) {
    // Check if the calculated difference between the right and left node positions
    // matches the original constraint's difference value.
    if (nodePositions[rightIndices[idx]] - nodePositions[leftIndices[idx]] !== diffValues[idx]) {
      finalResult = "No"; // If a mismatch is found, the system is inconsistent.
      break; // No need to check further constraints, as inconsistency is confirmed.
    }
  }

  // Print the final result to the console.
  console.log(finalResult);

  // Helper function to recursively calculate and propagate node positions based on connections.
  // `currNodeIdx`: The index of the node whose position is currently known or being used as a reference.
  // `startConnIdx`: The index within `nodeConnections[currNodeIdx]` to start processing connection pairs.
  function calculateNodePosition(currNodeIdx, startConnIdx) {
    // Loop through all connection pairs for the `currNodeIdx` in reverse order.
    do {
      // Extract the target node index from the current connection pair.
      var targetNode = nodeConnections[currNodeIdx][startConnIdx];
      // Extract the difference value to the target node from the current connection pair.
      var differenceToTarget = nodeConnections[currNodeIdx][startConnIdx + 0x1];

      // If the target node itself has unprocessed connections, add it to the queue
      // for future processing to ensure full propagation.
      if (nodeConnections[targetNode].length > 0x0) {
        processingQueue.push(targetNode);
      }

      // Calculate the position of the target node relative to the current node.
      nodePositions[targetNode] = nodePositions[currNodeIdx] + differenceToTarget;

      // Move to the previous connection pair (decrement by 2).
      startConnIdx -= 0x2;
    } while (startConnIdx >= 0x0); // Continue as long as there are connection pairs to process.

    // After processing all direct connections from `currNodeIdx`, clear its connection list.
    // This marks these connections as handled and prevents redundant processing.
    nodeConnections[currNodeIdx] = [];
  }
}

// Read the input from standard input (typically a file in competitive programming environments)
// and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
