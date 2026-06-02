"use strict"

const parseNumericString = (strVal) => {
    const RADIX_DECIMAL = 10;
    return parseInt(strVal, RADIX_DECIMAL);
};

const ProcessInput = (rawData) => {
    const trimmedInput = rawData.trim();
    const stringParts = trimmedInput.split(' ');
    
    const parsedNumbers = stringParts.map(parseNumericString);

    const initialValue = parsedNumbers[0];
    const targetValue = parsedNumbers[1];

    let resultCount = 0;

    const multiplierBase = initialValue - 1;

    if (initialValue >= targetValue) {
        resultCount = 1;
    } else { 
        const thresholdForLoop = targetValue - 1;

        for (let iterationIndex = 0; multiplierBase * iterationIndex < thresholdForLoop; iterationIndex++) {
            resultCount += 1;
        }
    }
    console.log(resultCount);
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
