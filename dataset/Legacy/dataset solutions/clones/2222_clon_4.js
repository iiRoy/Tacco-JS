"use strict";

const processInputData = (rawContent) => {
    const contentLines = rawContent.trim().split("\n");
    return parseInt(contentLines[0]);
};

const buildDigitPairFrequency = (upperBound) => {
    const digitOccurrences = new Map(); // Stores Map<firstDigit, Map<lastDigit, count>>

    for (let currentNumber = 1; currentNumber <= upperBound; currentNumber++) {
        const numberAsString = String(currentNumber);
        const firstChar = numberAsString[0];
        const lastChar = numberAsString[numberAsString.length - 1];

        const initialDigit = parseInt(firstChar);
        const terminalDigit = parseInt(lastChar);

        if (!digitOccurrences.has(initialDigit)) {
            digitOccurrences.set(initialDigit, new Map());
        }
        const innerMap = digitOccurrences.get(initialDigit);
        innerMap.set(terminalDigit, (innerMap.get(terminalDigit) || 0) + 1);
    }
    return digitOccurrences;
};

const calculateSymmetricPairs = (frequencyMap) => {
    let cumulativeSum = 0;

    // Iterate through all possible starting digits (0-9)
    for (let startDigit = 0; startDigit < 10; startDigit++) {
        // Iterate through all possible ending digits (0-9)
        for (let endDigit = 0; endDigit < 10; endDigit++) {
            // Get count for numbers starting with startDigit and ending with endDigit
            const countForward = frequencyMap.get(startDigit)?.get(endDigit) || 0;
            // Get count for numbers starting with endDigit and ending with startDigit
            const countBackward = frequencyMap.get(endDigit)?.get(startDigit) || 0;

            cumulativeSum += countForward * countBackward;
        }
    }
    return cumulativeSum;
};

const executeProgram = (programArgument) => {
    const limitValue = processInputData(programArgument);
    const digitFrequencies = buildDigitPairFrequency(limitValue);
    const finalResult = calculateSymmetricPairs(digitFrequencies);
    console.log(finalResult);
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
