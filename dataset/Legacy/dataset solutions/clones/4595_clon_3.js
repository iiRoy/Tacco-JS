function parseInteger(s)   { return parseInt(s);   }
function parseFloatValue(s) { return parseFloat(s); }
function isEven(s)   { return (s % 2) === 0; }
function isOdd(s)    { return (s % 2) === 1; }

Array.prototype.sortNumbersAscending  = function ()  { return this.sort((a, b) => (a - b)); }
Array.prototype.sortNumbersDescending = function ()  { return this.sort((a, b) => (b - a)); }
Array.prototype.sortStringsAscending  = function ()  { return this.sort();                  }
Array.prototype.sortStringsDescending = function ()  { return this.sort().reverse();        }
Array.prototype.filterOut     = function (x) { return this.filter(e => e !== x);    }

function checkGridBounds(row, col, maxRows, maxCols) {
    return row >= 0 && row < maxRows && col >= 0 && col < maxCols;
}

function locateInitialSpreadPoint(gridData, totalRows, totalCols) {
    for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < totalCols; c++) {
            if (gridData[r][c] === 'S') {
                return [r, c];
            }
        }
    }
    return null;
}

function calculateManhattanDistanceToEdge(rowCoord, colCoord, totalRows, totalCols) {
    const distanceToTop = rowCoord;
    const distanceToBottom = totalRows - 1 - rowCoord;
    const distanceToLeft = colCoord;
    const distanceToRight = totalCols - 1 - colCoord;
    return Math.min(distanceToTop, distanceToBottom, distanceToLeft, distanceToRight);
}

function processGrid(inputLines) {
    const [gridHeight, gridWidth, spreadIterations] = inputLines[0].split(' ').map(parseInteger);

    const gridState = inputLines.slice(1).map(line => line.split(''));

    let currentSpreadCells = [];
    const initialSCoords = locateInitialSpreadPoint(gridState, gridHeight, gridWidth);
    if (initialSCoords) {
        currentSpreadCells.push(initialSCoords);
    }

    const rowDirectionChanges = [-1, 1, 0, 0]; // Up, Down, Stay, Stay
    const colDirectionChanges = [0, 0, -1, 1]; // Stay, Stay, Left, Right
    const numberOfDirections = rowDirectionChanges.length;

    for (let iterationStep = 0; iterationStep < spreadIterations; iterationStep++) {
        let nextSpreadCells = [];
        const currentSpreadCount = currentSpreadCells.length;

        for (let cellIndex = 0; cellIndex < currentSpreadCount; cellIndex++) {
            const [currentRow, currentCol] = currentSpreadCells[cellIndex];

            for (let dir = 0; dir < numberOfDirections; dir++) {
                const nextRow = currentRow + rowDirectionChanges[dir];
                const nextCol = currentCol + colDirectionChanges[dir];

                if (checkGridBounds(nextRow, nextCol, gridHeight, gridWidth) &&
                    gridState[nextRow][nextCol] === '.') {
                    gridState[nextRow][nextCol] = 'S';
                    nextSpreadCells.push([nextRow, nextCol]);
                }
            }
        }
        currentSpreadCells = nextSpreadCells;
    }

    let minStepsToEdge = Infinity;
    let zeroDistanceFound = false;

    for (let r = 0; r < gridHeight; r++) {
        for (let c = 0; c < gridWidth; c++) {
            if (gridState[r][c] === 'S') {
                const currentCellEdgeDistance = calculateManhattanDistanceToEdge(r, c, gridHeight, gridWidth);
                
                if (currentCellEdgeDistance === 0) {
                    minStepsToEdge = 1;
                    zeroDistanceFound = true;
                    break;
                }
                const requiredSteps = Math.ceil(currentCellEdgeDistance / spreadIterations) + 1;
                minStepsToEdge = Math.min(minStepsToEdge, requiredSteps);
            }
        }
        if (zeroDistanceFound) {
            break;
        }
    }

    console.log(minStepsToEdge);
}

processGrid(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));
