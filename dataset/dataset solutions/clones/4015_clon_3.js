const parseIntegerLine = (lineContent) => {
    return lineContent.split(' ').map(strVal => parseInt(strVal, 10));
};

const calculateManhattanDistance = (pointOne, pointTwo) => {
    const [rowCoord1, colCoord1] = pointOne;
    const [rowCoord2, colCoord2] = pointTwo;
    return Math.abs(rowCoord1 - rowCoord2) + Math.abs(colCoord1 - colCoord2);
};

const solveMagicGridProblem = (rawInputString) => {
    const allInputLines = rawInputString.trim().split('\n');

    const [gridHeight, gridWidth, stepDistance] = parseIntegerLine(allInputLines[0]);

    const dataAndQueryLines = allInputLines.slice(1);

    const totalGridCells = gridHeight * gridWidth;

    const cellPositionMap = new Array(totalGridCells + 1);

    for (let currentRowIndex = 0; currentRowIndex < gridHeight; currentRowIndex++) {
        const currentGridRowValues = parseIntegerLine(dataAndQueryLines[currentRowIndex]);
        for (let currentColIndex = 0; currentColIndex < gridWidth; currentColIndex++) {
            const cellValue = currentGridRowValues[currentColIndex];
            cellPositionMap[cellValue] = [currentRowIndex, currentColIndex];
        }
    }

    const cumulativeMagicCost = new Array(totalGridCells + 1).fill(0);

    for (let sequenceStartValue = 1; sequenceStartValue <= stepDistance; sequenceStartValue++) {
        for (let currentCellVal = sequenceStartValue; currentCellVal <= totalGridCells - stepDistance; currentCellVal += stepDistance) {
            const nextCellVal = currentCellVal + stepDistance;

            const currentCellPos = cellPositionMap[currentCellVal];
            const nextCellPos = cellPositionMap[nextCellVal];

            const distanceBetweenSteps = calculateManhattanDistance(currentCellPos, nextCellPos);

            cumulativeMagicCost[nextCellVal] = cumulativeMagicCost[currentCellVal] + distanceBetweenSteps;
        }
    }

    const numberOfQueries = parseIntegerLine(dataAndQueryLines[gridHeight])[0];

    const queryResultsList = [];

    for (let queryIndex = 0; queryIndex < numberOfQueries; queryIndex++) {
        const queryLineData = dataAndQueryLines[gridHeight + 1 + queryIndex];
        const [queryRangeStart, queryRangeEnd] = parseIntegerLine(queryLineData);

        const queryTotalCost = cumulativeMagicCost[queryRangeEnd] - cumulativeMagicCost[queryRangeStart];
        queryResultsList.push(queryTotalCost);
    }

    return queryResultsList.join('\n');
};

console.log(solveMagicGridProblem(require('fs').readFileSync('/dev/stdin', 'utf8')));
