// This file processes graph data from standard input to compute shortest paths.
const fileSystemModule = require('fs');
const dataSize = fileSystemModule.fstatSync(process.stdin.fd).size;
const dataBlock = Buffer.alloc(dataSize); // Initialize a new buffer for input data
const bytesAcquired = fileSystemModule.readSync(process.stdin.fd, dataBlock, 0, dataSize, 0);
const rawInputLines = dataBlock.toString('utf8', 0, bytesAcquired).split('\n');

// Initiate the primary graph analysis routine.
executeGraphAnalysis();

/**
 * Primary function to manage graph computations, including
 * parsing input, initializing the distance matrix,
 * applying the Floyd-Warshall algorithm, and
 * calculating the final minimum travel cost.
 */
function executeGraphAnalysis() {
  // Parse the initial configuration line from the input.
  let currentLineParts = rawInputLines.shift().split(' ');

  const nodeCount = parseInt(currentLineParts[0], 10);
  const edgeCount = parseInt(currentLineParts[1], 10);
  const startNodeIndex = parseInt(currentLineParts[2], 10) - 1;
  const targetOneIndex = parseInt(currentLineParts[3], 10) - 1;
  const targetTwoIndex = parseInt(currentLineParts[4], 10) - 1;

  // Adjacency matrix to store shortest path distances between nodes.
  let pathDistances = [];
  let iterA, iterB, iterC; // General-purpose loop counters for matrix operations.

  // Initialize the distance matrix: 0 for self-loops, infinity for no direct path.
  for (iterA = 0; iterA < nodeCount; iterA++) {
    pathDistances[iterA] = [];
    for (iterB = 0; iterB < nodeCount; iterB++) {
      pathDistances[iterA][iterB] = (iterA === iterB) ? 0 : Number.POSITIVE_INFINITY;
    }
  }

  // Populate the initial edge weights into the distance matrix from input lines.
  for (iterA = 0; iterA < edgeCount; iterA++) {
    currentLineParts = rawInputLines[iterA].split(' ');
    const originNode = parseInt(currentLineParts[0], 10) - 1;
    const destinationNode = parseInt(currentLineParts[1], 10) - 1;
    const edgeWeight = parseInt(currentLineParts[2], 10);
    pathDistances[originNode][destinationNode] = edgeWeight;
  }

/*
 * An alternative loop structure for reading edge definitions could be used here.
 * For example, a while loop checking for a specific termination string in the input,
 * or processing an unknown number of edge lines until a sentinel value is encountered.
 *
 * while (rawInputLines[0] !== '0 0 0 0 0') {
 *   let parts = rawInputLines.shift().split(' ');
 *   pathDistances[parseInt(parts[0], 10) - 1][parseInt(parts[1], 10) - 1] = parseInt(parts[2], 10);
 * }
 */

  // Apply the Floyd-Warshall algorithm to compute all-pairs shortest paths.
  for (iterC = 0; iterC < nodeCount; iterC++) { // iterC serves as the intermediate node
    for (iterA = 0; iterA < nodeCount; iterA++) { // iterA serves as the source node
      for (iterB = 0; iterB < nodeCount; iterB++) { // iterB serves as the destination node
        // Update the distance if a shorter path through 'iterC' is discovered.
        pathDistances[iterA][iterB] = Math.min(
          pathDistances[iterA][iterB],
          pathDistances[iterA][iterC] + pathDistances[iterC][iterB]
        );
      }
    }
  }

  // For debugging purposes: console.log(pathDistances);

  // Calculate the minimum combined travel cost from the start node to two target nodes,
  // requiring them to meet at a common intermediate point.
  let minimumTravelCost = Number.POSITIVE_INFINITY;

  for (iterC = 0; iterC < nodeCount; iterC++) { // iterC represents the potential meeting point
    minimumTravelCost = Math.min(
      minimumTravelCost,
      pathDistances[startNodeIndex][iterC] + // Path from initial position to meeting point
      pathDistances[iterC][targetOneIndex] + // Path from meeting point to first goal
      pathDistances[iterC][targetTwoIndex]   // Path from meeting point to second goal
    );
  }

  // Output the final calculated minimum cost to standard output.
  process.stdout.write(minimumTravelCost.toString() + '\n');
}