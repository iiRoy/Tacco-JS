'use strict';
(function(entryData){
  entryData = entryData.trim().split(/\n/);

  const numItems = entryData.shift() - 0;
  const totalStates = Math.pow(2, numItems);
  const modulusVal = Math.pow(10, 9) + 7;

  entryData = entryData.map(textRow => textRow.split(/\s+/).map(parsedNum => parsedNum - 0));
  const compatibilityGrid = entryData;

  const bitWeightIndex = [];
  for(let idx = 0; idx < numItems; idx++) {
    bitWeightIndex.push({});
  }

  for(let maleIdx = 1; maleIdx < totalStates; maleIdx++) {
    let currentBitmask = maleIdx;
    let setBitsCount = 0;
    while(currentBitmask > 0) {
      setBitsCount += (currentBitmask % 2);
      currentBitmask = (currentBitmask - currentBitmask % 2) / 2;
    }
    bitWeightIndex[setBitsCount - 1][maleIdx] = maleIdx;
  }
  
  const solutionCache = [];
  for(let iter = 0; iter < numItems; iter++) {
    solutionCache.push({});
  }
  solutionCache[-1] = new Array(totalStates).fill(1);
  
  /*
   *  The following dynamic programming block calculates the total number of
   *  possible bipartite matchings.
   *  `solutionCache[currentManIdx][currentWomanSet]` represents the count
   *  of ways to match the first `currentManIdx + 1` individuals from the
   *  first set with a subset of individuals from the second set,
   *  where the specific subset is given by `currentWomanSet`.
   */
  
  for(let currentManIdx = 0; currentManIdx < numItems; currentManIdx++) {
    for(let currentWomanSet in bitWeightIndex[currentManIdx]) {
      if(solutionCache[currentManIdx][currentWomanSet] === undefined) {
        solutionCache[currentManIdx][currentWomanSet] = 0;
      }
      for(let femaleIdx = 0; femaleIdx < numItems; femaleIdx++) {
        if(compatibilityGrid[currentManIdx][femaleIdx] === 0) continue;
        if((currentWomanSet & (1 << femaleIdx)) === 0) continue;
        solutionCache[currentManIdx][currentWomanSet] += (solutionCache[currentManIdx - 1][currentWomanSet ^ (1 << femaleIdx)] || 0);
      }
      solutionCache[currentManIdx][currentWomanSet] %= modulusVal;
    }
  }
  console.log(solutionCache[numItems - 1][totalStates - 1] || 0);
})(require('fs').readFileSync('/dev/stdin','utf8'));