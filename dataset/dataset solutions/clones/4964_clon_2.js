'use strict';
// This script processes grid data to determine if a specific pattern holds true.

// Read input from standard input, decode, trim, and split into lines.
const dataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Parse grid dimensions (Rows and Columns) from the first line.
const gridDims = dataLines[0].split(' ').map(Number);
const numRows = gridDims[0]; // Total number of rows in the grid.
const numCols = gridDims[1]; // Total number of columns in the grid.

// Parse the number of data points from the second line.
const numPoints = parseInt(dataLines[1]);

// Extract the data points (row, column, value) from the remaining lines.
const pointDataStrings = dataLines.slice(2);

// Initialize variables to store calculated differences for x and y coordinates.
// -1 indicates that the difference has not yet been established.
let deltaXOdd = -1;
let deltaXEven = -1;
let deltaYOdd = -1;
let deltaYEven = -1;

// Initialize Maps to store points based on their parity and coordinate type.
// These maps will hold [coordinate, value] pairs for a given row/column.
let xOddPoints = new Map(); // Stores points where x-coordinate (row) is odd.
let xEvenPoints = new Map(); // Stores points where x-coordinate (row) is even.
let yOddPoints = new Map(); // Stores points where y-coordinate (column) is odd.
let yEvenPoints = new Map(); // Stores points where y-coordinate (column) is even.

// Iterate through each provided data point.
for (let idx = 0; idx < numPoints; idx++) {
	// Parse the current data point: row, column, and associated value.
	let currentPointStr = pointDataStrings[idx].split(' ');
	let rowCoord = parseInt(currentPointStr[0]);
	let colCoord = parseInt(currentPointStr[1]);
	let valueA = parseInt(currentPointStr[2]);

	// --- Process based on Y-coordinate (column) parity ---
	// Special handling if the number of rows is exactly 2.
	if (numRows === 2) {
		// For R=2, all rows are effectively 'even' in terms of parity logic for Y-axis.
		if (yEvenPoints.has(colCoord)) {
			// If a point with the same column already exists, compare values.
			let yPointInfo = yEvenPoints.get(colCoord);
			let prevRow = yPointInfo[0];
			let prevValA = yPointInfo[1];

			// Calculate the difference 'd'.
			let difference = prevValA - valueA;

			// If this is the first difference found for y-even, set it.
			if (deltaYEven === -1) {
				deltaYEven = difference;
			} else {
				// If a difference was already set, it must match the current one.
				if (difference !== deltaYEven) {
					console.log('No');
					process.exit();
				}
			}
			// Check boundary conditions for the value 'a1'.
			if (valueA - difference * rowCoord < 0 ||
				valueA + difference * (numRows - rowCoord) < 0) {
				console.log('No');
				process.exit();
			}
		} else {
			// If no point with this column exists, store the current one.
			yEvenPoints.set(colCoord, [rowCoord, valueA]);
		}
	} else {
		// General case for R > 2.
		if (rowCoord % 2 === 0) {
			// If the row coordinate is even.
			if (yEvenPoints.has(colCoord)) {
				let yPointInfo = yEvenPoints.get(colCoord);
				let prevRow = yPointInfo[0];
				let prevValA = yPointInfo[1];

				// Calculate the difference 'd' based on row difference.
				let difference = (prevValA - valueA) / ((prevRow - rowCoord) / 2);

				if (deltaYEven === -1) {
					// Ensure 'd' is an integer.
					if (Math.round(difference) !== difference) {
						console.log('No');
						process.exit();
					}
					deltaYEven = difference;

					// After establishing deltaYEven, check all previously stored yOddPoints.
					for (let yOddEntry of yOddPoints.entries()) {
						let entryCol = yOddEntry[0];
						let entryRow = yOddEntry[1][0];
						let entryValA = yOddEntry[1][1];

						// Check boundary conditions for these points.
						if (entryValA - difference * ((entryRow / 2) - 1) < 0 ||
							entryValA + difference * Math.floor((numRows - entryRow) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					// If deltaYEven was already set, it must match.
					if (difference !== deltaYEven) {
						console.log('No');
						process.exit();
					}
				}
				// Check boundary conditions for the current point.
				if (valueA - difference * ((rowCoord / 2) - 1) < 0 ||
					valueA + difference * Math.floor((numRows - rowCoord) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {
				yEvenPoints.set(colCoord, [rowCoord, valueA]);
			}
		} else {
			// If the row coordinate is odd.
			if (yOddPoints.has(colCoord)) {
				let yPointInfo = yOddPoints.get(colCoord);
				let prevRow = yPointInfo[0];
				let prevValA = yPointInfo[1];

				// Calculate the difference 'd'.
				let difference = (prevValA - valueA) / ((prevRow - rowCoord) / 2);

				if (deltaYOdd === -1) {
					// Ensure 'd' is an integer.
					if (Math.round(difference) !== difference) {
						console.log('No');
						process.exit();
					}

					deltaYOdd = difference;

					// After establishing deltaYOdd, check all previously stored yOddPoints.
					for (let yOddEntry of yOddPoints.entries()) {
						let entryCol = yOddEntry[0];
						let entryRow = yOddEntry[1][0];
						let entryValA = yOddEntry[1][1];

						// Check boundary conditions for these points.
						if (entryValA - difference * Math.floor(entryRow / 2) < 0 ||
							entryValA + difference * Math.floor((numRows - entryRow) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					// If deltaYOdd was already set, it must match.
					if (difference !== deltaYOdd) {
						console.log('No');
						process.exit();
					}
				}
				// Check boundary conditions for the current point.
				if (valueA - difference * Math.floor(rowCoord / 2) < 0 ||
					valueA + difference * Math.floor((numRows - rowCoord) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {
				yOddPoints.set(colCoord, [rowCoord, valueA]);
			}
		}
	}

	// --- Process based on X-coordinate (row) parity ---
	// Special handling if the number of columns is exactly 2.
	if (numCols === 2) {
		// For C=2, all columns are effectively 'even' in terms of parity logic for X-axis.
		if (xEvenPoints.has(rowCoord)) {
			// If a point with the same row already exists, compare values.
			let xPointInfo = xEvenPoints.get(rowCoord);
			let prevCol = xPointInfo[0];
			let prevValA = xPointInfo[1];

			// Calculate the difference 'd'.
			let difference = prevValA - valueA;

			// If this is the first difference found for x-even, set it.
			if (deltaXEven === -1) {
				deltaXEven = difference;
			} else {
				// If a difference was already set, it must match the current one.
				if (difference !== deltaXEven) {
					console.log('No');
					process.exit();
				}
			}
			// Check boundary conditions for the value 'a1'.
			if (valueA - difference * colCoord < 0 ||
				valueA + difference * (numCols - colCoord) < 0) {
				console.log('No');
				process.exit();
			}
		} else {
			// If no point with this row exists, store the current one.
			xEvenPoints.set(rowCoord, [colCoord, valueA]);
		}
	} else {
		// General case for C > 2.
		if (colCoord % 2 === 0) {
			// If the column coordinate is even.
			if (xEvenPoints.has(rowCoord)) {
				let xPointInfo = xEvenPoints.get(rowCoord);
				let prevCol = xPointInfo[0];
				let prevValA = xPointInfo[1];

				// Calculate the difference 'd' based on column difference.
				let difference = (prevValA - valueA) / ((prevCol - colCoord) / 2);

				if (deltaXEven === -1) {
					// Ensure 'd' is an integer.
					if (Math.round(difference) !== difference) {
						console.log('No');
						process.exit();
					}

					deltaXEven = difference;

					// After establishing deltaXEven, check all previously stored xEvenPoints.
					for (let xEvenEntry of xEvenPoints.entries()) {
						let entryRow = xEvenEntry[0];
						let entryCol = xEvenEntry[1][0];
						let entryValA = xEvenEntry[1][1];

						// Check boundary conditions for these points.
						if (entryValA - difference * ((entryCol / 2) - 1) < 0 ||
							entryValA + difference * Math.floor((numCols - entryCol) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					// If deltaXEven was already set, it must match.
					if (difference !== deltaXEven) {
						console.log('No');
						process.exit();
					}
				}
				// Check boundary conditions for the current point.
				if (valueA - difference * ((colCoord / 2) - 1) < 0 ||
					valueA + difference * Math.floor((numCols - colCoord) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {
				xEvenPoints.set(rowCoord, [colCoord, valueA]);
			}
		} else {
			// If the column coordinate is odd.
			if (xOddPoints.has(rowCoord)) {
				let xPointInfo = xOddPoints.get(rowCoord);
				let prevCol = xPointInfo[0];
				let prevValA = xPointInfo[1];

				// Calculate the difference 'd'.
				let difference = (prevValA - valueA) / ((prevCol - colCoord) / 2);

				if (deltaXOdd === -1) {
					// Ensure 'd' is an integer.
					if (Math.round(difference) !== difference) {
						console.log('No');
						process.exit();
					}

					deltaXOdd = difference;

					// After establishing deltaXOdd, check all previously stored xOddPoints.
					for (let xOddEntry of xOddPoints.entries()) {
						let entryRow = xOddEntry[0];
						let entryCol = xOddEntry[1][0];
						let entryValA = xOddEntry[1][1];

						// Check boundary conditions for these points.
						if (entryValA - difference * Math.floor(entryCol / 2) < 0 ||
							entryValA + difference * Math.floor((numCols - entryCol) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					// If deltaXOdd was already set, it must match.
					if (difference !== deltaXOdd) {
						console.log('No');
						process.exit();
					}
				}
				// Check boundary conditions for the current point.
				if (valueA - difference * Math.floor(colCoord / 2) < 0 ||
					valueA + difference * Math.floor((numCols - colCoord) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {
				xOddPoints.set(rowCoord, [colCoord, valueA]);
			}
		}
	}
}

// If all checks pass for all points, print 'Yes'.
console.log('Yes');
