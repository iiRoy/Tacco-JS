var inputLines = [];
var gridSize, gridData;

var inputReaderModule = require('readline');

var interfaceInstance = inputReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceInstance.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

interfaceInstance.on('close', function () {
    const firstLineContent = inputLines.shift();
    gridSize = Number(firstLineContent);

    const parseGridRow = (rowString) => rowString.split(" ").map(Number);
    gridData = inputLines.map(parseGridRow);

    var pathQueue = [[0, 0, 0]];
    console.log(findMaxPathSum(pathQueue));
});

function findMaxPathSum(initialQueue) {
    var maxSum = 0;
    var processingQueue = [...initialQueue];

    while (processingQueue.length > 0) {
        const [currentRow, currentCol, previousPathSum] = processingQueue.shift();

        const currentCellValue = gridData[currentRow][currentCol];
        const currentAccumulatedSum = previousPathSum + currentCellValue;

        if (currentAccumulatedSum > maxSum) {
            maxSum = currentAccumulatedSum;
        }

        const addNextStep = (r, c, sum) => {
            processingQueue.push([r, c, sum]);
        };

        if (currentCol + 1 < gridSize) {
            addNextStep(currentRow, currentCol + 1, currentAccumulatedSum);
        }

        if (currentRow === 0) {
            addNextStep(currentRow + 1, currentCol, currentAccumulatedSum);
        }
    }

    return maxSum;
}
