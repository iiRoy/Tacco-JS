(function executeProgram() { // This Immediately Invoked Function Expression (IIFE) serves as the main entry point for the application.

  /*
   * Read all input data from the standard input stream.
   * It's decoded as UTF-8, then any leading or trailing whitespace is removed.
   * Finally, the entire input is split into an array of strings, where each string represents a line.
   */
  const inputDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line of input is expected to be a number indicating the total count of elements.
  // We parse it to an integer and store it.
  const elementCount = Number(inputDataLines.shift());

  // The second line contains space-separated numeric values.
  // We extract this line and split it into an array of string elements.
  const dataElements = inputDataLines.shift().split(' ');

  // Call the primary function to transform the array into a max-heap structure.
  // After this call, 'dataElements' will be rearranged according to max-heap properties.
  constructLargestHeap(dataElements);

  /*
   * Format the heap-ordered array into a single string for output.
   * The 'reduce' method iterates through the array, concatenating each element
   * with a preceding space to form the final output string.
   */
  const outputString = dataElements.reduce(
    (accumulatorString, currentElement) => accumulatorString + ' ' + currentElement,
    '' // The initial value for the accumulator is an empty string.
  );

  // Print the resulting string, which represents the max-heap, to the console.
  console.log(outputString);

})(); // The IIFE is immediately invoked.


/**
 * Transforms a given array into a max-heap.
 * A max-heap is a complete binary tree where the value of each node is greater than or equal
 * to the value of its children.
 * @param {Array<string>} collectionOfNumbers - The array of numbers (as strings) to be heapified.
 */
function constructLargestHeap(collectionOfNumbers) {
  // Retrieve the total number of items in the collection.
  const totalElements = collectionOfNumbers.length;

  let leftChildIndex, // Index of the left child node.
    rightChildIndex, // Index of the right child node.
    maxIndex; // Index of the largest element among a parent and its children.

  /**
   * An inner helper function that maintains the max-heap property for a subtree rooted at `currentIndex`.
   * It assumes that the children of `currentIndex` are already valid max-heaps.
   * @param {number} currentIndex - The index of the root of the subtree to heapify.
   */
  const heapifySubtree = (currentIndex) => {
    leftChildIndex = 2 * currentIndex + 1; // Calculate the index for the left child.
    rightChildIndex = 2 * currentIndex + 2; // Calculate the index for the right child.

    // Initially assume the current node is the largest among the three (parent, left, right).
    if (leftChildIndex < totalElements && Number(collectionOfNumbers[leftChildIndex]) > Number(collectionOfNumbers[currentIndex])) {
      maxIndex = leftChildIndex; // If left child is greater, it's the new largest.
    } else {
      maxIndex = currentIndex; // Otherwise, the current node remains the largest.
    }

    // Check if the right child exists and is greater than the current largest element identified so far.
    if (rightChildIndex < totalElements && Number(collectionOfNumbers[rightChildIndex]) > Number(collectionOfNumbers[maxIndex])) {
      maxIndex = rightChildIndex; // If right child is greater, it becomes the new largest.
    }

    // If the largest element is not the current node, a swap is necessary.
    // After swapping, recursively call heapify on the affected subtree to ensure
    // the max-heap property is restored down the tree.
    if (maxIndex !== currentIndex) {
      // Utilize array destructuring for an efficient swap of elements.
      [collectionOfNumbers[currentIndex], collectionOfNumbers[maxIndex]] =
      [collectionOfNumbers[maxIndex], collectionOfNumbers[currentIndex]];

      heapifySubtree(maxIndex); // Recursively fix the subtree rooted at the swapped child.
    }
  };

  // The main loop to build the max-heap.
  // It iterates from the last non-leaf node up to the root (index 0).
  // By processing nodes in reverse order, we ensure that when `heapifySubtree` is called,
  // its child subtrees are already valid max-heaps.
  for (let idx = Math.floor(collectionOfNumbers.length / 2 - 1); idx >= 0; idx--) {
    heapifySubtree(idx); // Apply the heapify operation to each parent node.
  }
}