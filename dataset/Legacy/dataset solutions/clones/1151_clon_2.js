var output = console.log;

if (typeof process !== "undefined") {
    var dataBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        dataBuffer += chunk;
    });
    process.stdin.on('end', function() {
        var inputLines = dataBuffer.split("\n");
        processGrid(inputLines);
    });
}

// --- Helper Functions ---

function isFurtherRight(coordA, coordB) {
    // Determines if coordB is to the right of coordA.
    return coordA[1] < coordB[1];
}

function isFurtherDown(coordA, coordB) {
    // Determines if coordB is below coordA.
    return coordA[0] < coordB[0];
}

function getRightNeighbor(coordA) {
    // Returns the coordinate directly to the right of coordA.
    return [coordA[0], coordA[1] + 1];
}

function getDownNeighbor(coordA) {
    // Returns the coordinate directly below coordA.
    return [coordA[0] + 1, coordA[1]];
}

function hasMoreDominant(coordA, dominantSet) {
    // Checks if coordA is dominated by any point in dominantSet.
    // A point 'd' dominates 'a' if 'd' is to the left of 'a' (same row)
    // or 'd' is above 'a' (same column).
    dominantSet.unshift(false); // Placeholder for initial reduce value.
    var resultFlag = dominantSet.reduce((prevVal, currElem) => {
        if (prevVal) {
            return prevVal;
        } else {
            if (coordA[1] === currElem[1]) { // Same column
                return isFurtherDown(currElem, coordA);
            }
            if (coordA[0] === currElem[0]) { // Same row
                return isFurtherRight(currElem, coordA);
            }
            return prevVal;
        }
    });
    dominantSet.shift(); // Remove the placeholder.
    return resultFlag;
}

function processGrid(inputLines) {
    var parsedGridData = inputLines.map(lineEntry => lineEntry.split(" ").map(strNum => Number(strNum)));
    var dimensionsLine = parsedGridData.shift();
    var gridHeight = dimensionsLine[0];
    var gridWidth = dimensionsLine[1];

    var maximumArea = -1;

    // nextXCoord[r][c] stores the row index of the next '1' encountered when moving down from (r,c),
    // or 'r' if (r,c) itself is '1'.
    var nextXCoord = new Array(gridHeight).fill(0).map(row => new Array(gridWidth).fill(-1));
    // nextYCoord[r][c] stores the column index of the next '1' encountered when moving right from (r,c),
    // or 'c' if (r,c) itself is '1'.
    var nextYCoord = new Array(gridHeight).fill(0).map(row => new Array(gridWidth).fill(-1));
    // dominantPoints[r][c] stores a list of "dominant" points for rectangles ending at (r,c).
    var dominantPoints = new Array(gridHeight).fill(0).map(row => new Array(gridWidth).fill([]));

    for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
            var currentCellValue = parsedGridData[rowIdx][colIdx];

            // Retrieve values from previous cells.
            var prevNextX = (rowIdx === 0) ? -1 : nextXCoord[rowIdx - 1][colIdx];
            var prevNextY = (colIdx === 0) ? -1 : nextYCoord[rowIdx][colIdx - 1];
            var prevDominantSet = (rowIdx === 0 || colIdx === 0) ? [] : dominantPoints[rowIdx - 1][colIdx - 1];

            var newDominantSet;

            if (currentCellValue === 0) {
                // If the current cell is 0, it can be part of a rectangle.
                var xCandidate = [prevNextX, colIdx];
                var yCandidate = [rowIdx, prevNextY];

                // Transform previous dominant points based on current cell's context.
                newDominantSet = prevDominantSet.map(currentPoint => {
                    if (!isFurtherRight(yCandidate, currentPoint)) {
                        return [currentPoint[0], prevNextY + 1];
                    }
                    if (!isFurtherDown(xCandidate, currentPoint)) {
                        return [prevNextX + 1, currentPoint[1]];
                    }
                    return currentPoint;
                });

                // Add new dominant points derived from the current cell's position.
                newDominantSet.push(getRightNeighbor(yCandidate));
                newDominantSet.push(getDownNeighbor(xCandidate));

                // Filter out points that are dominated by others in the set.
                newDominantSet = newDominantSet.filter(
                    currentPoint => !hasMoreDominant(currentPoint, newDominantSet)
                );

                // Remove duplicate dominant points.
                newDominantSet = newDominantSet.filter((currentPoint, idx) => {
                    for (var innerIdx = 0; innerIdx < idx; innerIdx++) {
                        var otherPoint = newDominantSet[innerIdx];
                        if (otherPoint[0] === currentPoint[0] && otherPoint[1] === currentPoint[1]) {
                            return false; // This point is a duplicate.
                        }
                    }
                    return true; // This point is unique so far.
                });
            } else {
                // If the current cell is 1, it cannot be part of a 0-rectangle.
                prevNextX = rowIdx;
                prevNextY = colIdx;
                newDominantSet = [];
            }

            // Store the computed values for the current cell.
            dominantPoints[rowIdx][colIdx] = newDominantSet;
            nextXCoord[rowIdx][colIdx] = prevNextX;
            nextYCoord[rowIdx][colIdx] = prevNextY;

            // Calculate areas of all possible rectangles ending at (rowIdx, colIdx).
            var potentialAreas = [-1]; // Initialize with -1 for Math.max.
            newDominantSet.forEach(currentPoint => {
                var rectangleHeight = rowIdx - currentPoint[0] + 1;
                var rectangleWidth = colIdx - currentPoint[1] + 1;
                potentialAreas.push(rectangleHeight * rectangleWidth);
            });

            // Update the overall maximum area found.
            var currentMaxArea = Math.max.apply(null, potentialAreas);
            if (currentMaxArea > maximumArea) {
                maximumArea = currentMaxArea;
            }
        }
    }
    output(maximumArea); // Print the final result.
}
