"use strict";

const processInput = (inputStr) => {
  const inputSegments = inputStr.split(" ");

  let valueA = parseInt(inputSegments[0], 10);
  let valueB = parseInt(inputSegments[1], 10);
  let valueC = parseInt(inputSegments[2], 10);

  let finalAccumulator = 0;
  
  if (valueB >= valueC) {
    const combinedSum = valueC + valueB;
    finalAccumulator += combinedSum;
    valueC = 0;
  } else {
    const doubledB = valueB * 2;
    finalAccumulator += doubledB;
    valueC = valueC - valueB;
    valueB = 0;
  }
  
  if (valueC > 0) {
    const adjustmentAmount = Math.min(valueC, valueA);
    valueC = valueC - adjustmentAmount;
    finalAccumulator = finalAccumulator + adjustmentAmount;
  }

  finalAccumulator += (valueC > 0 ? 1 : 0);
  console.log(finalAccumulator);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
