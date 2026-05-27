(function executeProgram() {
  // Read input from standard input, decode as UTF-8, trim whitespace, and split into an array of lines.
  const inputDataRows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line contains an integer, which is consumed but not used in this specific logic.
  const firstLineValue = Number(inputDataRows.shift());

  // Process the remaining line (which contains space-separated numbers) to build a max heap.
  // The result is then joined with spaces and printed to the console, prefixed with a space.
  console.log(' ' + createMaxHeap(inputDataRows.shift().split(' ')).join(' '));
})();

/**
 * Converts an array into a max heap in-place.
 * A max heap is a complete binary tree where the value of each node is greater than or equal to the value of its children.
 *
 * @param {string[]} elementCollection - The array of string numbers to be converted into a max heap.
 * @returns {string[]} The array representing the max heap.
 */
function createMaxHeap(elementCollection) {
  const collectionSize = elementCollection.length;

  /**
   * Performs the "sift-down" operation to maintain the max heap property.
   * This function assumes that the children of the node at `rootIndex` are already max heaps.
   *
   * @param {number} rootIndex - The index of the node to heapify.
   */
  const siftDown = (rootIndex) => {
    let leftNodeIdx, rightNodeIdx, maxIdx = rootIndex; // Initialize maxIdx with the current root.

    // Calculate indices of left and right children.
    leftNodeIdx = 2 * rootIndex + 1;
    rightNodeIdx = 2 * rootIndex + 2;

    // If the left child exists and is greater than the current largest element, update maxIdx.
    if (leftNodeIdx < collectionSize && Number(elementCollection[leftNodeIdx]) > Number(elementCollection[maxIdx])) {
      maxIdx = leftNodeIdx;
    }

    // If the right child exists and is greater than the current largest element, update maxIdx.
    if (rightNodeIdx < collectionSize && Number(elementCollection[rightNodeIdx]) > Number(elementCollection[maxIdx])) {
      maxIdx = rightNodeIdx;
    }

    // If the largest element is not the current root, swap them and recursively call siftDown on the affected subtree.
    if (maxIdx !== rootIndex) {
      // Swap elements using a concise array destructuring trick.
      elementCollection[maxIdx] = [elementCollection[rootIndex], elementCollection[rootIndex] = elementCollection[maxIdx]][0];
      siftDown(maxIdx); // Recursively heapify the affected child subtree.
    }
  };

  // Build the max heap by starting from the last non-leaf node and moving up to the root.
  // The loop iterates from the parent of the last element down to the root (index 0).
  for (let currentParentIdx = Math.floor(elementCollection.length / 2) - 1; currentParentIdx >= 0; currentParentIdx--) {
    siftDown(currentParentIdx); // Apply siftDown to each parent node.
  }

  return elementCollection; // Return the heapified array.
}
