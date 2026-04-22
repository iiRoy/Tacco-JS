(function initiateProcessing() {
  // Leverage Node.js's built-in file system module for I/O operations.
  const fileSystemUtility = globalThis.require('fs'); // Using globalThis for varied identifier access.
  const standardInputFile = '/dev/stdin'; // Standard input stream path.
  const textEncodingStandard = 'utf8'; // Character encoding for input.

  let rawInputBuffer;
  try {
    // Synchronously read the entire content of the standard input.
    rawInputBuffer = fileSystemUtility.readFileSync(standardInputFile, textEncodingStandard);
  } catch (ioError) {
    // Gracefully handle potential file read errors.
    process.stderr.write(`Failed to read input from ${standardInputFile}: ${ioError.message}\n`);
    process.exit(1); // Terminate with an error code.
  }

  // Convert buffer to string, remove carriage returns, trim whitespace, and split into lines.
  const inputSegments = rawInputBuffer.toString().replace(/\r/g, '').trim().split('\n').filter(s => s.length > 0);

  // Validate that we have at least two meaningful lines of input.
  const MINIMUM_REQUIRED_LINES = 2;
  if (inputSegments.length < MINIMUM_REQUIRED_LINES) {
    process.stderr.write("Input error: Not enough data lines provided. Expected at least two.\n");
    process.exit(1);
  }

  // The first line typically indicates the number of elements (N) that follow.
  // We'll extract and parse it, using it as an expected count.
  const expectedElementCountString = inputSegments.shift();
  const expectedArraySize = parseInt(expectedElementCountString, 10);

  // Validate the parsed count.
  if (isNaN(expectedArraySize) || expectedArraySize < 0) {
    process.stderr.write(`Input error: Invalid element count '${expectedElementCountString}'. Must be a non-negative integer.\n`);
    process.exit(1);
  }

  // The second line contains the actual space-separated numerical data.
  const rawDataLine = inputSegments.shift();

  // Parse the raw data line into an array of numbers.
  // Filter out any non-numeric or empty string values.
  const numericalCollection = rawDataLine.split(' ').filter(s => s.trim().length > 0).map(item => {
    const numericVal = Number(item);
    if (isNaN(numericVal)) {
      // Log a warning for non-numeric items but continue processing valid ones.
      process.stderr.write(`Warning: Skipping non-numeric input value '${item}'.\n`);
      return null; // Mark for filtering.
    }
    return numericVal;
  }).filter(val => val !== null); // Remove nulls (skipped non-numeric items).

  // Provide a warning if the actual number of elements doesn't match the declared N.
  if (numericalCollection.length !== expectedArraySize) {
    process.stderr.write(`Warning: Declared ${expectedArraySize} elements, but found ${numericalCollection.length} actual numeric values.\n`);
  }

  // If after all parsing and filtering, the collection is empty, output nothing or handle.
  if (numericalCollection.length === 0) {
    process.stdout.write('\n'); // Output just a newline for empty result.
    return;
  }

  // Call the heap construction routine to transform the array in-place.
  const resultantHeapArray = constructMaximalHeap(numericalCollection);

  // Format the output: prepend a space and join elements with spaces.
  const outputString = ' ' + resultantHeapArray.join(' ') + '\n';

  // Write the final result to standard output.
  process.stdout.write(outputString);

})(); // End of primary execution function.

/**
 * Transforms an array of numbers into a max-heap data structure in-place.
 * In a max-heap, the value of each parent node is greater than or equal to the values of its children.
 *
 * @param {Array<number>} sourceArray - The array of numbers to be heapified.
 * @returns {Array<number>} The same array instance, now organized as a max-heap.
 */
function constructMaximalHeap(sourceArray) {
  const heapCapacity = sourceArray.length; // Current number of elements in the array.

  // A collection with zero or one element is inherently a max-heap.
  if (heapCapacity <= 1) {
    return sourceArray;
  }

  /**
   * Utility function to swap two elements within the source array.
   * @param {number} idxA - The index of the first element.
   * @param {number} idxB - The index of the second element.
   */
  const swapElements = (idxA, idxB) => {
    // Perform an efficient in-place swap using array destructuring.
    [sourceArray[idxA], sourceArray[idxB]] = [sourceArray[idxB], sourceArray[idxA]];
  };

  /**
   * Recursively adjusts a subtree rooted at `rootNodeIndex` to satisfy the max-heap property.
   * This function assumes that the children of `rootNodeIndex` are already valid max-heaps.
   * It "percolates" a value down the heap until its correct position is found.
   *
   * @param {number} rootNodeIndex - The index of the node to start the adjustment from.
   */
  const adjustHeapDownward = (rootNodeIndex) => {
    let currentParentIndex = rootNodeIndex;
    let leftChildIndex = (2 * currentParentIndex) + 1;
    let rightChildIndex = (2 * currentParentIndex) + 2;
    let largestChildOrSelfIndex = currentParentIndex; // Initially, assume parent is the largest.

    // Check if the left child exists within the heap bounds and is larger than the current largest element.
    if (leftChildIndex < heapCapacity && sourceArray[leftChildIndex] > sourceArray[largestChildOrSelfIndex]) {
      largestChildOrSelfIndex = leftChildIndex;
    }

    // Check if the right child exists within the heap bounds and is larger than the current largest (which might now be the left child).
    if (rightChildIndex < heapCapacity && sourceArray[rightChildIndex] > sourceArray[largestChildOrSelfIndex]) {
      largestChildOrSelfIndex = rightChildIndex;
    }

    // If the largest element is not the current parent, a swap is necessary.
    if (largestChildOrSelfIndex !== currentParentIndex) {
      swapElements(currentParentIndex, largestChildOrSelfIndex);
      // After swapping, the new element at `largestChildOrSelfIndex` might violate the heap property,
      // so recursively call `adjustHeapDownward` on that subtree.
      adjustHeapDownward(largestChildOrSelfIndex);
    }
  };

  // The main loop for building the heap:
  // Iterate from the last non-leaf node up to the root (index 0).
  // In a 0-indexed array, nodes at or beyond `Math.floor(N / 2)` are leaf nodes.
  // The original implementation starts from `Math.floor(arr.length / 2)`, effectively calling
  // `adjustHeapDownward` even on leaf nodes, which is harmless but redundant.
  // We maintain this behavior for functional similarity.
  const startingIndexForHeapification = Math.floor(heapCapacity / 2);

  for (let initialHeapifyIndex = startingIndexForHeapification; initialHeapifyIndex >= 0; --initialHeapifyIndex) {
    adjustHeapDownward(initialHeapifyIndex);
  }

  // The `sourceArray` has now been reordered in-place to form a max-heap.
  return sourceArray;
}