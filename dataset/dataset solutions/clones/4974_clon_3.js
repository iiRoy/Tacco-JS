'use strict'

const generateNumberStrings = (digitCharacters, combinationMask) => {
    const segmentStrings = [digitCharacters[0]];
    const separatorPositions = digitCharacters.length - 1;

    for (let currentPos = 0; currentPos < separatorPositions; currentPos++) {
        const nextCharacter = digitCharacters[currentPos + 1];
        const isSeparatorPresent = (combinationMask >> currentPos) & 1;

        if (isSeparatorPresent) {
            segmentStrings.push(nextCharacter);
        } else {
            const lastSegmentIndex = segmentStrings.length - 1;
            segmentStrings[lastSegmentIndex] += nextCharacter;
        }
    }
    return segmentStrings;
};

const processInput = (rawData) => {
    const cleanedInput = rawData.trim();
    const digitChars = cleanedInput.split("");
    const potentialSeparatorCount = digitChars.length - 1;
    let overallTotalSum = 0;

    const totalCombinations = 1 << potentialSeparatorCount;

    for (let combinationIndex = 0; combinationIndex < totalCombinations; combinationIndex++) {
        const currentNumberSegments = generateNumberStrings(digitChars, combinationIndex);

        const sumOfCurrentCombination = currentNumberSegments.reduce((accumulator, segmentString) => {
            const numericValue = parseInt(segmentString, 10);
            return accumulator + numericValue;
        }, 0);

        overallTotalSum += sumOfCurrentCombination;
    }

    console.log(overallTotalSum);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
