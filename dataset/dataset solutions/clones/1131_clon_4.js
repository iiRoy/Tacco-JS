const rawData = require('node:fs').readFileSync(0, 'utf8');
const parsedLines = rawData.trim().split('\n');

const firstLineElements = parsedLines[0].split(' ');
const goalValue = Number(firstLineElements[0]);
const coinCount = Number(firstLineElements[1]);

const coinDenominations = parsedLines[1].trim().split(' ').map(Number);

const solutionTable = new Array(goalValue + 1).fill(Infinity);

solutionTable[0] = 0;

for (let currentSum = 1; currentSum <= goalValue; currentSum++) {
    for (let j = 0; j < coinCount; j++) {
        const currentCoin = coinDenominations[j];

        if (currentSum - currentCoin >= 0) {
            solutionTable[currentSum] = Math.min(
                solutionTable[currentSum],
                solutionTable[currentSum - currentCoin] + 1
            );
        }
    }
}

console.log(solutionTable[goalValue]);