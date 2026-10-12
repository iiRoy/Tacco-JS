'use strict'

const parseAndSortNumericString = (inputLine) => {
    const stringTokens = inputLine.split(' ');
    const numericValues = stringTokens.map(strVal => parseInt(strVal, 10));
    numericValues.sort((firstNum, secondNum) => firstNum - secondNum);
    return numericValues;
};

const processInputData = (rawContent) => {
    const contentLines = rawContent.split('\n');
    const relevantLineIndex = 1; // The problem specifies the second line (index 1)
    const dataLine = contentLines[relevantLineIndex];

    const orderedValues = parseAndSortNumericString(dataLine);

    const minimumValue = orderedValues[0];
    const maximumValue = orderedValues[orderedValues.length - 1];

    const calculatedRange = maximumValue - minimumValue;

    console.log(calculatedRange);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf-8'));
