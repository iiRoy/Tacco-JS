'use strict';

let inputData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
const numVal = +inputData[0];
const originalString = inputData[1];

let currentProcessedString = originalString;
let stringModifiedInIteration;

do {
    let previousProcessedStringState = currentProcessedString;
    currentProcessedString = currentProcessedString.replace(/\(\)/g, '');
    stringModifiedInIteration = (currentProcessedString.length !== previousProcessedStringState.length);
} while (stringModifiedInIteration);

let stringWithOnlyOpenParens = currentProcessedString.replace(/\)/g, '');
let countOfUnmatchedOpenParens = stringWithOnlyOpenParens.length;
let countOfUnmatchedCloseParens = currentProcessedString.length - stringWithOnlyOpenParens.length;

let requiredPrefixParens = '('.repeat(countOfUnmatchedCloseParens);
let requiredSuffixParens = ')'.repeat(countOfUnmatchedOpenParens);

console.log(requiredPrefixParens + originalString + requiredSuffixParens);
