var gridSize;
var gridData;

function solvePuzzle() {
    var visitedCells = {};
    var resultValue = "NA";
    var queueNodes = [[0, 0, 0], [1, 0, 0]];
    const targetColumnIndex = gridSize - 1;

    while (queueNodes.length > 0) {
        var currentNode = queueNodes.shift();
        var currentRow = currentNode[0];
        var currentCol = currentNode[1];
        var stepCount = currentNode[2];

        var cellIdentifier = currentRow + "," + currentCol;
        if (visitedCells.hasOwnProperty(cellIdentifier)) {
            continue;
        }
        visitedCells[cellIdentifier] = true;

        if (currentCol === targetColumnIndex && gridData[currentRow][currentCol] !== 2) {
            resultValue = stepCount;
            break;
        }

        var currentCellValue = gridData[currentRow][currentCol];

        if (currentCellValue === 1) {
            let tempColForward = currentCol;
            while (tempColForward < gridSize && gridData[currentRow][tempColForward] === 1) {
                tempColForward++;
            }
            currentCol = tempColForward - 1;
        } else if (currentCellValue === 2) {
            let tempColBackward = currentCol;
            while (tempColBackward >= 0 && gridData[currentRow][tempColBackward] === 2) {
                tempColBackward--;
            }
            currentCol = tempColBackward + 1;
        }

        const nextRowToggle = 1 - currentRow;
        const nextStepCount = stepCount + 1;
        
        const newNodesToAdd = [];
        for (let i = 0; i <= 2; i++) {
            newNodesToAdd.push([nextRowToggle, currentCol + i, nextStepCount]);
        }
        queueNodes.push(...newNodesToAdd);
    }
    return resultValue;
}

var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = rawData.trim().split("\n");

while (true) {
    const currentNString = inputLines.shift();
    gridSize = parseInt(currentNString, 10);

    if (gridSize === 0) {
        break;
    }

    gridData = [];
    
    const firstRowString = inputLines.shift();
    gridData[0] = firstRowString.split(" ").map(val => parseInt(val, 10));

    const secondRowString = inputLines.shift();
    gridData[1] = secondRowString.split(" ").map(val => parseInt(val, 10));

    console.log(solvePuzzle());
}
