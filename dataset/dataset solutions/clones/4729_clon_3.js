'use strict'

const processInput = (rawData) => {
    const THRESHOLD_VALUE = 1200;
    const parsedNumber = parseInt(rawData);

    const getComparisonResult = (valueToCheck, limitValue) => {
        if (valueToCheck < limitValue) {
            return 'ABC';
        } else {
            return 'ARC';
        }
    };

    const outputString = getComparisonResult(parsedNumber, THRESHOLD_VALUE);
    console.log(outputString);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'))
