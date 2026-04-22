'use strict';

// --- Global Constants and Entry Point Configuration ---

// A very large number to represent an infinite or unreachable distance in pathfinding algorithms.
// Using Number.MAX_SAFE_INTEGER avoids potential issues with actual Infinity in specific calculations.
const MAX_PATH_VALUE = Number.MAX_SAFE_INTEGER;

// The default index for the starting node in graph traversal problems.
const SOURCE_NODE_IDENTIFIER = 0;

// A multiplier used to invert edge weights, typically for converting a "longest path" problem
// into a "shortest path on negative weights" problem.
const WEIGHT_INVERSION_FACTOR = -1;

// The main application orchestrator function.
// It coordinates the sequence of operations: input acquisition, parsing, and computation.
async function initiateGraphSolver() {
  try {
    // Step 1: Obtain the raw problem data from the standard input stream.
    const rawProblemSpecification = await retrieveDataFromStandardInput();

    // Step 2: Transform the raw string data into a structured numerical format.
    const formattedProblemData = processRawInputToStructure(rawProblemSpecification);

    // Step 3: Execute the core algorithm to find the optimal path.
    await determineOptimalPath(formattedProblemData);

  } catch (executionError) {
    // Catch and report any unhandled errors that occur during the program's execution.
    console.error(`Application encountered a critical error: ${executionError.message}`);
    // Exit the process with a non-zero status code to indicate failure.
    process.exit(1);
  }
}

// --- Core Algorithm Logic (Bellman-Ford Implementation) ---

/**
 * Determines the shortest path in a graph with potentially negative edge weights,
 * and detects negative cycles reachable from the source.
 * This function is an implementation of the Bellman-Ford algorithm.
 * @param {Array<Array<number>>} graphStructure - The parsed graph data.
 *   The first sub-array contains [totalNodes, totalEdges].
 *   Subsequent sub-arrays define edges: [origin, destination, cost].
 * @returns {Promise<void>} Resolves when the path calculation is complete, printing the result.
 */
async function determineOptimalPath(graphStructure) {
  // Validate the fundamental structure of the input data.
  if (!Array.isArray(graphStructure) || graphStructure.length === 0) {
    console.error("Error: Graph structure is invalid or empty.");
    return;
  }

  // Extract graph dimensions from the first line of input.
  const [totalNodes, totalEdges] = graphStructure[SOURCE_NODE_IDENTIFIER];

  // Perform basic sanity checks on graph dimensions.
  if (totalNodes <= 0 || totalEdges < 0) {
    console.error(`Error: Invalid graph dimensions (Nodes: ${totalNodes}, Edges: ${totalEdges}).`);
    return;
  }
  if (graphStructure.length !== totalEdges + 1) {
    console.error(`Input format error: Expected ${totalEdges + 1} data rows, but received ${graphStructure.length}.`);
    return;
  }

  // Initialize an array to store the minimum distances from the source node to all other nodes.
  // All distances are initially set to a large value (infinity), except for the source node.
  const currentMinimumDistances = new Array(totalNodes).fill(MAX_PATH_VALUE);
  currentMinimumDistances[SOURCE_NODE_IDENTIFIER] = 0; // Distance from source to itself is zero.

  // Map the raw input rows representing edges into a more structured object format.
  // Edge weights are inverted here, transforming a "longest path" problem into a "shortest path" problem.
  const graphConnections = graphStructure.slice(1).map((edgeSpec) => ({
    originNode: edgeSpec[0] - 1,       // Convert to 0-indexed node ID
    destinationNode: edgeSpec[1] - 1,  // Convert to 0-indexed node ID
    edgeWeight: edgeSpec[2] * WEIGHT_INVERSION_FACTOR // Apply inversion factor
  }));

  let distanceUpdatedInCurrentPass; // Flag to track if any distance was improved in the current iteration.

  // The Bellman-Ford algorithm requires at most (totalNodes - 1) passes to find all shortest paths
  // in a graph without negative cycles. An additional Nth pass is used to detect negative cycles.
  // We iterate N+1 times to explicitly check for negative cycles on the last pass.
  for (let passIteration = 0; passIteration < totalNodes + 1; ++passIteration) {
    distanceUpdatedInCurrentPass = false; // Reset the update flag for each new pass.

    // Iterate over all edges in the graph.
    for (const activeConnection of graphConnections) {
      const { originNode, destinationNode, edgeWeight } = activeConnection;

      // Only attempt to relax an edge if its origin node is reachable.
      if (currentMinimumDistances[originNode] !== MAX_PATH_VALUE) {
        const candidateNewDistance = currentMinimumDistances[originNode] + edgeWeight;

        // If a shorter path to the destination node is found, update its distance.
        if (currentMinimumDistances[destinationNode] > candidateNewDistance) {
          currentMinimumDistances[destinationNode] = candidateNewDistance;
          distanceUpdatedInCurrentPass = true; // Mark that an update occurred in this pass.
        }
      }
    }

    // Optimization: If no distances were updated in a full pass,
    // it means the algorithm has converged, and no negative cycles are present.
    // We can break early.
    if (!distanceUpdatedInCurrentPass && passIteration < totalNodes) {
      break;
    }
  }

  // After `totalNodes` passes, if `distanceUpdatedInCurrentPass` is still true
  // after the (N+1)-th pass, it signifies the presence of a negative cycle
  // reachable from the source, meaning paths can be arbitrarily short (negative infinity).
  if (distanceUpdatedInCurrentPass) {
    console.log('inf'); // Output for negative cycle detection.
  } else {
    // If no negative cycle was detected, the shortest path to the target node is valid.
    const finalNodeIdentifier = totalNodes - 1; // The last node is often the target.
    const finalCalculatedDistance = currentMinimumDistances[finalNodeIdentifier];

    if (finalCalculatedDistance === MAX_PATH_VALUE) {
      // If the target node remains unreachable.
      console.log('unreachable'); // A custom output for unreachable state.
    } else {
      // Invert the final distance back to the original problem's interpretation (e.g., longest path value).
      console.log(finalCalculatedDistance * WEIGHT_INVERSION_FACTOR);
    }
  }
}

// --- Input Processing Utilities ---

/**
 * Transforms a raw, multi-line string input into a structured 2D array of numbers.
 * Each line is parsed, split by spaces, and its components converted to numerical values.
 * @param {string} rawInputContent - The unprocessed string obtained from standard input.
 * @returns {Array<Array<number>>} A 2D array where each inner array represents a parsed line of numbers.
 * @throws {Error} If any line contains non-numeric data.
 */
function processRawInputToStructure(rawInputContent) {
  // Basic validation for the input string's validity.
  if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
    throw new Error("Input data is empty or not a valid string.");
  }

  // Split the entire input into individual lines, then filter out any empty lines.
  const linesOfData = rawInputContent
    .trim() // Remove overall leading/trailing whitespace.
    .split('\n')
    .filter(line => line.trim().length > 0); // Exclude lines that are empty or only whitespace.

  // Map each valid line string to an array of numbers.
  const structuredNumericData = linesOfData.map((dataLine, lineIndex) => {
    const numericValues = dataLine.split(' ').map(Number);
    // Validate that all components successfully converted to numbers.
    if (numericValues.some(isNaN)) {
      throw new Error(`Data parsing error on line ${lineIndex + 1}: Found non-numeric value in "${dataLine}".`);
    }
    return numericValues;
  });

  return structuredNumericData;
}

/**
 * Asynchronously reads all available data from the standard input stream.
 * This function leverages Node.js stream capabilities to collect input chunks.
 * @returns {Promise<string>} A Promise that resolves with the complete concatenated string
 *   read from stdin, or rejects if an I/O error occurs.
 */
function retrieveDataFromStandardInput() {
  return new Promise((resolveInput, rejectInput) => {
    let collectedDataSegments = []; // Buffer to accumulate incoming data chunks.

    // Ensure the input stream is interpreted as UTF-8 encoded text.
    process.stdin.setEncoding('utf8');

    // Event listener for when data chunks become available.
    process.stdin.on('data', (dataChunk) => {
      collectedDataSegments.push(dataChunk);
    });

    // Event listener for when the input stream has ended.
    process.stdin.on('end', () => {
      // Concatenate all collected chunks into a single string and resolve the Promise.
      resolveInput(collectedDataSegments.join(''));
    });

    // Event listener for any errors during the input stream operation.
    process.stdin.on('error', (streamError) => {
      // Reject the Promise if an error occurs.
      rejectInput(new Error(`Failed to read from standard input: ${streamError.message}`));
    });

    // Note: Calling process.stdin.resume() is often implicitly handled by attaching 'data' listeners,
    // which puts the stream into 'flowing' mode. Explicitly calling it is usually not required here.
  });
}

// --- Program Execution Start ---

// Immediately invoke the main application function to begin execution.
// Using an async IIFE allows top-level await behavior for the program's entry point.
(async () => {
  await initiateGraphSolver();
})();