"use strict";
function processInput(sourceText) {
    const lineSegments = sourceText.split('\n');

    const totalElements = parseInt(lineSegments[0]);
    const fullStoneSequence = lineSegments[1].split('');

    const relevantStones = fullStoneSequence.slice(0, totalElements);

    const dotTally = relevantStones.filter(element => element === '.').length;
    const hashTally = relevantStones.filter(element => element === '#').length;

    const resultValue = Math.min(dotTally, hashTally);

    console.log(resultValue);
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
