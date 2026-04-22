"use strict";

const acquireInputData = (source) => {
    let stringSegments = [];
    let tempBuffer = '';
    for (let char of source) {
        if (char === ' ' || char === '\n' || char === '\r') {
            if (tempBuffer.length > 0) {
                stringSegments.push(tempBuffer);
                tempBuffer = '';
            }
        } else {
            tempBuffer += char;
        }
    }
    if (tempBuffer.length > 0) {
        stringSegments.push(tempBuffer);
    }
    return stringSegments.map(s => Number(s));
};

const subtractFirstFromSumOfOthers = (elements) => {
    const primary = elements[0];
    const secondary = elements[1];
    const tertiary = elements[2];
    return tertiary + secondary - primary;
};

const ensureNonNegative = (val) => {
    if (val < 0) {
        return 0;
    } else {
        return val;
    }
};

const processAndDisplay = (inputContent) => {
    const rawNumbers = acquireInputData(inputContent);
    const calculatedValue = subtractFirstFromSumOfOthers(rawNumbers);
    const adjustedValue = ensureNonNegative(calculatedValue);
    console.log(adjustedValue);
};

processAndDisplay(require('fs').readFileSync('/dev/stdin', 'utf8'));