'use strict';

function performCalculation(inputString) {
  const numericStrings = inputString.match(/-?\d+/g);
  const quantity = Number(numericStrings[0]);
  const initialValue = Number(numericStrings[1]);

  const seriesEnd = initialValue + quantity - 1;

  const totalSum = (quantity / 2) * (initialValue + seriesEnd);

  let absoluteMinElement;
  if (initialValue <= 0 && seriesEnd >= 0) {
    absoluteMinElement = 0;
  } else if (initialValue > 0) {
    absoluteMinElement = initialValue;
  } else {
    absoluteMinElement = seriesEnd;
  }
  
  const finalResult = totalSum - absoluteMinElement;
  
  console.log(finalResult);
}

performCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));