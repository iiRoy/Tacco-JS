const transformDigit = (val) => String(val).split('').reduce((acc, char) => acc + Number(char), 0);

const rawInput = require('fs').readFileSync(0, 'utf8');
const lines = rawInput.trim().split('\n');

const unusedN = Number(lines.shift());
const idChars = Array.from(lines.shift());
const unusedA = Number(lines.shift());
const valueSet = lines.shift().split(' ').map(val => +val);

const { multipliers: wildcardMultipliers, initialSum: baseSum } = idChars.reduce((accumulator, char, index) => {
    const isEvenPosition = index % 2 === 0;
    if (char === '*') {
        accumulator.multipliers.push(isEvenPosition ? 1 : 2);
    } else {
        const digitValue = Number(char);
        accumulator.initialSum += isEvenPosition ? digitValue : transformDigit(digitValue * 2);
    }
    return accumulator;
}, { multipliers: [], initialSum: 0 });

let currentStates = new Map();
currentStates.set(baseSum, 1);

for (const multiplier of wildcardMultipliers) {
    const nextStates = new Map();
    for (const [currentSum, count] of currentStates.entries()) {
        for (const itemValue of valueSet) {
            const increment = transformDigit(itemValue * multiplier);
            const newSum = currentSum + increment;
            nextStates.set(newSum, (nextStates.get(newSum) || 0) + count);
        }
    }
    currentStates = nextStates;
}

let finalAnswer = 0;
for (const [finalSum, count] of currentStates.entries()) {
    if (finalSum <= 1000000 && finalSum % 10 === 0) {
        finalAnswer += count;
    }
}

console.log(finalAnswer);
