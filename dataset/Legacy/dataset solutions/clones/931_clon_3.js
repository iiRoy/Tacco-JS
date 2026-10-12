const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
let dataRows = fileContent.split('\n');

const matrixCount = Number(dataRows.shift());

const dimensions = [];

for (let currentMatrixIndex = 1; currentMatrixIndex <= matrixCount; currentMatrixIndex++) {
    const currentPair = dataRows.shift().split(' ');
    dimensions[currentMatrixIndex] = Number(currentPair[0]);
    dimensions[currentMatrixIndex + 1] = Number(currentPair[1]);
}

const minScalarMultiplications = [];
const POSITIVE_INFINITY_VALUE = Number.POSITIVE_INFINITY;

for (let rowIndex = 0; rowIndex <= matrixCount; rowIndex++) {
    minScalarMultiplications.push(new Array(matrixCount + 1).fill(POSITIVE_INFINITY_VALUE));
}

for (let diagonalIndex = 1; diagonalIndex <= matrixCount; diagonalIndex++) {
    minScalarMultiplications[diagonalIndex][diagonalIndex] = 0;
}

for (let chainLength = 1; chainLength < matrixCount; chainLength++) {
    for (let startMatrixIndex = 1; startMatrixIndex <= matrixCount - chainLength; startMatrixIndex++) {
        const endMatrixIndex = startMatrixIndex + chainLength;
        for (let splitPoint = startMatrixIndex + 1; splitPoint <= endMatrixIndex; splitPoint++) {
            const costOfLeftChain = minScalarMultiplications[startMatrixIndex][splitPoint - 1];
            const costOfRightChain = minScalarMultiplications[splitPoint][endMatrixIndex];
            const costOfCurrentMultiplication = dimensions[startMatrixIndex] * dimensions[splitPoint] * dimensions[endMatrixIndex + 1];
            
            const totalCostForSubproblem = costOfLeftChain + costOfRightChain + costOfCurrentMultiplication;
            
            if (totalCostForSubproblem < minScalarMultiplications[startMatrixIndex][endMatrixIndex]) {
                minScalarMultiplications[startMatrixIndex][endMatrixIndex] = totalCostForSubproblem;
            }
        }
    }
}

console.log(minScalarMultiplications[1][matrixCount]);
