'use strict';

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const headerParts = rawData[0].split(' ').map(Number);
const itemCount = headerParts[0];
const targetRatioA = headerParts[1];
const targetRatioB = headerParts[2];
const ingredientData = rawData.slice(1).map(l => l.split(' ').map(Number));

const maxIngredientA = 10;
const maxIngredientB = 10;
const maxIngredientCost = 100;

const maxPossibleSumA = maxIngredientA * itemCount;
const maxPossibleSumB = maxIngredientB * itemCount;

const minExpenditure = Array(maxPossibleSumA + 1).fill(null).map(() =>
    Array(maxPossibleSumB + 1).fill(maxIngredientCost * itemCount + 1)
);

minExpenditure[0][0] = 0;

for (let i = 0; i < itemCount; i++) {
    const currentAVal = ingredientData[i][0];
    const currentBVal = ingredientData[i][1];
    const currentCVal = ingredientData[i][2];

    for (let currentSumA = maxPossibleSumA; currentSumA >= currentAVal; currentSumA--) {
        for (let currentSumB = maxPossibleSumB; currentSumB >= currentBVal; currentSumB--) {
            minExpenditure[currentSumA][currentSumB] = Math.min(
                minExpenditure[currentSumA][currentSumB],
                minExpenditure[currentSumA - currentAVal][currentSumB - currentBVal] + currentCVal
            );
        }
    }
}

let finalOutcome = maxIngredientCost * itemCount + 1;

for (let k = 1; ; k++) {
    const checkSumA = k * targetRatioA;
    const checkSumB = k * targetRatioB;

    if (checkSumA > maxPossibleSumA || checkSumB > maxPossibleSumB) {
        break;
    }

    if (minExpenditure[checkSumA][checkSumB] < maxIngredientCost * itemCount + 1) {
        finalOutcome = Math.min(finalOutcome, minExpenditure[checkSumA][checkSumB]);
    }
}

console.log(finalOutcome === maxIngredientCost * itemCount + 1 ? -1 : finalOutcome);
