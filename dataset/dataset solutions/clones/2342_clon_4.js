'use strict';
function processInput(rawData) {
    let numericalExtracts = [];
    let currentSegment = '';
    let processedData = rawData.replace(/^\s+|\s+$/g, '');

    for (let currentPos = 0; currentPos < processedData.length; currentPos++) {
        let symbol = processedData[currentPos];
        if (symbol === ' ') {
            numericalExtracts.push(+currentSegment);
            currentSegment = '';
        } else {
            currentSegment += symbol;
        }
    }
    numericalExtracts.push(+currentSegment);

    const firstThreeValues = [
        numericalExtracts[0],
        numericalExtracts[1],
        numericalExtracts[2]
    ];

    let calculatedSum = firstThreeValues.reduce((accumulated, val) => {
        const numericVal = +val;
        if (isNaN(accumulated) || isNaN(numericVal)) {
            return NaN;
        }
        return accumulated + numericVal;
    }, 0);

    let finalVerdict;
    switch (true) {
        case calculatedSum > 21:
            finalVerdict = 'bust';
            break;
        default:
            finalVerdict = 'win';
            break;
    }

    console.log(finalVerdict);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));