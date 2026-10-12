'use strict'

function processInput(rawData) {
  const inputLines = rawData.split('\n');
  const limitValue = parseInt(inputLines[0], 10);

  const generatedNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '19', '29', '39', '49', '59', '69', '79', '89', '99', '199'];

  const leadingParts = [];
  for (let digit = 2; digit <= 19; digit++) {
    leadingParts.push(String(digit));
  }

  let currentSuffix = '99';
  const MAX_OUTER_ITERATIONS = 21;

  const combineParts = (prefix, suffix) => prefix + suffix;

  for (let outerIteration = 0; outerIteration < MAX_OUTER_ITERATIONS; outerIteration++) {
    for (let innerIteration = 0; innerIteration < leadingParts.length; innerIteration++) {
      const combinedString = combineParts(leadingParts[innerIteration], currentSuffix);
      generatedNumbers.push(combinedString);
    }
    currentSuffix += '9';
  }

  const finalResult = generatedNumbers.slice(0, limitValue).join('\n');
  console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
