const outputFn = console.log;

if (typeof process !== "undefined") {
    let rawData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) {
        rawData += chunk;
    });
    process.stdin.on('end', function () {
        const inputLines = rawData.split("\n");
        main(inputLines);
    });
}

//----- Helper functions -----

function isRighterThan(pointOne, pointTwo) {
    // Returns true if pointTwo is strictly to the right of pointOne
    return pointOne[1] < pointTwo[1];
}

function isLowerThan(pointOne, pointTwo) {
    // Returns true if pointTwo is strictly below pointOne
    return pointOne[0] < pointTwo[0];
}

function getRightNeighbor(coordinates) {
    // Returns coordinates one unit to the right
    return [coordinates[0], coordinates[1] + 1];
}

function getLowerNeighbor(coordinates) {
    // Returns coordinates one unit below
    return [coordinates[0] + 1, coordinates[1]];
}

// Refactored helper: checks if a candidate point is subdominant to any point in a given set
function isPointSubdominant(candidatePoint, dominantSet) {
    return dominantSet.some(function (dominantPoint) {
        // If they are in the same column
        if (candidatePoint[1] === dominantPoint[1]) {
            // Check if dominantPoint is above candidatePoint
            return isLowerThan(dominantPoint, candidatePoint);
        }
        // If they are in the same row
        if (candidatePoint[0] === dominantPoint[0]) {
            // Check if dominantPoint is to the left of candidatePoint
            return isRighterThan(dominantPoint, candidatePoint);
        }
        return false;
    });
}

// New helper function to filter out duplicate points from an array
function getUniquePoints(pointList) {
    const seenPointKeys = new Set();
    const uniquePointsResult = [];
    for (let i = 0; i < pointList.length; i++) {
        const currentPoint = pointList[i];
        const pointKey = `${currentPoint[0]},${currentPoint[1]}`;
        if (!seenPointKeys.has(pointKey)) {
            seenPointKeys.add(pointKey);
            uniquePointsResult.push(currentPoint);
        }
    }
    return uniquePointsResult;
}

function main(inputLines) {
    try {
        const parsedGridData = inputLines.map(function (line) {
            return line.split(" ").map(Number);
        });

        const gridDimensions = parsedGridData.shift();
        const gridHeight = gridDimensions[0];
        const gridWidth = gridDimensions[1];

        let maximumArea = -1;

        // DP arrays initialization
        const lastZeroX = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(-1));
        const lastZeroY = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(-1));
        const dominantPoints = Array.from({ length: gridHeight }, () => Array(gridWidth).fill([]));

        // Constants for cell values
        const EMPTY_CELL = 0;
        const OBSTACLE_CELL = 1;

        for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
            for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
                const currentCellValue = parsedGridData[rowIdx][colIdx];

                const prevRowIdx = rowIdx - 1;
                const prevColIdx = colIdx - 1;

                let currentLastZeroX = (rowIdx === 0) ? -1 : lastZeroX[prevRowIdx][colIdx];
                let currentLastZeroY = (colIdx === 0) ? -1 : lastZeroY[rowIdx][prevColIdx];
                const prevDominantPoints = (rowIdx === 0 || colIdx === 0) ? [] : dominantPoints[prevRowIdx][prevColIdx];

                let newDominantPoints;

                if (currentCellValue === EMPTY_CELL) {
                    const xCoordCandidate = [currentLastZeroX, colIdx];
                    const yCoordCandidate = [rowIdx, currentLastZeroY];

                    const mappedDominants = prevDominantPoints.map(function (pointEntry) {
                        if (!isRighterThan(yCoordCandidate, pointEntry)) {
                            return [pointEntry[0], currentLastZeroY + 1];
                        }
                        if (!isLowerThan(xCoordCandidate, pointEntry)) {
                            return [currentLastZeroX + 1, pointEntry[1]];
                        }
                        return pointEntry;
                    });

                    const combinedDominants = mappedDominants.concat([
                        getRightNeighbor(yCoordCandidate),
                        getLowerNeighbor(xCoordCandidate)
                    ]);

                    const filteredDominants = combinedDominants.filter(function (point) {
                        return !isPointSubdominant(point, combinedDominants);
                    });

                    newDominantPoints = getUniquePoints(filteredDominants);

                } else { // currentCellValue === OBSTACLE_CELL
                    currentLastZeroX = rowIdx;
                    currentLastZeroY = colIdx;
                    newDominantPoints = [];
                }

                dominantPoints[rowIdx][colIdx] = newDominantPoints;
                lastZeroX[rowIdx][colIdx] = currentLastZeroX;
                lastZeroY[rowIdx][colIdx] = currentLastZeroY;

                let currentMaxAreaForCell = 0;
                newDominantPoints.forEach(function (dominantPoint) {
                    const rectangleHeight = rowIdx - dominantPoint[0] + 1;
                    const rectangleWidth = colIdx - dominantPoint[1] + 1;
                    currentMaxAreaForCell = Math.max(currentMaxAreaForCell, rectangleHeight * rectangleWidth);
                });

                if (currentMaxAreaForCell > maximumArea) {
                    maximumArea = currentMaxAreaForCell;
                }
            }
        }
        outputFn(maximumArea);
    } catch (e) {
        outputFn(e);
    }
}
