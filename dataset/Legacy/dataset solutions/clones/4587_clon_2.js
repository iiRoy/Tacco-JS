'use strict' // Enforce strict mode for cleaner code.

// Main entry point for the application.
entryPoint()

/**
 * Initiates the program flow by reading input, parsing it, and then performing calculations.
 * @param {any} rawData - Placeholder for potential direct input, though typically read from stdin.
 */
function entryPoint (rawData) {
  // Asynchronously acquire input from standard input.
  acquireInput()
    .then(processRawData) // Parse the raw string input into a structured format.
    .then(computeResult)  // Perform the core calculation logic.
}

/**
 * Computes the shortest path using a modified Bellman-Ford algorithm,
 * detecting negative cycles if present.
 * @param {Array<Array<number>>} processedInput - The parsed input data.
 */
function computeResult (processedInput) {
  // Extract graph dimensions: number of nodes (vertices) and number of edges.
  let nodeCount = processedInput[0][0]
  let edgeCount = processedInput[0][1]

  // Initialize distances array. All nodes are initially unreachable (Infinity),
  // except the starting node (node 0), which has a distance of 0.
  let distances = new Array(nodeCount).fill(Infinity)
  distances[0] = 0

  // Prepare the list of edges.
  // Note: Weights are reversed (multiplied by -1) because the problem
  // likely asks for the longest path, which can be solved by finding
  // the shortest path on a graph with negated edge weights.
  let graphEdges = new Array(edgeCount).fill(0).map(
    ( _ , idx ) => ({
      sourceNode: processedInput[idx + 1][0] - 1, // Adjust to 0-indexed.
      targetNode: processedInput[idx + 1][1] - 1, // Adjust to 0-indexed.
      edgeWeight: processedInput[idx + 1][2] * -1 // Negate weight for longest path.
    })
  )

  // Bellman-Ford algorithm iteration counter.
  // We iterate up to N-1 times for shortest paths, and one more time (Nth iteration)
  // to detect negative cycles.
  let updateCounter = 0
  while (true) {
    let hasUpdated = false // Flag to track if any distance was updated in the current pass.

    // Iterate over all edges to relax them.
    for (let currentEdge of graphEdges) {
      // Check if the source node is reachable and if a shorter path to the target node
      // can be found through the current edge.
      let needsUpdate = distances[currentEdge.sourceNode] < Infinity &&
                        distances[currentEdge.targetNode] > distances[currentEdge.sourceNode] + currentEdge.edgeWeight

      if (needsUpdate) {
        // Update the distance to the target node.
        distances[currentEdge.targetNode] = distances[currentEdge.sourceNode] + currentEdge.edgeWeight
        hasUpdated = true // Mark that an update occurred.
      }
    }

    // If no distances were updated in a full pass, the shortest paths have been found.
    if (hasUpdated) {
      updateCounter++ // Increment the pass counter.
    } else {
      break // No updates, so we can stop.
    }

    // If updates continue beyond N passes (i.e., N+1 passes), it indicates a negative cycle
    // reachable from the source node.
    if (updateCounter === nodeCount + 1) {
      console.log('inf') // Output 'inf' as per problem specification for negative cycles.
      return // Terminate execution.
    }
  }

  // Output the shortest path to the last node (nodeCount - 1),
  // reversing the negation applied to weights to get the original longest path value.
  console.log(distances[nodeCount - 1] * -1)
}

/**
 * Parses raw string input into a structured array of numbers.
 * Each line is split by space, and each part is converted to a number.
 * @param {string} rawText - The raw input string from stdin.
 * @returns {Array<Array<number>>} - Parsed input as a 2D array of numbers.
 */
function processRawData (rawText) {
  // Split the raw text by newlines, then each line by spaces, and convert to numbers.
  let processedInput = rawText.split('\n').map(lineStr => lineStr.split(' ').map(Number))
  return processedInput
}

/**
 * Asynchronously reads all data from standard input.
 * @returns {Promise<string>} A promise that resolves with the complete input string.
 */
function acquireInput () {
  return new Promise((resolvePromise) => {
    let inputChunks = [] // Array to store incoming data chunks.
    process.stdin.resume() // Ensure stdin is open and emitting data.
    process.stdin.setEncoding('utf8') // Set encoding to UTF-8.

    // Event listener for 'data' chunks from stdin.
    process.stdin.on('data', (dataChunk) => {
      inputChunks.push(dataChunk) // Accumulate data chunks.
    })

    // Event listener for 'end' of stdin stream.
    process.stdin.on('end', () => {
      // Join all chunks, trim whitespace, and resolve the promise.
      let finalInputString = inputChunks.join('').trim()
      resolvePromise(finalInputString)
    })
  })
}
