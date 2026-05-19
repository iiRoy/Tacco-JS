// This function processes input data to determine path costs.
// It's designed to find the minimum number of moves to reach each row.
function ProcessInput(inputString) {
	const [ initialLine, ...remainingLines ] = inputString.split("\n");
	const [heightVal, widthVal] = parseNumericArray(initialLine);
	const gridData = create2DArray(remainingLines, ' ').map(rowItems => rowItems.map(itemStr => parseInt(itemStr, 10)));
	gridData.unshift(null); // Add a placeholder at index 0 to align with 1-based indexing for rows

	// This array will store the minimum move count to reach each row.
	// Initialized with -1 to indicate unreached rows.
	let pathCosts = new Array(heightVal).fill(-1);

	// Iterate through possible starting columns (from 1 to widthVal)
	for (let colIndex = 1; colIndex <= widthVal; colIndex++) {
		let currentX = colIndex; // Current horizontal position
		let currentY = 1;         // Current vertical position (starts at row 1)
		let stepCount = 0;        // Number of steps taken for the current path

		// Label for breaking out of the inner path traversal loop
		pathTraversal: while (true) {
			stepCount++; // Increment step count for each move

			// Check if movement downwards is possible from the current position
			if (isPathClearBelow(currentX, currentY, gridData)) {
				currentY++; // Move down to the next row
				// If this path is shorter or the row hasn't been reached yet, update pathCosts
				if (pathCosts[currentY - 2] === -1 || stepCount < pathCosts[currentY - 2]) {
					pathCosts[currentY - 2] = stepCount;
				}
				// If we've gone past the last row, this path is complete
				if (currentY > heightVal) break pathTraversal;
			} else {
				currentX++; // Move right to the next column
				// If we've gone past the last column, this path is complete
				if (currentX > widthVal) break pathTraversal;
			}
		}
	}
	// Output the calculated minimum path costs for each row
	console.log(pathCosts);

	// Helper function to determine if a downward move is allowed
	// based on the grid data (blocked ranges).
	function isPathClearBelow(currentXCoord, currentYCoord, dataMatrix) {
		const [startBlock, endBlock] = dataMatrix[currentYCoord];
		// A downward move is allowed if the current X coordinate is NOT within the blocked range
		return !(startBlock <= currentXCoord && currentXCoord <= endBlock);
	}
}

// Do not modify the following line (reads from standard input and calls ProcessInput)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

// --- Utility Functions ---

// Converts a string into an array of numbers.
function parseNumericArray(inputStr, separatorChar = ' ') {
	return inputStr.split(separatorChar).map(s => parseInt(s, 10));
}

// Converts a string into an array of BigInts.
function convertBigIntArray(inputStr, separatorChar = ' ') {
	return inputStr.split(separatorChar).map(s => BigInt(s));
}

// Creates a 2D array (matrix) from an array of strings.
function create2DArray(stringArray, separatorChar = ' ') {
	const resultMatrix = stringArray.map(rowString => rowString.split(separatorChar));
	return resultMatrix;
}

// Calculates the sum of numbers in an array.
function calculateSum(numericValues) {
	return numericValues.reduce((accumulator, currentValue) => accumulator + currentValue);
}
