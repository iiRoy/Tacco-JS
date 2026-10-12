const inputs = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const exitWithError = () => {
    console.log('No');
    process.exit();
};

const calculateDeltaValue = (valA, valB, coordA, coordB, divisor) => {
    let delta = (valB - valA) / ((coordB - coordA) / divisor);
    if (coordB > coordA) delta *= -1;
    return delta;
};

const validateYEvenR2 = (val, delta, row) => (val - delta * (row - 1) < 0 || val + delta * (2 - row) < 0);
const validateYEvenRNot2 = (val, delta, row, totalRows) => (val - delta * ((row / 2) - 1) < 0 || val + delta * Math.floor((totalRows - row) / 2) < 0);
const validateYOddMapped = (val, delta, row, totalRows) => (val - delta * Math.floor(row / 2) < 0 || val + delta * Math.floor((totalRows - row) / 2) < 0);
const validateYOddCurrent = (val, delta, row, totalRows) => (val - delta * Math.floor((row - 1) / 2) < 0 || val + delta * Math.floor((totalRows - row) / 2) < 0);

const validateXEvenC2 = (val, delta, col) => (val - delta * (col - 1) < 0 || val + delta * (2 - col) < 0);
const validateXEvenCNot2 = (val, delta, col, totalCols) => (val - delta * ((col / 2) - 1) < 0 || val + delta * Math.floor((totalCols - col) / 2) < 0);
const validateXOdd = (val, delta, col, totalCols) => (val - delta * Math.floor(col / 2) < 0 || val + delta * Math.floor((totalCols - col) / 2) < 0);

function handleDeltaAndValidation(
    deltaRef,
    calculatedDelta,
    dataMap,
    currentVal,
    currentCoord,
    totalDim,
    validationFnForMapped,
    validationFnForCurrent,
    exitFn
) {
    if (deltaRef.value === -1) {
        deltaRef.value = calculatedDelta;
        for (const mappedData of dataMap.values()) {
            const mappedCoord = mappedData[0];
            const mappedVal = mappedData[1];
            if (validationFnForMapped(mappedVal, calculatedDelta, mappedCoord, totalDim)) {
                exitFn();
            }
        }
    } else {
        if (calculatedDelta !== deltaRef.value) {
            exitFn();
        }
    }
    if (validationFnForCurrent(currentVal, calculatedDelta, currentCoord, totalDim)) {
        exitFn();
    }
}

const gridDimensions = inputs[0].split(' ').map(Number);
const numRows = gridDimensions[0];
const numCols = gridDimensions[1];
const numPoints = parseInt(inputs[1]);
const pointInputStrings = inputs.slice(2);

let deltaXOdd = { value: -1 };
let deltaXEven = { value: -1 };
let deltaYOdd = { value: -1 };
let deltaYEven = { value: -1 };

let rowOddPoints = new Map();
let rowEvenPoints = new Map();
let colOddPoints = new Map();
let colEvenPoints = new Map();

for (let i = 0; i < numPoints; i++) {
    const currentPointData = pointInputStrings[i].split(' ');
    const currentRow = parseInt(currentPointData[0]);
    const currentCol = parseInt(currentPointData[1]);
    const currentValue = parseInt(currentPointData[2]);

    if (numRows === 2) {
        if (colEvenPoints.has(currentCol)) {
            const previousPointData = colEvenPoints.get(currentCol);
            const previousRow = previousPointData[0];
            const previousValue = previousPointData[1];

            const calculatedDelta = calculateDeltaValue(currentValue, previousValue, currentRow, previousRow, 1);

            handleDeltaAndValidation(
                deltaYEven,
                calculatedDelta,
                colEvenPoints,
                currentValue,
                currentRow,
                numRows,
                validateYEvenR2,
                validateYEvenR2,
                exitWithError
            );
        } else {
            colEvenPoints.set(currentCol, [currentRow, currentValue]);
        }
    } else {
        if (currentRow % 2 === 0) {
            if (colEvenPoints.has(currentCol)) {
                const previousPointData = colEvenPoints.get(currentCol);
                const previousRow = previousPointData[0];
                const previousValue = previousPointData[1];

                const calculatedDelta = calculateDeltaValue(currentValue, previousValue, currentRow, previousRow, 2);

                handleDeltaAndValidation(
                    deltaYEven,
                    calculatedDelta,
                    colEvenPoints,
                    currentValue,
                    currentRow,
                    numRows,
                    validateYEvenRNot2,
                    validateYEvenRNot2,
                    exitWithError
                );
            } else {
                colEvenPoints.set(currentCol, [currentRow, currentValue]);
            }
        } else {
            if (colOddPoints.has(currentCol)) {
                const previousPointData = colOddPoints.get(currentCol);
                const previousRow = previousPointData[0];
                const previousValue = previousPointData[1];

                const calculatedDelta = calculateDeltaValue(currentValue, previousValue, currentRow, previousRow, 2);

                handleDeltaAndValidation(
                    deltaYOdd,
                    calculatedDelta,
                    colOddPoints,
                    currentValue,
                    currentRow,
                    numRows,
                    validateYOddMapped,
                    validateYOddCurrent,
                    exitWithError
                );
            } else {
                colOddPoints.set(currentCol, [currentRow, currentValue]);
            }
        }
    }

    if (numCols === 2) {
        if (rowEvenPoints.has(currentRow)) {
            const previousPointData = rowEvenPoints.get(currentRow);
            const previousCol = previousPointData[0];
            const previousValue = previousPointData[1];

            const calculatedDelta = calculateDeltaValue(currentValue, previousValue, currentCol, previousCol, 1);

            handleDeltaAndValidation(
                deltaXEven,
                calculatedDelta,
                rowEvenPoints,
                currentValue,
                currentCol,
                numCols,
                validateXEvenC2,
                validateXEvenC2,
                exitWithError
            );
        } else {
            rowEvenPoints.set(currentRow, [currentCol, currentValue]);
        }
    } else {
        if (currentCol % 2 === 0) {
            if (rowEvenPoints.has(currentRow)) {
                const previousPointData = rowEvenPoints.get(currentRow);
                const previousCol = previousPointData[0];
                const previousValue = previousPointData[1];

                const calculatedDelta = calculateDeltaValue(currentValue, previousValue, currentCol, previousCol, 2);

                handleDeltaAndValidation(
                    deltaXEven,
                    calculatedDelta,
                    rowEvenPoints,
                    currentValue,
                    currentCol,
                    numCols,
                    validateXEvenCNot2,
                    validateXEvenCNot2,
                    exitWithError
                );
            } else {
                rowEvenPoints.set(currentRow, [currentCol, currentValue]);
            }
        } else {
            if (rowOddPoints.has(currentRow)) {
                const previousPointData = rowOddPoints.get(currentRow);
                const previousCol = previousPointData[0];
                const previousValue = previousPointData[1];

                const calculatedDelta = calculateDeltaValue(currentValue, previousValue, currentCol, previousCol, 2);

                handleDeltaAndValidation(
                    deltaXOdd,
                    calculatedDelta,
                    rowOddPoints,
                    currentValue,
                    currentCol,
                    numCols,
                    validateXOdd,
                    validateXOdd,
                    exitWithError
                );
            } else {
                rowOddPoints.set(currentRow, [currentCol, currentValue]);
            }
        }
    }
}

console.log('Yes');
