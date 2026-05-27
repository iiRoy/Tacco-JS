const fileSystem = require("fs");

const getRawInputContent = () => fileSystem.readFileSync("/dev/stdin", "utf8");

const parseLineToInt = (lineString) => {
    const trimmedLine = lineString.trim();
    return parseInt(trimmedLine, 10);
};

(() => {
    const rawInputData = getRawInputContent();
    const inputLines = rawInputData.split('\n');

    const matrixSize = parseLineToInt(inputLines[0]);

    const moduloConstant = 1000000007;

    const createInitialDpGrid = (size) => {
        const grid = [];
        for (let r = 0; r < size; r++) {
            const row = Array(size).fill(1);
            grid.push(row);
        }
        return grid;
    };

    const dpMatrix = createInitialDpGrid(matrixSize);

    const applyModularSum = (a, b, mod) => (a + b) % mod;

    for (let rowIndex = 1; rowIndex < matrixSize; rowIndex++) {
        for (let colIndex = 1; colIndex < matrixSize; colIndex++) {
            const valueFromAbove = dpMatrix[rowIndex - 1][colIndex];
            const valueFromLeft = dpMatrix[rowIndex][colIndex - 1];
            dpMatrix[rowIndex][colIndex] = applyModularSum(valueFromAbove, valueFromLeft, moduloConstant);
        }
    }

    let accumulatedSum = 0;
    const iterationLimit = Math.floor(matrixSize / 3);

    const calculateTargetColumn = (currentSize, currentIteration) => {
        return currentSize - (currentIteration + 1) * 3;
    };

    for (let r = 0; r < iterationLimit; r++) {
        const targetColumnIndex = calculateTargetColumn(matrixSize, r);

        if (r < matrixSize && targetColumnIndex >= 0 && targetColumnIndex < matrixSize) {
            const cellValue = dpMatrix[r][targetColumnIndex];
            accumulatedSum = applyModularSum(accumulatedSum, cellValue, moduloConstant);
        }
    }

    console.log(accumulatedSum);
})();
