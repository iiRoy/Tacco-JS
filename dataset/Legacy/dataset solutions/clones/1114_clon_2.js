(function executeProgram() {
  // Retrieve raw input data from standard input, decode it,
  // remove leading/trailing whitespace, and split it into an array of lines.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line of input contains the total number of elements.
  const elementCount = Number(inputLines.shift());

  // The second line contains the space-separated elements, which are then
  // converted to numbers and stored in an array.
  const dataArray = inputLines.shift().split(' ').map(Number);

  // Invoke the function to transform the array into a max-heap structure.
  constructBinaryHeap(dataArray, elementCount);

  // Format the heap elements into a single string, each preceded by a space,
  // and print it to the console.
  console.log(dataArray.reduce((accumulator, currentElement) => accumulator += ` ${currentElement}`, ''));
})();

/**
 * Transforms a given array into a max-heap.
 * A max-heap is a complete binary tree where the value of each node is
 * greater than or equal to the value of its children.
 *
 * @param {number[]} dataArray - The array of numbers to be heapified.
 * @param {number} elementCount - The effective size of the array to consider for heap operations.
 */
function constructBinaryHeap(dataArray, elementCount) {
  /**
   * Maintains the max-heap property for a subtree rooted at `currentIdx`.
   * If the node at `currentIdx` is smaller than its children, it's swapped
   * with the largest child, and the process continues recursively down the tree.
   *
   * @param {number} currentIdx - The index of the root of the subtree to heapify.
   */
  const heapifyDown = (currentIdx) => {
    let leftChildIdx, rightChildIdx, largestChildOrSelfIdx;

    // Calculate the indices of the left and right children in a 0-indexed array.
    leftChildIdx = 2 * currentIdx + 1;
    rightChildIdx = 2 * currentIdx + 2;

    // Assume the current node is the largest initially.
    // Then, check if the left child exists within the array bounds and is larger.
    largestChildOrSelfIdx = (leftChildIdx < elementCount && dataArray[leftChildIdx] > dataArray[currentIdx])
      ? leftChildIdx
      : currentIdx;

    // Check if the right child exists and is larger than the current largest (which could be
    // the current node or the left child).
    if (rightChildIdx < elementCount && dataArray[rightChildIdx] > dataArray[largestChildOrSelfIdx]) {
      largestChildOrSelfIdx = rightChildIdx;
    }

    // If the largest element is not the current node, a swap is necessary.
    if (largestChildOrSelfIdx !== currentIdx) {
      // Swap the current node with the largest child.
      // This uses array destructuring for a concise swap operation.
      [dataArray[currentIdx], dataArray[largestChildOrSelfIdx]] = [dataArray[largestChildOrSelfIdx], dataArray[currentIdx]];

      // Recursively call heapifyDown on the affected subtree to ensure the max-heap property is maintained.
      heapifyDown(largestChildOrSelfIdx);
    }
  };

  // Iterate through the array from a specific starting point down to the root (index 0).
  // The original algorithm iterates from `elementCount * 2` down to `0`.
  // For indices `idx >= elementCount`, `heapifyDown` will not perform any swaps
  // because `leftChildIdx` and `rightChildIdx` will be out of bounds (`< elementCount` will be false).
  // This loop structure is preserved as per Type II cloning rules.
  for (let idx = elementCount << 1; idx >= 0; --idx) {
    heapifyDown(idx);
  }
}
