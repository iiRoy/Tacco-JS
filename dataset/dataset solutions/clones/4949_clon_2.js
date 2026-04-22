'use strict'; /* Enforce strict parsing and error handling */

// Acquire file system module for input operations
const getFileSys = require('fs');

// Read standard input, decode as UTF-8, remove leading/trailing whitespace, and split into lines
const dataLines = getFileSys.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Parse the first line for grid dimensions
const dimArray = dataLines[0].split(' ').map(Number);
const numRows = dimArray[0]; // Total number of rows in the grid
const numCols = dimArray[1]; // Total number of columns in the grid

// Parse the second line for the count of data points
const pointCount = parseInt(dataLines[1], 10); // Number of data points to process

// Extract raw data strings for each point (row, column, value)
const pointDataStrings = dataLines.slice(2);

// Initialize slope storage variables. `null` indicates no slope has been determined yet.
let slopeXOdd = null; // Slope for odd-indexed columns (X-axis)
let slopeXEven = null; // Slope for even-indexed columns (X-axis)
let slopeYOdd = null; // Slope for odd-indexed rows (Y-axis)
let slopeYEven = null; // Slope for even-indexed rows (Y-axis)

// Initialize maps to store previously encountered points for each parity and axis
// Key: Row/Column index, Value: [Column/Row index, Value]
const coordMapXOdd = new Map(); // Stores (row -> [col, val]) for odd columns
const coordMapXEven = new Map(); // Stores (row -> [col, val]) for even columns
const coordMapYOdd = new Map(); // Stores (col -> [row, val]) for odd rows
const coordMapYEven = new Map(); // Stores (col -> [row, val]) for even rows

// Iterate through each data point provided in the input
for (let idx = 0; idx < pointCount; ++idx) {
	// Parse the current data point string into its components: row, column, and value
	const currentPointStr = pointDataStrings[idx].split(' ');
	const currRow = parseInt(currentPointStr[0], 10); // Current row index
	const currCol = parseInt(currentPointStr[1], 10); // Current column index
	const currVal = parseInt(currentPointStr[2], 10); // Current value at (row, col)

	// --- Process Y-axis (Row-wise) relationships ---
	// Special handling if the number of rows is exactly 2
	if (numRows === 2) {
		// Check if we've already processed a point in this column for Y-even (R=2 implies all rows are effectively 'even' for this logic)
		if (coordMapYEven.has(currCol)) {
			// Retrieve the previously stored row and value for this column
			const prevRowVal = coordMapYEven.get(currCol);
			const prevRow = prevRowVal[0]; // Previous row index
			const prevVal = prevRowVal[1]; // Previous value

			// Calculate the slope based on the two points in this column
			const calcSlope = (prevVal - currVal) / (prevRow - currRow);

			// If no Y-even slope has been established yet
			if (slopeYEven === null) {
				slopeYEven = calcSlope; // Set the global Y-even slope

				// Validate all existing points in coordMapYEven against the newly established slope
				for (const mapEntry of coordMapYEven.entries()) {
					const entryCol = mapEntry[0]; // Column of the existing entry
					const entryRow = mapEntry[1][0]; // Row of the existing entry
					const entryVal = mapEntry[1][1]; // Value of the existing entry

					// Check if the value at (entryRow, entryCol) is consistent with the slope
					// The conditions represent linear interpolation/extrapolation bounds
					if (entryVal - calcSlope * (entryRow - 1) < 0 ||
						entryVal + calcSlope * (2 - entryRow) < 0) {
						console.log('No'); // Output 'No' and terminate if inconsistent
						process.exit();
					}
				}
			} else {
				// If a Y-even slope already exists, ensure the newly calculated slope matches
				if (calcSlope !== slopeYEven) {
					console.log('No'); // Output 'No' and terminate if slopes differ
					process.exit();
				}
			}

			// Finally, validate the current point against the established slope
			if (currVal - calcSlope * (currRow - 1) < 0 ||
				currVal + calcSlope * (2 - currRow) < 0) {
				console.log('No'); // Output 'No' and terminate if inconsistent
				process.exit();
			}
		} else {
			// If no previous point in this column, but a global Y-even slope exists
			if (slopeYEven !== null) {
				// Validate the current point against the global slope
				if (currVal - slopeYEven * (currRow - 1) < 0 ||
					currVal + slopeYEven * (2 - currRow) < 0) {
					console.log('No'); // Output 'No' and terminate if inconsistent
					process.exit();
				}
			}
			// Store the current point in the map for future comparisons
			coordMapYEven.set(currCol, [currRow, currVal]);
		}
	} else {
		// General case: More than 2 rows
		// Check if the current row index is even
		if (currRow % 2 === 0) {
			// Process for even rows
			if (coordMapYEven.has(currCol)) {
				const prevRowVal = coordMapYEven.get(currCol);
				const prevRow = prevRowVal[0];
				const prevVal = prevRowVal[1];

				const calcSlope = (prevVal - currVal) / ((prevRow - currRow) / 2);

				if (slopeYEven === null) {
					slopeYEven = calcSlope;

					// Note: Original code iterates over `map_y_odd` here, which might be a bug.
					// Replicating original logic.
					for (const mapEntry of coordMapYOdd.entries()) {
						const entryCol = mapEntry[0];
						const entryRow = mapEntry[1][0];
						const entryVal = mapEntry[1][1];

						if (entryVal - calcSlope * ((entryRow / 2) - 1) < 0 ||
							entryVal + calcSlope * Math.floor((numRows - entryRow) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					if (calcSlope !== slopeYEven) {
						console.log('No');
						process.exit();
					}
				}
				if (currVal - calcSlope * ((currRow / 2) - 1) < 0 ||
					currVal + calcSlope * Math.floor((numRows - currRow) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {
				if (slopeYEven !== null) { // Changed from `false` to `null`
					if (currVal - slopeYEven * ((currRow / 2) - 1) < 0 ||
						currVal + slopeYEven * Math.floor((numRows - currRow) / 2) < 0) {
						console.log('No');
						process.exit();
					}
				}
				coordMapYEven.set(currCol, [currRow, currVal]);
			}
		} else {
			// Process for odd rows
			if (coordMapYOdd.has(currCol)) {
				const prevRowVal = coordMapYOdd.get(currCol);
				const prevRow = prevRowVal[0];
				const prevVal = prevRowVal[1];

				const calcSlope = (prevVal - currVal) / ((prevRow - currRow) / 2);

				if (slopeYOdd === null) {
					slopeYOdd = calcSlope;

					for (const mapEntry of coordMapYOdd.entries()) {
						const entryCol = mapEntry[0];
						const entryRow = mapEntry[1][0];
						const entryVal = mapEntry[1][1];

						if (entryVal - calcSlope * Math.floor(entryRow / 2) < 0 ||
							entryVal + calcSlope * Math.floor((numRows - entryRow) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					if (calcSlope !== slopeYOdd) {
						console.log('No');
						process.exit();
					}
				}
				if (currVal - calcSlope * Math.floor((currRow - 1) / 2) < 0 ||
					currVal + calcSlope * Math.floor((numRows - currRow) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {
				if (slopeYOdd !== null) { // Changed from `false` to `null`
					if (currVal - slopeYOdd * Math.floor(currRow / 2) < 0 ||
						currVal + slopeYOdd * Math.floor((numRows - currRow) / 2) < 0) {
						console.log('No');
						process.exit();
					}
				}
				coordMapYOdd.set(currCol, [currRow, currVal]);
			}
		}
	}

	// --- Process X-axis (Column-wise) relationships ---
	// Special handling if the number of columns is exactly 2
	if (numCols === 2) {
		// Check if we've already processed a point in this row for X-even
		if (coordMapXEven.has(currRow)) {
			const prevColVal = coordMapXEven.get(currRow);
			const prevCol = prevColVal[0];
			const prevVal = prevColVal[1];

			const calcSlope = (prevVal - currVal) / (prevCol - currCol);

			// Note: Original code uses -1 here, changing to null for consistency
			if (slopeXEven === null) {
				slopeXEven = calcSlope;

				for (const mapEntryX of coordMapXEven.entries()) {
					const entryRowX = mapEntryX[0];
					const entryColX = mapEntryX[1][0];
					const entryValX = mapEntryX[1][1];

					if (entryValX - calcSlope * (entryColX - 1) < 0 ||
						entryValX + calcSlope * (numCols - entryColX) < 0) {
						console.log('No');
						process.exit();
					}
				}
			} else {
				if (calcSlope !== slopeXEven) {
					console.log('No');
					process.exit();
				}
			}
			if (currVal - calcSlope * (currCol - 1) < 0 ||
				currVal + calcSlope * (numCols - currCol) < 0) {
				console.log('No');
				process.exit();
			}
		} else {
			if (slopeXEven !== null) { // Changed from `false` to `null`
				if (currVal - slopeXEven * (currCol - 1) < 0 ||
					currVal + slopeXEven * (numCols - currCol) < 0) {
					console.log('No');
					process.exit();
				}
			}
			coordMapXEven.set(currRow, [currCol, currVal]);
		}
	} else {
		// General case: More than 2 columns
		// Check if the current column index is even
		if (currCol % 2 === 0) {
			// Process for even columns
			if (coordMapXEven.has(currRow)) {
				const prevColVal = coordMapXEven.get(currRow);
				const prevCol = prevColVal[0];
				const prevVal = prevColVal[1];

				const calcSlope = (prevVal - currVal) / ((prevCol - currCol) / 2);

				if (slopeXEven === null) {
					slopeXEven = calcSlope;

					for (const mapEntryX of coordMapXEven.entries()) {
						const entryRowX = mapEntryX[0];
						const entryColX = mapEntryX[1][0];
						const entryValX = mapEntryX[1][1];

						if (entryValX - calcSlope * ((entryColX / 2) - 1) < 0 ||
							entryValX + calcSlope * Math.floor((numCols - entryColX) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					if (calcSlope !== slopeXEven) {
						console.log('No');
						process.exit();
					}
				}
				if (currVal - calcSlope * ((currCol / 2) - 1) < 0 ||
					currVal + calcSlope * Math.floor((numCols - currCol) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {
				if (slopeXEven !== null) { // Changed from `false` to `null`
					if (currVal - slopeXEven * ((currCol / 2) - 1) < 0 ||
						currVal + slopeXEven * Math.floor((numCols - currCol) / 2) < 0) {
						console.log('No');
						process.exit();
					}
				}
				coordMapXEven.set(currRow, [currCol, currVal]);
			}
		} else {
			// Process for odd columns
			if (coordMapXOdd.has(currRow)) {
				const prevColVal = coordMapXOdd.get(currRow);
				const prevCol = prevColVal[0];
				const prevVal = prevColVal[1];

				const calcSlope = (prevVal - currVal) / ((prevCol - currCol) / 2);

				if (slopeXOdd === null) {
					slopeXOdd = calcSlope;

					for (const mapEntryX of coordMapXOdd.entries()) {
						const entryRowX = mapEntryX[0];
						const entryColX = mapEntryX[1][0];
						const entryValX = mapEntryX[1][1];

						if (entryValX - calcSlope * Math.floor(entryColX / 2) < 0 ||
							entryValX + calcSlope * Math.floor((numCols - entryColX) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					if (calcSlope !== slopeXOdd) {
						console.log('No');
						process.exit();
					}
				}
				if (currVal - calcSlope * Math.floor(currCol / 2) < 0 ||
					currVal + calcSlope * Math.floor((numCols - currCol) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {
				if (slopeXOdd !== null) { // Changed from `false` to `null`
					if (currVal - slopeXOdd * Math.floor(currCol / 2) < 0 ||
						currVal + slopeXOdd * Math.floor((numCols - currCol) / 2) < 0) {
						console.log('No');
						process.exit();
					}
				}
				coordMapXOdd.set(currRow, [currCol, currVal]);
			}
		}
	}
}

// If the program reaches this point, all checks passed successfully.
console.log('Yes');