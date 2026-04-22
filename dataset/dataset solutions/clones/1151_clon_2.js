var outputChannel = console.info;

if (typeof process !== "undefined") {
    var receivedData = "";

    process.stdin.resume();

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function(segment) {
        receivedData += segment;
    });

    process.stdin.on('end', function() {
        var textRows = receivedData.split("\n");
        processInput(textRows);
    });
}

// ----- Utility Functions Section -----

function isToTheRight(coordA, coordB) {
	// Determines if the second point's column index is greater than the first.
	return coordA[1] < coordB[1];
}

function isBelow(coordA, coordB) {
	// Determines if the second point's row index is greater than the first.
	return coordA[0] < coordB[0];
}

function getOneRight(currentPoint) {
	// Calculates the coordinates of a point one unit to the right.
	return [currentPoint[0], currentPoint[1] + 1];
}

function getOneDown(currentPoint) {
	// Calculates the coordinates of a point one unit below.
	return [currentPoint[0] + 1, currentPoint[1]];
}

function hasSuperiorCoverage(currentPoint, coverageSet) {
	// Checks if the 'currentPoint' is sub-covered by any rectangle in the 'coverageSet'.
	// This function temporarily modifies 'coverageSet' by adding/removing a placeholder.
	let tempPlaceholder = coverageSet.unshift(false);

	let resultFlag = coverageSet.reduce((previousState, currentCoverage) => {
		if (previousState) {
			return previousState;
		} else {
			if (currentPoint[1] === currentCoverage[1]) {
				// If column indices are identical, check vertical relationship.
				return isBelow(currentCoverage, currentPoint);
			}

			if (currentPoint[0] === currentCoverage[0]) {
				// If row indices are identical, check horizontal relationship.
				return isToTheRight(currentCoverage, currentPoint);
			}

			return previousState;
		}
	});
	
	coverageSet.shift(); // Remove the temporary placeholder.

	return resultFlag;
}

function processInput(textRows) {
	var numericGridRows = textRows.map(singleRow => singleRow.split(" ").map(element => Number(element)));
	var gridDimensions = numericGridRows.shift();
	var gridHeight = gridDimensions[0];
	var gridWidth = gridDimensions[1];
	
	var largestAreaFound = -1;
	
	var prevXCoords = Array(gridHeight).fill(0).map(rowFill => Array(gridWidth).fill(-1));
	var prevYCoords = Array(gridHeight).fill(0).map(rowFill => Array(gridWidth).fill(-1));
	var dominantRects = Array(gridHeight).fill(0).map(rowFill => Array(gridWidth).fill([]));
	
	for (var rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
		for (var colIndex = 0; colIndex < gridWidth; colIndex++) {
			var cellValue = numericGridRows[rowIndex][colIndex];
			
			// Determine inherited previous X and Y coordinates for rectangle tracking.
			var currentPrevX = rowIndex === 0 ? -1 : prevXCoords[rowIndex - 1][colIndex];
			var currentPrevY = colIndex === 0 ? -1 : prevYCoords[rowIndex][colIndex - 1];
			
			// Retrieve dominant rectangles from the top-left diagonal cell.
			var inheritedDominantRects = (rowIndex === 0 || colIndex === 0) ? [] : dominantRects[rowIndex - 1][colIndex - 1];
			
			var newDominantRects;

			if (cellValue === 0) {
				var xCoordCandidate = [currentPrevX, colIndex];
				var yCoordCandidate = [rowIndex, currentPrevY];
				
				newDominantRects = inheritedDominantRects.map(existingRect => {
					if (!isToTheRight(yCoordCandidate, existingRect)) {
						return [existingRect[0], currentPrevY + 1];
					}
					if (!isBelow(xCoordCandidate, existingRect)) {
						return [currentPrevX + 1, existingRect[1]];
					}
					return existingRect;
				});

				newDominantRects.push(getOneRight(yCoordCandidate));
				newDominantRects.push(getOneDown(xCoordCandidate));
				
				// Filter out rectangles that are sub-covered by other rectangles in the set.
				newDominantRects = newDominantRects.filter(rect => 
					!hasSuperiorCoverage(rect, newDominantRects)
				);
				
				// Remove duplicate entries from the dominant rectangles list.
				newDominantRects = newDominantRects.filter((currentElement, currentIndex) => {
					for (var loopCounter = 0; loopCounter < currentIndex; loopCounter++) {
						var otherElement = newDominantRects[loopCounter];
						if (otherElement[0] === currentElement[0] && otherElement[1] === currentElement[1]) {
							return false; // Found a duplicate, exclude it.
						} else {
							continue;
						}
					}
					return true; // No duplicate found, include it.
				});
			} else {
				// If cellValue is 1, it acts as a barrier.
				currentPrevX = rowIndex;
				currentPrevY = colIndex;
				newDominantRects = [];
			}
			
			dominantRects[rowIndex][colIndex] = newDominantRects;
			prevXCoords[rowIndex][colIndex] = currentPrevX;
			prevYCoords[rowIndex][colIndex] = currentPrevY;
			
			var candidateAreas = [-1];

			newDominantRects.forEach(rectBoundary => {
				var rectangleHeight = rowIndex - rectBoundary[0] + 1;
				var rectangleWidth = colIndex - rectBoundary[1] + 1;
				candidateAreas.push(rectangleHeight * rectangleWidth);
			});
			
			var currentMaxArea = Math.max.apply(null, candidateAreas);

			if (currentMaxArea > largestAreaFound) {
				largestAreaFound = currentMaxArea;
			}
		}
	}
	outputChannel(largestAreaFound);
}