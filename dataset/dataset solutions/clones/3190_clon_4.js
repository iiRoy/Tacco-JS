'use strict';

function handleInputData(sourcePayload) {
  const lineCollection = sourcePayload.trim().split('\n');
  const entityList = lineCollection[1].split(' ').map(Number);

  // Sort the entityList ascendingly
  const sortedElements = entityList.sort((left, right) => left - right);

  // Iterative GCD function
  const computeGreatestCommonDivisor = (operandA, operandB) => {
    while (operandB !== 0) {
      const remainderResult = operandA % operandB;
      operandA = operandB;
      operandB = remainderResult;
    }
    return operandA;
  };

  // Generate an array of pairwise GCDs using map
  const gcdsOfAdjacentPairs = sortedElements.slice(0, -1).map((element, index) => {
    return computeGreatestCommonDivisor(element, sortedElements[index + 1]);
  });

  // Find the minimum among the calculated GCDs using reduce
  const finalOutputValue = gcdsOfAdjacentPairs.reduce((minVal, currentVal) => Math.min(minVal, currentVal), Number.MAX_SAFE_INTEGER);

  console.log(finalOutputValue);
}

handleInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));