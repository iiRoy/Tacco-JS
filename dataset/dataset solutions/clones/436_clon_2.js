function computeShortestPaths() {
  // This function applies the Floyd-Warshall algorithm to find all-pairs shortest paths.
  // It iterates through all possible intermediate nodes to update path costs and times.
  for (let midIdx = 0; midIdx < graphDimensions[1]; midIdx++) {
    for (let rowIdx = 0; rowIdx < graphDimensions[1]; rowIdx++) {
      for (let colIdx = 0; colIdx < graphDimensions[1]; colIdx++) {
        // Update the minimum cost path between rowIdx and colIdx
        costMatrix[rowIdx][colIdx] = Math.min(costMatrix[rowIdx][colIdx], costMatrix[rowIdx][midIdx] + costMatrix[midIdx][colIdx]);
        // Update the minimum time path between rowIdx and colIdx
        timeMatrix[rowIdx][colIdx] = Math.min(timeMatrix[rowIdx][colIdx], timeMatrix[rowIdx][midIdx] + timeMatrix[midIdx][colIdx]);
      }
    }
  }
}

// Read all input data from standard input as a single string.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input string into an array of lines, removing any leading/trailing whitespace.
const inputLines = rawData.trim().split("\n");

// Begin the main processing loop for multiple test cases.
while (true) {
  // Extract the first line, split it by space, and convert parts to numbers.
  // This line typically contains the number of edges and the number of nodes.
  const graphDimensions = inputLines.shift().split(" ").map(Number);

  // Check for the termination condition: both numbers are zero.
  if (graphDimensions[0] === 0 && graphDimensions[1] === 0) {
    break; // Exit the loop if the termination condition is met.
  }

  // Initialize two matrices: one for path costs and one for path times.
  let costMatrix = [];
  let timeMatrix = [];

  // Populate the matrices with initial values.
  // Diagonal elements (path from a node to itself) are 0.
  // Non-diagonal elements are set to Infinity, indicating no direct path initially.
  for (let outerIdx = 0; outerIdx < graphDimensions[1]; outerIdx++) {
    costMatrix[outerIdx] = [];
    timeMatrix[outerIdx] = [];
    for (let innerIdx = 0; innerIdx < graphDimensions[1]; innerIdx++) {
      costMatrix[outerIdx][innerIdx] = (outerIdx === innerIdx) ? 0 : Infinity;
      timeMatrix[outerIdx][innerIdx] = (outerIdx === innerIdx) ? 0 : Infinity;
    }
  }

  // Read and process the edge data for the current graph.
  // graphDimensions[0] represents the number of edges.
  for (let edgeIdx = 0; edgeIdx < graphDimensions[0]; edgeIdx++) {
    // Parse each edge line: [source_node, destination_node, path_cost, path_time].
    const edgeData = inputLines.shift().split(" ").map(Number);
    // Adjust node indices to be 0-based (from 1-based input) and assign values.
    costMatrix[edgeData[0] - 1][edgeData[1] - 1] = edgeData[2];
    timeMatrix[edgeData[0] - 1][edgeData[1] - 1] = edgeData[3];
  }

  // Execute the Floyd-Warshall algorithm to compute all-pairs shortest paths.
  computeShortestPaths();

  // Read the number of queries for the current graph.
  const queryCount = Number(inputLines.shift());

  // Process each query.
  for (let queryIdx = 0; queryIdx < queryCount; queryIdx++) {
    // Parse query details: [source_node, destination_node, query_type].
    const queryDetails = inputLines.shift().split(" ").map(Number);
    // Based on query_type, print either the cost or the time for the path.
    if (queryDetails[2] === 0) {
      console.log(costMatrix[queryDetails[0] - 1][queryDetails[1] - 1]);
    }
    if (queryDetails[2] === 1) {
      console.log(timeMatrix[queryDetails[0] - 1][queryDetails[1] - 1]);
    }
  }
}
