'use strict';

function findGreatestCommonDivisor(valA, valB) {
  while (valB !== 0) {
    let temporaryValue = valB;
    valB = valA % valB;
    valA = temporaryValue;
  }
  return valA;
}

function processInputAndDeriveResult(sourceData) {
  const dataLines = sourceData.split('\n');
  const firstLineElements = dataLines[0].split(' ');
  const targetValue = Number(firstLineElements[1]);

  const numberStrings = dataLines[1].split(' ');

  const transformedValues = numberStrings.map(strItem => Math.abs(Number(strItem) - targetValue));

  const finalCommonDivisor = transformedValues.reduce((accumulator, currentElement) => {
      return findGreatestCommonDivisor(accumulator, currentElement);
  });

  return finalCommonDivisor;
}

function executeSolution(inputContent) {
  console.log(processInputAndDeriveResult(inputContent));
}

executeSolution(require("fs").readFileSync("/dev/stdin", "utf8").trim());
