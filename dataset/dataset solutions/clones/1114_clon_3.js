(function runMainProcess() {
  // A utility function to safely parse an integer from a string.
  // It handles potential non-numeric inputs by returning a default value (or NaN if not provided).
  const parseNumericInput = (lineValue, defaultValue = 0) => {
    const parsedValue = parseInt(lineValue, 10);
    // Return the parsed value if it's a valid non-negative number, otherwise the default.
    return (isNaN(parsedValue) || parsedValue < 0) ? defaultValue : parsedValue;
  };

  // A helper function to perform an in-place swap of two elements in an array.
  const performSwap = (targetArray, indexA, indexB) => {
    // Utilize array destructuring for an elegant swap operation.
    [targetArray[indexA], targetArray[indexB]] = [targetArray[indexB], targetArray[indexA]];
  };

  // --- Input Data Acquisition ---
  let rawInputSegments;
  try {
    // Attempt to read the entire content from standard input, decode as UTF-8,
    // remove leading/trailing whitespace, and split into individual lines.
    rawInputSegments = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  } catch (inputReadError) {
    // Log an error if reading from stdin fails, and terminate execution.
    console.error("Failed to read input from /dev/stdin:", inputReadError.message);
    return;
  }

  // Basic validation: ensure at least two lines of input are present (size + elements).
  if (rawInputSegments.length < 2) {
    console.error("Insufficient input data. Expected at least two lines (array size and elements).");
    return;
  }

  // Extract the declared count of elements from the first line.
  let declaredElementCount = parseNumericInput(rawInputSegments.shift());

  // Parse the second line into an array of numbers.
  // Non-numeric tokens are converted to NaN and then filtered out.
  let numericSequence = rawInputSegments.shift()
                                        .split(' ')
                                        .map(item => parseNumericInput(item, NaN)) // Map to NaN if invalid
                                        .filter(item => !isNaN(item)); // Remove NaN entries

  // --- Input Data Validation and Adjustment ---
  // Handle cases where no valid elements are parsed or declared count is zero/negative.
  if (declaredElementCount <= 0 || numericSequence.length === 0) {
    console.log(""); // Output an empty line, as no elements to process.
    return;
  }

  // If the number of actual parsed elements differs from the declared count,
  // issue a warning or adjust the array as appropriate for robust processing.
  if (numericSequence.length < declaredElementCount) {
    console.warn(`Warning: Actual elements parsed (${numericSequence.length}) are fewer than declared (${declaredElementCount}). Processing might be affected.`);
    // In this scenario, `formMaxHeapStructure` will use `declaredElementCount` as its boundary,
    // and `restoreHeapProperty` will handle `undefined` values if it tries to access beyond `numericSequence.length`.
  } else if (numericSequence.length > declaredElementCount) {
    console.warn(`Warning: Actual elements parsed (${numericSequence.length}) exceed declared (${declaredElementCount}). Truncating sequence.`);
    // Truncate the array to match the declared size. This ensures consistency.
    numericSequence = numericSequence.slice(0, declaredElementCount);
  }

  // --- Heap Construction ---
  // Transform the numeric sequence into a max-heap structure in-place.
  formMaxHeapStructure(numericSequence, declaredElementCount);

  // --- Output Generation ---
  // Construct the final output string by joining the heapified elements with spaces.
  // The `reduce` method is used, starting with an empty string, then prepending a space.
  // `trim()` is used to remove any leading space from the very first element.
  const formattedResultString = numericSequence.reduce((accumulator, currentVal) => {
    return `${accumulator} ${currentVal}`;
  }, '').trim();

  // Print the resulting space-separated sequence to standard output.
  console.log(formattedResultString);

})() ; // End of the main program execution block.


/**
 * @function formMaxHeapStructure
 * @description Converts a given array into a max-heap.
 *              A max-heap property dictates that the value of each node is
 *              greater than or equal to the values of its children.
 * @param {number[]} dataArray - The array of numbers to be transformed into a max-heap.
 * @param {number} effectiveArraySize - The number of elements in the array to consider for heap operations.
 */
function formMaxHeapStructure(dataArray, effectiveArraySize) {

  /**
   * @function restoreHeapProperty
   * @description Recursively adjusts a subtree rooted at 'rootNodeIndex' to satisfy the max-heap property.
   *              It assumes that the children's subtrees (if any) are already valid max-heaps.
   * @param {number} rootNodeIndex - The index of the current node to heapify down from.
   */
  const restoreHeapProperty = (rootNodeIndex) => {
    // Guard against invalid indices.
    if (rootNodeIndex < 0 || rootNodeIndex >= effectiveArraySize) {
        return;
    }

    let indexOfLargestElement = rootNodeIndex; // Initially, assume the current root is the largest.
    const leftChildPosition = 2 * rootNodeIndex + 1;
    const rightChildPosition = 2 * rootNodeIndex + 2;

    // Compare with the left child to find the largest.
    // Ensure the left child exists within the effective array bounds and is larger.
    if (leftChildPosition < effectiveArraySize && dataArray[leftChildPosition] > dataArray[indexOfLargestElement]) {
      indexOfLargestElement = leftChildPosition;
    }

    // Compare with the right child.
    // Ensure the right child exists within the effective array bounds and is larger than the current largest.
    if (rightChildPosition < effectiveArraySize && dataArray[rightChildPosition] > dataArray[indexOfLargestElement]) {
      indexOfLargestElement = rightChildPosition;
    }

    // If the largest element is not the current root, a swap is necessary.
    // After swapping, recursively call restoreHeapProperty on the affected subtree.
    if (indexOfLargestElement !== rootNodeIndex) {
      performSwap(dataArray, rootNodeIndex, indexOfLargestElement); // Use the shared swap utility.
      restoreHeapProperty(indexOfLargestElement); // Continue heapifying down.
    }
  };

  // Iterate from the last non-leaf node up to the root (index 0).
  // Leaf nodes are inherently single-element heaps, so we start heapifying from their parents.
  // The last non-leaf node is at index `floor(effectiveArraySize / 2) - 1`.
  // This loop structure is a correction from the original's potentially incorrect starting point.
  for (let currentIdx = Math.floor(effectiveArraySize / 2) - 1; currentIdx >= 0; currentIdx--) {
    restoreHeapProperty(currentIdx);
  }
}