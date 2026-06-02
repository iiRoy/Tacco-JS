(function runHeapProgram() {
  const fileSystemModule = require('fs');
  const standardInputPath = '/dev/stdin';
  const rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
  const programInputLines = rawInputContent.trim().split('\n');

  // The first line, originally 'n', is consumed but not used in this context.
  programInputLines.shift();

  const dataLineContent = programInputLines.shift();
  const initialArrayStrings = dataLineContent.split(' ');

  const processedHeapArray = constructMaxHeap(initialArrayStrings);
  const finalOutputString = ' ' + processedHeapArray.join(' ');

  console.log(finalOutputString);
})();

function constructMaxHeap(heapElements) {
  const elementCount = heapElements.length;

  // Helper function to safely get the numeric value of an element at a given index.
  // Returns -Infinity for out-of-bounds indices to simplify comparisons.
  const getNumericValue = (index) => {
    if (index >= 0 && index < elementCount) {
      return Number(heapElements[index]);
    }
    return -Infinity;
  };

  // Helper function to swap two elements in the array.
  const performSwap = (idxA, idxB) => {
    const temporaryValue = heapElements[idxA];
    heapElements[idxA] = heapElements[idxB];
    heapElements[idxB] = temporaryValue;
  };

  // Recursively adjusts a subtree to satisfy the max-heap property.
  const heapifyNodeDown = (currentRootIndex) => {
    let indexWithLargestValue = currentRootIndex;
    const leftChildIdx = 2 * currentRootIndex + 1;
    const rightChildIdx = 2 * currentRootIndex + 2;

    const currentRootNumericValue = getNumericValue(currentRootIndex);
    const leftChildNumericValue = getNumericValue(leftChildIdx);
    const rightChildNumericValue = getNumericValue(rightChildIdx);

    // Check if the left child exists and is larger than the current root.
    if (leftChildIdx < elementCount && leftChildNumericValue > currentRootNumericValue) {
      indexWithLargestValue = leftChildIdx;
    }

    // Check if the right child exists and is larger than the current largest (which could be the left child).
    if (rightChildIdx < elementCount && rightChildNumericValue > getNumericValue(indexWithLargestValue)) {
      indexWithLargestValue = rightChildIdx;
    }

    // If the largest element is not the current root, swap them and continue heapifying down.
    if (indexWithLargestValue !== currentRootIndex) {
      performSwap(currentRootIndex, indexWithLargestValue);
      heapifyNodeDown(indexWithLargestValue);
    }
  };

  // Build the max-heap by iterating from the last non-leaf node up to the root.
  // The first index that could be a parent is Math.floor(elementCount / 2) for a 0-indexed array.
  const startingParentIndex = Math.floor(elementCount / 2);

  for (let parentIdx = startingParentIndex; parentIdx >= 0; parentIdx--) {
    heapifyNodeDown(parentIdx);
  }

  return heapElements;
}
