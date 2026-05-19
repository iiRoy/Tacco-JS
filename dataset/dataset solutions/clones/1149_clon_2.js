"use strict";

// This section handles input acquisition, either from a hardcoded string or standard input.
var rawData = function () {/*
                         6 6
                         1 0 1 0 1 0
                         0 1 0 1 0 1
                         1 0 1 0 1 0
                         0 1 0 1 0 1
                         1 0 1 0 1 0
                         0 1 0 1 0 1
                         */}.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].replace(/\n/g, "\n");

// Browser environment input handling
if (typeof document !== "undefined") {
	document.addEventListener("DOMContentLoaded", function () {
		var inputLines = rawData.split("\n");
		inputLines.shift(); // Remove the first empty line from the multiline string literal.
		inputLines.pop();   // Remove the last empty line.
		processGrid(inputLines);
	});
}

// Node.js environment output handler.
var output = console.log;

// Node.js environment input handling.
if (typeof process !== "undefined") {
	var nodeInputBuffer = ""; // Accumulate input chunks from stdin.
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function (chunk) {
		nodeInputBuffer += chunk;
	});
	process.stdin.on('end', function () {
		var inputLines = nodeInputBuffer.split("\n");
		processGrid(inputLines);
	});
}

// Utility functions for coordinate comparisons and transformations.

/**
 * Determines if a second point is located to the right of a first point.
 * @param {Array<number>} pointA - The first coordinate [row, column].
 * @param {Array<number>} pointB - The second coordinate [row, column].
 * @returns {boolean} True if pointB's column index is greater than pointA's column index.
 */
function isFurtherRight(pointA, pointB) {
	return pointA[0b1] < pointB[0b1];
}

/**
 * Determines if a second point is located below a first point.
 * @param {Array<number>} pointA - The first coordinate [row, column].
 * @param {Array<number>} pointB - The second coordinate [row, column].
 * @returns {boolean} True if pointB's row index is greater than pointA's row index.
 */
function isFurtherDown(pointA, pointB) {
	return pointA[0x0] < pointB[0x0];
}

/**
 * Calculates the coordinate immediately to the right of the given point.
 * @param {Array<number>} currentPoint - The base coordinate [row, column].
 * @returns {Array<number>} A new coordinate [row, column + 1].
 */
function getRightNeighbor(currentPoint) {
	return [currentPoint[0x0], currentPoint[0b1] + 0b1];
}

/**
 * Calculates the coordinate immediately below the given point.
 * @param {Array<number>} currentPoint - The base coordinate [row, column].
 * @returns {Array<number>} A new coordinate [row + 1, column].
 */
function getDownNeighbor(currentPoint) {
	return [currentPoint[0x0] + 0b1, currentPoint[0b1]];
}

/**
 * Checks if a target point is dominated by any point within a collection of dominant points.
 * A point 'c' dominates 'a' if they share a row/column and 'c' is further right/down.
 * @param {Array<number>} targetPoint - The point to check for dominance.
 * @param {Array<Array<number>>} dominantPoints - The set of points that might dominate 'targetPoint'.
 * @returns {boolean} True if 'targetPoint' is dominated by at least one point in 'dominantPoints'.
 */
function hasMoreDominant(targetPoint, dominantPoints) {
	// The original code uses unshift/shift to manage the initial value for reduce.
	// This exact pattern is preserved for behavioral equivalence.
	dominantPoints.unshift(false);
	var resultFlag = dominantPoints.reduce(function (prevVal, currPoint) {
		if (prevVal) {
			return prevVal; // If dominance already found, propagate true.
		} else {
			if (targetPoint[0b1] === currPoint[0b1]) { // Same column index.
				return isFurtherDown(currPoint, targetPoint);
			}
			if (targetPoint[0x0] === currPoint[0x0]) { // Same row index.
				return isFurtherRight(currPoint, targetPoint);
			}
			return prevVal; // No dominance by currPoint, continue.
		}
	});
	dominantPoints.shift(); // Remove the temporary placeholder.
	return resultFlag;
}

// Custom Array prototype method to populate a new array.
// This replicates the non-standard behavior of the original's `fill` polyfill,
// which returns a new array instead of modifying in-place.
Array.prototype.populateWith = function (fillValue) {
	var arrayLength = this.length;
	var newArray = [];
	for (var idx = 0x0; idx < arrayLength; idx++) {
		newArray[idx] = fillValue;
	}
	return newArray;
};

/**
 * Main function to process the grid data and determine the maximum area of a rectangle
 * composed entirely of zeros.
 * @param {Array<string>} inputLines - Raw string lines representing the grid.
 */
function processGrid(inputLines) {
	// Convert string lines into a 2D array of numbers.
	var parsedGridData = inputLines.map(function (lineStr) {
		return lineStr.split(" ").map(function (numStr) {
			return Number(numStr);
		});
	});

	// Extract grid dimensions from the first line.
	var dimensionsLine = parsedGridData.shift();
	var gridHeight = dimensionsLine[0x0];
	var gridWidth = dimensionsLine[0b1];

	var maxArea = ~0; // Initialize maximum area to -1.

	// State arrays for dynamic programming approach, storing information from previous cells.
	// `lastZeroX[col]` stores the row index of the last '0' encountered in column `col`
	// that could form the top-left corner of a rectangle.
	var lastZeroX = new Array(gridWidth).populateWith(~0); // Initialize with -1.
	// `lastZeroY[col]` stores the column index of the last '0' encountered in row `row`
	// that could form the top-left corner of a rectangle.
	var lastZeroY = new Array(gridWidth).populateWith(~0); // Initialize with -1.
	// `dominantSet[col]` stores a list of dominant points for rectangles ending at the current cell.
	var dominantSet = new Array(gridWidth).populateWith([]); // Initialize with empty arrays.

	// Iterate through each row of the grid.
	for (var rowIdx = 0x0; rowIdx < gridHeight; rowIdx++) {
		// Temporary arrays to hold the state for the current row, which will become
		// the 'previous' state for the next row's calculations.
		var currentRowLastZeroY = [];
		var currentRowDominantSet = [];

		// Iterate through each column in the current row.
		for (var colIdx = 0x0; colIdx < gridWidth; colIdx++) {
			var cellValue = parsedGridData[rowIdx][colIdx];

			// Variables to store the calculated state for the current cell.
			var prevLastZeroX;
			var prevLastZeroY;
			var currentDominantSet;

			if (cellValue === 0x0) { // If the current cell is a zero.
				// Determine `prevLastZeroX` from the cell directly above (from `lastZeroX` of previous row).
				prevLastZeroX = (rowIdx === 0x0) ? ~0 : lastZeroX[colIdx];
				// Determine `prevLastZeroY` from the cell to the left (from `currentRowLastZeroY` of current row).
				prevLastZeroY = (colIdx === 0x0) ? ~0 : currentRowLastZeroY[colIdx - 0b1];

				// Get the dominant set from the cell diagonally top-left (from `dominantSet` of previous row).
				var prevDominantSet = (rowIdx === 0x0 || colIdx === 0x0) ? [] : dominantSet[colIdx - 0b1];

				// Reference points used in dominance calculations.
				var xCoordRef = [prevLastZeroX, colIdx];
				var yCoordRef = [rowIdx, prevLastZeroY];

				// Debugging output, strictly preserved as per Type II rules.
				if (rowIdx === 0b1 && colIdx === 0b10) {
					output(currentDominantSet); // This will output 'undefined' as currentDominantSet is not yet assigned.
				}

				// Transform existing dominant points based on current cell's context.
				currentDominantSet = prevDominantSet.map(function (point) {
					if (!isFurtherRight(yCoordRef, point) && !isFurtherDown(xCoordRef, point)) {
						return [prevLastZeroX + 0b1, prevLastZeroY + 0b1];
					}
					if (!isFurtherRight(yCoordRef, point)) {
						return [point[0x0], prevLastZeroY + 0b1];
					}
					if (!isFurtherDown(xCoordRef, point)) {
						return [prevLastZeroX + 0b1, point[0b1]];
					}
					return point; // Point remains unchanged if no transformation applies.
				});

				// Add new dominant points derived from the current cell's position.
				currentDominantSet.push(getRightNeighbor(yCoordRef));
				currentDominantSet.push(getDownNeighbor(xCoordRef));

				// Debugging output, preserved.
				if (rowIdx === 0b1 && colIdx === 0b10) {
					output(currentDominantSet);
				}

				// Filter out any points that are sub-dominant within the current set.
				currentDominantSet = currentDominantSet.filter(function (point) {
					return !hasMoreDominant(point, currentDominantSet);
				});

				// Debugging output, preserved.
				if (rowIdx === 0b1 && colIdx === 0b10) {
					output(currentDominantSet);
				}

				// Remove duplicate points from the dominant set.
				currentDominantSet = currentDominantSet.filter(function (point, currentIndex) {
					for (var checkIdx = 0x0; checkIdx < currentIndex; checkIdx++) {
						var otherPoint = currentDominantSet[checkIdx];
						if (otherPoint[0x0] === point[0x0] && otherPoint[0b1] === point[0b1]) {
							return false; // Duplicate found, exclude it.
						} else {
							continue; // Continue checking.
						}
					}
					return true; // No duplicate found for this point.
				});

			} else { // If the current cell is a one.
				// Reset state variables as a '1' breaks any continuous rectangle of zeros.
				prevLastZeroX = rowIdx;
				prevLastZeroY = colIdx;
				currentDominantSet = [];
			}

			// Store the calculated state for the current cell in the temporary row arrays.
			currentRowDominantSet[colIdx] = currentDominantSet;
			lastZeroX[colIdx] = prevLastZeroX; // This update is effectively temporary due to the reset below.
			currentRowLastZeroY[colIdx] = prevLastZeroY;

			// Calculate potential rectangle areas using the current dominant set.
			var potentialAreas = [~0]; // Initialize with -1.
			currentDominantSet.forEach(function (point) {
				var heightCalc = rowIdx - point[0x0] + 0b1;
				var widthCalc = colIdx - point[0b1] + 0b1;
				potentialAreas.push(heightCalc * widthCalc);
			});
			var currentMaxArea = Math.max.apply(this, potentialAreas);

			// Update the overall maximum area found.
			if (currentMaxArea > maxArea) {
				maxArea = currentMaxArea;
			}
		}
		// After processing all columns in the current row, update the main state arrays for the next row.
		lastZeroX = new Array(gridWidth).populateWith(~0); // Reset `lastZeroX` for the next row's calculations.
		lastZeroY = currentRowLastZeroY; // `lastZeroY` becomes the `currentRowLastZeroY` from the current row.
		dominantSet = currentRowDominantSet; // `dominantSet` becomes the `currentRowDominantSet` from the current row.
	}
	output(maxArea); // Output the final maximum area.
}
