"use strict";

function evaluateNumericProperty(sourceData) {
    const primaryLine = sourceData.split('\n')[0];
    const baseValue = Number(primaryLine);

    const digitTotal = String(baseValue)
        .split('')
        .map(digitChar => parseInt(digitChar, 10))
        .reduce((runningSum, currentElement) => runningSum + currentElement, 0);

    console.log(baseValue % digitTotal === 0 ? 'Yes' : 'No');
}

evaluateNumericProperty(require('fs').readFileSync('/dev/stdin', 'utf8'));
