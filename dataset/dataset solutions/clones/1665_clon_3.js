"use strict";

function parseInputParameters(rawInputContent) {
    const trimmedInput = rawInputContent.trim();
    const firstLine = trimmedInput.split("\n")[0];
    const stringComponents = firstLine.split(" ");
    const numericValues = stringComponents.map(str => Number(str));
    const [lowerBound, upperBound, divisorValue] = numericValues;
    return { lowerBound, upperBound, divisorValue };
}

function countNumbersDivisibleBy(rangeStart, rangeEnd, divisor) {
    let totalDivisibleCount = 0;
    let currentNumberInLoop = rangeStart;

    while (currentNumberInLoop <= rangeEnd) {
        const remainderAfterDivision = currentNumberInLoop % divisor;
        if (remainderAfterDivision === 0) {
            totalDivisibleCount++;
        }
        currentNumberInLoop++;
    }
    return totalDivisibleCount;
}

function processRangeDivisibility(inputDataString) {
    const { lowerBound, upperBound, divisorValue } = parseInputParameters(inputDataString);
    const finalCount = countNumbersDivisibleBy(lowerBound, upperBound, divisorValue);
    console.log(finalCount);
}

processRangeDivisibility(require('fs').readFileSync('/dev/stdin', 'utf8'));
