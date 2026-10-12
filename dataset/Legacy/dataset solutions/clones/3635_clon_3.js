'use strict';
const fileSystemHandler = require('fs');
const standardInputFile = '/dev/stdin';

const rawInputContent = fileSystemHandler.readFileSync(standardInputFile, 'utf8');
const parsedInputElements = rawInputContent.split(/\s/);

const firstNumericString = parsedInputElements[0];
const numericValue = Number(firstNumericString);

function calculateCategoryLabel(inputNumber) {
    let finalLabel;
    if (inputNumber < 1200) {
        finalLabel = 'ABC';
    } else if (inputNumber < 2800) {
        finalLabel = 'ARC';
    } else {
        finalLabel = 'AGC';
    }
    return finalLabel;
}

const categoryLabel = calculateCategoryLabel(numericValue);

console.log(categoryLabel);
