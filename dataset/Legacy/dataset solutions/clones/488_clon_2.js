function solvePuzzle() {
  // An object to store visited grid cell coordinates (row,col) to prevent redundant processing.
  // This acts as a set for visited states during the breadth-first search.
  let visitedStates = {};
  // Variable to hold the final calculated minimum steps, initialized to "NA" (Not Available).
  let finalResult = "NA";
  // A queue for the BFS algorithm. Each element is an array: [row index, column index, steps taken].
  // It starts with two initial positions in the first column.
  let processingQueue = [
    [0, 0, 0],
    [1, 0, 0]
  ];

  // The main loop for the BFS traversal. It continues until the queue is empty
  // or the target destination is reached.
  while (true) {
    // If there are no more states to process in the queue, break the loop.
    if (processingQueue.length === 0) {
      break;
    }

    // Dequeue the next state to process from the front of the queue.
    let currentElement = processingQueue.shift();
    let rowIdx = currentElement[0]; // The current row index.
    let colIdx = currentElement[1]; // The current column index.

    // Construct a unique key for the current cell to check if it has been visited.
    const cellKey = rowIdx + "," + colIdx;

    // If this cell has already been processed, skip to the next iteration.
    if (visitedStates.hasOwnProperty(cellKey)) {
      continue;
    } else {
      // Mark the current cell as visited.
      visitedStates[cellKey] = true;
    }

    let stepCount = currentElement[2]; // The number of steps taken to reach this cell.

    // Check if the current cell is the target destination.
    // The target is the last column (gridWidth - 1) and the cell value must not be '2'.
    if (colIdx === gridWidth - 1 && gridData[rowIdx][colIdx] !== 2) {
      finalResult = stepCount; // If target reached, store the step count as the result.
      break; // Exit the BFS loop as a solution is found.
    }

    // Get the value of the current cell from the grid.
    let cellValue = gridData[rowIdx][colIdx];

    // Apply special movement rules based on the cell's value.
    if (cellValue === 1) {
      // If the cell value is 1, move right (increment colIdx) as long as consecutive cells are 1.
      while (true) {
        colIdx++; // Move to the next column.
        // If the next cell is not 1, we've exited the sequence of '1's.
        if (gridData[rowIdx][colIdx] !== 1) {
          colIdx--; // Step back one column to land on the last '1' cell.
          break;
        }
      }
    } else if (cellValue === 2) {
      // If the cell value is 2, move left (decrement colIdx) as long as consecutive cells are 2.
      while (true) {
        colIdx--; // Move to the previous column.
        // If the next cell is not 2, we've exited the sequence of '2's.
        if (gridData[rowIdx][colIdx] !== 2) {
          break; // Stay on the cell that is not '2'.
        }
      }
    }

    // Enqueue the next possible states. These involve switching to the other row
    // and moving to one of three possible column offsets (current column, current+1, current+2).
    for (let loopVar = 0; loopVar <= 2; loopVar++) {
      processingQueue.push([1 - rowIdx, colIdx + loopVar, stepCount + 1]);
    }
  }
  // Return the computed result.
  return finalResult;
}

// Read the entire input from standard input as a UTF-8 string.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input string into an array of lines, removing any leading/trailing whitespace.
let inputLines = rawData.trim().split("\n");

// Declare global variables that will hold the grid dimensions and data for each test case.
let gridWidth; // Represents the 'n' value from the input, indicating the width of the grid.
let gridData = []; // Represents the 'xy' 2D array from the input, containing the grid values.

// Process test cases one by one until a grid width of 0 is encountered.
while (true) {
  // Extract the grid width for the current test case from the input lines and convert it to a number.
  gridWidth = inputLines.shift() - 0;
  // If the grid width is 0, it signifies the end of input, so break the loop.
  if (gridWidth === 0) {
    break;
  }

  // Initialize the grid data array for the current test case.
  gridData = [];
  // Read the first row of grid data, split by spaces, and convert all elements to numbers.
  gridData[0] = inputLines.shift().split(" ").map(Number);
  // Read the second row of grid data, split by spaces, and convert all elements to numbers.
  gridData[1] = inputLines.shift().split(" ").map(Number);

  // Call the puzzle solving function and print its returned result to the console.
  console.log(solvePuzzle());
}
