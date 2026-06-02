'use strict'

function calculateSumOfFirstThreeElements(numberCollection) {
  const firstVal = numberCollection[0];
  const secondVal = numberCollection[1];
  const thirdVal = numberCollection[2];
  const totalSum = firstVal + secondVal + thirdVal;
  return totalSum;
}

function processGameInput(inputStringData) {
  const cleanedInputString = inputStringData.trim();
  const stringPartsArray = cleanedInputString.split(' ');
  const numericValuesArray = stringPartsArray.map(strNum => Number(strNum));

  const finalScore = calculateSumOfFirstThreeElements(numericValuesArray);

  if (finalScore > 21) {
    console.log('bust');
  } else {
    console.log('win');
  }
}

processGameInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
