const largeDistance = 1000000007; // A large prime number used to represent infinity for path lengths

/**
 * Processes grid data to find the maximum shortest path between any two traversable cells.
 * This function implements the Floyd-Warshall algorithm.
 * @param {string} inputStringContent - The raw input string containing grid dimensions and layout.
 * @returns {number} The maximum shortest path found, or 0 if no paths exist or input is invalid.
 */
function CalculateMaxPath(inputStringContent) {
  // Split the entire input content into individual lines.
  const rawInputLines = inputStringContent.split('\n');

  // Parse grid dimensions from the first line of input.
  const dimensionParts = rawInputLines[0].split(' ');
  const gridHeight = parseInt(dimensionParts[0], 10);
  const gridWidth = parseInt(dimensionParts[1], 10);

  // Basic validation for grid dimensions to prevent errors with malformed input.
  if (isNaN(gridHeight) || isNaN(gridWidth) || gridHeight <= 0 || gridWidth <= 0) {
    // console.error("Error: Invalid grid dimensions detected. Height or Width is non-positive or not a number.");
    return 0; // Return 0 or throw an error for invalid input, depending on requirements.
  }

  // Calculate the total number of cells in the grid, which is also the number of nodes in our graph.
  const totalGridCells = gridHeight * gridWidth;

  // Extract the grid layout lines, skipping the first line which contains dimensions.
  // We take exactly 'gridHeight' lines following the dimension line.
  const gridLayoutSegments = rawInputLines.slice(1, gridHeight + 1);
  const cellTypeMatrix = gridLayoutSegments.map(line => line.split(''));

  // Initialize the all-pairs shortest path matrix (distance matrix).
  // Each cell (node) is connected to itself with distance 0. All other paths are initially 'infinity'.
  const shortestDistanceMatrix = Array.from({ length: totalGridCells }, (_, nodeIdxA) =>
    Array.from({ length: totalGridCells }, (_, nodeIdxB) => (nodeIdxA === nodeIdxB ? 0 : largeDistance))
  );

  // Populate direct adjacency connections (edges) in the shortestDistanceMatrix.
  // We iterate through each cell in the grid to find immediate traversable neighbors.
  for (let currentRow = 0; currentRow < gridHeight; currentRow++) {
    for (let currentCol = 0; currentCol < gridWidth; currentCol++) {
      const currentCellLinearIndex = currentRow * gridWidth + currentCol;

      // Only consider traversable cells (represented by '.').
      if (cellTypeMatrix[currentRow][currentCol] === '.') {
        // Check for a traversable cell to the immediate right.
        if (currentCol + 1 < gridWidth && cellTypeMatrix[currentRow][currentCol + 1] === '.') {
          const rightNeighborLinearIndex = currentRow * gridWidth + (currentCol + 1);
          shortestDistanceMatrix[currentCellLinearIndex][rightNeighborLinearIndex] = 1;
          shortestDistanceMatrix[rightNeighborLinearIndex][currentCellLinearIndex] = 1; // Bidirectional connection
        }

        // Check for a traversable cell immediately below.
        if (currentRow + 1 < gridHeight && cellTypeMatrix[currentRow + 1][currentCol] === '.') {
          const bottomNeighborLinearIndex = (currentRow + 1) * gridWidth + currentCol;
          shortestDistanceMatrix[currentCellLinearIndex][bottomNeighborLinearIndex] = 1;
          shortestDistanceMatrix[bottomNeighborLinearIndex][currentCellLinearIndex] = 1; // Bidirectional connection
        }
      }
    }
  }

  // Execute the Floyd-Warshall algorithm to compute all-pairs shortest paths.
  // The algorithm iterates through all possible intermediate nodes.
  for (let intermediateNode = 0; intermediateNode < totalGridCells; intermediateNode++) {
    // Then, for each possible intermediate node, it checks all possible start nodes.
    for (let startNode = 0; startNode < totalGridCells; startNode++) {
      // And for each start node, it checks all possible end nodes.
      for (let endNode = 0; endNode < totalGridCells; endNode++) {
        // If paths exist from start to intermediate and intermediate to end,
        // update the shortest path from start to end if a shorter one is found via 'intermediateNode'.
        // This check prevents potential overflow if largeDistance + largeDistance exceeds max integer,
        // and ensures we only consider reachable paths.
        if (shortestDistanceMatrix[startNode][intermediateNode] !== largeDistance &&
            shortestDistanceMatrix[intermediateNode][endNode] !== largeDistance) {
          shortestDistanceMatrix[startNode][endNode] = Math.min(
            shortestDistanceMatrix[startNode][endNode],
            shortestDistanceMatrix[startNode][intermediateNode] + shortestDistanceMatrix[intermediateNode][endNode]
          );
        }
      }
    }
  }

  // After computing all shortest paths, find the single maximum shortest path among all reachable pairs.
  let overallMaximumShortestPath = 0;
  for (let i = 0; i < totalGridCells; i++) {
    for (let j = 0; j < totalGridCells; j++) {
      // Only consider paths that are actually reachable (i.e., their distance is not 'infinity').
      // We also skip paths from a node to itself, as their distance is 0.
      if (i !== j && shortestDistanceMatrix[i][j] < largeDistance) {
        overallMaximumShortestPath = Math.max(overallMaximumShortestPath, shortestDistanceMatrix[i][j]);
      }
    }
  }

  // Output the final result to the console.
  console.log(overallMaximumShortestPath.toString());
  return overallMaximumShortestPath;
}

/**
 * Auxiliary function for testing the solution in a browser-like environment.
 * It retrieves input/output from DOM elements and displays the test result.
 * @param {number} testCaseIdentifier - A unique identifier for the test case (e.g., 1, 2, 3).
 */
function performTestRun(testCaseIdentifier) {
  // Reference to the global document object, assuming a browser context.
  const documentReference = document;

  // Retrieve the test input string from a specific DOM element.
  const testInputString = documentReference.getElementById("input" + testCaseIdentifier).value;

  // Execute the main path calculation logic with the retrieved test input.
  const calculatedResult = CalculateMaxPath(testInputString);

  // Retrieve the expected output string from another DOM element.
  // It's trimmed and only the first line is considered for comparison.
  const expectedOutputRaw = documentReference.getElementById("output" + testCaseIdentifier).value.trim();
  const expectedResultValue = parseInt(expectedOutputRaw.split("\n")[0], 10);

  // Determine if the calculated result matches the expected result.
  let testEvaluationStatus = "WA"; // Default status: Wrong Answer
  if (calculatedResult === expectedResultValue) {
    testEvaluationStatus = "AC"; // Accepted if results match
  }

  // Update the inner HTML of a result element to display the test status.
  documentReference.getElementById("result" + testCaseIdentifier).innerHTML = testEvaluationStatus;
}

// Entry point for execution in a Node.js environment, typically used in competitive programming.
// Reads input from standard input and passes it to the main processing function.
CalculateMaxPath(require("fs").readFileSync("/dev/stdin", "utf8"));