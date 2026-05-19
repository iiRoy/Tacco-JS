function solvePuzzle(gridWidth, gridData) {
    const visitedCells = new Set();
    let resultSteps = "NA";
    const initialQueueStates = [[0, 0, 0], [1, 0, 0]];
    const processingQueue = [...initialQueueStates];

    while (processingQueue.length > 0) {
        const currentProcessingState = processingQueue.shift();
        const [currentRow, currentCol, stepCount] = currentProcessingState;

        const cellIdentifier = `${currentRow},${currentCol}`;
        if (visitedCells.has(cellIdentifier)) {
            continue;
        }
        visitedCells.add(cellIdentifier);

        const isTargetReached = (colIndex, cellValueAtTarget) => colIndex === gridWidth - 1 && cellValueAtTarget !== 2;
        if (isTargetReached(currentCol, gridData[currentRow][currentCol])) {
            resultSteps = stepCount;
            break;
        }

        const currentCellValue = gridData[currentRow][currentCol];
        let effectiveColumnAfterMovement = currentCol;

        if (currentCellValue === 1) {
            let tempColumnForForwardScan = currentCol;
            let foundEndOfPath = false;
            while (true) {
                tempColumnForForwardScan++;
                if (tempColumnForForwardScan >= gridWidth - 1) {
                    foundEndOfPath = true;
                    break;
                }
                if (gridData[currentRow][tempColumnForForwardScan] !== 1) {
                    tempColumnForForwardScan--;
                    break;
                }
            }
            if (foundEndOfPath) {
                resultSteps = stepCount;
                break;
            }
            effectiveColumnAfterMovement = tempColumnForForwardScan;
        } else if (currentCellValue === 2) {
            let tempColumnForBackwardScan = currentCol;
            while (true) {
                tempColumnForBackwardScan--;
                if (gridData[currentRow][tempColumnForBackwardScan] !== 2) {
                    break;
                }
            }
            effectiveColumnAfterMovement = tempColumnForBackwardScan;
        }

        for (let columnOffset = 0; columnOffset <= 2; columnOffset++) {
            processingQueue.push([1 - currentRow, effectiveColumnAfterMovement + columnOffset, stepCount + 1]);
        }
    }
    return resultSteps;
}

const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
let inputLinesArray = rawInputData.trim().split("\n");

while (inputLinesArray.length > 0) {
    const currentGridWidth = Number(inputLinesArray.shift());
    if (currentGridWidth === 0) {
        break;
    }

    const currentGridData = [];
    currentGridData.push(inputLinesArray.shift().split(" ").map(Number));
    currentGridData.push(inputLinesArray.shift().split(" ").map(Number));

    console.log(solvePuzzle(currentGridWidth, currentGridData));
}
