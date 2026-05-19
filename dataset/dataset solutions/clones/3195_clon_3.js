const STD_IN_STREAM = process.stdin;
const STD_OUT_STREAM = process.stdout;

let inputLinesBuffer = [];
let targetSumValue, numAvailableElements;
let elementMatchData;
let maxNumberStringsMemo;

const ioInterfaceModule = require('readline');

const inputReaderInstance = ioInterfaceModule.createInterface({
    input: STD_IN_STREAM,
    output: STD_OUT_STREAM,
});

inputReaderInstance.on('line', (currentLineContent) => {
    inputLinesBuffer.push(currentLineContent);
});

function determineBetterNumberString(currentBestCandidate, potentialNewCandidate) {
    if (currentBestCandidate.length < potentialNewCandidate.length) {
        return true;
    }
    if (currentBestCandidate.length === potentialNewCandidate.length && currentBestCandidate < potentialNewCandidate) {
        return true;
    }
    return false;
}

inputReaderInstance.on('close', () => {
    const digitMatchCosts = [0, 2, 5, 5, 4, 5, 6, 3, 7, 6];

    const firstInputLineParts = inputLinesBuffer[0].split(" ");
    targetSumValue = Number(firstInputLineParts[0]);
    numAvailableElements = Number(firstInputLineParts[1]);

    elementMatchData = Array(numAvailableElements + 1);

    elementMatchData[0] = { digitValue: 0, matchCost: 0 };

    const availableDigitsInput = inputLinesBuffer[1].split(" ");
    for (let i = 1; i <= numAvailableElements; i++) {
        const currentDigitValue = Number(availableDigitsInput[i - 1]);
        const correspondingMatchCost = digitMatchCosts[currentDigitValue];
        elementMatchData[i] = {
            digitValue: currentDigitValue,
            matchCost: correspondingMatchCost,
        };
    }

    maxNumberStringsMemo = Array(targetSumValue + 1);
    maxNumberStringsMemo.fill("");

    for (let currentWeight = 1; currentWeight <= targetSumValue; currentWeight++) {
        for (let elementIdx = 1; elementIdx <= numAvailableElements; elementIdx++) {
            const currentElement = elementMatchData[elementIdx];
            const elementMatchCost = currentElement.matchCost;
            const elementDigitValue = currentElement.digitValue;

            const remainingWeight = currentWeight - elementMatchCost;

            if (remainingWeight < 0) {
                continue;
            }

            const previousResultString = maxNumberStringsMemo[remainingWeight];

            const potentialNewNumberString = previousResultString + elementDigitValue;

            const existingBestForCurrentWeight = maxNumberStringsMemo[currentWeight];

            if (determineBetterNumberString(existingBestForCurrentWeight, potentialNewNumberString)) {
                maxNumberStringsMemo[currentWeight] = potentialNewNumberString;
            }
        }
    }

    console.log(maxNumberStringsMemo[targetSumValue]);
});
