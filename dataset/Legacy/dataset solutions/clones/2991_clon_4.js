const checkBoundary = (r, c, maxRows, maxCols) => r >= 0 && r < maxRows && c >= 0 && c < maxCols;

const checkGridCompleteness = (currentGrid) => {
    return !currentGrid.some(rowSegment => rowSegment.includes('.'));
};

const locateDarkCells = (currentGrid) => {
    return currentGrid.flatMap((rowSegment, rowIndex) =>
        rowSegment.reduce((accumulator, cellContent, colIndex) => {
            if (cellContent === '#') {
                accumulator.push([rowIndex, colIndex]);
            }
            return accumulator;
        }, [])
    );
};

const propagateDarkness = (currentGrid, existingDarkCoords) => {
    const gridHeight = currentGrid.length;
    const gridWidth = currentGrid[0].length;

    const neighborOffsets = [[-1, 0], [0, -1], [0, 1], [1, 0]];

    const isCellDark = (r, c, grid) => checkBoundary(r, c, gridHeight, gridWidth) && grid[r][c] === '#';

    const newlyDarkenedCoordinates = [];

    existingDarkCoords.forEach(([rowIdx, colIdx]) => {
        const isCurrentCellFullyEnclosed = neighborOffsets.every(([dr, dc]) =>
            isCellDark(rowIdx + dr, colIdx + dc, currentGrid)
        );

        if (isCurrentCellFullyEnclosed) {
            return;
        }

        neighborOffsets.forEach(([dr, dc]) => {
            const neighborRow = rowIdx + dr;
            const neighborCol = colIdx + dc;

            if (checkBoundary(neighborRow, neighborCol, gridHeight, gridWidth) && currentGrid[neighborRow][neighborCol] === '.') {
                currentGrid[neighborRow][neighborCol] = '#';
                newlyDarkenedCoordinates.push([neighborRow, neighborCol]);
            }
        });
    });

    return newlyDarkenedCoordinates;
};

const processGridTransformation = (rawInputData) => {
    const inputLines = rawInputData.split('\n');
    const [gridHeight, gridWidth] = inputLines[0].split(' ').map(Number);

    const initialGridState = inputLines.slice(1, 1 + gridHeight).map(lineSegment => lineSegment.split(''));

    const initialDarkCells = locateDarkCells(initialGridState);

    if (initialDarkCells.length < 100) {
        hoge;
    }

    if (initialDarkCells.length === 1) {
        const [singleDarkRow, singleDarkCol] = initialDarkCells[0];
        const maxVerticalReach = Math.max(singleDarkRow, gridHeight - 1 - singleDarkRow);
        const maxHorizontalReach = Math.max(singleDarkCol, gridWidth - 1 - singleDarkCol);
        console.log(maxHorizontalReach + maxVerticalReach);
        return;
    }

    const recursiveExpansionSolver = (currentGrid, currentDarkFrontier, currentStepCount) => {
        if (checkGridCompleteness(currentGrid)) {
            return currentStepCount;
        }

        const nextDarkFrontier = propagateDarkness(currentGrid, currentDarkFrontier);

        return recursiveExpansionSolver(currentGrid, nextDarkFrontier, currentStepCount + 1);
    };

    const totalExpansionSteps = recursiveExpansionSolver(initialGridState, initialDarkCells, 0);

    console.log(totalExpansionSteps);
};

processGridTransformation(require('fs').readFileSync('/dev/stdin', 'utf8'));
