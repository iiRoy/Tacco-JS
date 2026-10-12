"use strict";

const getFirstAndLastDigits = (inputNumber) => {
    const numberAsString = String(inputNumber);
    const firstCharacter = numberAsString[0];
    const lastCharacterIndex = numberAsString.length - 1;
    const lastCharacter = numberAsString[lastCharacterIndex];

    const first = parseInt(firstCharacter, 10);
    const last = parseInt(lastCharacter, 10);

    return { first, last };
};

const processInput = (rawData) => {
    const trimmedInput = rawData.trim();
    const inputLines = trimmedInput.split("\n");
    const limitVal = parseInt(inputLines[0], 10);

    const frequencyMatrix = Array.from({ length: 10 }, () => {
        return new Array(10).fill(0);
    });

    for (let currentNum = 1; currentNum <= limitVal; currentNum++) {
        const digitPair = getFirstAndLastDigits(currentNum);
        const firstDigit = digitPair.first;
        const lastDigit = digitPair.last;
        
        frequencyMatrix[firstDigit][lastDigit]++;
    }

    let finalResult = 0;

    for (let rowIdx = 0; rowIdx < 10; rowIdx++) {
        for (let colIdx = 0; colIdx < 10; colIdx++) {
            const countForIJ = frequencyMatrix[rowIdx][colIdx];
            const countForJI = frequencyMatrix[colIdx][rowIdx];
            finalResult += countForIJ * countForJI;
        }
    }

    console.log(finalResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
