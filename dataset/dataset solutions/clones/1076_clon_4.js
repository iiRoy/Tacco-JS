const evaluate = (unitA, unitB) => {
  const valA = unitA[1];
  const valB = unitB[1];
  return valA < valB ? -1 : (valA > valB ? 1 : 0);
};

const checkEquality = (unitA, unitB) => {
  return unitA[0] === unitB[0] && unitA[1] === unitB[1];
};

const formatItem = (unit) => {
  return `${unit[0]} ${unit[1]}`;
};

const adjustHeap = (collection, totalElements, rootPosition, comparator) => {
  let largest = rootPosition;
  let leftChild = 2 * rootPosition + 1;
  let rightChild = 2 * rootPosition + 2;

  if (leftChild < totalElements && comparator(collection[leftChild], collection[largest]) > 0) {
    largest = leftChild;
  }

  if (rightChild < totalElements && comparator(collection[rightChild], collection[largest]) > 0) {
    largest = rightChild;
  }

  if (largest !== rootPosition) {
    [collection[rootPosition], collection[largest]] = [collection[largest], collection[rootPosition]];
    adjustHeap(collection, totalElements, largest, comparator);
  }
};

const arrangeInOrder = (collection, comparator) => {
  const totalElements = collection.length;

  for (let i = Math.floor(totalElements / 2) - 1; i >= 0; i--) {
    adjustHeap(collection, totalElements, i, comparator);
  }

  for (let i = totalElements - 1; i > 0; i--) {
    [collection[0], collection[i]] = [collection[i], collection[0]];
    adjustHeap(collection, i, 0, comparator);
  }
};

const executeProcessing = () => {
  const fileSystem = require('fs');
  const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const inputSegments = inputData.trim().split('\n');

  const totalCount = Number(inputSegments.shift());
  const originalSequence = inputSegments.map(row => {
    const parts = row.split(' ');
    return [parts[0], Number(parts[1])];
  });

  const heapSortedSequence = Array.from(originalSequence);
  arrangeInOrder(heapSortedSequence, evaluate);

  const indexedElements = originalSequence.map((item, initialRank) => ({
    element: item,
    initialRank: initialRank
  }));

  const referenceSorted = indexedElements.sort((a, b) => {
    const comparisonResult = evaluate(a.element, b.element);
    if (comparisonResult === 0) {
      return a.initialRank - b.initialRank;
    }
    return comparisonResult;
  });

  let stabilityIndicator = true;
  for (let i = 0; i < totalCount; i++) {
    if (!checkEquality(referenceSorted[i].element, heapSortedSequence[i])) {
      stabilityIndicator = false;
      break;
    }
  }

  console.log(stabilityIndicator ? 'Stable' : 'Not stable');
  console.log(heapSortedSequence.map(formatItem).join('\n'));
};

executeProcessing();