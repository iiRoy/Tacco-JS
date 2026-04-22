function areIdentical(itemA, itemB) {
  return itemA[0] === itemB[0] && itemA[1] === itemB[1];
}

function evaluateOrdering(itemA, itemB) {
  return itemA[0] - itemB[0];
}

function formatItemDisplay(item) {
  return `${item[1]} ${item[0]}`;
}

function exchangePositions(container, firstIdx, secondIdx) {
  const temp = container[firstIdx];
  container[firstIdx] = container[secondIdx];
  container[secondIdx] = temp;
}

function adjustHeapPosition(container, heapBoundary, rootElementIdx, comparisonRule) {
  let dominantElementIdx = rootElementIdx;
  const leftChildIdx = 2 * rootElementIdx + 1;
  const rightChildIdx = 2 * rootElementIdx + 2;

  if (leftChildIdx < heapBoundary && comparisonRule(container[leftChildIdx], container[dominantElementIdx]) > 0) {
    dominantElementIdx = leftChildIdx;
  }

  if (rightChildIdx < heapBoundary && comparisonRule(container[rightChildIdx], container[dominantElementIdx]) > 0) {
    dominantElementIdx = rightChildIdx;
  }

  if (dominantElementIdx !== rootElementIdx) {
    exchangePositions(container, rootElementIdx, dominantElementIdx);
    adjustHeapPosition(container, heapBoundary, dominantElementIdx, comparisonRule);
  }
}

function performHeapSort(dataCollection, comparisonRule) {
  const collectionSize = dataCollection.length;

  for (let k = Math.floor(collectionSize / 2) - 1; k >= 0; k--) {
    adjustHeapPosition(dataCollection, collectionSize, k, comparisonRule);
  }

  for (let k = collectionSize - 1; k > 0; k--) {
    exchangePositions(dataCollection, 0, k);
    adjustHeapPosition(dataCollection, k, 0, comparisonRule);
  }
}

function processData() {
  const fileSystem = require('fs');
  const inputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  const totalItems = Number(inputLines.shift());

  const initialCollection = inputLines.map(entry => {
    const parts = entry.split(' ');
    return [Number(parts[1]), parts[0]];
  });

  const heapSortedCollection = initialCollection.map(item => [...item]);
  const stableReferenceCollection = initialCollection.map(item => [...item]);

  performHeapSort(heapSortedCollection, evaluateOrdering);

  stableReferenceCollection.sort(evaluateOrdering);

  const isOrderPreserved = stableReferenceCollection.every((item, idx) => {
    return areIdentical(item, heapSortedCollection[idx]);
  });

  console.log(isOrderPreserved ? 'Stable' : 'Not stable');
  console.log(heapSortedCollection.map(formatItemDisplay).join('\n'));
}

processData();