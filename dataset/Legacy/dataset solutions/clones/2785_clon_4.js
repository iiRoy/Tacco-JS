function processInputData(sourceText) {
  const lineSegments = sourceText.split('\n');
  const elementCountStr = lineSegments[0];
  const numericValues = lineSegments[1].split(' ').map(Number);

  const sortedCollection = obtainSortedSequence(numericValues);

  const collectionLength = sortedCollection.length;
  const upperMidIndex = Math.floor(collectionLength / 2);
  const lowerMidIndex = Math.floor(collectionLength / 2 - 1);

  console.log(sortedCollection[upperMidIndex] - sortedCollection[lowerMidIndex]);
}

function obtainSortedSequence(sourceArray) {
  return sourceArray.slice().sort((valA, valB) => valA - valB);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
