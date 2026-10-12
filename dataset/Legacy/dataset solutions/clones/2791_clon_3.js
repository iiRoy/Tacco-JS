'use strict';
(function(rawData){
  const processedInput = rawData.trim().split(/\s+/).map(val => parseInt(val, 10));

  const totalElements = processedInput[0];
  const selectedCount = processedInput[1];
  const remainingElements = totalElements - selectedCount + 1;
  const moduloVal = (1e9 + 7);

  function addMod(valA, valB){
    return (valA + valB) % moduloVal;
  }

  function multiplyMod(factorA, factorB){
    const splitIntoChunks = (numValue) => {
      const chunkShift = 9;
      const chunkMask = (1 << chunkShift) - 1;
      const part1 = (numValue >> (chunkShift * 2));
      const part2 = (numValue >> chunkShift) & chunkMask;
      const part3 = numValue & chunkMask;
      return [part3, part2, part1];
    };

    const aPartsArr = splitIntoChunks(factorA);
    const bPartsArr = splitIntoChunks(factorB);

    let resultProduct = 0;
    const baseShiftMultiplier = (1 << 9);

    for(let iIdx = 0; iIdx < 3; iIdx++){
      const currentAPart = aPartsArr[iIdx];
      for(let jIdx = 0; jIdx < 3; jIdx++){
        const currentBPart = bPartsArr[jIdx];
        let termProduct = (currentAPart * currentBPart) % moduloVal;

        const totalShifts = iIdx + jIdx;
        for(let kShift = 0; kShift < totalShifts; kShift++){
          termProduct = (termProduct * baseShiftMultiplier) % moduloVal;
        }
        resultProduct = addMod(resultProduct, termProduct);
      }
    }
    return resultProduct;
  }

  const combinationsTable = new Array(totalElements + 1);
  for (let nInit = 0; nInit <= totalElements; nInit++) {
      combinationsTable[nInit] = new Array(nInit + 1).fill(1);
  }

  for(let currentN = 2; currentN <= totalElements; currentN++){
    for(let currentK = 1; currentK < currentN; currentK++){
      const prevN_minus_1_K_minus_1 = combinationsTable[currentN - 1][currentK - 1];
      const prevN_minus_1_K = combinationsTable[currentN - 1][currentK];
      combinationsTable[currentN][currentK] = addMod(prevN_minus_1_K_minus_1, prevN_minus_1_K);
    }
  }

  const finalResults = [];
  const kMinusOne = selectedCount - 1;
  for(let loopIndex = 0; loopIndex < selectedCount; loopIndex++){
    const currentI = loopIndex + 1;
    const term1 = combinationsTable[remainingElements][currentI];
    const term2 = combinationsTable[kMinusOne][currentI - 1];
    const product = multiplyMod(term1, term2);
    finalResults.push(product);
  }

  console.log(finalResults.join('\n'));
})(require('fs').readFileSync('/dev/stdin','utf8'));
