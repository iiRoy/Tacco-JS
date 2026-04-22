"use strict";

function executeRoutine(sourceData) {
    const parsedLines = sourceData.split('\n');
    const relevantString = parsedLines[1];

    const periodCount = (relevantString.match(/\./g) || []).length;
    const poundCount = (relevantString.match(/#/g) || []).length;

    const finalResult = Math.min(periodCount, poundCount);

    console.log(finalResult);
}

executeRoutine(require('fs').readFileSync('/dev/stdin', 'utf8'));