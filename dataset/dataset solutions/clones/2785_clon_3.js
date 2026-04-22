function ProcessInputData(rawDataContent) {
  // Validate the raw input: ensure it's a non-empty string.
  if (typeof rawDataContent !== 'string' || rawDataContent.trim() === '') {
    console.error("Error: Provided input data is invalid or empty. Cannot proceed.");
    return;
  }

  // Split the entire input string by newline characters to get individual lines.
  const inputLines = rawDataContent.split('\n');

  // The first line typically contains metadata (like the count of elements),
  // which is not directly used in the core logic of this problem, similar to the original 'n' variable.
  // We can parse it if needed, but for this clone, it remains unused.
  // const elementCount = parseInt(inputLines[0].trim(), 10);

  // Ensure there's a second line containing the actual numeric data.
  if (inputLines.length < 2 || inputLines[1].trim() === '') {
    console.error("Error: Numeric data line is missing or empty in the input.");
    return;
  }

  // Extract the numeric strings from the second line, splitting by space.
  // `filter(Boolean)` removes any empty strings that might arise from multiple spaces.
  const stringRepresentations = inputLines[1].split(' ').filter(Boolean);

  // Convert all string representations into actual number types.
  const numericValues = stringRepresentations.map(Number);

  // Before sorting, check if there are enough elements for the final calculation.
  // The problem implies at least two elements for the middle difference.
  if (numericValues.length < 2) {
    console.log(0); // Output 0 or handle as an error if array is too small.
    return;
  }

  // Apply a custom merge sort algorithm to arrange the numbers in ascending order.
  const sortedNumericArray = performMergeSortAlgorithm(numericValues);

  // Determine the indices for the two middle elements in the sorted array.
  // For an array of length L, these are floor(L/2) - 1 and floor(L/2).
  const currentArrayLength = sortedNumericArray.length;
  const firstMiddleIndex = Math.floor(currentArrayLength / 2) - 1;
  const secondMiddleIndex = Math.floor(currentArrayLength / 2);

  // Retrieve the values at these calculated middle indices.
  const valueAtSecondMiddle = sortedNumericArray[secondMiddleIndex];
  const valueAtFirstMiddle = sortedNumericArray[firstMiddleIndex];

  // Output the difference between the two middle values.
  // Since the array is sorted, the second middle value will be greater than or equal to the first.
  console.log(valueAtSecondMiddle - valueAtFirstMiddle);
}

/**
 * Implements a recursive merge sort algorithm to sort an array of numbers.
 * This function orchestrates the division and merging steps.
 * @param {Array<number>} collectionToSort - The array of numbers that needs to be sorted.
 * @returns {Array<number>} A new array containing all elements from the input, sorted in ascending order.
 */
function performMergeSortAlgorithm(collectionToSort) {
  // Basic validation: ensure the input is an array.
  if (!Array.isArray(collectionToSort)) {
    console.error("Error: Merge sort function expects an array as input.");
    return [];
  }

  /**
   * Recursively divides an array segment into halves until it reaches base cases (0 or 1 element).
   * @param {Array<number>} currentSegment - The array segment currently being divided.
   * @returns {Array<number>} The sorted version of the current segment.
   */
  const divideAndSort = (currentSegment) => {
    // Base case: An array with 0 or 1 element is inherently sorted.
    if (currentSegment.length <= 1) {
      return currentSegment;
    }

    // Calculate the midpoint to split the segment into two halves.
    const splitPoint = Math.floor(currentSegment.length / 2);

    // Recursively call `divideAndSort` on the left and right halves.
    const leftHalfSorted = divideAndSort(currentSegment.slice(0, splitPoint));
    const rightHalfSorted = divideAndSort(currentSegment.slice(splitPoint));

    // Once the halves are sorted, merge them back together.
    return mergeTwoSortedArrays(leftHalfSorted, rightHalfSorted);
  };

  /**
   * Merges two already sorted arrays into a single, combined sorted array.
   * This implementation uses two pointers for efficient merging (linear time complexity).
   * @param {Array<number>} leftSource - The first sorted array.
   * @param {Array<number>} rightSource - The second sorted array.
   * @returns {Array<number>} A new array containing all elements from both input arrays, sorted.
   */
  const mergeTwoSortedArrays = (leftSource, rightSource) => {
    const combinedSortedArray = [];
    let leftCursor = 0; // Pointer for the left array
    let rightCursor = 0; // Pointer for the right array

    // Compare elements from both arrays and add the smaller one to the result.
    while (leftCursor < leftSource.length && rightCursor < rightSource.length) {
      if (leftSource[leftCursor] < rightSource[rightCursor]) {
        combinedSortedArray.push(leftSource[leftCursor]);
        leftCursor++;
      } else {
        combinedSortedArray.push(rightSource[rightCursor]);
        rightCursor++;
      }
    }

    // If there are any remaining elements in the left array, append them.
    while (leftCursor < leftSource.length) {
      combinedSortedArray.push(leftSource[leftCursor]);
      leftCursor++;
    }

    // If there are any remaining elements in the right array, append them.
    while (rightCursor < rightSource.length) {
      combinedSortedArray.push(rightSource[rightCursor]);
      rightCursor++;
    }

    return combinedSortedArray;
  };

  // Begin the sorting process by calling the recursive divide-and-sort function
  // with the initial unsorted collection.
  return divideAndSort(collectionToSort);
}

// Standard entry point for competitive programming environments (e.g., Node.js).
// Reads the entire content of standard input as a UTF-8 string.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));