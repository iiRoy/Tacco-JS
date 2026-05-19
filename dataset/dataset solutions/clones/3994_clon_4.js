"use strict";

const parseInputValues = (rawInput) => {
    const [lineContent] = rawInput.trim().split("\n");
    const [firstVal, secondVal] = lineContent.split(" ").map(Number);
    return { firstVal, secondVal };
};

function* generateContributions(limitValue, minimumRemainder) {
    if (minimumRemainder === 0) {
        yield limitValue * limitValue;
        return;
    }

    for (let currentDivisor = 1; currentDivisor <= limitValue; currentDivisor++) {
        const quotientResult = Math.floor(limitValue / currentDivisor);
        const remainderResult = limitValue % currentDivisor;

        const termForFullBlocks = quotientResult * Math.max(0, currentDivisor - minimumRemainder);
        let termForPartialBlock = 0;
        if (remainderResult > 0) {
            termForPartialBlock = Math.max(0, remainderResult - minimumRemainder + 1);
        }
        yield termForFullBlocks + termForPartialBlock;
    }
}

const processCalculation = (inputString) => {
    const { firstVal, secondVal } = parseInputValues(inputString);

    let accumulatedSum = 0;
    for (const individualContribution of generateContributions(firstVal, secondVal)) {
        accumulatedSum += individualContribution;
    }
    console.log(accumulatedSum);
};

processCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));
