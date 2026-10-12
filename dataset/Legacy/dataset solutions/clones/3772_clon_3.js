"use strict";
const MAX_TARGET_VALUE = 100000;
const INITIAL_MIN_VALUE = Infinity;
const BASE_FACTOR_ONE = 6;
const BASE_FACTOR_TWO = 9;
function updateMinOperationsWithBase(targetNumber, operationsArray, factor) {
    let currentPower = 1;
    while (currentPower <= targetNumber) {
        const previousResult = operationsArray[targetNumber - currentPower];
        const candidateResult = previousResult + 1;
        operationsArray[targetNumber] = Math.min(operationsArray[targetNumber], candidateResult);
        currentPower = currentPower * factor;
    }
}
let fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
let minimumSteps = [];
minimumSteps[0] = 0;
for (let currentNumber = 1; currentNumber <= MAX_TARGET_VALUE; ++currentNumber) {
    minimumSteps[currentNumber] = INITIAL_MIN_VALUE;
    updateMinOperationsWithBase(currentNumber, minimumSteps, BASE_FACTOR_ONE);
    updateMinOperationsWithBase(currentNumber, minimumSteps, BASE_FACTOR_TWO);
}
const targetInputNumber = parseInt(fileContent, 10);
console.log(minimumSteps[targetInputNumber]);
