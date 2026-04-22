let boardCellsReference;
let boardWidthReference;
let memoizationStore;

function navigateRoute(currentRow, currentColumn, currentPathLength) {
    if (currentColumn < 0 || currentColumn >= boardWidthReference) {
        return Infinity;
    }

    const locationKey = `${currentRow}_${currentColumn}`;

    if (memoizationStore.has(locationKey) && currentPathLength >= memoizationStore.get(locationKey)) {
        return Infinity;
    }

    memoizationStore.set(locationKey, currentPathLength);

    if (currentColumn === boardWidthReference - 1 && boardCellsReference[currentRow][currentColumn] !== 2) {
        return currentPathLength;
    }

    let adjustedColumn = currentColumn;
    const cellKind = boardCellsReference[currentRow][currentColumn];

    if (cellKind === 1) {
        while (true) {
            adjustedColumn++;
            if (adjustedColumn >= boardWidthReference || boardCellsReference[currentRow][adjustedColumn] !== 1) {
                adjustedColumn--;
                break;
            }
        }
    } else if (cellKind === 2) {
        while (true) {
            adjustedColumn--;
            if (adjustedColumn < 0 || boardCellsReference[currentRow][adjustedColumn] !== 2) {
                break;
            }
        }
    }

    let leastSteps = Infinity;

    for (let colOffset = 0; colOffset <= 2; colOffset++) {
        const nextRow = 1 - currentRow;
        const nextColumn = adjustedColumn + colOffset;
        
        const stepsFromNext = navigateRoute(nextRow, nextColumn, currentPathLength + 1);
        leastSteps = Math.min(leastSteps, stepsFromNext);
    }

    return leastSteps;
}

function solveBoardConfiguration(dimensionValue, cellData) {
    boardWidthReference = dimensionValue;
    boardCellsReference = cellData;
    memoizationStore = new Map();

    let outcomeFromTopStart = navigateRoute(0, 0, 0);
    let outcomeFromBottomStart = navigateRoute(1, 0, 0);

    const overallMinimum = Math.min(outcomeFromTopStart, outcomeFromBottomStart);

    return overallMinimum === Infinity ? "NA" : String(overallMinimum);
}

const processInputCases = (inputLines, currentIndex, resultsCollection = []) => {
    if (currentIndex >= inputLines.length) {
        return resultsCollection;
    }

    const currentBoardDimension = parseInt(inputLines[currentIndex], 10);
    if (currentBoardDimension === 0) {
        return resultsCollection;
    }

    const currentBoardCells = [];
    currentBoardCells[0] = inputLines[currentIndex + 1].split(' ').map(Number);
    currentBoardCells[1] = inputLines[currentIndex + 2].split(' ').map(Number);

    const currentOutcome = solveBoardConfiguration(currentBoardDimension, currentBoardCells);
    resultsCollection.push(currentOutcome);

    return processInputCases(inputLines, currentIndex + 3, resultsCollection);
};

const executeMazeSolver = () => {
    const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
    const allInputLines = rawInputData.trim().split('\n');

    const finalResults = processInputCases(allInputLines, 0);

    console.log(finalResults.join('\n'));
};

executeMazeSolver();