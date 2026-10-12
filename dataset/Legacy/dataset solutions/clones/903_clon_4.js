function computeLargeSum(firstOperand, secondOperand) {
    const val1 = BigInt(firstOperand);
    const val2 = BigInt(secondOperand);
    return (val1 + val2).toString();
}

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split("\n");

inputLines.shift();

const sortedNumbersA = inputLines.shift().split(" ").map(Number);
sortedNumbersA.sort((val1, val2) => val1 - val2);

inputLines.shift();

const queryValuesB = inputLines.shift().split(" ").map(Number);
const expectedResultsC = inputLines.shift().split(" ");

const maxPossibleValue = 1000000;
const cumulativeSumCache = new Map();

let currentCumulativeSum = BigInt(0);
let lastKnownSumForRange = BigInt(0);
let aIndex = 0;

for (let i = 0; i <= maxPossibleValue; i++) {
    if (aIndex < sortedNumbersA.length && sortedNumbersA[aIndex] === i) {
        currentCumulativeSum += BigInt(sortedNumbersA[aIndex]);
        lastKnownSumForRange = currentCumulativeSum;
        aIndex++;
    }
    cumulativeSumCache.set(i, lastKnownSumForRange.toString());
}

queryValuesB.forEach((queryVal, index) => {
    const actualSumString = cumulativeSumCache.get(queryVal);
    const expectedSumString = expectedResultsC[index];

    const actualBigInt = BigInt(actualSumString);
    const expectedBigInt = BigInt(expectedSumString);

    let outcome = "No";
    if (expectedBigInt <= actualBigInt) {
        outcome = "Yes";
    }
    console.log(outcome);
});
