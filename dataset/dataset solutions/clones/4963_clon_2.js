'use strict';
// This script reads grid dimensions and data points from standard input
// and determines if the given points form a valid linear progression
// based on specific rules for odd/even rows/columns and grid sizes.

// Import the file system module to read input data synchronously
const dataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Parse the first line to get the number of rows and columns
const gridDims = dataLines[0].split(' ').map(Number);
const numRows = gridDims[0]; // Total number of rows in the grid
const numCols = gridDims[1]; // Total number of columns in the grid

// Parse the second line to get the total number of data points
const numPoints = parseInt(dataLines[1], 10); // Ensure integer parsing with radix 10

// Extract the remaining lines, which contain the coordinates and values of the data points
const pointCoordsAndValues = dataLines.slice(2);

// Initialize variables to store the common differences (slopes) for various grid segments.
// 'false' is used as an initial state to indicate that a difference has not yet been established.
let xOddDiff = false;  // Common difference for points in odd-indexed columns (horizontal)
let xEvenDiff = false; // Common difference for points in even-indexed columns (horizontal)
let yOddDiff = false;  // Common difference for points in odd-indexed rows (vertical)
let yEvenDiff = false; // Common difference for points in even-indexed rows (vertical)

// Initialize Maps to store the first encountered data point for a given row/column index.
// These maps help in calculating the common difference when a second point is found.
let rowOddMap = new Map();  // Stores {row_idx: [col_idx, value]} for points in odd columns
let rowEvenMap = new Map(); // Stores {row_idx: [col_idx, value]} for points in even columns
let colOddMap = new Map();  // Stores {col_idx: [row_idx, value]} for points in odd rows
let colEvenMap = new Map(); // Stores {col_idx: [row_idx, value]} for points in even rows

// Iterate through each provided data point
for (let idx = 0; idx < numPoints; idx++) {
	// Parse the current data point's row, column, and value
	let currentPointData = pointCoordsAndValues[idx].split(' ');
	let currRow = parseInt(currentPointData[0], 10); // Current row index (1-based)
	let currCol = parseInt(currentPointData[1], 10); // Current column index (1-based)
	let currVal = parseInt(currentPointData[2], 10); // Value at the current (row, col)

	// --- Logic for vertical (Y-axis) consistency ---
	// Special handling if the grid has only 2 rows
	if (numRows === 2) {
		// Check if a point in the current column has already been processed
		if (colEvenMap.has(currCol)) {
			// Retrieve the previously stored point's row and value for this column
			let prevRowVal = colEvenMap.get(currCol);
			let prevRow = prevRowVal[0];
			let prevVal = prevRowVal[1];

			// Calculate the difference (slope) between the two points
			let difference = (prevVal - currVal) / (prevRow - currRow);

			// If yEvenDiff (common difference for 2-row case) is not yet set
			if (yEvenDiff === false) {
				yEvenDiff = difference; // Set the common difference

				// Validate all previously stored points in colEvenMap against this new difference
				for (let colRowValEntry of colEvenMap.entries()) {
					let mappedCol = colRowValEntry[0]; // Column index (not directly used in calculation here)
					let mappedRow = colRowValEntry[1][0]; // Row index of the mapped point
					let mappedVal = colRowValEntry[1][1]; // Value of the mapped point

					// Check if the value at the mapped point is consistent and non-negative at boundaries
					if (mappedVal - difference * (mappedRow - 1) < 0 ||
						mappedVal + difference * (2 - mappedRow) < 0) {
						console.log('No');
						process.exit(); // Exit if inconsistency found
					}
				}
			} else {
				// If yEvenDiff is already set, ensure the current difference matches
				if (difference !== yEvenDiff) {
					console.log('No');
					process.exit(); // Exit if differences don't match
				}
			}

			// Validate the current point against the established difference
			if (currVal - difference * (currRow - 1) < 0 ||
				currVal + difference * (2 - currRow) < 0) {
				console.log('No');
				process.exit(); // Exit if current point is inconsistent
			}

		} else {
			// If no previous point in this column, but a common difference is already established
			if (yEvenDiff !== false) {
				// Validate the current point against the established difference
				if (currVal - yEvenDiff * (currRow - 1) < 0 ||
					currVal + yEvenDiff * (2 - currRow) < 0) {
					console.log('No');
					process.exit(); // Exit if current point is inconsistent
				}
			}
			// Store the current point's data for future comparisons
			colEvenMap.set(currCol, [currRow, currVal]);
		}

	} else { // General case for grids with more than 2 rows
		// Check if the current row index is even
		if (currRow % 2 === 0) {
			// Check if a point in the current column (for an even row) has already been processed
			if (colEvenMap.has(currCol)) {
				let prevRowVal = colEvenMap.get(currCol);
				let prevRow = prevRowVal[0];
				let prevVal = prevRowVal[1];

				// Calculate difference, adjusted for even row spacing (every other row)
				let difference = (prevVal - currVal) / ((prevRow - currRow) / 2);

				// If yEvenDiff is not yet set
				if (yEvenDiff === false) {
					yEvenDiff = difference;

					// Validate all entries in colOddMap (NOTE: Original code iterates colOddMap here, not colEvenMap)
					for (let colRowValEntry of colOddMap.entries()) {
						let mappedCol = colRowValEntry[0];
						let mappedRow = colRowValEntry[1][0];
						let mappedVal = colRowValEntry[1][1];

						// Check consistency with difference
						if (mappedVal - difference * ((mappedRow / 2) - 1) < 0 ||
							mappedVal + difference * Math.floor((numRows - mappedRow) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					// If yEvenDiff is set, ensure current difference matches
					if (difference !== yEvenDiff) {
						console.log('No');
						process.exit();
					}
				}
				// Validate the current point
				if (currVal - difference * ((currRow / 2) - 1) < 0 ||
					currVal + difference * Math.floor((numRows - currRow) / 2) < 0) {
					console.log('No');
					process.exit();
				}

			} else {
				// If no previous point in this column for an even row, but yEvenDiff is NOT set
				// (NOTE: Original code uses `yEvenDiff === false` here, which means this check only runs if the difference is unset)
				if (yEvenDiff === false) {
					// This check will use `false` as the difference, effectively checking if `currVal < 0`
					if (currVal - yEvenDiff * ((currRow / 2) - 1) < 0 ||
						currVal + yEvenDiff * Math.floor((numRows - currRow) / 2) < 0) {
						console.log('No');
						process.exit();
					}
				}
				// Store the current point's data
				colEvenMap.set(currCol, [currRow, currVal]);
			}
		} else { // Current row index is odd
			// Check if a point in the current column (for an odd row) has already been processed
			if (colOddMap.has(currCol)) {
				let prevRowVal = colOddMap.get(currCol);
				let prevRow = prevRowVal[0];
				let prevVal = prevRowVal[1];

				// Calculate difference, adjusted for odd row spacing
				let difference = (prevVal - currVal) / ((prevRow - currRow) / 2);

				// If yOddDiff is not yet set
				if (yOddDiff === false) {
					yOddDiff = difference;

					// Validate all entries in colOddMap
					for (let colRowValEntry of colOddMap.entries()) {
						let mappedCol = colRowValEntry[0];
						let mappedRow = colRowValEntry[1][0];
						let mappedVal = colRowValEntry[1][1];

						// Check consistency with difference
						if (mappedVal - difference * Math.floor(mappedRow / 2) < 0 ||
							mappedVal + difference * Math.floor((numRows - mappedRow) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					// If yOddDiff is set, ensure current difference matches
					if (difference !== yOddDiff) {
						console.log('No');
						process.exit();
					}
				}
				// Validate the current point
				if (currVal - difference * Math.floor((currRow - 1) / 2) < 0 ||
					currVal + difference * Math.floor((numRows - currRow) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {
				// If no previous point in this column for an odd row, but yOddDiff is NOT set
				// (NOTE: Original code uses `yOddDiff === false` here, similar to the even row case)
				if (yOddDiff === false) {
					// This check will use `false` as the difference, effectively checking if `currVal < 0`
					if (currVal - yOddDiff * Math.floor(currRow / 2) < 0 ||
						currVal + yOddDiff * Math.floor((numRows - currRow) / 2) < 0) {
						console.log('No');
						process.exit();
					}
				}
				// Store the current point's data
				colOddMap.set(currCol, [currRow, currVal]);
			}
		}
	}

	// --- Logic for horizontal (X-axis) consistency ---
	// Special handling if the grid has only 2 columns
	if (numCols === 2) {
		// Check if a point in the current row has already been processed
		if (rowEvenMap.has(currRow)) {
			// Retrieve the previously stored point's column and value for this row
			let prevColVal = rowEvenMap.get(currRow);
			let prevCol = prevColVal[0];
			let prevVal = prevColVal[1];

			// Calculate the difference (slope) between the two points
			let difference = (prevVal - currVal) / (prevCol - currCol);

			// This section contains a known inconsistency from the original code:
			// `xEvenDiff` is initialized to `false`, but first checked against `-1`.
			// If `xEvenDiff` is `false`, `false === -1` is `false`, so it falls into the `else` block.
			// In the `else` block, `d !== xEvenDiff` (i.e., `d !== false`) will be true for any numeric `d`,
			// causing an immediate 'No' and exit. This behavior is preserved.
			if (xEvenDiff === -1) { // This condition will likely be false on first check
				xEvenDiff = difference; // Set the common difference

				// Validate all previously stored points in rowEvenMap against this new difference
				for (let rowColValEntry of rowEvenMap.entries()) {
					let mappedRow = rowColValEntry[0]; // Row index (not directly used in calculation here)
					let mappedCol = rowColValEntry[1][0]; // Column index of the mapped point
					let mappedVal = rowColValEntry[1][1]; // Value of the mapped point

					// Check if the value at the mapped point is consistent and non-negative at boundaries
					if (mappedVal - difference * (mappedCol - 1) < 0 ||
						mappedVal + difference * (numCols - mappedCol) < 0) {
						console.log('No');
						process.exit();
					}
				}
			} else {
				// If xEvenDiff is already set (or is false, triggering the bug), ensure the current difference matches
				if (difference !== xEvenDiff) {
					console.log('No');
					process.exit();
				}
			}
			// Validate the current point against the established difference
			if (currVal - difference * (currCol - 1) < 0 ||
				currVal + difference * (numCols - currCol) < 0) {
				console.log('No');
				process.exit();
			}

		} else {
			// If no previous point in this row, but a common difference is already established
			if (xEvenDiff !== false) { // This check uses `false`, consistent with initialization
				// Validate the current point against the established difference
				if (currVal - xEvenDiff * (currCol - 1) < 0 ||
					currVal + xEvenDiff * (numCols - currCol) < 0) {
					console.log('No');
					process.exit();
				}
			}
			// Store the current point's data
			rowEvenMap.set(currRow, [currCol, currVal]);
		}
	} else { // General case for grids with more than 2 columns
		// Check if the current column index is even
		if (currCol % 2 === 0) {
			// Check if a point in the current row (for an even column) has already been processed
			if (rowEvenMap.has(currRow)) {
				let prevColVal = rowEvenMap.get(currRow);
				let prevCol = prevColVal[0];
				let prevVal = prevColVal[1];

				// Calculate difference, adjusted for even column spacing
				let difference = (prevVal - currVal) / ((prevCol - currCol) / 2);

				// If xEvenDiff is not yet set
				if (xEvenDiff === false) {
					xEvenDiff = difference;

					// Validate all entries in rowEvenMap
					for (let rowColValEntry of rowEvenMap.entries()) {
						let mappedRow = rowColValEntry[0];
						let mappedCol = rowColValEntry[1][0];
						let mappedVal = rowColValEntry[1][1];

						// Check consistency with difference
						if (mappedVal - difference * ((mappedCol / 2) - 1) < 0 ||
							mappedVal + difference * Math.floor((numCols - mappedCol) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					// If xEvenDiff is set, ensure current difference matches
					if (difference !== xEvenDiff) {
						console.log('No');
						process.exit();
					}
				}
				// Validate the current point
				if (currVal - difference * ((currCol / 2) - 1) < 0 ||
					currVal + difference * Math.floor((numCols - currCol) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {
				// If no previous point in this row for an even column, but a common difference is set
				if (xEvenDiff !== false) {
					if (currVal - xEvenDiff * ((currCol / 2) - 1) < 0 ||
						currVal + xEvenDiff * Math.floor((numCols - currCol) / 2) < 0) {
						console.log('No');
						process.exit();
					}
				}
				// Store the current point's data
				rowEvenMap.set(currRow, [currCol, currVal]);
			}

		} else { // Current column index is odd
			// Check if a point in the current row (for an odd column) has already been processed
			if (rowOddMap.has(currRow)) {
				let prevColVal = rowOddMap.get(currRow);
				let prevCol = prevColVal[0];
				let prevVal = prevColVal[1];

				// Calculate difference, adjusted for odd column spacing
				let difference = (prevVal - currVal) / ((prevCol - currCol) / 2);

				// If xOddDiff is not yet set
				if (xOddDiff === false) {
					xOddDiff = difference;

					// Validate all entries in rowOddMap
					for (let rowColValEntry of rowOddMap.entries()) {
						let mappedRow = rowColValEntry[0];
						let mappedCol = rowColValEntry[1][0];
						let mappedVal = rowColValEntry[1][1];

						// Check consistency with difference
						if (mappedVal - difference * Math.floor(mappedCol / 2) < 0 ||
							mappedVal + difference * Math.floor((numCols - mappedCol) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					// If xOddDiff is set, ensure current difference matches
					if (difference !== xOddDiff) {
						console.log('No');
						process.exit();
					}
				}
				// Validate the current point
				if (currVal - difference * Math.floor(currCol / 2) < 0 ||
					currVal + difference * Math.floor((numCols - currCol) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {
				// If no previous point in this row for an odd column, but a common difference is set
				if (xOddDiff !== false) {
					if (currVal - xOddDiff * Math.floor(currCol / 2) < 0 ||
						currVal + xOddDiff * Math.floor((numCols - currCol) / 2) < 0) {
						console.log('No');
						process.exit();
					}
				}
				// Store the current point's data
				rowOddMap.set(currRow, [currCol, currVal]);
			}
		}
	}
}

// If the loop completes without any inconsistencies leading to an early exit,
// then all conditions are met, and the grid is considered valid.
console.log('Yes');
