'use strict';

const MODULUS_VAL = 998244353;

let itemValues;
let elementCount;
let ceilingSum;
let collectiveSum;

const cacheDual = new Map();
const cacheSingle = new Map();

function computeSumCombinations(itemIndex, targetSum, isMultipliedChoice) {
    if (targetSum < 0) {
        return 0;
    }
    if (itemIndex === 0) {
        return targetSum === 0 ? 1 : 0;
    }

    const currentMemoCache = isMultipliedChoice ? cacheDual : cacheSingle;
    const memoIdentifier = `${itemIndex}_${targetSum}`;

    if (currentMemoCache.has(memoIdentifier)) {
        return currentMemoCache.get(memoIdentifier);
    }

    let waysToFormSum = 0;
    
    // Scenario 1: Exclude the current item (itemValues[itemIndex - 1])
    waysToFormSum = (waysToFormSum + computeSumCombinations(itemIndex - 1, targetSum, isMultipliedChoice)) % MODULUS_VAL;

    // Scenario 2: Include the current item (itemValues[itemIndex - 1])
    const currentItemWeight = itemValues[itemIndex - 1];
    if (targetSum >= currentItemWeight) {
        const choiceMultiplier = isMultipliedChoice ? 2 : 1;
        const waysIfIncluded = computeSumCombinations(itemIndex - 1, targetSum - currentItemWeight, isMultipliedChoice);
        waysToFormSum = (waysToFormSum + (choiceMultiplier * waysIfIncluded) % MODULUS_VAL) % MODULUS_VAL;
    }
    
    currentMemoCache.set(memoIdentifier, waysToFormSum);
    return waysToFormSum;
}

function executeCalculation(inputDataString) {
    const processedNumbers = inputDataString.trim().split(/\s+/).map(Number);
    elementCount = processedNumbers.shift();
    itemValues = processedNumbers;

    collectiveSum = itemValues.reduce((accumulator, value) => accumulator + value, 0);
    ceilingSum = Math.floor(collectiveSum / 2);

    let finalOutcome = 1;

    for (let currentItem = 0; currentItem < elementCount; currentItem++) {
        finalOutcome = (finalOutcome * 3) % MODULUS_VAL;
    }

    let totalDualCounts = 0;
    for (let sumValue = 0; sumValue <= ceilingSum; sumValue++) {
        totalDualCounts = (totalDualCounts + computeSumCombinations(elementCount, sumValue, true)) % MODULUS_VAL;
    }
    
    finalOutcome = (finalOutcome - (3 * totalDualCounts) % MODULUS_VAL + MODULUS_VAL) % MODULUS_VAL;

    let singleChoiceHalfSumCount = 0;
    if (collectiveSum % 2 === 0) {
        singleChoiceHalfSumCount = computeSumCombinations(elementCount, ceilingSum, false);
    }
    
    finalOutcome = (finalOutcome + (3 * singleChoiceHalfSumCount) % MODULUS_VAL) % MODULUS_VAL;

    finalOutcome = (finalOutcome + MODULUS_VAL) % MODULUS_VAL;

    console.log(finalOutcome);
}

executeCalculation(require('fs').readFileSync('/dev/stdin','utf8'));