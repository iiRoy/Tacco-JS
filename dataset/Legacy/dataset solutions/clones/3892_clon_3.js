'use strict'

const processInput = (rawData) => {
    const parseNumericValue = (strValue) => {
        return parseInt(strValue, 10);
    };

    const isWithinRange = (startPoint, length, checkValue) => {
        const endPoint = startPoint + length;
        return checkValue >= startPoint && checkValue <= endPoint;
    };

    const inputLines = rawData.split('\n');
    const firstLineParts = inputLines[0].split(' ');

    const valA = parseNumericValue(firstLineParts[0]);
    const valB = parseNumericValue(firstLineParts[1]);
    const targetX = parseNumericValue(firstLineParts[2]);

    let outputMessage;
    if (isWithinRange(valA, valB, targetX)) {
        outputMessage = 'YES';
    } else {
        outputMessage = 'NO';
    }

    console.log(outputMessage);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
