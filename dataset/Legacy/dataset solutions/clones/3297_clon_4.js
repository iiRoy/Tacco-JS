const fs = require('fs');

const inputContent = fs.readFileSync('/dev/stdin', 'utf8');

const allLines = inputContent.split('\n');

const totalRows = Number(allLines[0]);

const expenseMatrix = allLines.slice(1, totalRows + 1).map(lineSegment => {
    const [firstCost, secondCost, thirdCost] = lineSegment.split(' ').map(Number);
    return [firstCost, secondCost, thirdCost];
});

const finalAccumulatedExpenses = expenseMatrix.slice(1).reduce((previousRowMaxes, currentRowExpenses) => {
    const nextRowMaxes = [0, 0, 0];

    nextRowMaxes[0] = currentRowExpenses[0] + Math.max(previousRowMaxes[1], previousRowMaxes[2]);

    nextRowMaxes[1] = currentRowExpenses[1] + Math.max(previousRowMaxes[0], previousRowMaxes[2]);

    nextRowMaxes[2] = currentRowExpenses[2] + Math.max(previousRowMaxes[0], previousRowMaxes[1]);

    return nextRowMaxes;
}, expenseMatrix[0]);

const overallMaximum = Math.max(...finalAccumulatedExpenses);

console.log(overallMaximum);
