const probeForElement = (targetVal, sortedCollection, lowBound, highBound) => {
  if (lowBound >= highBound) {
    return false;
  }

  const pivotIndex = Math.floor((lowBound + highBound) / 2);
  const currentVal = sortedCollection[pivotIndex];

  if (currentVal === targetVal) {
    return true;
  } else if (targetVal < currentVal) {
    return probeForElement(targetVal, sortedCollection, lowBound, pivotIndex);
  } else {
    return probeForElement(targetVal, sortedCollection, pivotIndex + 1, highBound);
  }
};

((inputSource) => {
  const inputLines = inputSource.trim().split('\n');

  const [, searchSpaceRaw, , queryElementsRaw] = inputLines;
  const searchSpace = searchSpaceRaw.split(" ").map(Number);
  const queryElements = queryElementsRaw.split(" ").map(Number);

  const foundCount = queryElements.reduce((accumulator, currentQuery) => {
    return accumulator + (probeForElement(currentQuery, searchSpace, 0, searchSpace.length) ? 1 : 0);
  }, 0);

  console.log(foundCount);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
