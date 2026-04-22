'use strict';
( function (initialStream) {
  initialStream = initialStream
    .trim()
    .split(/\s+/)
    .map( currentString => currentString - 0 );

  const numChildren = initialStream.shift();
  const maxCandies = initialStream.shift();
  const primeModulo = Math.pow(10, 9) + 7;
  const childCandyLimits = initialStream;

  const distributionWays = new Array(numChildren)
    .fill(0)
    .map(val => new Array(maxCandies + 1).fill(0));

  // distributionWays[childIndex][candyCount] represents the total number of
  // combinations to distribute up to 'candyCount' candies among children
  // from index 0 up to 'childIndex'.
  
  distributionWays[-1] = new Array(maxCandies + 1).fill(1);
  for (let childIndex = -1; childIndex < numChildren; childIndex++) {
    distributionWays[childIndex][-1] = 0;
  }
  
  for (let childIndex = 0; childIndex < numChildren; childIndex++) {
    for (let candyCount = 0; candyCount <= childCandyLimits[childIndex]; candyCount++) {
      distributionWays[childIndex][candyCount] = (distributionWays[childIndex][candyCount - 1] + distributionWays[childIndex - 1][candyCount]) % primeModulo;
    }
    for (let candyCount = childCandyLimits[childIndex] + 1; candyCount <= maxCandies; candyCount++) {
      distributionWays[childIndex][candyCount] = (distributionWays[childIndex][candyCount - 1] + distributionWays[childIndex - 1][candyCount] - distributionWays[childIndex - 1][candyCount - childCandyLimits[childIndex] - 1]) % primeModulo;
    }
  }
  
  // The result is derived from the last child and the total candy amount.
  // We need to adjust for potential negative results from the modulo operation.
  const finalAnswer = (distributionWays[numChildren - 1][maxCandies] - distributionWays[numChildren - 1][maxCandies - 1] + primeModulo) % primeModulo;
  console.log(finalAnswer);
} )( require('fs').readFileSync('/dev/stdin', 'utf8') );