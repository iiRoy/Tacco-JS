var printOutput = console.log;

if (typeof process !== "undefined") {
    var rawData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        rawData += chunk;
    });
    process.stdin.on('end', function() {
        var inputLines = rawData.split("\n");
        processGridData(inputLines);
    });
}

function isToTheRight(coordA, coordB) {
    return coordA[1] < coordB[1];
}

function isBelow(coordA, coordB) {
    return coordA[0] < coordB[0];
}

function getNextRightCoord(coord) {
    return [coord[0], coord[1] + 1];
}

function getNextDownCoord(coord) {
    return [coord[0] + 1, coord[1]];
}

function hasMoreDominant(currentPoint, dominantList) {
    return dominantList.some(compPoint => {
        if (currentPoint[1] === compPoint[1]) {
            return isBelow(compPoint, currentPoint);
        }
        if (currentPoint[0] === compPoint[0]) {
            return isToTheRight(compPoint, currentPoint);
        }
        return false;
    });
}

function initialize2DArray(rows, cols, fillValue) {
    const arr = [];
    for (let r = 0; r < rows; r++) {
        arr.push(new Array(cols).fill(fillValue));
    }
    return arr;
}

function filterUniquePoints(pointList) {
    const seenCoords = new Set();
    const uniquePoints = [];
    for (const point of pointList) {
        const coordStr = `${point[0]},${point[1]}`;
        if (!seenCoords.has(coordStr)) {
            seenCoords.add(coordStr);
            uniquePoints.push(point);
        }
    }
    return uniquePoints;
}

function processGridData(inputLines) {
    var parsedGridData = inputLines.map(line => line.split(" ").map(Number));
    var gridDimensions = parsedGridData.shift();
    var gridHeight = gridDimensions[0];
    var gridWidth = gridDimensions[1];

    var overallMaxArea = -1;

    var lastZeroX = initialize2DArray(gridHeight, gridWidth, -1);
    var lastZeroY = initialize2DArray(gridHeight, gridWidth, -1);
    var dominantPoints = initialize2DArray(gridHeight, gridWidth, []);

    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            const currentCellValue = parsedGridData[rowIdx][colIdx];

            let prevZeroX, prevZeroY;
            let prevDominantPoints;
            let newDominantPoints;

            if (rowIdx === 0) {
                prevZeroX = -1;
            } else {
                prevZeroX = lastZeroX[rowIdx - 1][colIdx];
            }

            if (colIdx === 0) {
                prevZeroY = -1;
            } else {
                prevZeroY = lastZeroY[rowIdx][colIdx - 1];
            }
            
            if (rowIdx === 0 || colIdx === 0) {
                prevDominantPoints = [];
            } else {
                prevDominantPoints = dominantPoints[rowIdx - 1][colIdx - 1];
            }

            if (currentCellValue === 0) {
                const currentXCoord = [prevZeroX, colIdx];
                const currentYCoord = [rowIdx, prevZeroY];

                newDominantPoints = prevDominantPoints.map(point => {
                    const pointRow = point[0];
                    const pointCol = point[1];

                    const isRightOfYc = isToTheRight(currentYCoord, point);
                    const isBelowOfXc = isBelow(currentXCoord, point);

                    if (!isRightOfYc) {
                        return [pointRow, prevZeroY + 1];
                    }
                    if (!isBelowOfXc) {
                        return [prevZeroX + 1, pointCol];
                    }
                    return point;
                });

                newDominantPoints.push(getNextRightCoord(currentYCoord));
                newDominantPoints.push(getNextDownCoord(currentXCoord));

                newDominantPoints = newDominantPoints.filter(point =>
                    !hasMoreDominant(point, newDominantPoints)
                );
                
                newDominantPoints = filterUniquePoints(newDominantPoints);

            } else {
                prevZeroX = rowIdx;
                prevZeroY = colIdx;
                newDominantPoints = [];
            }
            
            dominantPoints[rowIdx][colIdx] = newDominantPoints;
            lastZeroX[rowIdx][colIdx] = prevZeroX;
            lastZeroY[rowIdx][colIdx] = prevZeroY;
            
            const currentCellAreas = [-1];
            for (const dominantPoint of newDominantPoints) {
                const heightCalc = rowIdx - dominantPoint[0] + 1;
                const widthCalc = colIdx - dominantPoint[1] + 1;
                currentCellAreas.push(heightCalc * widthCalc);
            }
            
            const currentMaxArea = Math.max(...currentCellAreas);
            if (currentMaxArea > overallMaxArea) {
                overallMaxArea = currentMaxArea;
            }
        }
    }
    printOutput(overallMaxArea);
}
