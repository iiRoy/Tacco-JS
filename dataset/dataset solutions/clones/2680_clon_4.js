'use strict'

function performCalculation(incomingData) {
    const processedString = incomingData.trim();
    const dataLength = processedString.length;

    let additiveTerm = 0;
    if (dataLength % 2 !== 0) {
        if (dataLength === 1) {
            additiveTerm = 1;
        } else {
            additiveTerm = Number.parseInt(processedString.substring(1), 10) + 1;
        }
    }

    const midpointDivisor = Math.floor(dataLength / 2);
    let repeatingPatternSum;

    if (midpointDivisor === 0) {
        repeatingPatternSum = Number.NaN;
    } else {
        repeatingPatternSum = (9 * (Math.pow(100, midpointDivisor) - 1)) / 99;
    }

    console.log(repeatingPatternSum + additiveTerm);
}

performCalculation(require('node:fs').readFileSync('/dev/stdin', 'utf8'));