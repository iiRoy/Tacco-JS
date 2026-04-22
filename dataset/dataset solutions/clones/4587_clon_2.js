'use strict'; // Enforce strict parsing rules

executeProgram(); // Initiate the main application flow

function executeProgram(programArguments) {
  // This function orchestrates the data acquisition, parsing, and computation steps.
  acquireDataStream() // First, retrieve the raw input data.
    .then(processDataString) // Next, transform the raw data into a structured format.
    .then(computeShortestPath); // Finally, perform the core path calculation.
}

function computeShortestPath(graphData) {
  /*
   * This function implements the Bellman-Ford algorithm to find the shortest
   * path in a graph, or detect negative cycles.
   */
  let numNodes = graphData[0][0]; // Extract the total number of nodes from the input.
  let numEdges = graphData[0][1]; // Extract the total number of edges from the input.

  let distances = new Array(numNodes).fill(Number.POSITIVE_INFINITY); // Initialize distances to all nodes as infinite.
  distances[0] = 0; // The distance from the source node (node 0) to itself is zero.

  // Prepare the list of edges, negating weights for a longest path variation.
  let graphConnections = new Array(numEdges).fill(null).map(
    (_val, currentIndex) => ({
      originNode: graphData[currentIndex + 1][0] - 1, // Source node index (0-based).
      targetNode: graphData[currentIndex + 1][1] - 1, // Destination node index (0-based).
      edgeCost: graphData[currentIndex + 1][2] * -1 // Negate the cost; effectively finding the "longest path".
    })
  );

  let iterationCounter = 0; // Counter for Bellman-Ford iterations.
  while (true) {
    let wasModified = false; // Flag to check if any distance was updated in this iteration.
    for (let currentLink of graphConnections) {
      // Iterate through all edges to relax them.
      let conditionMet =
        distances[currentLink.originNode] !== Number.POSITIVE_INFINITY && // Ensure source node is reachable.
        distances[currentLink.targetNode] > distances[currentLink.originNode] + currentLink.edgeCost; // Check for a shorter path.

      if (conditionMet) {
        distances[currentLink.targetNode] = distances[currentLink.originNode] + currentLink.edgeCost; // Update target node's distance.
        wasModified = true; // Mark that an update occurred.
      }
    }

    if (wasModified) {
      iterationCounter++; // Increment iteration count if updates were made.
    } else {
      break; // No updates in this iteration, so the algorithm has converged.
    }

    // If an update occurs in the (numNodes + 1)-th iteration, a negative cycle exists.
    if (iterationCounter === numNodes + 1) {
      console.log('infinite_path'); // Indicate an infinitely long path due to a negative cycle.
      return; // Terminate execution.
    }
  }
  // Output the final computed distance to the last node, adjusted back to positive.
  console.log(distances[numNodes - 1] * -1);
}

function processDataString(rawTextStream) {
  // This function takes a raw string input and converts it into a structured array of numbers.
  let parsedNumericalData = rawTextStream
    .split('\n') // Split the input string by newline characters into an array of lines.
    .map(lineText =>
      lineText.split(' ').map(parseFloat) // For each line, split by space and convert parts to numbers.
    );
  return parsedNumericalData; // Return the 2D array of parsed numerical values.
}

function acquireDataStream() {
  // This asynchronous function reads all incoming data from standard input.
  return new Promise((completePromise) => {
    let bufferedChunks = []; // Array to store incoming data chunks.
    process.stdin.resume(); // Ensure the standard input stream is open.
    process.stdin.setEncoding('utf8'); // Set encoding for incoming data.

    process.stdin.on('data', (dataPiece) => {
      bufferedChunks.push(dataPiece); // Append each data chunk to the buffer.
    });

    process.stdin.on('end', () => {
      let finalInputString = bufferedChunks.join('').trim(); // Join all chunks and remove leading/trailing whitespace.
      completePromise(finalInputString); // Resolve the promise with the complete input string.
    });
  });
}