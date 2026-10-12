'use strict';
(function(rawDataInput){
  rawDataInput = rawDataInput.trim().split(/\n/);
  const numMen = parseInt(rawDataInput.shift(), 10);
  const totalCombinations = Math.pow(2, numMen);
  const modulusValue = Math.pow(10, 9) + 7;

  const parseMatrixRow = (str) => str.split(/\s+/).map(x => parseInt(x, 10));
  const compatibilityMatrix = rawDataInput.map(parseMatrixRow);

  const combinationsByCount = new Array(numMen).fill(0).map(() => new Object());

  const countSetBits = (n) => {
    let bitCount = 0;
    let tempMask = n;
    while (tempMask > 0) {
      bitCount += (tempMask & 1);
      tempMask >>= 1;
    }
    return bitCount;
  };

  for (let maskValue = 1; maskValue < totalCombinations; maskValue++) {
    const bitCount = countSetBits(maskValue);
    if (bitCount > 0 && bitCount <= numMen) {
      combinationsByCount[bitCount - 1][maskValue] = maskValue;
    }
  }

  const dynamicProgrammingTable = new Array(numMen).fill(0).map(() => new Object());

  const initialDPState = new Array(totalCombinations).fill(1);
  dynamicProgrammingTable[-1] = initialDPState;

  const applyModulus = (value) => value % modulusValue;

  for (let currentManIndex = 0; currentManIndex < numMen; currentManIndex++) {
    for (const maskKey in combinationsByCount[currentManIndex]) {
      const currentCombinationMask = parseInt(maskKey, 10);

      if (dynamicProgrammingTable[currentManIndex][currentCombinationMask] === undefined) {
        dynamicProgrammingTable[currentManIndex][currentCombinationMask] = 0;
      }

      for (let womanIndex = 0; womanIndex < numMen; womanIndex++) {
        if (compatibilityMatrix[currentManIndex][womanIndex] === 0) {
          continue;
        }

        const womanBit = (1 << womanIndex);
        if ((currentCombinationMask & womanBit) === 0) {
          continue;
        }

        const previousMask = currentCombinationMask ^ womanBit;
        const waysFromPreviousState = dynamicProgrammingTable[currentManIndex - 1][previousMask] || 0;
        dynamicProgrammingTable[currentManIndex][currentCombinationMask] += waysFromPreviousState;
      }
      dynamicProgrammingTable[currentManIndex][currentCombinationMask] = applyModulus(dynamicProgrammingTable[currentManIndex][currentCombinationMask]);
    }
  }

  const finalResult = dynamicProgrammingTable[numMen - 1][totalCombinations - 1] || 0;
  console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin','utf8'));
