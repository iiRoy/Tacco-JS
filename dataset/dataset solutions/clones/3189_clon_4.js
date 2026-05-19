'use strict'
function executeCalculation(rawInputText){
  let numericValues = extractNumbersFromString(rawInputText);
  const elementCount = numericValues.shift();
  let numberCollection = numericValues;

  if(elementCount === 1){
    console.log(numberCollection[0]);
    return;
  }

  numberCollection = sortNumbersInPlace(numberCollection);

  const finalCommonDivisor = numberCollection.reduce((currentGCD, nextValue) => {
    return findCommonDivisor(currentGCD, nextValue);
  }, numberCollection[0]);

  console.log(finalCommonDivisor);
}

function findCommonDivisor(firstVal, secondVal){
  if (secondVal === 0) {
    return firstVal;
  }
  return findCommonDivisor(secondVal, firstVal % secondVal);
}

function extractNumbersFromString(sourceText){
  return sourceText
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(segment => segment.length > 0)
    .map(Number);
}

function sortNumbersInPlace(inputArray){
  const sortedCopy = [...inputArray];
  sortedCopy.sort((a, b) => a - b);
  return sortedCopy;
}

executeCalculation(require('fs').readFileSync('/dev/stdin','utf8'));
