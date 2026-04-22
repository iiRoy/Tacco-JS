const inputSourceFileDescriptor = process.stdin.fd; // Reference to standard input file descriptor.

/**
 * Retrieves the entire content from standard input synchronously.
 * Includes robust error handling and checks for empty input.
 * @returns {string} The full string content of standard input, or an empty string on error/no input.
 */
function obtainFullInputContent() {
  const fileOperations = require('fs');
  try {
    const inputStatistics = fileOperations.fstatSync(inputSourceFileDescriptor);
    const expectedDataSize = inputStatistics.size;

    if (expectedDataSize === 0) {
      // No data available in standard input.
      return '';
    }

    // Allocate a buffer to hold the incoming data.
    const dataHoldingBuffer = Buffer.alloc(expectedDataSize);
    // Read the data into the buffer.
    const actualBytesTransferred = fileOperations.readSync(
      inputSourceFileDescriptor,
      dataHoldingBuffer,
      0, // Offset into the buffer
      expectedDataSize,
      0  // Position in the file (from beginning)
    );

    // Convert the read portion of the buffer to a UTF-8 string.
    return dataHoldingBuffer.toString('utf8', 0, actualBytesTransferred);
  } catch (operationError) {
    console.error("Error during synchronous input reading:", operationError.message);
    return ''; // Return empty string indicating failure or no usable input.
  }
}

/**
 * Parses a given string line into an array of numeric values.
 * Handles various whitespace and ensures conversion to numbers.
 * @param {string} textLine - The string line to be parsed.
 * @returns {number[]} An array of numbers extracted from the line.
 */
function parseLineIntoNumbers(textLine) {
  // Trim leading/trailing whitespace, split by one or more spaces, then convert each part to a Number.
  return textLine.trim().split(/\s+/).map(Number);
}

/**
 * Main execution routine for calculating maximum path values in a directed graph.
 * Reads graph structure from standard input, performs relaxation, and outputs results.
 */
function computeMaximumPathValues() {
  const completeInputString = obtainFullInputContent();

  if (!completeInputString) {
    console.error("No valid input received. Terminating graph processing.");
    return;
  }

  // Split input into lines, filtering out any blank lines.
  let activeInputLines = completeInputString.split('\n').filter(line => line.trim() !== '');

  if (activeInputLines.length === 0) {
    console.error("Input contains only empty lines or no content. Exiting.");
    return;
  }

  // Process the first line to get graph dimensions (number of vertices and edges).
  const dimensionTokens = parseLineIntoNumbers(activeInputLines.shift());

  if (dimensionTokens.length < 2 || isNaN(dimensionTokens[0]) || isNaN(dimensionTokens[1])) {
    console.error("First line must specify 'numVertices numEdges'. Malformed input. Aborting.");
    return;
  }

  const numberOfVertices = dimensionTokens[0];
  const numberOfEdges = dimensionTokens[1];

  // Basic sanity checks for graph dimensions.
  if (numberOfVertices < 0 || numberOfEdges < 0) {
    console.error("Vertex or edge counts cannot be negative. Exiting.");
    return;
  }
  if (numberOfVertices === 0) {
    console.log([]); // If no vertices, no paths to compute.
    return;
  }
  if (numberOfEdges > activeInputLines.length) {
    console.warn(`Warning: Expected ${numberOfEdges} edge definitions but found only ${activeInputLines.length}. Processing available edges.`);
  }

  // Initialize graph data structures.
  // `graphConnections` will be an adjacency list: graphConnections[u] = [[v1, w1], [v2, w2], ...]
  const graphConnections = Array.from({ length: numberOfVertices }, () => []);
  // `maxDistanceAccumulator` stores the maximum path value found to each node so far.
  const maxDistanceAccumulator = new Array(numberOfVertices).fill(0);

  // Populate the graph with edge information.
  for (let edgeDefinitionIndex = 0; edgeDefinitionIndex < numberOfEdges && edgeDefinitionIndex < activeInputLines.length; edgeDefinitionIndex++) {
    const edgeDataTokens = parseLineIntoNumbers(activeInputLines[edgeDefinitionIndex]);

    if (edgeDataTokens.length < 3 || isNaN(edgeDataTokens[0]) || isNaN(edgeDataTokens[1]) || isNaN(edgeDataTokens[2])) {
      console.warn(`Skipping malformed edge line at index ${edgeDefinitionIndex}: "${activeInputLines[edgeDefinitionIndex]}". Expected 'source target weight'.`);
      continue;
    }

    const sourceNode = edgeDataTokens[0];
    const destinationNode = edgeDataTokens[1];
    const pathWeight = edgeDataTokens[2];

    // Validate node identifiers are within bounds.
    if (sourceNode < 0 || sourceNode >= numberOfVertices || destinationNode < 0 || destinationNode >= numberOfVertices) {
      console.warn(`Skipping edge due to out-of-bounds node identifiers: ${sourceNode} -> ${destinationNode} (max index: ${numberOfVertices - 1}).`);
      continue;
    }

    // Add the edge to the adjacency list.
    graphConnections[sourceNode].push([destinationNode, pathWeight]);
  }

  // Core algorithm: A relaxation-based approach to find longest paths.
  // Similar to Bellman-Ford or SPFA, adapted for 'longest' path.
  // Starts processing from node 0 as per the original problem's implied starting point.
  const nodesPendingProcessing = [0];
  // A Set to efficiently track which nodes are currently in `nodesPendingProcessing` to avoid redundant pushes.
  const nodesCurrentlyInQueue = new Set([0]);

  // Safety counter to prevent infinite loops in case of positive cycles,
  // or extremely dense graphs where relaxation takes too long.
  let processingCycleCount = 0;
  const MAX_RELAXATION_STEPS_THRESHOLD = numberOfVertices * numberOfEdges * 2; // Heuristic limit.

  while (nodesPendingProcessing.length > 0) {
    if (processingCycleCount++ > MAX_RELAXATION_STEPS_THRESHOLD) {
      console.error("Exceeded maximum relaxation steps. Graph might contain positive cycles or is too complex. Terminating early.");
      break;
    }

    // Retrieve a node for processing (DFS-like behavior with .pop()).
    const currentActiveNode = nodesPendingProcessing.pop();

    // Remove from the 'in queue' tracker as it's now being processed.
    if (nodesCurrentlyInQueue.has(currentActiveNode)) {
      nodesCurrentlyInQueue.delete(currentActiveNode);
    }

    // Validate the current node's index.
    if (currentActiveNode === undefined || currentActiveNode < 0 || currentActiveNode >= numberOfVertices) {
      console.warn(`Encountered an invalid node identifier (${currentActiveNode}) during relaxation. Skipping.`);
      continue;
    }

    // Iterate over all outgoing edges from the `currentActiveNode`.
    for (const [neighborNode, edgeCost] of graphConnections[currentActiveNode]) {
      const potentialNewPathValue = maxDistanceAccumulator[currentActiveNode] + edgeCost;

      // If a longer path to `neighborNode` is found through `currentActiveNode`.
      if (potentialNewPathValue > maxDistanceAccumulator[neighborNode]) {
        maxDistanceAccumulator[neighborNode] = potentialNewPathValue; // Update the max path value.

        // If the neighbor node is not already awaiting processing, add it to the queue.
        // This prevents excessive queue growth while ensuring nodes are re-evaluated if their max path improves.
        if (!nodesCurrentlyInQueue.has(neighborNode)) {
          nodesPendingProcessing.push(neighborNode);
          nodesCurrentlyInQueue.add(neighborNode);
        }
      }
    }
  }

  // Output the final array of maximum path values for each node.
  console.log(maxDistanceAccumulator);
}

// Initiate the graph computation process.
computeMaximumPathValues();