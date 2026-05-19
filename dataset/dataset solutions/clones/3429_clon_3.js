"use strict";

const containsAllRequiredDigits = (numberAsString, requiredDigitsArray) => {
    for (const requiredDigitChar of requiredDigitsArray) {
        if (numberAsString.indexOf(requiredDigitChar) === -1) {
            return false;
        }
    }
    return true;
};

const processInput = inputData => {
    const inputLines = inputData.trim().split("\n");
    const targetNumber = parseInt(inputLines[0], 10);
    const targetNumberLength = String(targetNumber).length;

    const allowedDigitsAsStrings = ["3", "5", "7"];
    const generatedNumbersList = [3, 5, 7];

    let finalCount = 0;
    let previousGenerationStartIndex = 0;

    for (let iterationCount = 0; iterationCount < targetNumberLength - 1; ++iterationCount) {
        const currentListSizeBeforeExpansion = generatedNumbersList.length;
        
        for (const digitToPrepend of allowedDigitsAsStrings) {
            for (let baseNumberIndex = previousGenerationStartIndex; baseNumberIndex < currentListSizeBeforeExpansion; ++baseNumberIndex) {
                const currentBaseNumber = generatedNumbersList[baseNumberIndex];
                const newlyFormedNumber = parseInt(digitToPrepend + String(currentBaseNumber), 10);
                generatedNumbersList.push(newlyFormedNumber);
            }
        }
        previousGenerationStartIndex = currentListSizeBeforeExpansion;
    }

    for (const candidateNumber of generatedNumbersList) {
        if (candidateNumber > targetNumber) {
            break;
        }

        const candidateNumberAsString = String(candidateNumber);
        if (containsAllRequiredDigits(candidateNumberAsString, allowedDigitsAsStrings)) {
            finalCount++;
        }
    }

    console.log(finalCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
