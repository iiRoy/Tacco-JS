(function programEntry() {
  const fileSystem = require('fs');
  const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const inputDataLines = rawInputContent.trim().split('\n');

  const _discardedElementCount = Number(inputDataLines.shift());
  const dataForHeap = inputDataLines.shift().split(' ').map(Number);

  const resultHeapArray = createMaxHeapFromArray(dataForHeap);
  const outputString = ' ' + resultHeapArray.join(' ');

  console.log(outputString);
})();

function createMaxHeapFromArray(sourceArray) {
  const currentHeapSize = sourceArray.length;

  const siftDown = (rootIndex) => {
    let leftNodeIndex, rightNodeIndex, indexLargestElement;
    const currentValue = sourceArray[rootIndex];

    leftNodeIndex = 2 * rootIndex + 1;
    rightNodeIndex = 2 * rootIndex + 2;

    if (leftNodeIndex < currentHeapSize && sourceArray[leftNodeIndex] > currentValue) {
      indexLargestElement = leftNodeIndex;
    } else {
      indexLargestElement = rootIndex;
    }

    if (rightNodeIndex < currentHeapSize && sourceArray[rightNodeIndex] > sourceArray[indexLargestElement]) {
      indexLargestElement = rightNodeIndex;
    }

    if (indexLargestElement !== rootIndex) {
      const tempValue = sourceArray[rootIndex];
      sourceArray[rootIndex] = sourceArray[indexLargestElement];
      sourceArray[indexLargestElement] = tempValue;
      siftDown(indexLargestElement);
    }
  };

  const initialParentIndex = Math.floor(currentHeapSize / 2);
  for (let loopIndex = initialParentIndex; loopIndex >= 0; loopIndex--) {
    siftDown(loopIndex);
  }

  return sourceArray;
}
