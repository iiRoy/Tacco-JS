"use strict";

// Helper to extract input from comment block
function extractInputFromComment(commentFunction) {
    return commentFunction.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].replace(/\n/g, "\n");
}

var rawInputString = extractInputFromComment(function () {/*
                         6 6
                         1 0 1 0 1 0
                         0 1 0 1 0 1
                         1 0 1 0 1 0
                         0 1 0 1 0 1
                         1 0 1 0 1 0
                         0 1 0 1 0 1
                         */});

// Input processing function for setupInputAndRun
function parseInputLines(inputStringContent) {
    let linesArray = inputStringContent.split("\n");
    linesArray.shift(); // Remove first line (dimensions are handled separately)
    linesArray.pop();   // Remove last empty line if present
    return linesArray;
}

// Unified input handling and execution entry point
function setupInputAndRun(inputParserFunction) {
    if (typeof document !== "undefined") {
        document.addEventListener("DOMContentLoaded", function () {
            let processedLines = inputParserFunction(rawInputString);
            processGrid(processedLines);
        });
    } else if (typeof process !== "undefined") {
        let stdinBuffer = "";
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => {
            stdinBuffer += chunk;
        });
        process.stdin.on('end', () => {
            let processedLines = inputParserFunction(stdinBuffer);
            processGrid(processedLines);
        });
    }
}

// Initialize and run the application
setupInputAndRun(parseInputLines);

//-----

var outputLog = console.log;

//-----

function isRighter(pointCoordA, pointCoordB) {
	//return true if pointCoordB is righter than pointCoordA
	return pointCoordA[1] < pointCoordB[1];
}
function isDowner(pointCoordA, pointCoordB) {
	//return true if pointCoordB is downer than pointCoordA
	return pointCoordA[0] < pointCoordB[0];
}
function getRightNeighbor(pointCoord) {
	//get right neighbor of pointCoord
	return [pointCoord[0], pointCoord[1] + 1];
}
function getDownNeighbor(pointCoord) {
	return [pointCoord[0] + 1, pointCoord[1]];
}

// Helper for hasMoreDominant to check individual dominance conditions
function checkDominanceCondition(currentPoint, comparePoint) {
    if (currentPoint[1] === comparePoint[1]) {
        return isDowner(comparePoint, currentPoint);
    }
    if (currentPoint[0] === comparePoint[0]) {
        return isRighter(comparePoint, currentPoint);
    }
    return false;
}

function hasMoreDominant(currentPoint, dominantSet) {
	//return if currentPoint is subdominant in dominantSet
	// The original code modifies the array with unshift/shift, preserving this behavior.
	let _tempDummy = dominantSet.unshift(false);
	let isDominantFound = dominantSet.reduce(function (isPrevDominant, comparePoint) {
		if (isPrevDominant) {
			return isPrevDominant;
		} else {
			return checkDominanceCondition(currentPoint, comparePoint);
		}
	}, false); // Explicit initial value for reduce
	dominantSet.shift();
	return isDominantFound;
}

// Custom Array.prototype.fill implementation (as in original)
Array.prototype.customFill = function (fillValue) {
	let arrayLength = this.length;
	let resultArray = [];
	for (let loopIndex = 0; loopIndex < arrayLength; loopIndex++) {
		resultArray[loopIndex] = fillValue;
	}
	return resultArray;
};

// Helper to filter out duplicate points from an array of [x, y] coordinates
function filterUniquePoints(pointsArray) {
    const uniquePoints = [];
    for (let i = 0; i < pointsArray.length; i++) {
        const currentPoint = pointsArray[i];
        let isDuplicate = false;
        for (let k = 0; k < i; k++) {
            const otherPoint = pointsArray[k];
            if (otherPoint[0] === currentPoint[0] && otherPoint[1] === currentPoint[1]) {
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate) {
            uniquePoints.push(currentPoint);
        }
    }
    return uniquePoints;
}


function processGrid(inputLines) {
	let parsedGridData = inputLines.map(function (line) {
		return line.split(" ").map(Number); // Simplified Number conversion
	});

	let dimensions = parsedGridData.shift();
	let gridHeight = dimensions[0];
	let gridWidth = dimensions[1];
	let maxArea = -1;

	// Initialize arrays for previous row's data
	// Using Array.from for initial creation, customFill for resets later
	let prevRowBlockX = Array.from({ length: gridWidth }, () => -1);
	let prevColBlockY = Array.from({ length: gridWidth }, () => -1);
	let prevRowDominants = Array.from({ length: gridWidth }, () => []);

	for (let currentRowIdx = 0; currentRowIdx < gridHeight; currentRowIdx++) {
		let currentRowBlockY = []; // This will hold blockYCoord for the current row
		let currentRowDominants = []; // This will hold cellDominants for the current row

		for (let currentColIdx = 0; currentColIdx < gridWidth; currentColIdx++) {
			let cellValue = parsedGridData[currentRowIdx][currentColIdx];

			// Simplified blockXCoord based on observed behavior of original code
			// (n_x was always reset to -1 for h > 0 when val == 0)
			let blockXCoord = (cellValue === 1) ? currentRowIdx : -1;

			// blockYCoord from previous column in current row
			let blockYCoord = currentColIdx === 0 ? -1 : prevColBlockY[currentColIdx - 1];

			// Inherited dominants from previous column in current row
			let inheritedDominants = (currentRowIdx === 0 || currentColIdx === 0) ? [] : prevRowDominants[currentColIdx - 1];

			let cellDominants;
			if (cellValue === 0) {
				let currentXBlock = [blockXCoord, currentColIdx];
				let currentYBlock = [currentRowIdx, blockYCoord];

				if (currentRowIdx === 1 && currentColIdx === 2) {
					outputLog(cellDominants); // Preserving debug log
				}

				// Step 1: Transform inherited dominants based on current cell's block coordinates
				let transformedDominants = inheritedDominants.map(function (dominantPoint) {
					let isRighterCondition = isRighter(currentYBlock, dominantPoint);
					let isDownerCondition = isDowner(currentXBlock, dominantPoint);

					if (!isRighterCondition && !isDownerCondition) {
						return [blockXCoord + 1, blockYCoord + 1];
					}
					if (!isRighterCondition) {
						return [dominantPoint[0], blockYCoord + 1];
					}
					if (!isDownerCondition) {
						return [blockXCoord + 1, dominantPoint[1]];
					}
					return dominantPoint;
				});

				// Step 2: Add new dominant points derived from current cell's block coordinates
				transformedDominants.push(getRightNeighbor(currentYBlock));
				transformedDominants.push(getDownNeighbor(currentXBlock));
				cellDominants = transformedDominants;

				if (currentRowIdx === 1 && currentColIdx === 2) {
					outputLog(cellDominants); // Preserving debug log
				}

				// Step 3: Filter out subdominant points from the combined set
				cellDominants = cellDominants.filter(function (dominantPoint) {
					return !hasMoreDominant(dominantPoint, cellDominants);
				});

				if (currentRowIdx === 1 && currentColIdx === 2) {
					outputLog(cellDominants); // Preserving debug log
				}

				// Step 4: Filter out duplicate points using the helper function
				cellDominants = filterUniquePoints(cellDominants);

			} else { // cellValue === 1
				cellDominants = [];
			}

			currentRowDominants[currentColIdx] = cellDominants;
			prevRowBlockX[currentColIdx] = blockXCoord; // This updates the array that will be reset at row end
			currentRowBlockY[currentColIdx] = blockYCoord;

			// Calculate max area for current cell based on its dominants
			let potentialAreas = [-1];
			for (const dominantPoint of cellDominants) { // Using for...of loop for iteration
				let rectangleHeight = currentRowIdx - dominantPoint[0] + 1;
				let rectangleWidth = currentColIdx - dominantPoint[1] + 1;
				potentialAreas.push(rectangleHeight * rectangleWidth);
			}
			// Using reduce for finding max value instead of Math.max.apply
			let currentMaxArea = potentialAreas.reduce((maxVal, currentVal) => Math.max(maxVal, currentVal), -1);
			if (currentMaxArea > maxArea) {
				maxArea = currentMaxArea;
			}
		}
		// Reset prevRowBlockX for the next row (as per original logic)
		prevRowBlockX = new Array(gridWidth).customFill(-1);
		// Carry over currentRowBlockY and currentRowDominants for the next row's calculations
		prevColBlockY = currentRowBlockY;
		prevRowDominants = currentRowDominants;
	}
	outputLog(maxArea);
}
