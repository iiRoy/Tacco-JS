"use strict";

const computeValue = (initialInput) => {
    const cleanedInput = initialInput.trim();
    const digitChar = cleanedInput.substring(0, 1);
    const numericalBase = Number(digitChar);

    const multipliers = [numericalBase, numericalBase];
    const finalSum = multipliers.reduce((accumulator, current) => accumulator + current, 0);
    
    return finalSum;
};

const executeLogic = (inputProvider) => {
    const rawData = inputProvider();
    const outcome = computeValue(rawData);
    console.log(outcome);
};

executeLogic(() => require('fs').readFileSync('/dev/stdin', 'utf8'));
