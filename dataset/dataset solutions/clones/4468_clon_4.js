"use strict";

const computeGreatestCommonDivisor = (dividend, divisor) => {
    while (divisor !== 0) {
        let remainder = dividend % divisor;
        dividend = divisor;
        divisor = remainder;
    }
    return dividend;
};

const calculateOverallCommonDivisor = (numberCollection) => {
    if (numberCollection.length === 0) {
        return undefined; // Matches original behavior for empty array
    }
    return numberCollection.reduce((accumulator, currentNumber) =>
        computeGreatestCommonDivisor(accumulator, currentNumber)
    );
};

const processInputAndDetermineOutcome = (sourceText) => {
    const processedLines = sourceText.trim().split('\n');

    const [firstLineData, numberSequenceData] = processedLines;
    const [_, targetCriterionString] = firstLineData.split(' ');
    const targetCriterion = parseInt(targetCriterionString, 10);

    const numericValues = numberSequenceData
        .split(' ')
        .map(s => parseInt(s, 10))
        .sort((valA, valB) => valB - valA);

    const maximumValue = Math.max(...numericValues);
    
    const collectiveDivisor = calculateOverallCommonDivisor(numericValues);

    const finalVerdict = (maximumValue < targetCriterion)
        ? "IMPOSSIBLE"
        : (targetCriterion % collectiveDivisor === 0 ? "POSSIBLE" : "IMPOSSIBLE");

    console.log(finalVerdict);
};

processInputAndDetermineOutcome(require('fs').readFileSync('/dev/stdin', 'utf8'));