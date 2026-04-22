const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

let processedLines = (sourceData.trim()).split("\n");

while ( true ) {
  const currentPairValues = processedLines.shift()
                                           .split(" ")
                                           .map( val => parseInt(val, 10) );

  const itemCount = currentPairValues[0];
  const maxSumLimit = currentPairValues[1];

  if (itemCount === 0 && maxSumLimit === 0) {
    break;
  }

  let numericValues = [];

  for (let outerIndex = 0; outerIndex < itemCount; outerIndex++) {
    const extractedNumber = parseInt(processedLines.shift(), 10);
    numericValues.push(extractedNumber);
  }

  numericValues.sort( (valA, valB) => valA - valB );

  let validPairCounter = 0;

  for (let outerIndex = 0; outerIndex < itemCount; outerIndex++) {
    for (let innerIndex = outerIndex + 1; innerIndex < itemCount; innerIndex++) {
      if (numericValues[outerIndex] + numericValues[innerIndex] > maxSumLimit) {
        validPairCounter += itemCount - innerIndex;
        continue;
      }
    }
  }

  console.log(validPairCounter);
}