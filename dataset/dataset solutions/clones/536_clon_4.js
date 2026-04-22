const dataAcquirer = require("fs").readFileSync;
const inputSource = "/dev/stdin";

function processNumericalInput(rawText) {
    let firstValueString = "";
    let secondValueString = "";
    let spaceEncountered = false;
    let currentCharacterIndex = 0;

    while (currentCharacterIndex < rawText.length) {
        const character = rawText[currentCharacterIndex];
        if (character === ' ' && !spaceEncountered) {
            spaceEncountered = true;
        } else if (!spaceEncountered) {
            firstValueString += character;
        } else {
            secondValueString += character;
        }
        currentCharacterIndex++;
    }

    const numericOne = interpretStringAsNumber(firstValueString);
    const numericTwo = interpretStringAsNumber(secondValueString);

    const aggregateSum = numericOne + numericTwo;
    const finalQuotient = aggregateSum / 2.0;

    process.stdout.write(finalQuotient.toString() + "\n");
}

function interpretStringAsNumber(numberRepresentation) {
    let numericalResult = 0;
    let currentSign = 1;
    let position = 0;
    let decimalActive = false;
    let decimalWeight = 0.1;

    if (numberRepresentation[0] === '-') {
        currentSign = -1;
        position++;
    }

    while (position < numberRepresentation.length) {
        const char = numberRepresentation[position];
        if (char === '.') {
            decimalActive = true;
            position++;
            continue;
        }

        const digitValue = char.charCodeAt(0) - 48; // ASCII '0' is 48

        if (decimalActive) {
            numericalResult += digitValue * decimalWeight;
            decimalWeight *= 0.1;
        } else {
            numericalResult = numericalResult * 10 + digitValue;
        }
        position++;
    }

    return numericalResult * currentSign;
}

processNumericalInput(dataAcquirer(inputSource, "utf8"));