"use strict";

function calculateDigitSum(numberToProcess) {
  const numberAsString = numberToProcess.toString();
  const individualDigits = numberAsString.split('');
  const sumOfDigits = individualDigits.reduce((accumulator, digitCharacter) => {
    return accumulator + parseInt(digitCharacter, 10);
  }, 0);
  return sumOfDigits;
}

function processInput(rawInputData) {
  const cleanedInput = rawInputData.trim();
  const inputTokens = cleanedInput.split(' ');

  const limitValue = parseInt(inputTokens[0], 10);
  const lowerBoundValue = parseInt(inputTokens[1], 10);
  const upperBoundValue = parseInt(inputTokens[2], 10);

  const sequenceOfNumbers = Array.from({ length: limitValue }, (_, index) => index + 1);

  const filteredNumbers = sequenceOfNumbers.filter((currentNumber) => {
    const digitSumResult = calculateDigitSum(currentNumber);
    const isWithinRange = (digitSumResult >= lowerBoundValue && digitSumResult <= upperBoundValue);
    return isWithinRange;
  });

  const finalSum = filteredNumbers.reduce((totalAccumulator, numberValue) => {
    return totalAccumulator + numberValue;
  }, 0);
  
  console.log(finalSum);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
