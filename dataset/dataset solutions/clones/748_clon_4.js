const processDigitValue = (val) => val < 10 ? val : val - 9;

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split('\n');

const _unusedN = Number(inputLines.shift());
const cardPattern = inputLines.shift().split('');
const _unusedA = Number(inputLines.shift());
const candidateDigits = inputLines.shift().split(' ').map(Number);

const { multiplicationFactors, baseSum } = cardPattern.reduce((accumulator, char, index) => {
    if (char === '*') {
        accumulator.multiplicationFactors.push(index % 2 === 0 ? 1 : 2);
    } else {
        const digitValue = Number(char);
        accumulator.baseSum += (index % 2 === 0 ? digitValue : processDigitValue(digitValue * 2));
    }
    return accumulator;
}, { multiplicationFactors: [], baseSum: 0 });

const maxPossibleSum = 100;
let currentSumCounts = Array(maxPossibleSum).fill(0);
currentSumCounts[0] = 1;

multiplicationFactors.forEach((currentFactor) => {
    const nextSumCounts = Array(maxPossibleSum).fill(0);
    currentSumCounts.forEach((count, currentPartialSum) => {
        if (count === 0) return;

        candidateDigits.forEach((digit) => {
            const valueToAdd = processDigitValue(digit * currentFactor);
            const newPartialSum = currentPartialSum + valueToAdd;
            if (newPartialSum < maxPossibleSum) {
                nextSumCounts[newPartialSum] += count;
            }
        });
    });
    currentSumCounts = nextSumCounts;
});

const totalValidCombinations = currentSumCounts.reduce((accumulator, count, finalPartialSum) => {
    if ((baseSum + finalPartialSum) % 10 === 0) {
        return accumulator + count;
    }
    return accumulator;
}, 0);

console.log(totalValidCombinations);
