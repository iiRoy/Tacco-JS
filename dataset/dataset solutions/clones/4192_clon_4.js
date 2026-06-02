'use strict';

function processInput(sourceData) {
    const initialValue = Number(sourceData);
    let currentNumber = initialValue;
    let digitSummation = 0;

    if (currentNumber === 0) {
        digitSummation = 0;
    } else {
        while (currentNumber > 0) {
            digitSummation += currentNumber % 10;
            currentNumber = Math.floor(currentNumber / 10);
        }
    }
    
    let finalVerdict;
    if (initialValue % digitSummation === 0) {
        finalVerdict = 'Yes';
    } else {
        finalVerdict = 'No';
    }
    console.log(finalVerdict);
}

processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
