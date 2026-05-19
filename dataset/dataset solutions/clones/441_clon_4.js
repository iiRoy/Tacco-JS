function getPrimesUpTo(upperBound) {
    const primeCandidates = new Set();
    for (let k = 2; k <= upperBound; k++) {
        primeCandidates.add(k);
    }

    for (let pVal = 2; pVal * pVal <= upperBound; pVal++) {
        if (primeCandidates.has(pVal)) {
            for (let multiple = pVal * pVal; multiple <= upperBound; multiple += pVal) {
                primeCandidates.delete(multiple);
            }
        }
    }
    return primeCandidates;
}

const primeNumbers = getPrimesUpTo(1000000);

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split("\n");

while (true) {
    const currentLine = inputLines.shift().split(" ").map(Number);
    const countElements = currentLine[0];
    const targetSum = currentLine[1];

    if (countElements === 0 && targetSum === 0) break;

    const possibleSums = new Set([0]);
    const inputValues = [];
    for (let k = 0; k < countElements; k++) {
        const val = Number(inputLines.shift());
        inputValues.push(val);
    }

    for (const currentNum of inputValues) {
        const sumsToAdd = new Set();
        for (const existingSum of possibleSums) {
            const newPotentialSum = existingSum + currentNum;
            if (newPotentialSum <= targetSum) {
                sumsToAdd.add(newPotentialSum);
            }
        }
        for (const sumToAdd of sumsToAdd) {
            possibleSums.add(sumToAdd);
        }
    }

    let resultSum = 0;
    for (let candidateSum = targetSum; candidateSum > 0; candidateSum--) {
        if (possibleSums.has(candidateSum) && primeNumbers.has(candidateSum)) {
            resultSum = candidateSum;
            break;
        }
    }

    console.log((resultSum === 0) ? "NA" : resultSum);
}
