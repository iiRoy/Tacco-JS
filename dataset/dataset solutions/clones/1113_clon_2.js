(function executeProgram() {
  // This section handles reading input from the standard input stream.
  const inputDataRows = require('fs').readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split('\n');

  // The first line of input typically contains the count of elements.
  // Although not directly used in the heap construction logic, it's consumed.
  const countOfElements = Number(inputDataRows.shift());

  // The subsequent line provides the space-separated elements that will form the array.
  const dataCollection = inputDataRows.shift().split(' ');

  // Initiate the process to transform the array into a max heap.
  constructBinaryHeap(dataCollection);

  // Output the elements of the now-heapified array, joined by single spaces.
  console.log(dataCollection.reduce((accumulatorString, currentElement) => accumulatorString + ' ' + currentElement, ''));
})();

/**
 * Converts a given array of string-represented numbers into a max heap structure in-place.
 * The heap property ensures that for any given node 'i', the value of node 'i' is
 * greater than or equal to the values of its children.
 *
 * @param {Array<string>} dataCollection - The array of string numbers to be heapified.
 */
function constructBinaryHeap(dataCollection) {
  const collectionSize = dataCollection.length;
  let leftChildIndex, rightChildIndex, maxElementIndex;

  /**
   * This helper function maintains the max heap property for a subtree rooted at 'currentIndex'.
   * It compares the node at 'currentIndex' with its children and swaps if necessary
   * to ensure the parent is the largest. This process is then recursively applied
   * to the affected child subtree.
   *
   * @param {number} currentIndex - The index of the root node of the subtree to heapify.
   */
  const heapifyDown = (currentIndex) => {
    leftChildIndex = 2 * currentIndex + 1; // Calculate index of the left child
    rightChildIndex = 2 * currentIndex + 2; // Calculate index of the right child

    // Determine which element among the current node and its children is the largest.
    // Initially assume the current node is the largest.
    if (leftChildIndex < collectionSize && Number(dataCollection[leftChildIndex]) > Number(dataCollection[currentIndex])) {
      maxElementIndex = leftChildIndex;
    } else {
      maxElementIndex = currentIndex;
    }

    // Compare with the right child to find the true largest.
    if (rightChildIndex < collectionSize && Number(dataCollection[rightChildIndex]) > Number(dataCollection[maxElementIndex])) {
      maxElementIndex = rightChildIndex;
    }

    // If the largest element is not the current node, a swap is required.
    if (maxElementIndex !== currentIndex) {
      // Perform the swap using a concise array destructuring trick.
      dataCollection[maxElementIndex] = [dataCollection[currentIndex], dataCollection[currentIndex] = dataCollection[maxElementIndex]][0];
      // Recursively call heapifyDown on the subtree where the swap occurred.
      heapifyDown(maxElementIndex);
    }
  };

  // The main loop to build the max heap.
  // It iterates from the last non-leaf node up to the root (index 0).
  // All nodes after Math.floor(dataCollection.length / 2 - 1) are leaf nodes,
  // and thus are already valid heaps of size 1.
  for (let currentIndex = Math.floor(dataCollection.length / 2 - 1); currentIndex >= 0; currentIndex--) {
    heapifyDown(currentIndex); // Apply heapifyDown to each non-leaf node.
  }
}
