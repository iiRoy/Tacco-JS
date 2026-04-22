"use strict";

// Polyfill for Array.prototype.initializeValues (analogous to fill)
// Populates an array with a specified element.
if (!Array.prototype.initializeValues) {
    Array.prototype.initializeValues = function (elementVal) {
        let collectionLength = this.length;
        let newCollection = [];
        for (let loopIndex = 0; loopIndex < collectionLength; loopIndex++) {
            newCollection[loopIndex] = elementVal;
        }
        return newCollection;
    };
}


// This block defines a sample data source for development or testing purposes.
const testData = (function () {
    /*
        6 6
        1 0 1 0 1 0
        0 1 0 1 0 1
        1 0 1 0 1 0
        0 1 0 1 0 1
        1 0 1 0 1 0
        0 1 0 1 0 1
    */
}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].replace(/\n/g, "\n");

// If running in a web browser environment, attach event handler for page load.
if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
        let inputRows = testData.split("\n"); // Split the multiline string into an array of strings.
        inputRows.shift(); // Remove the first element (likely an empty line or header).
        inputRows.pop();  // Remove the last element (another empty line or footer).
        executeCoreLogic(inputRows); // Pass the processed rows to the main processing routine.
    });
}


// Node.js specific input/output handling.
const outputMessage = console.log; // Renamed `log`
if (typeof process !== "undefined") {
    var rawInputBuffer = ""; // Renamed `input`, using `var` for hoisting behavior.
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (incomingBlock) { // Renamed `chunk`
        rawInputBuffer += incomingBlock;
    });
    process.stdin.on('end', function () {
        let processedLines = rawInputBuffer.split("\n"); // Renamed `lines`
        executeCoreLogic(processedLines); // Renamed `main`
    });
}


/**
 * Determines if pointTwo is positioned to the right of pointOne.
 * @param {Array<number>} pointOne - The first coordinate [row, col].
 * @param {Array<number>} pointTwo - The second coordinate [row, col].
 * @returns {boolean} True if pointTwo's column index is greater than pointOne's.
 */
function compareRightPosition(pointOne, pointTwo) {
    return pointOne[1] < pointTwo[1];
}

/**
 * Determines if pointTwo is positioned below pointOne.
 * @param {Array<number>} pointOne - The first coordinate [row, col].
 * @param {Array<number>} pointTwo - The second coordinate [row, col].
 * @returns {boolean} True if pointTwo's row index is greater than pointOne's.
 */
function compareDownPosition(pointOne, pointTwo) {
    return pointOne[0] < pointTwo[0];
}

/**
 * Calculates the coordinate immediately to the right of the given point.
 * @param {Array<number>} currentPoint - The original coordinate [row, col].
 * @returns {Array<number>} A new coordinate [row, col + 1].
 */
function deriveRightPoint(currentPoint) {
    return [currentPoint[0], currentPoint[1] + 1];
}

/**
 * Calculates the coordinate immediately below the given point.
 * @param {Array<number>} currentPoint - The original coordinate [row, col].
 * @returns {Array<number>} A new coordinate [row + 1, col].
 */
function deriveDownPoint(currentPoint) {
    return [currentPoint[0] + 1, currentPoint[1]];
}

/**
 * Checks if a given coordinate is "subordinate" to any coordinate in a set of superiors.
 * A coordinate 'target' is subordinate if there exists a 'superior' in 'superiorSet'
 * such that 'superior' is either to the right of 'target' (same row) or below 'target' (same column).
 * This function temporarily modifies the superiorSet for internal processing.
 * @param {Array<number>} targetCoord - The coordinate to check for dominance.
 * @param {Array<Array<number>>} superiorSet - A collection of potentially dominant coordinates.
 * @returns {boolean} True if a superior element is found, false otherwise.
 */
function findDominatingEntry(targetCoord, superiorSet) {
    // Temporarily prepend a dummy value to the array to handle reduction logic.
    // The return value of unshift (new length) is not used.
    var tempBool = superiorSet.unshift(false); // Retain original var declaration and assignment.

    // Reduce the array to find if any element dominates the targetCoord.
    var hasMatch = superiorSet.reduce(function (accumulator, currentItem) { // Retain original var declaration.
        if (accumulator) {
            return accumulator; // If a match is already found, propagate it.
        } else {
            // Check for dominance conditions.
            if (targetCoord[1] === currentItem[1]) { // If columns are identical
                return compareDownPosition(currentItem, targetCoord); // Check if currentItem is above targetCoord
            }
            if (targetCoord[0] === currentItem[0]) { // If rows are identical
                return compareRightPosition(currentItem, targetCoord); // Check if currentItem is to the left of targetCoord
            }
            return accumulator; // No dominance found for this item, continue.
        }
    });
    superiorSet.shift(); // Remove the dummy value added earlier.
    return hasMatch;
}


/**
 * Executes the primary logic to find the largest rectangular area of zeros in a binary grid.
 * @param {Array<string>} dataLines - Input lines, where the first line contains grid dimensions.
 */
function executeCoreLogic(dataLines) {
    // Parse input strings into a 2D array of numbers.
    var numericGrid = dataLines.map(function (stringRow) { // Renamed `lines2`
        return stringRow.split(" ").map(function (tokenString) { // Renamed `e`, `f`
            return parseInt(tokenString, 10); // Changed Number to parseInt for data type change.
        });
    });

    var dimensionsRow = numericGrid.shift(); // Renamed `top_line`
    var gridHeight = dimensionsRow[0]; // Renamed `H`
    var gridWidth = dimensionsRow[1];  // Renamed `W`
    var greatestArea = -1; // Renamed `max`

    // Arrays to store state from the previous row iteration.
    // `lastXCoords`: Stores the row index of the last '1' encountered in the column above (or -1 if none).
    var lastXCoords = new Array(gridWidth).initializeValues(-1); // Renamed `n_x`
    // `lastYCoords`: Stores the column index of the last '1' encountered to the left (or -1 if none).
    var lastYCoords = new Array(gridWidth).initializeValues(-1); // Renamed `n_y`
    // `previousDominantSet`: Stores dominant points from the previous row.
    var previousDominantSet = new Array(gridWidth).initializeValues([]); // Renamed `dom`

    for (var rowIndex = 0; rowIndex < gridHeight; rowIndex++) { // Renamed `h`
        // Temporary arrays to store state for the current row iteration.
        var currentRowXTrack = []; // Renamed `v_n_x` (note: this variable is declared but never used for its values)
        var currentRowYTrack = []; // Renamed `v_n_y`
        var currentDominantTrack = []; // Renamed `v_dom`

        for (var colIndex = 0; colIndex < gridWidth; colIndex++) { // Renamed `w`
            var cellValue = numericGrid[rowIndex][colIndex]; // Renamed `val`

            // Determine the 'next' boundary coordinates based on previous cells.
            // Row index of the last '1' encountered in the column above.
            var nextXBoundary = rowIndex === 0 ? -1 : lastXCoords[colIndex]; // Renamed `n_n_x`
            // Column index of the last '1' encountered to the left.
            var nextYBoundary = colIndex === 0 ? -1 : lastYCoords[colIndex - 1]; // Renamed `n_n_y`
            // Dominant points inherited from the cell to the left in the current row.
            var inheritedDominants = rowIndex === 0 || colIndex === 0 ? [] : previousDominantSet[colIndex - 1]; // Renamed `_dom`

            var refinedDominants; // This will hold the dominant points for the current cell. Declared with `var` to match hoisting behavior.

            if (cellValue === 0) { // If the current cell is a '0' (part of a potential rectangle)
                var xReferencePoint = [nextXBoundary, colIndex]; // Renamed `x_c`
                var yReferencePoint = [rowIndex, nextYBoundary]; // Renamed `y_c`

                // Debugging log. This will output 'undefined' due to `var` hoisting.
                if (rowIndex === 1 && colIndex === 2) {
                    outputMessage(refinedDominants);
                }

                // Transform inherited dominant points based on current cell's boundaries.
                refinedDominants = inheritedDominants.map(function (dominantCoord) { // Renamed `e`
                    // If the dominant point is not "right" of yReferencePoint and not "down" of xReferencePoint
                    // (i.e., it's within the new potential rectangle's boundaries)
                    if (!compareRightPosition(yReferencePoint, dominantCoord) && !compareDownPosition(xReferencePoint, dominantCoord)) {
                        return [nextXBoundary + 1, nextYBoundary + 1]; // Expand the rectangle from this dominant point.
                    }
                    if (!compareRightPosition(yReferencePoint, dominantCoord)) {
                        return [dominantCoord[0], nextYBoundary + 1]; // Expand horizontally.
                    }
                    if (!compareDownPosition(xReferencePoint, dominantCoord)) {
                        return [nextXBoundary + 1, dominantCoord[1]]; // Expand vertically.
                    }
                    return dominantCoord; // No expansion, keep as is.
                });

                // Add new dominant points derived from current cell's boundaries.
                refinedDominants.push(deriveRightPoint(yReferencePoint));
                refinedDominants.push(deriveDownPoint(xReferencePoint));

                // Debugging log again.
                if (rowIndex === 1 && colIndex === 2) {
                    outputMessage(refinedDominants);
                }

                // Filter out sub-dominant points (points that are "covered" by other dominant points).
                refinedDominants = refinedDominants.filter(function (currentElement) { // Renamed `e`
                    return !findDominatingEntry(currentElement, refinedDominants);
                });

                // Debugging log again.
                if (rowIndex === 1 && colIndex === 2) {
                    outputMessage(refinedDominants);
                }

                // Remove duplicate dominant points.
                refinedDominants = refinedDominants.filter(function (currentElement, currentIndex) { // Renamed `e`, `i`
                    for (var comparisonIndex = 0; comparisonIndex < currentIndex; comparisonIndex++) { // Renamed `k`
                        var comparedItem = refinedDominants[comparisonIndex]; // Renamed `o`
                        if (comparedItem[0] === currentElement[0] && comparedItem[1] === currentElement[1]) {
                            return false; // Duplicate found, exclude it.
                        } else {
                            continue; // No duplicate with this item, continue checking.
                        }
                    }
                    return true; // No duplicates found up to this point, include it.
                });

            } else { // If the current cell is a '1' (a block, cannot be part of a rectangle)
                nextXBoundary = rowIndex; // Reset X boundary to current row.
                nextYBoundary = colIndex; // Reset Y boundary to current column.
                refinedDominants = []; // No dominant points can pass through a '1'.
            }

            currentDominantTrack[colIndex] = refinedDominants; // Store dominant points for current cell.
            lastXCoords[colIndex] = nextXBoundary; // Store X boundary for current cell. (Note: this value is overwritten later for the next row).
            currentRowYTrack[colIndex] = nextYBoundary; // Store Y boundary for current cell.

            // Calculate potential rectangle areas from current dominant points.
            var calculatedAreas = [-1]; // Renamed `maxs`
            refinedDominants.forEach(function (dominantPoint) { // Renamed `e`
                var rectHeight = rowIndex - dominantPoint[0] + 1; // Renamed `hei`
                var rectWidth = colIndex - dominantPoint[1] + 1;  // Renamed `wid`
                calculatedAreas.push(rectHeight * rectWidth); // Add calculated area to list.
            });
            var iterationMax = Math.max.apply(null, calculatedAreas); // Renamed `m`, `this` changed to `null` as it's not used by `Math.max`.
            if (iterationMax > greatestArea) {
                greatestArea = iterationMax; // Update overall maximum area.
            }
        }
        // Update state for the next row iteration.
        lastXCoords = new Array(gridWidth).initializeValues(-1); // Reset lastXCoords for the new row.
        lastYCoords = currentRowYTrack; // Carry over currentRowYTrack as lastYCoords for the next row.
        previousDominantSet = currentDominantTrack; // Carry over currentDominantTrack as previousDominantSet for the next row.
    }
    outputMessage(greatestArea); // Display the final maximum area.
}