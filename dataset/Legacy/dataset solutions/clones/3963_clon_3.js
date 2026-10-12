"use strict";

const DECIMAL_RADIX = 10;
const INPUT_DELIMITER = " ";

const parseNumericValue = (strValue) => {
    return parseInt(strValue, DECIMAL_RADIX);
};

const getConditionalResult = (conditionMet) => {
    return conditionMet ? "Yes" : "No";
};

const processInput = (rawData) => {
    const inputSegments = rawData.split(INPUT_DELIMITER);

    const valA = parseNumericValue(inputSegments[0]);
    const valB = parseNumericValue(inputSegments[1]);
    const valC = parseNumericValue(inputSegments[2]);

    const sumOfFirstTwo = valA + valB;

    const conditionIsMet = sumOfFirstTwo >= valC;

    const resultString = getConditionalResult(conditionIsMet);

    console.log(resultString);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
