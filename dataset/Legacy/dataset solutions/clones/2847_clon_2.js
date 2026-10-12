console.log((inputData => {
  // Parse the input string: first line contains N, second line contains array elements.
  // All values are converted to integers.
  const [[countElements], dataArray] = inputData
    .trim()
    .split('\n')
    .map(rowString => rowString.split(' ').map(valueString => parseInt(valueString, 10)));

  // Sort the main array in descending order.
  dataArray.sort((firstValue, secondValue) => secondValue - firstValue);

  // Use a binary search-like approach to find the approximate split point
  // between non-negative and negative numbers.
  let leftIdx = 0;
  let rightIdx = countElements - 1;

  while (rightIdx - leftIdx > 1) {
    const midIdx = leftIdx + Math.floor((rightIdx - leftIdx) / 2); // Calculate middle index
    if (dataArray[midIdx] < 0) {
      rightIdx = midIdx; // If middle element is negative, search in the left half (including mid)
    } else {
      leftIdx = midIdx; // If middle element is non-negative, search in the right half (including mid)
    }
  }

  // Initialize a list to store the sequence of operations.
  const operationsList = [];

  // Initialize the two accumulators with the largest and smallest elements from the sorted array.
  let currentSum = dataArray[0]; // The largest element (A[0])
  let currentDiff = dataArray[dataArray.length - 1]; // The smallest element (A[N-1])

  // Create two sub-arrays:
  // positivePart: elements from index 1 up to (but not including) rightIdx.
  //               These are typically positive or zero, excluding the largest.
  // negativePart: elements from rightIdx up to (but not including) the last element.
  //               These are typically negative, excluding the smallest.
  const positivePart = dataArray.slice(1, rightIdx);
  const negativePart = dataArray.slice(rightIdx, dataArray.length - 1);

  // Process elements from the 'positivePart' array.
  // Subtract each element from 'currentDiff'.
  while (positivePart.length > 0) {
    const elementToSubtract = positivePart.pop(); // Get the last element
    operationsList.push(`${currentDiff} ${elementToSubtract}`); // Record the operation
    currentDiff -= elementToSubtract; // Update currentDiff
  }

  // Perform the operation involving the largest element and the accumulated 'currentDiff'.
  operationsList.push(`${currentSum} ${currentDiff}`);
  currentSum -= currentDiff; // Update currentSum

  // Process elements from the 'negativePart' array.
  // Subtract each element from 'currentSum'.
  while (negativePart.length > 0) {
    const elementToSubtract = negativePart.pop(); // Get the last element
    operationsList.push(`${currentSum} ${elementToSubtract}`); // Record the operation
    currentSum -= elementToSubtract; // Update currentSum
  }

  // Return the final accumulated value followed by the list of operations, each on a new line.
  return `${currentSum}\n` + operationsList.join('\n');

})(require('node:fs').readFileSync('/dev/stdin', 'utf8')));
