const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let inputLines = rawInputData.trim().split('\n');

const clampValue = (valueToClamp, lowerBound, upperBound) => {
    const clampedLower = Math.max(lowerBound, valueToClamp);
    const finalClamped = Math.min(upperBound, clampedLower);
    return finalClamped;
};

while (true) {
    const currentDimensionLine = inputLines.shift();
    const dimensionStrings = currentDimensionLine.split(' ');

    const firstDimStr = dimensionStrings[0];
    const secondDimStr = dimensionStrings[1];

    if (firstDimStr === '0' && secondDimStr === '0') {
        break;
    }

    const countN = parseInt(firstDimStr, 10);
    const countM = parseInt(secondDimStr, 10);

    const mValues = [];
    for (let mIdx = 0; mIdx < countM; mIdx++) {
        mValues.push(parseInt(inputLines.shift(), 10));
    }

    const nValues = [];
    for (let nIdx = 0; nIdx < countN; nIdx++) {
        nValues.push(parseInt(inputLines.shift(), 10));
    }

    const dpTable = Array.from({ length: countN + 1 }, () =>
        Array.from({ length: 256 }, () => Infinity)
    );

    const initialDpColumn = 128;
    dpTable[0][initialDpColumn] = 0;

    for (let iRow = 1; iRow <= countN; iRow++) {
        const currentNValue = nValues[iRow - 1];
        for (let jCol = 0; jCol <= 255; jCol++) {
            const costFromPreviousState = dpTable[iRow - 1][jCol];

            if (costFromPreviousState !== Infinity) {
                for (let kDeltaIdx = 0; kDeltaIdx < countM; kDeltaIdx++) {
                    const mDelta = mValues[kDeltaIdx];
                    const potentialNextJ = jCol + mDelta;
                    const clampedNextJ = clampValue(potentialNextJ, 0, 255);

                    const squaredDifference = Math.pow(currentNValue - clampedNextJ, 2);
                    const totalAccumulatedCost = costFromPreviousState + squaredDifference;

                    dpTable[iRow][clampedNextJ] = Math.min(dpTable[iRow][clampedNextJ], totalAccumulatedCost);
                }
            }
        }
    }

    const minimumFinalCost = dpTable[countN].reduce((accumulator, currentCost) =>
        Math.min(accumulator, currentCost), Infinity
    );

    console.log(minimumFinalCost);
}
