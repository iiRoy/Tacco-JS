"use strict";

const processInput = (rawContent) => {
  const numericValue = parseInt(rawContent.trim(), 10);
  
  const digitSum = String(numericValue)
    .split('')
    .map(char => parseInt(char, 10))
    .reduce((accumulator, currentDigit) => accumulator + currentDigit, 0);

  const finalResult = (digitSum === 1) ? 10 : digitSum;

  console.log(finalResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
