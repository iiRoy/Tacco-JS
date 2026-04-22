// This JavaScript program is designed to solve a shortest path problem
// on a directed, weighted graph. It calculates the minimum total distance
// required to travel from a specified source node (S) to an intermediate node (I),
// and then from that same intermediate node (I) to two distinct target nodes (G1 and G2).
// The overall objective is to find an intermediate node I that minimizes the sum:
// ShortestPath(S, I) + ShortestPath(I, G1) + ShortestPath(I, G2).
//
// The algorithm proceeds in several stages:
// 1. Input Parsing: Reads graph configuration (number of nodes, S, G1, G2)
//    and edge definitions from standard input.
// 2. Graph Initialization: Creates an adjacency matrix representing direct
//    edge weights, with self-loops having 0 distance and non-existent
//    edges having an effectively infinite distance.
// 3. All-Pairs Shortest Path (Floyd-Warshall): Computes the shortest
//    path between every pair of nodes in the graph. This step is crucial
//    for determining ShortestPath(A, B) for any A, B.
// 4. Result Calculation: Iterates through all possible nodes to serve as the
//    intermediate node (I), calculates the total path sum for each, and identifies
//    the global minimum.
//
// Input format:
// The first line contains five space-separated integers:
// N M S G1 G2
// N: total number of nodes (1-indexed in input, converted to 0-indexed internally)
// M: (unused in this specific problem, but present in original specification)
// S: index of the source node
// G1: index of the first target node
// G2: index of the second target node
//
// Subsequent lines define edges:
// U V W
// U: start node of the edge
// V: end node of the edge
// W: weight/cost of the edge
// Edge definitions continue until a line containing '0 0 0 0 0' is encountered.
//
// Output:
// A single integer representing the minimum total path sum.

// --- Constants and Utility Functions ---

// A large value to represent unreachable paths or non-existent edges.
const INFINITE_DIST = Infinity;

// The special string indicating the end of edge definition input.
const EDGE_DEFINITION_TERMINATOR = '0 0 0 0 0';

/**
 * Safely parses a string into an integer.
 * @param {string} valueStr The string to parse.
 * @param {string} [context='unknown'] Optional context for error messages.
 * @returns {number} The parsed integer, or 0 if parsing fails (with a warning).
 */
const parseInteger = (valueStr, context = 'input') => {
  const num = parseInt(valueStr, 10);
  if (isNaN(num)) {
    console.warn(`Warning: Could not parse '${valueStr}' as an integer in ${context}. Defaulting to 0.`);
    return 0;
  }
  return num;
};

// --- Standard Input Handling ---

// Accumulator for all data received from stdin.
let accumulatedInputData = '';

// Configure stdin to interpret incoming bytes as UTF-8 characters.
process.stdin.setEncoding('utf8');

// Instruct stdin to start emitting 'data' events.
process.stdin.resume();

// Event listener for each chunk of data received.
process.stdin.on('data', (dataPiece) => {
  accumulatedInputData += dataPiece;
});

// Event listener for when the entire input stream has ended.
process.stdin.on('end', () => {
  // Once all input is collected, pass it to the main processing logic.
  processGraphPathCalculation(accumulatedInputData);
});

// --- Main Graph Processing Logic ---

/**
 * Orchestrates the graph parsing, shortest path calculation, and final result computation.
 * @param {string} fullRawInput The complete string of input data from stdin.
 */
function processGraphPathCalculation(fullRawInput) {
  // Clean and split the raw input into individual lines.
  const inputLines = fullRawInput.trim().split('\n').filter(line => line.trim() !== '');

  // --- Input Validation and Parameter Extraction ---
  if (inputLines.length === 0) {
    console.error('Error: No valid input lines provided for graph processing.');
    return;
  }

  const graphConfigLine = inputLines.shift(); // Get the first line and remove it from the array.
  const configTokens = graphConfigLine.split(' ');

  // Expecting at least 5 parameters (N M S G1 G2)
  if (configTokens.length < 5) {
    console.error('Error: Insufficient parameters in the first line. Expected N M S G1 G2.');
    return;
  }

  // Parse initial graph parameters. Node indices are 1-based in input, convert to 0-based.
  const totalNodes = parseInteger(configTokens[0], 'node count N');
  // const unusedEdgeCount = parseInteger(configTokens[1], 'edge count M'); // 'M' is not used in original logic.
  const initialNodeIndex = parseInteger(configTokens[2], 'source node S') - 1;
  const firstTargetIndex = parseInteger(configTokens[3], 'target G1') - 1;
  const secondTargetIndex = parseInteger(configTokens[4], 'target G2') - 1;

  // Further validation for core parameters.
  if (totalNodes <= 0) {
    console.error('Error: Number of nodes (N) must be a positive integer.');
    return;
  }
  if (initialNodeIndex < 0 || initialNodeIndex >= totalNodes ||
      firstTargetIndex < 0 || firstTargetIndex >= totalNodes ||
      secondTargetIndex < 0 || secondTargetIndex >= totalNodes) {
    console.error(`Error: Source or target node indices are out of bounds (0 to ${totalNodes - 1}).`);
    return;
  }

  // --- Graph Initialization: Adjacency Matrix ---
  // Initialize a 2D array (matrix) to store shortest path distances.
  // pathDistanceMatrix[u][v] will store the shortest distance from node u to node v.
  // Initially, set self-loops to 0 and all other paths to INFINITE_DIST.
  const pathDistanceMatrix = Array.from({ length: totalNodes }, (_, rowIdx) =>
    Array.from({ length: totalNodes }, (_, colIdx) =>
      rowIdx === colIdx ? 0 : INFINITE_DIST
    )
  );

  // --- Populate Matrix with Direct Edge Weights ---
  // Iterate through the remaining input lines to add direct edge weights to the matrix.
  // The loop continues until the special terminator line is found or input runs out.
  let currentLinePointer = 0;
  while (currentLinePointer < inputLines.length && inputLines[currentLinePointer] !== EDGE_DEFINITION_TERMINATOR) {
    const edgeSpecTokens = inputLines[currentLinePointer].split(' ');

    // Basic validation for edge data format.
    if (edgeSpecTokens.length < 3) {
      console.warn(`Warning: Malformed edge definition line '${inputLines[currentLinePointer]}'. Skipping.`);
      currentLinePointer++;
      continue;
    }

    const startVertex = parseInteger(edgeSpecTokens[0], 'edge start node') - 1;
    const endVertex = parseInteger(edgeSpecTokens[1], 'edge end node') - 1;
    const edgeWeight = parseInteger(edgeSpecTokens[2], 'edge weight');

    // Validate parsed edge data.
    if (startVertex < 0 || startVertex >= totalNodes ||
        endVertex < 0 || endVertex >= totalNodes ||
        edgeWeight < 0) { // Assuming non-negative weights for simplicity with Floyd-Warshall.
      console.warn(`Warning: Invalid edge data (${startVertex + 1}, ${endVertex + 1}, ${edgeWeight}). Skipping.`);
      currentLinePointer++;
      continue;
    }

    // For multiple edges between the same two nodes, take the minimum weight.
    pathDistanceMatrix[startVertex][endVertex] = Math.min(pathDistanceMatrix[startVertex][endVertex], edgeWeight);

    currentLinePointer++; // Move to the next edge definition line.
  }

  // --- Floyd-Warshall Algorithm: All-Pairs Shortest Paths ---
  // This triple-nested loop computes the shortest path between all pairs of nodes (i, j)
  // by considering every node 'k' as a possible intermediate point.
  // Iteration order: k (pivot), then i (source), then j (destination).
  for (let pivotVertex = 0; pivotVertex < totalNodes; pivotVertex++) {
    for (let sourceVertex = 0; sourceVertex < totalNodes; sourceVertex++) {
      for (let destinationVertex = 0; destinationVertex < totalNodes; destinationVertex++) {
        // Calculate the potential path length if going from source to destination via pivot.
        // It's crucial to check for INFINITE_DIST to prevent unexpected behavior like Infinity + (-X)
        // if negative weights were allowed (though not in this problem).
        if (pathDistanceMatrix[sourceVertex][pivotVertex] === INFINITE_DIST ||
            pathDistanceMatrix[pivotVertex][destinationVertex] === INFINITE_DIST) {
          continue; // Cannot form a path through this pivot if either segment is unreachable.
        }

        const distanceThroughPivot = pathDistanceMatrix[sourceVertex][pivotVertex] + pathDistanceMatrix[pivotVertex][destinationVertex];

        // If the path through the pivot is shorter than the currently known path, update it.
        if (distanceThroughPivot < pathDistanceMatrix[sourceVertex][destinationVertex]) {
          pathDistanceMatrix[sourceVertex][destinationVertex] = distanceThroughPivot;
        }
      }
    }
  }

  // --- Final Result Calculation ---
  // Find the minimum sum of paths: ShortestPath(S, I) + ShortestPath(I, G1) + ShortestPath(I, G2)
  // where I is any possible intermediate node.
  let overallMinimumCost = INFINITE_DIST;

  for (let candidateMidNode = 0; candidateMidNode < totalNodes; candidateMidNode++) {
    const pathToMid = pathDistanceMatrix[initialNodeIndex][candidateMidNode];
    const pathToG1FromMid = pathDistanceMatrix[candidateMidNode][firstTargetIndex];
    const pathToG2FromMid = pathDistanceMatrix[candidateMidNode][secondTargetIndex];

    // Only consider paths where all three segments are reachable.
    if (pathToMid !== INFINITE_DIST &&
        pathToG1FromMid !== INFINITE_DIST &&
        pathToG2FromMid !== INFINITE_DIST) {

      const currentPathSumCandidate = pathToMid + pathToG1FromMid + pathToG2FromMid;
      overallMinimumCost = Math.min(overallMinimumCost, currentPathSumCandidate);
    }
  }

  // Output the final computed minimum cost.
  console.log(overallMinimumCost);
}