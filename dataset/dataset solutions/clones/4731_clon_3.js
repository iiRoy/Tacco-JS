'use strict'
const processInput = rawInputString => {
    const COMPARISON_THRESHOLD = 1200;

    const determineContestType = (valueToCheck) => {
        return valueToCheck >= COMPARISON_THRESHOLD ? 'ARC' : 'ABC';
    };

    const trimmedInput = rawInputString.trim();
    const inputLines = trimmedInput.split("\n");

    const firstLineContent = inputLines[0];
    const firstPartFromLine = firstLineContent.split(' ')[0];

    const numericValue = Number(firstPartFromLine);

    const contestResult = determineContestType(numericValue);

    console.log(contestResult);
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
