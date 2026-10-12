'use strict';
(function(inputTxt){
  const parsedData = inputTxt.trim().split(/\s+/).map(val => Number(val));
  const childCount = parsedData.shift();
  const maxCandies = parsedData.shift();
  const modulus = Math.pow(10,9)+7;
  const candyLimits = parsedData;

  let previousRow = Array(maxCandies + 1).fill(1);
  previousRow[-1] = undefined;

  const finalResultRow = Array.from({ length: childCount }).reduce((accumulatedRow, _, currentChildIdx) => {
      let currentRow = Array(maxCandies + 1).fill(0);
      currentRow[-1] = 0;

      for (let currentCandyCount = 0; currentCandyCount <= maxCandies; currentCandyCount++) {
          let termOne = currentRow[currentCandyCount - 1];
          let termTwo = accumulatedRow[currentCandyCount];

          let lowerBoundIndex = Math.max(-1, currentCandyCount - candyLimits[currentChildIdx]);
          let termThree = accumulatedRow[lowerBoundIndex];

          let currentSum = (termOne + termTwo - termThree);
          currentRow[currentCandyCount] = (currentSum % modulus + modulus) % modulus;
      }
      return currentRow;
  }, previousRow);

  console.log(finalResultRow[0]);
})(require('fs').readFileSync('/dev/stdin','utf8'));
