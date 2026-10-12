(function entryPoint() {
  // This immediately invoked function expression serves as the main entry point for the script.
  // It reads input, processes it, and prints the result.

  // Read all lines from standard input, decode as UTF-8, remove leading/trailing whitespace,
  // and split the content into an array of strings based on newline characters.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line of input is typically 'n', representing the number of elements.
  // Although it's shifted and converted to a number, its value isn't explicitly used later in this specific problem's logic.
  const countElements = Number(inputLines.shift());

  // The second line of input contains space-separated numbers.
  // These are split into an array of strings, then each string is converted to a Number.
  // The resulting array of numbers is then passed to the heap construction function.
  // Finally, the modified array (now a max heap) is joined back into a space-separated string,
  // prefixed with an additional space, and printed to the console.
  console.log(' ' + constructMaxBinaryHeap(inputLines.shift().split(' ').map(Number)).join(' '));
})(); // End of the main execution block.


/**
 * Transforms a given array into a max heap in-place.
 * A max heap is a complete binary tree where the value of each parent node is
 * greater than or equal to the values of its child nodes.
 *
 * @param {Array<number>} dataArray - The array of numerical values to be heapified.
 * @returns {Array<number>} The same array instance, now organized as a max heap.
 */
function constructMaxBinaryHeap(dataArray) {
  const arraySize = dataArray.length; // Store the current size of the array for efficient access.

  /**
   * Performs the "heapify-down" operation on a subtree rooted at a specified index.
   * This function ensures that the subtree rooted at 'currentIndex' satisfies the max heap property.
   * If a child is larger than the parent, they are swapped, and the process is recursively applied
   * to the child's subtree.
   *
   * @param {number} currentIndex - The index of the node to start the heapify-down process from.
   */
  const heapifyDown = (currentIndex) => {
    let leftChildIndex, rightChildIndex, largestElementIndex;

    // Calculate the indices of the left and right children based on the current node's index.
    leftChildIndex = 2 * currentIndex + 1;
    rightChildIndex = 2 * currentIndex + 2;

    // Initially assume the current node is the largest among itself and its children.
    // Check if the left child exists and is larger than the current node.
    if (leftChildIndex < arraySize && dataArray[leftChildIndex] > dataArray[currentIndex]) {
      largestElementIndex = leftChildIndex;
    } else {
      largestElementIndex = currentIndex;
    }

    // Check if the right child exists and is larger than the current 'largestElementIndex'.
    if (rightChildIndex < arraySize && dataArray[rightChildIndex] > dataArray[largestElementIndex]) {
      largestElementIndex = rightChildIndex;
    }

    // If the largest element is not the current node, a swap is necessary.
    // After swapping, recursively call heapifyDown on the subtree where the swap occurred
    // to maintain the max heap property.
    if (largestElementIndex !== currentIndex) {
      // This is a common JavaScript idiom for swapping two array elements without a temporary variable.
      // It assigns dataArray[currentIndex] to dataArray[largestElementIndex]
      // and the original dataArray[largestElementIndex] to dataArray[currentIndex].
      dataArray[largestElementIndex] = [dataArray[currentIndex], dataArray[currentIndex] = dataArray[largestElementIndex]][0];
      heapifyDown(largestElementIndex); // Continue heapifying down from the swapped child.
    }
  };

  // The heap construction process starts from the last non-leaf node and proceeds upwards to the root.
  // For a 0-indexed array, the parent of the last element is at index floor((arraySize - 1 - 1) / 2).
  // The loop iterates from the first node that could potentially have children (or be a parent)
  // down to the root (index 0).
  for (let currentIndex = Math.floor(dataArray.length / 2); currentIndex >= 0; currentIndex--) {
    heapifyDown(currentIndex); // Apply the heapify-down operation to each node.
  }

  return dataArray; // Return the array, which is now a max heap.
}
