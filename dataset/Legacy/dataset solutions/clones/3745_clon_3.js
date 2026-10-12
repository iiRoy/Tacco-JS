'use strict'

const processInput = rawData => {
    const lineSeparator = '\n';
    const allInputLines = rawData.split(lineSeparator);

    const getNumericValue = (stringValue) => {
        return parseInt(stringValue, 10);
    };

    const relevantLine = allInputLines[0];
    const lineParts = relevantLine.split(' ');

    const valueA = getNumericValue(lineParts[0]);
    const valueB = getNumericValue(lineParts[1]);

    const comparisonThreshold = 8;

    const negativeOutcomeMessage = ':(';
    const positiveOutcomeMessage = 'Yay!';

    const isConditionMet = (valueA > comparisonThreshold || valueB > comparisonThreshold);

    const finalOutput = isConditionMet ? negativeOutcomeMessage : positiveOutcomeMessage;

    console.log(finalOutput);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
