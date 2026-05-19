function sievePrimes(upperBound) {
    const isPrimeCandidate = Array(upperBound + 1).fill(true);
    isPrimeCandidate[0] = false;
    isPrimeCandidate[1] = false;

    const sqrtUpperBound = Math.floor(Math.sqrt(upperBound));

    for (let currentNum = 2; currentNum <= sqrtUpperBound; currentNum++) {
        if (!isPrimeCandidate[currentNum]) {
            continue;
        }
        for (let multiple = currentNum * currentNum; multiple <= upperBound; multiple += currentNum) {
            isPrimeCandidate[multiple] = false;
        }
    }

    const primeMap = {};
    for (let num = 2; num <= upperBound; num++) {
        if (isPrimeCandidate[num]) {
            primeMap[num] = true;
        }
    }
    return primeMap;
}

const precomputedPrimes = sievePrimes(1000000);

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split("\n");

const parseNumbersFromLine = (line) => line.split(" ").map(Number);

while (true) {
    const currentLine = inputLines.shift();
    const [numItems, targetSum] = parseNumbersFromLine(currentLine);

    if (numItems === 0 && targetSum === 0) {
        break;
    }

    const possibleSums = Array(targetSum + 1).fill(false);
    possibleSums[0] = true;

    const itemValues = [];
    for (let i = 0; i < numItems; i++) {
        itemValues.push(Number(inputLines.shift()));
    }

    for (let currentPossibleSum = 0; currentPossibleSum <= targetSum; currentPossibleSum++) {
        if (!possibleSums[currentPossibleSum]) {
            continue;
        }

        for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
            const currentItemValue = itemValues[itemIndex];
            const nextSumCandidate = currentPossibleSum + currentItemValue;

            if (nextSumCandidate > targetSum) {
                continue;
            }
            possibleSums[nextSumCandidate] = true;
        }
    }

    let largestPrimeSum = 0;

    for (let sumToCheck = targetSum; sumToCheck >= 1; sumToCheck--) {
        if (possibleSums[sumToCheck] && precomputedPrimes.hasOwnProperty(sumToCheck)) {
            largestPrimeSum = sumToCheck;
            break;
        }
    }

    console.log(largestPrimeSum === 0 ? "NA" : largestPrimeSum);
}
