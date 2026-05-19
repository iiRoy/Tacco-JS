"use strict";

const createTwoDimensionalArray = (rowsCount, columnsCount, initialValue = 0) => {
    let newArray = new Array(rowsCount);
    for (let r = 0; r < rowsCount; r++) {
        newArray[r] = new Array(columnsCount).fill(initialValue);
    }
    return newArray;
};

function processInputAndSolve(rawInputData) {
    const MODULO_VALUE = 998244353;

    const inputLines = rawInputData.split("\n");
    const numberOfItems = parseInt(inputLines[0], 10);
    const itemWeightValues = inputLines.slice(1, numberOfItems + 1).map(valStr => parseInt(valStr, 10));

    const totalWeightSum = itemWeightValues.reduce((accumulatedSum, currentWeight) => accumulatedSum + currentWeight, 0);

    // dpCombinationsRG: Stores counts for combinations using only Red (R) or Green (G) assignments.
    const dpCombinationsRG = createTwoDimensionalArray(numberOfItems + 1, totalWeightSum + 1);
    // dpCombinationsRGB: Stores counts for combinations using Red (R), Green (G), or Blue (B) assignments.
    const dpCombinationsRGB = createTwoDimensionalArray(numberOfItems + 1, totalWeightSum + 1);

    dpCombinationsRG[0][0] = 1;
    dpCombinationsRGB[0][0] = 1;

    for (let currentItemIndex = 1; currentItemIndex <= numberOfItems; currentItemIndex++) {
        const currentItemWeight = itemWeightValues[currentItemIndex - 1];

        for (let currentTargetSum = 0; currentTargetSum <= totalWeightSum; currentTargetSum++) {
            // Option 1: Assign the current item to Red (R).
            // This means the current item contributes its weight to the sum.
            const previousSumForRed = currentTargetSum - currentItemWeight;
            if (previousSumForRed >= 0) {
                dpCombinationsRG[currentItemIndex][currentTargetSum] += dpCombinationsRG[currentItemIndex - 1][previousSumForRed];
                dpCombinationsRGB[currentItemIndex][currentTargetSum] += dpCombinationsRGB[currentItemIndex - 1][previousSumForRed];
            }

            // Option 2: Assign the current item to Green (G) or Blue (B).
            // These assignments do not contribute to the 'currentTargetSum' in the same way Red does.
            // For dpCombinationsRG, it's just the G case.
            dpCombinationsRG[currentItemIndex][currentTargetSum] += dpCombinationsRG[currentItemIndex - 1][currentTargetSum];
            // For dpCombinationsRGB, it's both G and B cases, hence multiplied by 2.
            dpCombinationsRGB[currentItemIndex][currentTargetSum] += 2 * dpCombinationsRGB[currentItemIndex - 1][currentTargetSum];
        }
    }

    const totalPossibleArrangements = Math.pow(3, numberOfItems);
    let sumForCaseA = 0; // Corresponds to 'sum' in original, related to dpCombinationsRGB
    let sumForCaseB = 0; // Corresponds to 'sum1' in original, related to dpCombinationsRG

    const halfTotalWeight = Math.floor(totalWeightSum / 2);

    for (let finalSumCandidate = halfTotalWeight; finalSumCandidate <= totalWeightSum; finalSumCandidate++) {
        sumForCaseA += dpCombinationsRGB[numberOfItems][finalSumCandidate];

        if (finalSumCandidate === halfTotalWeight) {
            sumForCaseB += dpCombinationsRG[numberOfItems][finalSumCandidate];
        }
    }

    let finalResult = totalPossibleArrangements - (3 * sumForCaseA) + (3 * sumForCaseB);
    finalResult = (finalResult % MODULO_VALUE + MODULO_VALUE) % MODULO_VALUE;

    console.log(finalResult);
}

processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));
