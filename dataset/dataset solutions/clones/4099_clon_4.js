'use strict';

function processInputData(sourceContent) {
    const firstLine = sourceContent.split('\n')[0];
    const targetPosition = 3;
    const substituteValue = '8';

    let resultString;

    if (firstLine.length > targetPosition) {
        resultString = firstLine.slice(0, targetPosition) + substituteValue + firstLine.slice(targetPosition + 1);
    } else {
        resultString = firstLine + substituteValue;
    }

    console.log(resultString);
}

processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
