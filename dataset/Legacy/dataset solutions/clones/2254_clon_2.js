function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  rawData = rawData.split("\n");

  // Parse grid dimensions (height and width) from the first line of input.
  var gridDimensions = rawData[0].split(" ");
  var gridHeight = parseInt(gridDimensions[0]);
  var gridWidth = parseInt(gridDimensions[1]);

  // Define a large number to represent an unreachable path or infinity in distance calculations.
  var infinityVal = Math.pow(10, 9) + 7;

  // Remove the first line (which contained the dimensions) from the input array.
  rawData.shift();

  // Trim any excess lines from the input, keeping only the grid rows.
  rawData.splice(gridHeight, rawData.length);

  // Convert each grid row string into an array of individual characters (cells).
  var gridCells = rawData.map(line => line.split(""));

  // Initialize an array to store the connections (edges) between traversable cells.
  var connections = new Array();
  var cellIndex = 0; // A unique identifier for each cell in the grid, used as a node index.

  // Iterate through the grid to identify traversable cells and establish connections.
  for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
      // If the current cell is traversable (represented by '.').
      if (gridCells[rowIdx][colIdx] === ".") {
        // Check for a traversable cell directly below the current cell.
        if (rowIdx !== gridHeight - 1) {
          if (gridCells[rowIdx + 1][colIdx] === ".") {
            // Add an edge between the current cell and the cell below it.
            connections.push([cellIndex, cellIndex + gridWidth]);
          }
        }
        // Check for a traversable cell directly to the right of the current cell.
        if (colIdx !== gridWidth - 1) {
          if (gridCells[rowIdx][colIdx + 1] === ".") {
            // Add an edge between the current cell and the cell to its right.
            connections.push([cellIndex, cellIndex + 1]);
          }
        }
      }
      // Increment the cell index for the next cell in the grid.
      cellIndex++;
    }
  }

  // Initialize the distance matrix for the Floyd-Warshall algorithm.
  // The total number of nodes in the graph is equal to the total number of cells.
  var totalCells = gridHeight * gridWidth;
  var distanceMatrix = new Array(totalCells);

  // Populate the initial distance matrix.
  // - Distance from a node to itself is 0.
  // - All other distances are initialized to infinityVal.
  for (var startNode = 0; startNode < totalCells; startNode++) {
    var rowDistances = new Array(totalCells).fill(infinityVal);
    rowDistances[startNode] = 0; // Distance to self is zero.
    distanceMatrix[startNode] = rowDistances;
  }

  // Add direct connections (edges) to the distance matrix with a weight of 1.
  // Since movement is bidirectional, add edges in both directions.
  for (var connIdx = 0; connIdx < connections.length; connIdx++) {
    var nodeA = connections[connIdx][0];
    var nodeB = connections[connIdx][1];
    distanceMatrix[nodeA][nodeB] = 1;
    distanceMatrix[nodeB][nodeA] = 1;
  }

  var maxDistance = 0; // Variable to store the maximum shortest path found.

  // Apply the Floyd-Warshall algorithm to compute all-pairs shortest paths.
  // 'intermediateNode' represents the potential intermediate vertex in a path from 'startNode' to 'endNode'.
  for (var intermediateNode = 0; intermediateNode < totalCells; intermediateNode++) {
    for (var startNode = 0; startNode < totalCells; startNode++) {
      for (var endNode = 0; endNode < totalCells; endNode++) {
        // Update the shortest path from 'startNode' to 'endNode'
        // if a path through 'intermediateNode' is shorter than the current known path.
        distanceMatrix[startNode][endNode] = Math.min(
          distanceMatrix[startNode][intermediateNode] + distanceMatrix[intermediateNode][endNode],
          distanceMatrix[startNode][endNode]
        );
      }
    }
  }

  // After computing all shortest paths, find the maximum finite distance among them.
  for (var idxRow = 0; idxRow < totalCells; idxRow++) {
    for (var idxCol = 0; idxCol < totalCells; idxCol++) {
      // If the path is reachable (i.e., its distance is less than infinityVal).
      if (distanceMatrix[idxRow][idxCol] < infinityVal) {
        // Update 'maxDistance' if a longer shortest path is found.
        maxDistance = Math.max(maxDistance, distanceMatrix[idxRow][idxCol]);
      }
    }
  }

  // Output the final maximum shortest path to the console.
  console.log('%s', maxDistance);
  return maxDistance;
}

// This helper function is typically used for local testing in a browser environment.
// It's not directly involved in the Node.js execution flow for competitive programming.
function testSolution(testCaseNum) {
  var testInput = document.getElementById("input" + testCaseNum).value;
  var calculatedAnswer = ProcessInput(testInput);
  var testOutcome = "WA"; // Assume Wrong Answer initially.

  // Compare the calculated answer with the expected output for the test case.
  if (calculatedAnswer == document.getElementById("output" + testCaseNum).value.split("\n")[0]) {
    testOutcome = "AC"; // If they match, the test is Accepted.
  }
  // Display the test outcome in the designated HTML element.
  document.getElementById("result" + testCaseNum).innerHTML = testOutcome;
}

// Main execution block for Node.js environment.
// Reads input from standard input, processes it using ProcessInput, and prints the result.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
