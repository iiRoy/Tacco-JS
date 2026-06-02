const adjustValue = (val) => val < 10 ? val : val - 9;

const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');

const [
    unusedLineCount,
    identifierSequence,
    unusedAlpha,
    numericSequence
] = rawInput.trim().split("\n");

const identifierCharacters = identifierSequence.split("");
const numericElements = numericSequence.split(" ").map(Number);

const { baseSum, factorList } = identifierCharacters.reduce(
    (accumulator, character, index) => {
        if (character === "*") {
            accumulator.factorList.push(index % 2 === 0 ? 1 : 2);
        } else {
            const digitValue = Number(character);
            if (index % 2 === 0) {
                accumulator.baseSum += digitValue;
            } else {
                accumulator.baseSum += adjustValue(digitValue * 2);
            }
        }
        return accumulator;
    },
    { baseSum: 0, factorList: [] }
);

let currentSumPossibilities = new Map();
currentSumPossibilities.set(baseSum, 1);

for (const currentFactor of factorList) {
    const nextSumPossibilities = new Map();
    for (const [previousSum, countOfWays] of currentSumPossibilities.entries()) {
        for (const element of numericElements) {
            const valueToAdd = adjustValue(element * currentFactor);
            const newTotalSum = previousSum + valueToAdd;
            nextSumPossibilities.set(newTotalSum, (nextSumPossibilities.get(newTotalSum) || 0) + countOfWays);
        }
    }
    currentSumPossibilities = nextSumPossibilities;
}

let finalCount = 0;
for (const [totalSumKey, waysCount] of currentSumPossibilities.entries()) {
    if (totalSumKey % 10 === 0) {
        finalCount += waysCount;
    }
}

console.log(finalCount);
