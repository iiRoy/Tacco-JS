"use strict";
function processInput(rawData) {
    const parsedLines = rawData.split('\n');

    const stoneCount = parseInt(parsedLines[0], 10);
    const stoneChars = parsedLines[1].split('');

    const DOT_REPRESENTATION = '.';
    const HASH_REPRESENTATION = '#';

    let dotCount = 0;
    let hashCount = 0;

    for (const currentStone of stoneChars) {
        if (currentStone === DOT_REPRESENTATION) {
            dotCount++;
        } else if (currentStone === HASH_REPRESENTATION) {
            hashCount++;
        }
    }

    const resultValue = Math.min(dotCount, hashCount);

    console.log(resultValue);
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
