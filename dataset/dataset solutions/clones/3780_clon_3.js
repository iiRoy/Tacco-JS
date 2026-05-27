"use strict";

const readInputNumber = () => {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const firstLine = fileContent.split('\n')[0];
    return parseInt(firstLine);
};

const calculateDigitSum = (digitChars) => {
  return digitChars.reduce((accumulator, currentDigitChar) => accumulator + Number(currentDigitChar), 0);
};

const initialValue = readInputNumber();
let minSumOfDigits = initialValue;

const loopUpperBound = Math.floor(initialValue / 2) + 1;

for (let currentNum = 1; currentNum < loopUpperBound; currentNum++) {
    const complementNum = initialValue - currentNum;

    const currentNumDigits = currentNum.toString().split('');
    const complementNumDigits = complementNum.toString().split('');

    const sumForCurrentNum = calculateDigitSum(currentNumDigits);
    const sumForComplementNum = calculateDigitSum(complementNumDigits);

    const currentCombinedSum = sumForCurrentNum + sumForComplementNum;

    minSumOfDigits = Math.min(minSumOfDigits, currentCombinedSum);
}

console.log(minSumOfDigits);
