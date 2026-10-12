// Function to perform a Breadth-First Search (BFS) to find the shortest path
// based on a sequence of characters that must be matched on the grid.
function ExploreGrid(startX, startY, targetSequence) {
  // Define movement vectors for 4 cardinal directions: up, left, right, down.
  const deltaX = [0, -1, 1, 0]; // Changes in the X-coordinate (column)
  const deltaY = [-1, 0, 0, 1]; // Changes in the Y-coordinate (row)

  // Initialize a 2D array to store the minimum remaining sequence length
  // required to reach a particular cell. This acts as a memoization table
  // to avoid redundant computations and cycles.
  // The maximum grid size is assumed to be 1000x1000 based on typical problem constraints.
  const minPathLengths = [];
  for (let r = 0; r <= 1000; r++) {
    minPathLengths[r] = [];
    for (let c = 0; c <= 1000; c++) {
      // Initialize each cell with the full length of the target sequence.
      // A smaller value will indicate a more "progressed" path to that cell.
      minPathLengths[r][c] = targetSequence.length;
    }
  }

  // Initialize the step counter for the current path being explored.
  let currentSteps = 0;
  // Initialize the BFS queue with the starting position, initial step count,
  // and the complete target sequence to be matched.
  const explorationQueue = [[startX, startY, currentSteps, targetSequence]];

  // Main loop for the Breadth-First Search.
  while (true) {
    // If the queue becomes empty, it means all reachable paths have been explored
    // and the target sequence was not fully matched.
    if (explorationQueue.length === 0) {
      currentSteps = Infinity; // Set to Infinity to indicate no valid path found.
      break; // Exit the BFS loop.
    }

    // Dequeue the first element from the queue, which represents the current state.
    const currentNode = explorationQueue.shift();
    const currX = currentNode[0];             // Current X-coordinate (column)
    const currY = currentNode[1];             // Current Y-coordinate (row)
    const currPathLength = currentNode[2];    // Steps taken to reach this state
    const remainingSequence = currentNode[3]; // Remaining part of the target sequence to match

    // If the remaining sequence is empty, it means we have successfully matched
    // the entire target sequence. This is the goal state.
    if (remainingSequence === '') {
      currentSteps = currPathLength; // The current path length is the shortest path.
      break; // Exit the BFS loop as the solution is found.
    }

    // Explore all four adjacent cells (neighbors) from the current cell.
    for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
      const nextX = currX + deltaX[directionIndex]; // Calculate next X-coordinate
      const nextY = currY + deltaY[directionIndex]; // Calculate next Y-coordinate
      let nextRemainingSequence = remainingSequence; // Start with the current remaining sequence

      // Check if the next cell is within the grid boundaries.
      // `wh` is a global variable representing the grid's width and height.
      if (nextX < 0 || nextY < 0 || nextX >= wh[0] || nextY >= wh[1]) {
        continue; // Skip this cell if it's out of bounds.
      }

      // Check if the character at the next grid cell matches the first character
      // of the `remainingSequence`.
      // `YX` is a global variable representing the grid map itself.
      if (YX[nextY][nextX] === remainingSequence[0]) {
        nextRemainingSequence = nextRemainingSequence.slice(1); // If matched, consume the character.
      }

      // Pruning condition: If we've already found a path to `(nextY, nextX)`
      // that resulted in an equal or shorter `nextRemainingSequence.length`,
      // then this current path is not better, so we can skip it.
      if (minPathLengths[nextY][nextX] <= nextRemainingSequence.length) {
        continue;
      }

      // Update the memoization table with the new, shorter `nextRemainingSequence.length`.
      minPathLengths[nextY][nextX] = nextRemainingSequence.length;
      // Enqueue the new state: next coordinates, incremented path length, and updated sequence.
      explorationQueue.push([nextX, nextY, currPathLength + 1, nextRemainingSequence]);
    }
  }
  return currentSteps; // Return the total steps for the shortest path found.
}

// Read the entire input from standard input as a UTF-8 string.
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
// Trim whitespace from the input and split it into an array of lines.
const inputLines = (fileContent.trim()).split('\n');

// Process multiple test cases. The loop continues until a "0 0" line is encountered.
while (true) {
  // Extract grid dimensions (width and height) from the first line of the current test case.
  // `gridDimensions` will be an array like [width, height].
  const gridDimensions = (inputLines.shift()).split(' ').map(Number);

  // Check for the termination condition: if both width and height are 0.
  if (gridDimensions[0] === 0 && gridDimensions[1] === 0) {
    break; // Exit the loop if the termination condition is met.
  }

  // Initialize arrays to store the grid map and the starting coordinates.
  const terrainData = [];
  const initialPosition = []; // Stores [startX, startY]

  // Populate the `terrainData` grid and find the 'S' (start) character's position.
  for (let r = 0; r < gridDimensions[1]; r++) {
    const rowContent = (inputLines.shift()).split(''); // Get characters for the current row.
    // If 'S' is found in this row, record its column and row index.
    if (rowContent.indexOf('S') !== -1) {
      initialPosition[0] = rowContent.indexOf('S'); // X-coordinate (column)
      initialPosition[1] = r;                       // Y-coordinate (row)
    }
    terrainData.push(rowContent); // Add the row to the grid map.
  }

  // Assign `gridDimensions` and `terrainData` to global variables `wh` and `YX`.
  // This makes them accessible within the `ExploreGrid` function without explicit passing,
  // mimicking the original code's implicit dependency.
  var wh = gridDimensions;
  var YX = terrainData;

  // Array to store the results of running BFS for different target sequences.
  // Each element will be [pathLength, sequenceIndex].
  const solutionPaths = [];
  // Run the BFS for each predefined target sequence and store the result.
  solutionPaths.push([ExploreGrid(initialPosition[0], initialPosition[1], '2345G'), 1]);
  solutionPaths.push([ExploreGrid(initialPosition[0], initialPosition[1], '3451G'), 2]);
  solutionPaths.push([ExploreGrid(initialPosition[0], initialPosition[1], '4512G'), 3]);
  solutionPaths.push([ExploreGrid(initialPosition[0], initialPosition[1], '5123G'), 4]);
  solutionPaths.push([ExploreGrid(initialPosition[0], initialPosition[1], '1234G'), 5]);

  // Sort the results based on the path length (the first element of each inner array)
  // in ascending order.
  solutionPaths.sort(function(pathA, pathB) {
    return pathA[0] - pathB[0];
  });

  // Output the result. If the shortest path length is Infinity (no path found), print "NA".
  // Otherwise, print the index of the sequence and its corresponding shortest path length.
  if (solutionPaths[0][0] === Infinity) {
    console.log('NA');
  } else {
    console.log(solutionPaths[0][1] + ' ' + solutionPaths[0][0]);
  }
}
