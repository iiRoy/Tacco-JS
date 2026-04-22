const integerValueExtractor = (inputStr) => Number.parseInt(inputStr, 10);
const floatValueExtractor = (inputStr) => Number.parseFloat(inputStr);

const isEvenCheck = (valueItem) => (valueItem & 1) === 0;
const isOddCheck = (valueItem) => (valueItem & 1) === 1;

const ascendingNumericSorter = (collectionInstance) => [...collectionInstance].sort((firstEl, secondEl) => firstEl - secondEl);
const descendingNumericSorter = (collectionInstance) => [...collectionInstance].sort((firstEl, secondEl) => secondEl - firstEl);
const ascendingLexicographicSorter = (collectionInstance) => [...collectionInstance].sort();
const descendingLexicographicSorter = (collectionInstance) => [...collectionInstance].sort().reverse();

const filterOutElement = (collectionInstance, undesiredElement) => collectionInstance.filter(currentElement => currentElement !== undesiredElement);

const computeGridAnalysis = (inputDataLines) => {
    const configSettings = inputDataLines[0].split(' ').map(integerValueExtractor);
    const gridHeight = configSettings[0];
    const gridWidth = configSettings[1];
    const maxMoveDistance = configSettings[2];

    let currentGridState = inputDataLines.slice(1).map(oneGridRow => oneGridRow.split(''));
    let startingPointCoords = [-1, -1];

    currentGridState.some((rowContents, rowIndex) => {
        const colIndex = rowContents.findIndex(cellChar => cellChar === 'S');
        if (colIndex !== -1) {
            startingPointCoords = [rowIndex, colIndex];
            return true;
        }
        return false;
    });

    const bfsTraversalQueue = [];
    bfsTraversalQueue.push([...startingPointCoords, 0]);

    const neighborOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    let queueHeadIndex = 0;
    while (queueHeadIndex < bfsTraversalQueue.length) {
        const [currentRow, currentCol, currentPathLength] = bfsTraversalQueue[queueHeadIndex++];

        if (currentPathLength > maxMoveDistance) continue;
        if (currentRow < 0 || currentRow >= gridHeight || currentCol < 0 || currentCol >= gridWidth) continue;

        const currentCellVal = currentGridState[currentRow][currentCol];

        if (
            currentCellVal === '.' ||
            currentCellVal === 'S' ||
            (typeof currentCellVal === 'number' && currentCellVal > currentPathLength)
        ) {
            currentGridState[currentRow][currentCol] = currentPathLength;

            for (const [rowOffset, colOffset] of neighborOffsets) {
                bfsTraversalQueue.push([currentRow + rowOffset, currentCol + colOffset, currentPathLength + 1]);
            }
        }
    }

    const calculateExitProximity = (rCoord, cCoord) => {
        const distanceToTop = rCoord;
        const distanceToBottom = (gridHeight - 1) - rCoord;
        const distanceToLeft = cCoord;
        const distanceToRight = (gridWidth - 1) - cCoord;
        return Math.min(distanceToTop, distanceToBottom, distanceToLeft, distanceToRight);
    };

    let finalCalculatedMin = Infinity;

    const processedCells = currentGridState.flatMap((rowArr, r) =>
        rowArr.map((valueInCell, c) => ({ rIndex: r, cIndex: c, cellPathLength: valueInCell }))
    ).filter(cellInfo => typeof cellInfo.cellPathLength === 'number');

    finalCalculatedMin = processedCells.reduce((currentOverallMin, cellInfo) => {
        const cellExitDistance = calculateExitProximity(cellInfo.rIndex, cellInfo.cIndex);

        if (cellExitDistance === 0) {
            return 1;
        }

        const requiredJourneyCount = Math.ceil(cellExitDistance / maxMoveDistance) + 1;
        return Math.min(currentOverallMin, requiredJourneyCount);
    }, Infinity);

    console.log(finalCalculatedMin);
};

const acquireInputData = (sourceText) => {
    return sourceText.split('\n').map(lineString => lineString.trim());
};

computeGridAnalysis(acquireInputData(require("fs").readFileSync("/dev/stdin", "utf8")));