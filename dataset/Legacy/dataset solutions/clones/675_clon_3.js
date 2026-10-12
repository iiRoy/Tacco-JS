const fileSystem = require('fs');
const STANDARD_INPUT_PATH = '/dev/stdin';
const TERMINATION_SEQUENCE = "0 0 0 0 0 0";

const parseNumericLine = (lineContent) => {
    return lineContent.split(" ").map(Number);
};

const calculateQuotientByThree = (value) => {
    return Math.floor(value / 3);
};

const rawInputData = fileSystem.readFileSync(STANDARD_INPUT_PATH, 'utf8');
let inputLinesBuffer = rawInputData.trim().split("\n");

while (true) {
    let currentInputLine = inputLinesBuffer.shift();

    if (currentInputLine === TERMINATION_SEQUENCE) {
        break;
    }

    const numericValues = parseNumericLine(currentInputLine);

    let firstSumComponent = numericValues[0] + numericValues[3];
    let secondSumComponent = numericValues[1] + numericValues[4];
    let thirdSumComponent = numericValues[2] + numericValues[5];

    let totalCalculatedCount = 0;

    totalCalculatedCount += calculateQuotientByThree(firstSumComponent);
    totalCalculatedCount += calculateQuotientByThree(secondSumComponent);
    totalCalculatedCount += calculateQuotientByThree(thirdSumComponent);

    firstSumComponent = firstSumComponent % 3;
    secondSumComponent = secondSumComponent % 3;
    thirdSumComponent = thirdSumComponent % 3;

    while (firstSumComponent >= 1 && secondSumComponent >= 1 && thirdSumComponent >= 1) {
        firstSumComponent--;
        secondSumComponent--;
        thirdSumComponent--;
        totalCalculatedCount++;
    }

    console.log(totalCalculatedCount);
}
