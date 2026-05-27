function findDuplicateIndices(inputArray) {
    const DIGIT_RANGE = 10;
    const occurrenceCounts = new Array(DIGIT_RANGE).fill(0);

    for (const currentValue of inputArray) {
        if (currentValue >= 0 && currentValue < DIGIT_RANGE) {
            occurrenceCounts[currentValue]++;
        }
    }

    const duplicateValues = [];
    for (let i = 0; i < DIGIT_RANGE; i++) {
        if (occurrenceCounts[i] >= 2) {
            duplicateValues.push(i);
        }
    }

    const indicesOfDuplicates = [];
    for (let i = 0; i < inputArray.length; i++) {
        if (duplicateValues.includes(inputArray[i])) {
            indicesOfDuplicates.push(i);
        }
    }
    return indicesOfDuplicates;
}

const parseNumericRow = (lineString) => lineString.split(" ").map(Number);

const readSquareGrid = (sourceLines, dimension) => {
    const grid = [];
    for (let i = 0; i < dimension; i++) {
        grid.push(parseNumericRow(sourceLines.shift()));
    }
    return grid;
};

const createZeroFilledGrid = (dimension) => {
    return Array.from({ length: dimension }, () => new Array(dimension).fill(0));
};

const getColumnValues = (grid, colIndex, dimension) => {
    const column = [];
    for (let rowIndex = 0; rowIndex < dimension; rowIndex++) {
        column.push(grid[rowIndex][colIndex]);
    }
    return column;
};

const getSubgridCellCoordinates = (blockRowIndex, blockColIndex, subgridDimension) => {
    const coords = [];
    for (let r = 0; r < subgridDimension; r++) {
        for (let c = 0; c < subgridDimension; c++) {
            coords.push([blockRowIndex * subgridDimension + r, blockColIndex * subgridDimension + c]);
        }
    }
    return coords;
};

const getValuesFromCoordinates = (grid, coordinatesList) => {
    const values = [];
    for (const coordPair of coordinatesList) {
        values.push(grid[coordPair[0]][coordPair[1]]);
    }
    return values;
};

const formatOutputGrid = (originalGrid, markerGrid, dimension) => {
    const formattedRows = [];
    for (let r = 0; r < dimension; r++) {
        const currentRow = [];
        for (let c = 0; c < dimension; c++) {
            const cellValue = originalGrid[r][c];
            const formattedCell = markerGrid[r][c] >= 1 ? `*${cellValue}` : ` ${cellValue}`;
            currentRow.push(formattedCell);
        }
        formattedRows.push(currentRow.join(""));
    }
    return formattedRows.join("\n");
};

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split("\n");

let outputBuffer = "";

const GRID_DIMENSION = 9;
const SUBGRID_DIMENSION = 3;

const numTestCases = Number(inputLines.shift());

for (let testCaseIndex = 0; testCaseIndex < numTestCases; testCaseIndex++) {
    const gridData = readSquareGrid(inputLines, GRID_DIMENSION);
    const duplicateMarkers = createZeroFilledGrid(GRID_DIMENSION);

    for (let rowIndex = 0; rowIndex < GRID_DIMENSION; rowIndex++) {
        const duplicatePositions = findDuplicateIndices(gridData[rowIndex]);
        for (const colIndex of duplicatePositions) {
            duplicateMarkers[rowIndex][colIndex]++;
        }
    }

    for (let colIndex = 0; colIndex < GRID_DIMENSION; colIndex++) {
        const columnValues = getColumnValues(gridData, colIndex, GRID_DIMENSION);
        const duplicatePositions = findDuplicateIndices(columnValues);
        for (const rowIndex of duplicatePositions) {
            duplicateMarkers[rowIndex][colIndex]++;
        }
    }

    for (let blockRow = 0; blockRow < SUBGRID_DIMENSION; blockRow++) {
        for (let blockCol = 0; blockCol < SUBGRID_DIMENSION; blockCol++) {
            const subgridCoordinates = getSubgridCellCoordinates(blockRow, blockCol, SUBGRID_DIMENSION);
            const subgridValues = getValuesFromCoordinates(gridData, subgridCoordinates);
            const duplicatePositions = findDuplicateIndices(subgridValues);

            for (const duplicateIndex of duplicatePositions) {
                const [originalRow, originalCol] = subgridCoordinates[duplicateIndex];
                duplicateMarkers[originalRow][originalCol]++;
            }
        }
    }

    outputBuffer += formatOutputGrid(gridData, duplicateMarkers, GRID_DIMENSION) + "\n\n";
}

console.log(outputBuffer.trim());
