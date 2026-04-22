'use strict';
console.log((function(sourceData){
  const componentStrings = sourceData.trim().split('\n');
  const primarySequence = componentStrings[0];
  const secondarySequence = componentStrings[1];

  const valueCache = new Map();

  function calculateOptimalSubsequence(firstIndex, secondIndex) {
    const currentKey = `${firstIndex},${secondIndex}`;
    if (valueCache.has(currentKey)) {
      return valueCache.get(currentKey);
    }

    if (firstIndex >= primarySequence.length || secondIndex >= secondarySequence.length) {
      return '';
    }

    let outcome;
    if (primarySequence[firstIndex] === secondarySequence[secondIndex]) {
      outcome = primarySequence[firstIndex] + calculateOptimalSubsequence(firstIndex + 1, secondIndex + 1);
    } else {
      const variantOne = calculateOptimalSubsequence(firstIndex + 1, secondIndex);
      const variantTwo = calculateOptimalSubsequence(firstIndex, secondIndex + 1);
      outcome = variantOne.length > variantTwo.length ? variantOne : variantTwo;
    }

    valueCache.set(currentKey, outcome);
    return outcome;
  }

  return calculateOptimalSubsequence(0, 0);

})(require('fs').readFileSync('/dev/stdin', 'utf8')));