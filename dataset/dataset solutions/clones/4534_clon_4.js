'use strict';

const obtainSourceData = require('fs').readFileSync;
const sourceContent = obtainSourceData('/dev/stdin', 'utf8');
const contentRows = sourceContent.split('\n');

const initialSequence = contentRows[1];

function refineExpression(currentExpression) {
    let nextExpression = currentExpression.replace(/\(\)/g, '');
    if (nextExpression.length === currentExpression.length) {
        return currentExpression;
    } else {
        return refineExpression(nextExpression);
    }
}

const processedExpression = refineExpression(initialSequence);

let numOpeningBrackets = 0;
let numClosingBrackets = 0;

for (let currentSymbol of processedExpression) {
    if (currentSymbol === '(') {
        numOpeningBrackets++;
    } else if (currentSymbol === ')') {
        numClosingBrackets++;
    }
}

let leadingPadding = '('.repeat(numClosingBrackets);
let trailingPadding = ')'.repeat(numOpeningBrackets);

console.log(leadingPadding + initialSequence + trailingPadding);