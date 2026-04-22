const rdl = require('readline');

const maxDigitCount = 10;
const maximumValue = 45;
const minimumAllowedDigit = 10;

let calculationStorage;

function establishStorage() {
    calculationStorage = Array(maxDigitCount + 1).fill(null).map(() =>
        Array(maximumValue + 1).fill(null).map(() =>
            Array(minimumAllowedDigit + 1).fill(-1)
        )
    );
}

function determineCombinations(digitsToSelect, currentSumGoal, lowestDigit) {
    if (digitsToSelect === 0) {
        return currentSumGoal === 0 ? 1 : 0;
    }
    if (currentSumGoal < 0) {
        return 0;
    }
    if (lowestDigit > 9) {
        return 0;
    }

    const minPossibleSum = (digitsToSelect * lowestDigit) + (digitsToSelect * (digitsToSelect - 1) / 2);
    const maxPossibleSum = (digitsToSelect * 9) - (digitsToSelect * (digitsToSelect - 1) / 2);

    if (currentSumGoal < minPossibleSum || currentSumGoal > maxPossibleSum) {
        return 0;
    }

    if (calculationStorage[digitsToSelect][currentSumGoal][lowestDigit] !== -1) {
        return calculationStorage[digitsToSelect][currentSumGoal][lowestDigit];
    }

    let totalPossibleWays = 0;
    for (let chosenDigit = lowestDigit; chosenDigit <= 9; chosenDigit++) {
        if (currentSumGoal >= chosenDigit) {
            totalPossibleWays += determineCombinations(digitsToSelect - 1, currentSumGoal - chosenDigit, chosenDigit + 1);
        }
    }

    calculationStorage[digitsToSelect][currentSumGoal][lowestDigit] = totalPossibleWays;
    return totalPossibleWays;
}

function computeResult(quantity, value) {
    establishStorage();
    return determineCombinations(quantity, value, 0);
}

const inputProcessor = rdl.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let collectedData = [];

inputProcessor.on('line', (lineContent) => {
    collectedData.push(lineContent);
});

inputProcessor.on('close', () => {
    handleCollectedData(collectedData);
});

function handleCollectedData(allInputLines) {
    for (const dataRow of allInputLines) {
        const valuePairs = dataRow.trim().split(' ').map(Number);
        const countValue = valuePairs[0];
        const sumValue = valuePairs[1];

        if (countValue === 0 && sumValue === 0) {
            return;
        }

        console.log(computeResult(countValue, sumValue));
    }
}