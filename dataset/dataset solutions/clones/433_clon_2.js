function computeShortestPaths() {
  // Iterate through all possible intermediate nodes (k)
  for (let intermediateNode = 0; intermediateNode < graphDimensions[1]; intermediateNode++) {
    // Iterate through all possible source nodes (i)
    for (let rowIdx = 0; rowIdx < graphDimensions[1]; rowIdx++) {
      // Iterate through all possible destination nodes (j)
      for (let colIdx = 0; colIdx < graphDimensions[1]; colIdx++) {
        // Update the cost matrix using the intermediate node
        costMatrix[rowIdx][colIdx] = Math.min(costMatrix[rowIdx][colIdx], costMatrix[rowIdx][intermediateNode] + costMatrix[intermediateNode][colIdx]);
        // Update the time matrix using the intermediate node
        timeMatrix[rowIdx][colIdx] = Math.min(timeMatrix[rowIdx][colIdx], timeMatrix[rowIdx][intermediateNode] + timeMatrix[intermediateNode][colIdx]);
      }
    }
  }
}

// Read the entire input file synchronously
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input into an array of lines, removing any leading/trailing whitespace
const inputLines = fileContent.trim().split("\n");

// Process multiple test cases until a termination condition is met
while (true) {
  // Read the first line of the current test case, containing N (nodes) and M (edges)
  const graphDimensions = inputLines.shift().split(" ").map(Number);

  // Check for the termination condition: N=0 and M=0
  if (graphDimensions[0] === 0 && graphDimensions[1] === 0) {
    break; // Exit the main processing loop
  }

  // Declare and initialize two 2D arrays (matrices) for costs and times
  let costMatrix = [];
  let timeMatrix = [];

  // Initialize matrices for up to 101 nodes (0-indexed, so 0 to 100)
  for (let idxA = 0; idxA < 101; idxA++) {
    costMatrix[idxA] = [];
    timeMatrix[idxA] = [];
    for (let idxB = 0; idxB < 101; idxB++) {
      // Set diagonal elements to 0 (distance to self) and others to Infinity
      costMatrix[idxA][idxB] = (idxA === idxB) ? 0 : Infinity;
      timeMatrix[idxA][idxB] = (idxA === idxB) ? 0 : Infinity;
    }
  }

  // Read and populate the initial edge weights into the matrices
  // graphDimensions[0] represents the number of initial edges
  for (let edgeCount = 0; edgeCount < graphDimensions[0]; edgeCount++) {
    const edgeData = inputLines.shift().split(" ").map(Number);
    // Adjusting node indices from 1-based to 0-based
    costMatrix[edgeData[0] - 1][edgeData[1] - 1] = edgeData[2]; // Cost
    timeMatrix[edgeData[0] - 1][edgeData[1] - 1] = edgeData[3]; // Time
  }

  // Execute the Floyd-Warshall algorithm to find all-pairs shortest paths
  computeShortestPaths();

  // Read the number of queries for the current test case
  const numQueries = Number(inputLines.shift());

  // Process each query
  for (let queryCount = 0; queryCount < numQueries; queryCount++) {
    const queryDetails = inputLines.shift().split(" ").map(Number);
    // queryDetails[2] indicates which matrix to query: 0 for cost, 1 for time
    if (queryDetails[2] === 0) {
      // Output the shortest cost path
      console.log(costMatrix[queryDetails[0] - 1][queryDetails[1] - 1]);
    }
    if (queryDetails[2] === 1) {
      // Output the shortest time path
      console.log(timeMatrix[queryDetails[0] - 1][queryDetails[1] - 1]);
    }
  }
}
