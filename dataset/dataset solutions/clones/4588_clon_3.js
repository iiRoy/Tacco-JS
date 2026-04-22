'use strict'

// A global constant representing an unreachable state or infinite distance.
const MAX_DISTANCE_VAL = Number.POSITIVE_INFINITY

/**
 * Orchestrates the graph analysis process: reading input, parsing, and computing the optimal path.
 *
 * @returns {void}
 */
async function initiateGraphAnalysis () {
  try {
    // Step 1: Acquire raw text data from standard input.
    const unparsedText = await acquireRawInputData()

    // Step 2: Transform the raw text into a structured graph configuration.
    const graphStructure = transformInputToGraphConfig(unparsedText)
    if (!graphStructure) {
      console.error('Error: Could not parse graph configuration.')
      return
    }

    // Step 3: Compute the optimal path cost using a Bellman-Ford like algorithm.
    const calculationResult = determineOptimalPathCost(graphStructure)

    // Step 4: Display the final result.
    if (calculationResult.hasNegativeCycle) {
      console.log('inf') // Indicates an infinitely long path due to a negative cycle.
    } else {
      // The problem requires the 'longest' path, which is achieved by negating edge weights.
      // So, we negate the final shortest path value to get the original longest path.
      console.log(calculationResult.finalDistance * -1)
    }
  } catch (err) {
    console.error(`An error occurred during graph analysis: ${err.message}`)
    // Optionally, log the full stack trace for debugging
    // console.error(err.stack)
  }
}

/**
 * Reads all data from standard input asynchronously.
 *
 * @returns {Promise<string>} A promise that resolves with the complete input string.
 */
function acquireRawInputData () {
  return new Promise((resolve, reject) => {
    const receivedChunks = []
    process.stdin.resume()
    process.stdin.setEncoding('utf8')

    process.stdin.on('data', (dataSegment) => {
      receivedChunks.push(dataSegment)
    })

    process.stdin.on('end', () => {
      const finalInputString = receivedChunks.join('').trim()
      resolve(finalInputString)
    })

    process.stdin.on('error', (err) => {
      reject(new Error(`Failed to read from stdin: ${err.message}`))
    })
  })
}

/**
 * Parses the raw input string into a structured format representing the graph.
 *
 * @param {string} unparsedText - The raw input string, typically lines of space-separated numbers.
 * @returns {{nodeCount: number, edgeCount: number, connections: Array<{source: number, destination: number, cost: number}>} | null}
 *          An object containing graph parameters, or null if parsing fails.
 */
function transformInputToGraphConfig (unparsedText) {
  if (!unparsedText) {
    console.warn('Warning: No input text provided for parsing.')
    return null
  }

  const structuredData = unparsedText
    .split('\n')
    .map(lineFragment => lineFragment.split(' ').map(Number))
    .filter(row => row.length > 0 && !isNaN(row[0])) // Filter out empty lines or lines that don't start with a number

  if (structuredData.length < 1) {
    console.error('Error: Input data is empty or malformed after initial split.')
    return null
  }

  const [graphHeader] = structuredData
  const graphNodeCount = graphHeader[0]
  const graphEdgeCount = graphHeader[1]

  if (isNaN(graphNodeCount) || isNaN(graphEdgeCount) || graphNodeCount <= 0 || graphEdgeCount < 0) {
    console.error('Error: Invalid node or edge count in input header.')
    return null
  }

  // Extract graph connections, adjusting indices and negating weights for 'longest path' logic.
  const graphConnections = structuredData.slice(1).map(
    (edgeDetails, idx) => {
      if (edgeDetails.length < 3) {
        console.warn(`Warning: Edge definition on line ${idx + 2} is incomplete. Skipping.`)
        return null // Skip malformed edge lines
      }
      return {
        source: edgeDetails[0] - 1, // Adjust to 0-based indexing
        destination: edgeDetails[1] - 1, // Adjust to 0-based indexing
        cost: edgeDetails[2] * -1 // Negate weight to find longest path via Bellman-Ford
      }
    }
  ).filter(connection => connection !== null) // Remove skipped null entries

  if (graphConnections.length !== graphEdgeCount) {
    console.warn(`Warning: Expected ${graphEdgeCount} edges but found ${graphConnections.length} valid edges.`)
  }

  return {
    nodeCount: graphNodeCount,
    edgeCount: graphEdgeCount,
    connections: graphConnections
  }
}

/**
 * Computes the shortest path from the source node (node 0) to all other nodes
 * using the Bellman-Ford algorithm, detecting negative cycles.
 *
 * @param {{nodeCount: number, edgeCount: number, connections: Array<{source: number, destination: number, cost: number}>}} graphData
 *        Structured graph information.
 * @returns {{finalDistance: number, hasNegativeCycle: boolean}} The final distance to the last node and a flag for negative cycles.
 */
function determineOptimalPathCost (graphData) {
  const numNodes = graphData.nodeCount
  const graphEdges = graphData.connections

  // Initialize distance estimates: all nodes are unreachable except the source.
  const distanceEstimates = Array.from({ length: numNodes }, () => MAX_DISTANCE_VAL)
  distanceEstimates[0] = 0 // Source node (0-indexed) has a distance of 0 to itself.

  let wasDistanceUpdatedInCycle = false
  const MAX_BELLMAN_FORD_ITERATIONS = numNodes // n iterations for detection, n-1 for shortest paths

  // Main Bellman-Ford loop: Relax edges repeatedly.
  // We iterate 'numNodes' times. The (numNodes)-th iteration is specifically for negative cycle detection.
  for (let iterationIndex = 0; iterationIndex < MAX_BELLMAN_FORD_ITERATIONS; ++iterationIndex) {
    wasDistanceUpdatedInCycle = false // Reset flag for current iteration

    for (const currentEdge of graphEdges) {
      const { source, destination, cost } = currentEdge

      // Skip invalid edges or edges from unreachable nodes.
      if (distanceEstimates[source] === MAX_DISTANCE_VAL) {
        continue
      }

      const potentialNewDistance = distanceEstimates[source] + cost

      // If a shorter path to the destination is found, update the distance.
      if (distanceEstimates[destination] > potentialNewDistance) {
        distanceEstimates[destination] = potentialNewDistance
        wasDistanceUpdatedInCycle = true

        // If an update occurs in the N-th iteration (0-indexed N-1, so here `numNodes - 1`),
        // it signifies the presence of a negative cycle reachable from the source.
        if (iterationIndex === numNodes - 1) {
          // This node is part of or reachable from a negative cycle.
          // For Bellman-Ford, if we can still relax an edge after N-1 iterations,
          // a negative cycle exists.
          return { finalDistance: distanceEstimates[numNodes - 1], hasNegativeCycle: true }
        }
      }
    }

    // If no distances were updated in an entire iteration, the algorithm has converged.
    // Further iterations won't change distances unless a negative cycle is detected.
    if (!wasDistanceUpdatedInCycle) {
      break // Optimization: no changes, so paths are stable.
    }
  }

  // After all iterations, if the last node is still unreachable, return infinity.
  const targetNodeIndex = numNodes - 1
  const finalCalculatedDistance = distanceEstimates[targetNodeIndex]

  // Check if the target node was ever reached.
  if (finalCalculatedDistance === MAX_DISTANCE_VAL) {
    // If the target node is unreachable even without negative cycles, it's effectively infinite.
    // The problem implies 'inf' for negative cycles, but an unreachable node also yields an "infinite" path.
    // For consistency with the original code's negative cycle check, we differentiate.
    // If not a negative cycle, this means no path exists.
    return { finalDistance: MAX_DISTANCE_VAL, hasNegativeCycle: false }
  }

  return { finalDistance: finalCalculatedDistance, hasNegativeCycle: false }
}

// Execute the main analysis function when the script runs.
// This ensures the program starts automatically.
initiateGraphAnalysis()