'use strict';

function determineCharacter(valueToCheck, limitValue) {
    const charForGreater = 'c';
    const charForLessOrEqual = 'd';
    return (valueToCheck > limitValue) ? charForGreater : charForLessOrEqual;
}

function processInput(initialData) {
    const hardcodedStringValue = '999';
    let processedNumericValue = Number(hardcodedStringValue);

    const comparisonBoundary = 1000;

    let finalCharacterResult = determineCharacter(processedNumericValue, comparisonBoundary);

    const outputPrefixString = 'ab';
    console.log(outputPrefixString + finalCharacterResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
