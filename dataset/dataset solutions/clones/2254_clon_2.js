function ProcessInput(rawData) {
  // Split the entire raw input string into individual lines
  const lines = rawData.split('\n');

  // Parse grid dimensions from the first line
  const dimensions = lines[0].split(' ');
  const gridHeight = parseInt(dimensions[0], 10);
  const gridWidth = parseInt(dimensions[1], 10);

  // Define a large number to represent infinity for distance calculations
  const infinityVal = Math.pow(10, 9) + 7;

  // Remove the dimension line from the input array
  lines.shift();

  // Trim any excess lines beyond the grid height
  lines.splice(gridHeight, lines.length);

  // Convert each grid row string into an array of characters
  const charGrid = lines.map(gridRow => gridRow.split(''));

  // Array to store direct connections (edges) between traversable cells
  const connections = [];

  // Initialize a unique numerical identifier for each cell in the grid
  let pointIndex = 0;

  // Iterate through each cell of the grid to identify paths and connections
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
      // If the current cell is a path ('.')
      if (charGrid[rowIdx][colIdx] === '.') {
        // Check for a traversable cell directly below
        if (rowIdx !== gridHeight - 1) {
          if (charGrid[rowIdx + 1][colIdx] === '.') {
            connections.push([pointIndex, pointIndex + gridWidth]); // Add vertical connection
          }
        }
        // Check for a traversable cell directly to the right
        if (colIdx !== gridWidth - 1) {
          if (charGrid[rowIdx][colIdx + 1] === '.') {
            connections.push([pointIndex, pointIndex + 1]); // Add horizontal connection
          }
        }
      }
      pointIndex++; // Increment to the next cell's identifier
    }
  }

  // Calculate the total number of points (cells) in the grid
  const totalPoints = gridHeight * gridWidth;
  // Initialize a 2D array (matrix) to store shortest distances between all pairs of points
  const distanceMatrix = new Array(totalPoints);

  // Populate the distance matrix: distance from a point to itself is 0, others are infinity
  for (let idxA = 0; idxA < totalPoints; idxA++) {
    const currentPointDistances = new Array(totalPoints).fill(infinityVal);
    currentPointDistances[idxA] = 0; // Distance from point A to point A is 0
    distanceMatrix[idxA] = currentPointDistances;
  }

  // Set direct connection costs (edges) in the distance matrix to 1
  for (let segIdx = 0; segIdx < connections.length; segIdx++) {
    const [startNode, endNode] = connections[segIdx];
    distanceMatrix[startNode][endNode] = 1; // Cost of direct path is 1
    distanceMatrix[endNode][startNode] = 1; // Connections are bidirectional
  }

  // Variable to store the maximum shortest path length found
  let longestPath = 0;

  // Apply the Floyd-Warshall algorithm to find all-pairs shortest paths
  for (let intermediateIdx = 0; intermediateIdx < totalPoints; intermediateIdx++) { // Consider each point as an intermediate stop
    for (let sourceIdx = 0; sourceIdx < totalPoints; sourceIdx++) { // For each starting point
      for (let destIdx = 0; destIdx < totalPoints; destIdx++) { // For each ending point
        // Update the shortest path if a shorter route is found via intermediateIdx
        distanceMatrix[sourceIdx][destIdx] = Math.min(
          distanceMatrix[sourceIdx][intermediateIdx] + distanceMatrix[intermediateIdx][destIdx],
          distanceMatrix[sourceIdx][destIdx]
        );
      }
    }
  }

  // After computing all shortest paths, find the maximum among them
  for (let sourceIdx = 0; sourceIdx < totalPoints; sourceIdx++) {
    for (let destIdx = 0; destIdx < totalPoints; destIdx++) {
      // Only consider paths that are actually reachable (not infinity)
      if (distanceMatrix[sourceIdx][destIdx] < infinityVal) {
        longestPath = Math.max(longestPath, distanceMatrix[sourceIdx][destIdx]); // Update the maximum
      }
    }
  }

  // Output the final computed longest shortest path
  console.log('%s', longestPath);
  return longestPath;
}

// Helper function for local testing within a browser environment
function ExecuteTest(testCaseIdentifier) {
  // Retrieve the input string for the specific test case
  const testInput = document.getElementById("input" + testCaseIdentifier).value;
  // Run the main processing logic with the test input
  const computedAnswer = ProcessInput(testInput);
  let testOutcome = "WA"; // Default test result is "Wrong Answer"

  // Compare the computed answer with the expected output for the test case
  if (computedAnswer.toString() === document.getElementById("output" + testCaseIdentifier).value.split('\n')[0]) {
    testOutcome = "AC"; // If they match, set to "Accepted"
  }
  // Display the test outcome in the corresponding HTML element
  document.getElementById("result" + testCaseIdentifier).innerHTML = testOutcome;
}

// Execute the primary processing function using standard input (e.g., from a file)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));