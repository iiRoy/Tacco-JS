(function executeProgram() {
  const fileSystemModule = require('fs');
  const standardInputFilePath = '/dev/stdin';
  const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8').trim();
  const inputLines = rawInputContent.split('\n');

  const parseNumericValue = (valueString) => Number(valueString);

  // The first line 'n' is read but not used in the original logic beyond parsing.
  const elementCount = parseNumericValue(inputLines.shift());
  const dataArray = inputLines.shift().split(' ');

  constructMaxHeap(dataArray);

  let outputStringAccumulator = '';
  for (let k = 0; k < dataArray.length; k++) {
    outputStringAccumulator += ' ' + dataArray[k];
  }
  console.log(outputStringAccumulator);
})();

function constructMaxHeap(targetArray) {
  const arrayLength = targetArray.length;
  let leftChildIndex, rightChildIndex, largestElementIndex;

  const getNumericArrayValue = (index) => Number(targetArray[index]);

  const performSwap = (idxA, idxB) => {
    const temporaryValue = targetArray[idxA];
    targetArray[idxA] = targetArray[idxB];
    targetArray[idxB] = temporaryValue;
  };

  const heapifyDown = (currentIndex) => {
    leftChildIndex = 2 * currentIndex + 1;
    rightChildIndex = 2 * currentIndex + 2;
    largestElementIndex = currentIndex; // Assume current node is the largest initially

    // Check if left child exists and is larger than current largest
    if (leftChildIndex < arrayLength && getNumericArrayValue(leftChildIndex) > getNumericArrayValue(largestElementIndex)) {
      largestElementIndex = leftChildIndex;
    }

    // Check if right child exists and is larger than current largest
    if (rightChildIndex < arrayLength && getNumericArrayValue(rightChildIndex) > getNumericArrayValue(largestElementIndex)) {
      largestElementIndex = rightChildIndex;
    }

    // If the largest element is not the current node, swap and recursively heapify the affected subtree
    if (largestElementIndex !== currentIndex) {
      performSwap(currentIndex, largestElementIndex);
      heapifyDown(largestElementIndex);
    }
  };

  // Iterate from the last non-leaf node up to the root to build the max heap
  const startingIndexForHeapBuild = Math.floor(arrayLength / 2 - 1);
  for (let k = startingIndexForHeapBuild; k >= 0; k--) {
    heapifyDown(k);
  }
}
