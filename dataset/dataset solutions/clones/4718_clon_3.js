'use strict';

/**
 * Constant representing a node's state as visited.
 * Used for clarity instead of raw numbers.
 * @type {number}
 */
const NODE_EXPLORED_MARKER = 1;

/**
 * Constant representing a node's state as unvisited.
 * Used for clarity instead of raw numbers.
 * @type {number}
 */
const NODE_UNEXPLORED_MARKER = 0;

/**
 * Determines if all nodes within a given status array have been marked as explored.
 * This is a crucial check for identifying a complete path in the graph traversal.
 *
 * @param {number[]} explorationStatusArray - An array where each element indicates the visit status of a node.
 * @returns {boolean} True if every node has the NODE_EXPLORED_MARKER, false otherwise.
 */
function verifyAllNodesVisited(explorationStatusArray) {
  // Defensive check for invalid or empty input, although context usually ensures non-empty.
  if (!Array.isArray(explorationStatusArray) || explorationStatusArray.length === 0) {
    return true; // If there are no nodes, all (zero) are considered visited.
  }

  // Utilizes the 'every' array method for an efficient and readable check.
  const areAllMarked = explorationStatusArray.every(
    (nodeState) => nodeState === NODE_EXPLORED_MARKER
  );
  return areAllMarked;
}

/**
 * Executes a recursive Depth-First Search (DFS) traversal to discover all unique paths
 * that visit every single node in the graph exactly once. This function updates
 * an external counter object upon finding such a path.
 *
 * @param {number} currentPositionIndex - The 0-based index of the vertex currently being examined.
 * @param {number} totalVertexQuantity - The total count of vertices in the graph.
 * @param {number[][]} connectivityMatrix - The adjacency matrix representing vertex connections.
 * @param {number[]} visitTrackingArray - An array tracking the visit status of nodes for the current path.
 * @param {{pathCount: number}} resultContainer - An object holding the total path count, passed by reference.
 * @returns {void}
 */
function performGraphTraversal(
  currentPositionIndex,
  totalVertexQuantity,
  connectivityMatrix,
  visitTrackingArray,
  resultContainer
) {
  // Input validation: Ensure the current position is within valid bounds and essential data structures exist.
  if (
    currentPositionIndex < 0 ||
    currentPositionIndex >= totalVertexQuantity ||
    !Array.isArray(connectivityMatrix) ||
    !Array.isArray(visitTrackingArray) ||
    typeof resultContainer !== 'object' ||
    resultContainer === null
  ) {
    console.warn('Traversal function received invalid parameters. Skipping.');
    return;
  }

  // Base case: If the current path has successfully visited every node, increment the counter.
  if (verifyAllNodesVisited(visitTrackingArray)) {
    resultContainer.pathCount++;
    return; // A complete path has been found; no need to extend this branch further.
  }

  // Explore all potential next vertices from the current position.
  for (let nextCandidateVertex = 0; nextCandidateVertex < totalVertexQuantity; nextCandidateVertex++) {
    const isDirectlyConnected = connectivityMatrix[currentPositionIndex][nextCandidateVertex] === NODE_EXPLORED_MARKER;
    const hasNotBeenVisitedInCurrentPath = visitTrackingArray[nextCandidateVertex] === NODE_UNEXPLORED_MARKER;

    // Proceed only if there's an edge to the candidate vertex AND it hasn't been part of the current path.
    if (isDirectlyConnected && hasNotBeenVisitedInCurrentPath) {
      // Mark the candidate vertex as visited for the ongoing path.
      visitTrackingArray[nextCandidateVertex] = NODE_EXPLORED_MARKER;

      // Recursively call the traversal function for the newly visited vertex.
      performGraphTraversal(
        nextCandidateVertex,
        totalVertexQuantity,
        connectivityMatrix,
        visitTrackingArray,
        resultContainer
      );

      // Backtracking step: Unmark the vertex to allow it to be included in alternative paths.
      // This is vital for finding all distinct paths.
      visitTrackingArray[nextCandidateVertex] = NODE_UNEXPLORED_MARKER;
    }
  }
}

/**
 * A robust utility function to parse an integer from a string,
 * including basic error handling.
 *
 * @param {string} stringValue - The string to be converted to an integer.
 * @returns {number} The parsed integer.
 * @throws {Error} If the input string cannot be parsed into a valid integer.
 */
const parseIntegerStrictly = (stringValue) => {
  const parsedNumber = Number.parseInt(stringValue, 10);
  if (Number.isNaN(parsedNumber)) {
    throw new Error(`Invalid numeric string provided: "${stringValue}"`);
  }
  return parsedNumber;
};

/**
 * The primary execution function responsible for reading input,
 * constructing the graph, and initiating the path-finding algorithm.
 *
 * @param {string} rawSystemInput - The entire input string, typically from standard input.
 * @returns {void}
 */
function initiateGraphProcessingAndPathCounting(rawSystemInput) {
  // Initial validation: Check if any input data was provided.
  if (!rawSystemInput || rawSystemInput.trim().length === 0) {
    console.error('Error: Input data is empty or invalid.');
    return;
  }

  // Divide the input into individual lines for easier parsing.
  const dataLines = rawSystemInput.trim().split('\n');

  // Extract the first line which contains graph dimensions (N nodes, M edges).
  const dimensionsSegment = dataLines.shift();
  if (!dimensionsSegment) {
    console.error('Error: Graph dimensions line is missing from input.');
    return;
  }

  const [nodesCountStr, edgesCountStr] = dimensionsSegment.split(' ');
  let numberOfNodes, numberOfEdges;

  try {
    numberOfNodes = parseIntegerStrictly(nodesCountStr);
    numberOfEdges = parseIntegerStrictly(edgesCountStr);
  } catch (error) {
    console.error(`Error parsing graph dimensions: ${error.message}`);
    return;
  }

  // Validate the extracted dimensions.
  if (numberOfNodes <= 0 || numberOfEdges < 0) {
    console.error('Error: Invalid number of nodes or edges specified.');
    return;
  }
  if (numberOfNodes > 10) {
      console.warn(`Warning: A high number of nodes (${numberOfNodes}) detected. Computation might be very slow.`);
  }

  // Initialize the adjacency matrix for the graph.
  // All connections are initially set to NODE_UNEXPLORED_MARKER (0).
  const graphAdjacencyMatrix = Array.from({ length: numberOfNodes }, () =>
    Array.from({ length: numberOfNodes }, () => NODE_UNEXPLORED_MARKER)
  );

  // Iterate through the remaining lines to define the graph's edges.
  for (const connectionDescription of dataLines) {
    // Skip any empty lines that might be present in the input.
    if (connectionDescription.trim() === '') continue;

    const [nodeA_str, nodeB_str] = connectionDescription.split(' ');
    let nodeA_id, nodeB_id;

    try {
      nodeA_id = parseIntegerStrictly(nodeA_str);
      nodeB_id = parseIntegerStrictly(nodeB_str);
    } catch (error) {
      console.error(`Error parsing edge definition "${connectionDescription}": ${error.message}`);
      continue; // Skip this malformed edge entry.
    }

    // Validate node IDs against the total number of nodes (input is 1-based).
    if (
      nodeA_id < 1 ||
      nodeA_id > numberOfNodes ||
      nodeB_id < 1 ||
      nodeB_id > numberOfNodes
    ) {
      console.error(`Error: Edge nodes (${nodeA_id}, ${nodeB_id}) are out of valid range (1 to ${numberOfNodes}).`);
      continue; // Skip invalid edge.
    }

    // Convert 1-based input IDs to 0-based indices for the matrix.
    const zeroBasedNodeA = nodeA_id - 1;
    const zeroBasedNodeB = nodeB_id - 1;

    // Mark the connection in both directions for an undirected graph.
    graphAdjacencyMatrix[zeroBasedNodeA][zeroBasedNodeB] = NODE_EXPLORED_MARKER;
    graphAdjacencyMatrix[zeroBasedNodeB][zeroBasedNodeA] = NODE_EXPLORED_MARKER;
  }

  // Prepare the node visitation tracker for the DFS algorithm.
  // Initially, all nodes are marked as unvisited.
  const currentPathNodeStatuses = Array.from(
    { length: numberOfNodes },
    () => NODE_UNEXPLORED_MARKER
  );

  // The problem specifies starting the traversal from node 0 (0-indexed).
  const initialStartingNode = 0;
  currentPathNodeStatuses[initialStartingNode] = NODE_EXPLORED_MARKER;

  // Create an object to store the final count of paths.
  // This object is passed by reference, allowing the recursive function to update it.
  const pathResultHolder = { pathCount: 0 };

  // Initiate the Depth-First Search traversal from the starting node.
  performGraphTraversal(
    initialStartingNode,
    numberOfNodes,
    graphAdjacencyMatrix,
    currentPathNodeStatuses,
    pathResultHolder
  );

  // Output the total number of unique paths found.
  console.log(pathResultHolder.pathCount);
}

// Entry point: Read input from standard input and begin processing.
try {
  const fileSystemModule = require('fs');
  const systemInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  initiateGraphProcessingAndPathCounting(systemInputData);
} catch (executionError) {
  console.error('An error occurred during program execution:', executionError.message);
  // Optionally, exit with an error code in production environments.
  // process.exit(1);
}