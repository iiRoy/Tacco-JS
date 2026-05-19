'use strict'; // Enforce strict mode for better code quality and error handling

// Initiate the primary execution flow of the program.
entryPoint();

/**
 * Serves as the main entry point for the application.
 * It orchestrates the sequence of operations: reading input, parsing it,
 * and then performing the core computation.
 * @param {any} initialData - An optional parameter, typically unused as input is read from stdin.
 */
function entryPoint (initialData) {
  acquireInputData() // Step 1: Obtain raw text input from the standard input stream.
    .then(processRawData) // Step 2: Transform the raw text into a structured numeric format.
    .then(computeShortestPath); // Step 3: Execute the primary algorithm with the processed data.
}

/**
 * Implements the Bellman-Ford algorithm to find the longest path in a graph
 * (by negating edge weights to find the shortest path in the transformed graph)
 * and detect negative cycles.
 * @param {Array<Array<number>>} graphData - Structured input data. The first sub-array
 *                                           contains the number of nodes and edges.
 *                                           Subsequent sub-arrays define the edges.
 */
function computeShortestPath (graphData) {
  // Extract graph dimensions: total number of nodes and edges.
  const nodeCount = graphData[0][0];
  const edgeCount = graphData[0][1];

  // Initialize an array to store the shortest distance from the source node (node 0)
  // to all other nodes. All distances are initially set to positive infinity,
  // except for the source node itself, which is 0.
  const distanceArray = new Array(nodeCount).fill(Number.POSITIVE_INFINITY);
  distanceArray[0] = 0; // The distance to the starting node is zero.

  // Transform the raw edge definitions into a more convenient object format.
  // Node indices are adjusted to be 0-based, and edge weights are negated
  // to convert the longest path problem into a shortest path problem.
  const graphEdges = new Array(edgeCount).fill(null).map(
    (ignoredValue, index) => ({
      sourceNode: graphData[index + 1][0] - 1, // Convert 1-based node index to 0-based.
      targetNode: graphData[index + 1][1] - 1, // Convert 1-based node index to 0-based.
      edgeWeight: graphData[index + 1][2] * -1 // Negate weight for longest path calculation.
    })
  );

  let updateIterationCounter = 0; // Counter for passes where distance updates occurred.

  // Bellman-Ford algorithm loop: Iterate up to `nodeCount` times.
  // If updates continue beyond `nodeCount - 1` iterations, a negative cycle exists.
  while (true) {
    let hasUpdated = false; // Flag to track if any distance was updated in the current pass.

    // Iterate through all defined edges to perform relaxation.
    for (const currentEdge of graphEdges) {
      // Check if the source node is reachable and if a shorter path to the target node
      // can be found via the current edge.
      const needsDistanceUpdate = distanceArray[currentEdge.sourceNode] !== Number.POSITIVE_INFINITY &&
                                  distanceArray[currentEdge.targetNode] > distanceArray[currentEdge.sourceNode] + currentEdge.edgeWeight;

      if (needsDistanceUpdate) {
        // Update the distance to the target node if a shorter path is found.
        distanceArray[currentEdge.targetNode] = distanceArray[currentEdge.sourceNode] + currentEdge.edgeWeight;
        hasUpdated = true; // Mark that an update occurred in this pass.
      }
    }

    // If no distances were updated in a complete pass, the shortest paths are stable.
    if (!hasUpdated) {
      break; // Exit the loop as no further improvements can be made.
    } else {
      // Increment the counter if at least one update happened.
      updateIterationCounter++;
    }

    // If updates persist for `nodeCount` iterations, it implies a negative cycle
    // is reachable from the source, making the longest path infinite.
    if (updateIterationCounter === nodeCount) {
      console.log('inf'); // Output 'inf' as per problem specification.
      return; // Terminate the function.
    }
  }

  // After the loop, output the final longest path to the last node (nodeCount - 1).
  // The stored distance is negated again to revert the initial weight inversion.
  console.log(distanceArray[nodeCount - 1] * -1);
}

/**
 * Transforms the raw input string into a structured array of numeric data.
 * Each line of the input string is split by newline characters, and then
 * each resulting line string is further split by spaces. Finally, all
 * string segments are converted into numbers.
 * @param {string} rawDataString - The complete raw input string obtained from stdin.
 * @returns {Array<Array<number>>} An array where each inner array represents a line
 *                                  of numeric data from the input.
 */
function processRawData (rawDataString) {
  // Split the input string into lines, then each line into space-separated numbers.
  const parsedNumericData = rawDataString.split('\n').map(dataRow => dataRow.split(' ').map(Number));
  return parsedNumericData;
}

/**
 * Asynchronously reads all available data from the standard input stream (stdin).
 * It accumulates data chunks until the 'end' event is emitted, then resolves
 * a Promise with the complete, trimmed input string.
 * @returns {Promise<string>} A Promise that resolves with the full input string.
 */
function acquireInputData () {
  return new Promise((resolvePromise) => {
    const inputChunks = []; // Buffer to store parts of the input data.
    process.stdin.resume(); // Ensures the stdin stream is active and emitting data.
    process.stdin.setEncoding('utf8'); // Sets the character encoding for the input.

    // Event handler for when data chunks are received from stdin.
    process.stdin.on('data', (dataChunk) => {
      inputChunks.push(dataChunk); // Append the received chunk to the buffer.
    });

    // Event handler for when the stdin stream has ended.
    process.stdin.on('end', () => {
      // Join all buffered chunks into a single string and remove any leading/trailing whitespace.
      const completeInputString = inputChunks.join('').trim();
      resolvePromise(completeInputString); // Resolve the Promise with the final input string.
    });
  });
}
