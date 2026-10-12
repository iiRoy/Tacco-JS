const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const inputLines = inputData.split('\n');

const numMatrices = Number(inputLines.shift());

const dimensionArray = [];
inputLines.slice(0, numMatrices).forEach((line, index) => {
    const [rows, cols] = line.split(' ').map(Number);
    if (index === 0) {
        dimensionArray.push(rows);
    }
    dimensionArray.push(cols);
});

const dpCache = Array.from({ length: numMatrices }, () =>
    Array(numMatrices).fill(null)
);

function computeOptimalCost(firstMatrix, lastMatrix) {
    if (firstMatrix === lastMatrix) {
        return 0;
    }

    if (dpCache[firstMatrix][lastMatrix] !== null) {
        return dpCache[firstMatrix][lastMatrix];
    }

    let minCostForChain = Number.POSITIVE_INFINITY;

    for (let pivot = firstMatrix; pivot < lastMatrix; pivot++) {
        const currentChainCost =
            computeOptimalCost(firstMatrix, pivot) +
            computeOptimalCost(pivot + 1, lastMatrix) +
            dimensionArray[firstMatrix] * dimensionArray[pivot + 1] * dimensionArray[lastMatrix + 1];

        if (currentChainCost < minCostForChain) {
            minCostForChain = currentChainCost;
        }
    }

    dpCache[firstMatrix][lastMatrix] = minCostForChain;
    return minCostForChain;
}

console.log(computeOptimalCost(0, numMatrices - 1));
