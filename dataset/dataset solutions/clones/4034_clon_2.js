'use strict';

// This script processes grid data from standard input to find a path.
console.log(function(inputData) {
  // Parse the input string into an array of lines.
  const linesArray = inputData.trim().split('\n');

  // Extract grid dimensions (Height and Width) from the first line.
  const dimensions = linesArray[0].split(' ').map(val => val | 0);
  const heightVal = dimensions[0];
  const widthVal = dimensions[1];

  // Initialize the grid layout with a border of 'Infinity' to simplify boundary checks.
  const gridLayout = [Array(widthVal + 2).fill(Infinity)];
  let dotCount = 0; // Counter for '.' cells (walkable path).

  // Populate the grid layout based on input lines.
  for (let rowIdx = 1; rowIdx <= heightVal; rowIdx++) {
    gridLayout.push([Infinity]); // Left border for the current row.
    for (let colIdx = 0; colIdx < widthVal; colIdx++) {
      // If the cell is a '.', it's walkable, mark it with 0 and increment dotCount.
      // Otherwise, it's an obstacle, mark it with 'Infinity'.
      if (linesArray[rowIdx][colIdx] === '.') {
        dotCount++;
        gridLayout[rowIdx].push(0);
      } else {
        gridLayout[rowIdx].push(Infinity);
      }
    }
    gridLayout[rowIdx].push(Infinity); // Right border for the current row.
  }
  gridLayout.push(Array(widthVal + 2).fill(Infinity)); // Bottom border.

  // Define possible movement directions (up, left, down, right).
  const moveDirections = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1]
  ];

  // Initialize a Breadth-First Search (BFS) queue.
  // Each element is [x_coordinate, y_coordinate, steps_taken].
  // Starting point is (1,1) with 2 steps (as per problem context, likely 1-indexed and start counts as 1, then 1 step to move).
  const bfsQueue = [
    [1, 1, 2]
  ];

  // Perform BFS until the queue is empty.
  do {
    const currentPos = bfsQueue.shift(); // Get the next position to explore.

    // Explore all four possible directions from the current position.
    for (const directionVector of moveDirections) {
      const nextCol = currentPos[0] + directionVector[0];
      const nextRow = currentPos[1] + directionVector[1];

      // If the target destination (bottom-right corner) is reached,
      // calculate and return the result.
      if (nextCol === widthVal && nextRow === heightVal) {
        return dotCount - currentPos[2];
      }

      // If the next cell is walkable (marked 0) and hasn't been visited yet,
      // mark it with the current path length and add it to the queue.
      if (gridLayout[nextRow][nextCol] === 0) {
        gridLayout[nextRow][nextCol] = currentPos[2] + 1;
        bfsQueue.push([nextCol, nextRow, currentPos[2] + 1]);
      }
    }
  } while (bfsQueue[0]); // Continue as long as there are elements in the queue.

  // This part should ideally not be reached if a path always exists.
  // If no path is found, the problem statement implies a path always exists.
  // For robustness, one might return an error or specific value here.
  // However, preserving original behavior, this implies the loop will always find a path.
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
