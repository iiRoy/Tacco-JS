'use strict';
(function(rawInputString){
  const processedData = rawInputString.trim().split(/\s+/).map(val => Number(val));
  const elementCount = processedData.shift();
  const valuesArray = processedData;

  const scoreMemo = Array.from({ length: elementCount }, () =>
    Array.from({ length: elementCount }, () => undefined)
  );

  const calculateOptimalDifference = (leftBoundary, rightBoundary) => {
    if (leftBoundary > rightBoundary) {
      return 0;
    }

    if (scoreMemo[leftBoundary][rightBoundary] !== undefined) {
      return scoreMemo[leftBoundary][rightBoundary];
    }

    const takeLeftElement = valuesArray[leftBoundary] - calculateOptimalDifference(leftBoundary + 1, rightBoundary);

    const takeRightElement = valuesArray[rightBoundary] - calculateOptimalDifference(leftBoundary, rightBoundary - 1);

    const currentOptimal = Math.max(takeLeftElement, takeRightElement);

    scoreMemo[leftBoundary][rightBoundary] = currentOptimal;
    return currentOptimal;
  };

  const finalResult = calculateOptimalDifference(0, elementCount - 1);

  console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin','utf8'));
