/* This function recursively traces a path on a grid, marking cells. */
function pathfinder(row, col, directionIdx) {
	// If the current cell is already marked as a path, do nothing.
	if (gameGrid[row][col] !== "+")   {
		return;
	}

	// Define changes for row and column based on direction.
	var verticalOffsets = [-1, 0, 1, 0]; // Up, Right, Down, Left
	var horizontalOffsets = [0, 1, 0, -1]; // Up, Right, Down, Left

	// Calculate the coordinates of the next cell.
	var nextRow = row + verticalOffsets[directionIdx];
	var nextCol = col + horizontalOffsets[directionIdx];

	// Check if the next cell is out of bounds.
	if (nextRow < 0 || nextCol < 0 || nextRow >= gridSize || nextCol >= gridSize) {
		// If out of bounds, change direction and try again from the current cell.
		directionIdx = (directionIdx + 1) % 4; // Cycle through 0, 1, 2, 3
		pathfinder(row, col, directionIdx);
	} else {
		// If the next cell is a '#' (obstacle/filled cell).
		if (gameGrid[nextRow][nextCol] === "#") {
			// Mark the cell before the obstacle as a path.
			gameGrid[nextRow - verticalOffsets[directionIdx]][nextCol - horizontalOffsets[directionIdx]] = "+";
			// Recursive calls based on the current direction, adjusting position.
			if (directionIdx === 3) {
				pathfinder(nextRow - 2 * verticalOffsets[directionIdx] - 1, nextCol - 2 * horizontalOffsets[directionIdx], 0);
			} else if (directionIdx === 0) {
				pathfinder(nextRow - 2 * verticalOffsets[directionIdx], nextCol - 2 * horizontalOffsets[directionIdx] + 1, 1);
			} else if (directionIdx === 1) {
				pathfinder(nextRow - 2 * verticalOffsets[directionIdx] + 1, nextCol - 2 * horizontalOffsets[directionIdx], 2);
			} else if (directionIdx === 2) {
				pathfinder(nextRow - 2 * verticalOffsets[directionIdx], nextCol - 2 * horizontalOffsets[directionIdx] - 1, 3);
			}
		} else {
			// If the next cell is not an obstacle, mark the current cell as an obstacle.
			gameGrid[row][col] = "#";
			// Store the coordinates of the last cell marked as an obstacle.
			lastMarkedCell = [row, col];
			// Move to the next cell in the current direction.
			pathfinder(nextRow, nextCol, directionIdx);
		}
	}
}

// Acquire file system module for input handling.
var dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process raw input: trim whitespace, split by newline, convert to numbers.
var numericInputList = dataSource.trim().split("\n").map(Number);

// Extract the total number of test cases.
var totalCases = numericInputList.shift();

// Iterate through each test case.
while (totalCases--) {
	// Get the grid size for the current test case.
	var gridSize = numericInputList.shift();

	// Handle special cases for grid size 0.
	if (gridSize === 0) {
		console.log("");
		continue;
	}

	// Handle special cases for grid size 1.
	if (gridSize === 1) {
		console.log("#");
		continue;
	}

	// Initialize the game grid.
	var gameGrid = [];
	for (var outerIdx = 0; outerIdx < gridSize; outerIdx++) {
		gameGrid[outerIdx] = []; // Create a new row.
		for (var innerIdx = 0; innerIdx < gridSize; innerIdx++) {
			gameGrid[outerIdx][innerIdx] = "+"; // Initialize cells with a '+' (empty).
		}
	}

	// Variable to store the last cell marked as '#'.
	var lastMarkedCell = [];

	// Start the pathfinding process from the bottom-left corner, facing up (direction 0).
	pathfinder(gridSize - 1, 0, 0);

	// If the grid size is even, adjust the last marked cell.
	if (gridSize % 2 === 0) {
		gameGrid[lastMarkedCell[0]][lastMarkedCell[1]] = "+";
	}

	// Output the final grid, replacing commas and '+' with spaces.
	console.log(gameGrid.join("\n").replace(/,/g, "").replace(/\+/g, " "));
}