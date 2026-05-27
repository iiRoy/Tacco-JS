const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = rawInputData.trim().split("\n");

function parseDimensions(lineContent) {
    return lineContent.split(" ").map(Number);
}

while (true) {
    const currentDimensions = parseDimensions(inputLines.shift());
    const countN = currentDimensions[0];
    const countM = currentDimensions[1];

    if (countN === 0 && countM === 0) {
        break;
    }

    const mValuesArray = [];
    for (let outerLoopIndex = 0; outerLoopIndex < countM; outerLoopIndex++) {
        mValuesArray.push(Number(inputLines.shift()));
    }

    const nValuesArray = [];
    for (let outerLoopIndex = 0; outerLoopIndex < countN; outerLoopIndex++) {
        nValuesArray.push(Number(inputLines.shift()));
    }

    const dynamicProgrammingTable = [];
    for (let rowIndex = 0; rowIndex <= countN; rowIndex++) {
        dynamicProgrammingTable.push(Array(256).fill(Number.POSITIVE_INFINITY));
    }
    dynamicProgrammingTable[0][128] = 0;

    for (let rowIndex = 1; rowIndex <= countN; rowIndex++) {
        const targetNValue = nValuesArray[rowIndex - 1];
        for (let currentValue = 0; currentValue <= 255; currentValue++) {
            const previousStepCost = dynamicProgrammingTable[rowIndex - 1][currentValue];

            if (previousStepCost === Number.POSITIVE_INFINITY) {
                continue;
            }

            for (let mArrayIndex = 0; mArrayIndex < countM; mArrayIndex++) {
                const mModifier = mValuesArray[mArrayIndex];
                const potentialNewValue = currentValue + mModifier;

                const clampedValue = Math.max(0, Math.min(255, potentialNewValue));

                const squaredDiff = Math.pow(targetNValue - clampedValue, 2);
                const currentPathCost = previousStepCost + squaredDiff;

                dynamicProgrammingTable[rowIndex][clampedValue] = Math.min(
                    dynamicProgrammingTable[rowIndex][clampedValue],
                    currentPathCost
                );
            }
        }
    }

    const finalMinimumCost = Math.min(...dynamicProgrammingTable[countN]);
    console.log(finalMinimumCost);
}
