const obtainPrimes = (limitVal) => {
    const candidateNumbers = new Set();
    for (let c = 2; c <= limitVal; ++c) {
        candidateNumbers.add(c);
    }

    const upperCheck = Math.floor(Math.sqrt(limitVal));
    for (let p = 2; p <= upperCheck; ++p) {
        if (candidateNumbers.has(p)) {
            for (let multiple = p * p; multiple <= limitVal; multiple += p) {
                candidateNumbers.delete(multiple);
            }
        }
    }
    const primeMap = {};
    candidateNumbers.forEach(val => {
        primeMap[val] = true;
    });
    return primeMap;
};

const primeValidators = obtainPrimes(1000000);

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInput.trim().split('\n');

let linePointer = 0;

while (true) {
    const currentConfig = processedLines[linePointer++].split(' ').map(Number);
    const countItems = currentConfig[0];
    const targetSum = currentConfig[1];

    if (countItems === 0 && targetSum === 0) break;

    const availableItems = [];
    for (let currentItemIdx = 0; currentItemIdx < countItems; ++currentItemIdx) {
        availableItems.push(parseInt(processedLines[linePointer++], 10));
    }

    let possibleSums = new Set([0]);
    
    availableItems.forEach(itemValue => {
        const newSumsFromItem = new Set();
        possibleSums.forEach(currentTotal => {
            const nextTotal = currentTotal + itemValue;
            if (nextTotal <= targetSum) {
                newSumsFromItem.add(nextTotal);
            }
        });
        newSumsFromItem.forEach(sum => possibleSums.add(sum));
    });

    let bestResult = 0;
    const sortedPossibleSums = Array.from(possibleSums).sort((a, b) => b - a);

    for (const currentSum of sortedPossibleSums) {
        if (currentSum > 0 && primeValidators.hasOwnProperty(currentSum)) {
            bestResult = currentSum;
            break;
        }
    }
    
    console.log((bestResult === 0) ? "NA" : bestResult);
}