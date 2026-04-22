const documentSource = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineFragments = documentSource.trim().split("\n");

const dataMatrix = [];
const cumulativeMaximums = [];

lineFragments.forEach(function(segment) {
    const rowEntries = segment.split(",").map(Number);
    dataMatrix.push(rowEntries);
    cumulativeMaximums.push(new Array(rowEntries.length).fill(Number.MIN_SAFE_INTEGER));
});

if (dataMatrix.length > 0) {
    cumulativeMaximums[0][0] = dataMatrix[0][0];
}

for (let currentRowIndex = 0; currentRowIndex < dataMatrix.length - 1; currentRowIndex++) {
    for (let currentColumnIndex = 0; currentColumnIndex < dataMatrix[currentRowIndex].length; currentColumnIndex++) {
        if (cumulativeMaximums[currentRowIndex][currentColumnIndex] !== Number.MIN_SAFE_INTEGER) {
            const currentPathAggregate = cumulativeMaximums[currentRowIndex][currentColumnIndex];

            const isUpperSection = (dataMatrix.length - 1) / 2 > currentRowIndex;

            if (isUpperSection) {
                const nextValue1 = dataMatrix[currentRowIndex + 1][currentColumnIndex];
                cumulativeMaximums[currentRowIndex + 1][currentColumnIndex] = Math.max(
                    cumulativeMaximums[currentRowIndex + 1][currentColumnIndex],
                    currentPathAggregate + nextValue1
                );

                const nextValue2 = dataMatrix[currentRowIndex + 1][currentColumnIndex + 1];
                cumulativeMaximums[currentRowIndex + 1][currentColumnIndex + 1] = Math.max(
                    cumulativeMaximums[currentRowIndex + 1][currentColumnIndex + 1],
                    currentPathAggregate + nextValue2
                );
            } else {
                if (currentColumnIndex - 1 >= 0) {
                    const nextValue1 = dataMatrix[currentRowIndex + 1][currentColumnIndex - 1];
                    cumulativeMaximums[currentRowIndex + 1][currentColumnIndex - 1] = Math.max(
                        cumulativeMaximums[currentRowIndex + 1][currentColumnIndex - 1],
                        currentPathAggregate + nextValue1
                    );
                }

                if (currentColumnIndex < dataMatrix[currentRowIndex + 1].length) {
                    const nextValue2 = dataMatrix[currentRowIndex + 1][currentColumnIndex];
                    cumulativeMaximums[currentRowIndex + 1][currentColumnIndex] = Math.max(
                        cumulativeMaximums[currentRowIndex + 1][currentColumnIndex],
                        currentPathAggregate + nextValue2
                    );
                }
            }
        }
    }
}

let ultimatePathSum = 0;
if (dataMatrix.length > 0) {
    const finalRowSums = cumulativeMaximums[cumulativeMaximums.length - 1];
    ultimatePathSum = Math.max(...finalRowSums);
}

console.log(ultimatePathSum);