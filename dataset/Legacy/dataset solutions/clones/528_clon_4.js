const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = fileContent.split('\n').filter(Boolean);

const initialParams = lineSegments.shift().split(' ').map(Number);
const adjustedN = initialParams[0] - 1;
const countM = initialParams[1];
const targetP = initialParams[2];

const rawNumbers = lineSegments.slice(0, countM).map(Number);

const filteredNumbers = rawNumbers.filter(val => val !== targetP);
const numbersIncludingTarget = [...filteredNumbers, targetP];
const sortedNumbers = numbersIncludingTarget.sort((a, b) => a - b);

const allPossibleCosts = sortedNumbers.flatMap((elementVal, idx, fullArr) => {
    const currentElementCosts = [];

    if (elementVal <= targetP && idx > 0) {
        const leftAdjacent = fullArr[idx - 1];
        const costOptionA = (targetP - elementVal) * 2 + (adjustedN - targetP + 1) + leftAdjacent;
        currentElementCosts.push(costOptionA);
    }

    if (targetP <= elementVal && idx < fullArr.length - 1) {
        const rightAdjacent = fullArr[idx + 1];
        const costOptionB = (elementVal - targetP) * 2 + targetP + (adjustedN - rightAdjacent + 1);
        currentElementCosts.push(costOptionB);
    }
    return currentElementCosts;
});

const calculatedMinimum = allPossibleCosts.length > 0 ? Math.min(...allPossibleCosts) : Number.POSITIVE_INFINITY;

console.log(calculatedMinimum * 100);
