const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericValues = rawInputData.trim().split("\n").map(Number);

const coinDenominations = [500, 100, 50, 10, 5, 1];

const determineMinimumCoins = (targetAmount) => {
    return coinDenominations.reduce((accumulator, currentDenom) => {
        if (targetAmount === 0) {
            return accumulator;
        }
        const countForDenom = Math.floor(targetAmount / currentDenom);
        targetAmount -= countForDenom * currentDenom;
        return accumulator + countForDenom;
    }, 0);
};

const processValueSequence = (remainingSequence) => {
    if (remainingSequence.length === 0) {
        return;
    }
    const currentInputVal = remainingSequence[0];
    if (currentInputVal === 0) {
        return;
    }
    const changeRequired = 1000 - currentInputVal;
    const totalCoins = determineMinimumCoins(changeRequired);
    console.log(totalCoins);
    processValueSequence(remainingSequence.slice(1));
};

processValueSequence(numericValues);
