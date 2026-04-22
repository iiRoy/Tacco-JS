const programOptions = {
  dataPath: '/dev/stdin', // Path to the input data source
  lineBreakChar: '\n'     // Character used to separate lines
};

// Read input data from the file system, decode it, and split into individual lines
const dataRows = require('fs')
  .readFileSync(programOptions.dataPath, 'utf-8')
  .split(programOptions.lineBreakChar);

let swapTally = 0; // Initialize a counter for element movements

/**
 * Inserts an element into a sorted list while maintaining sorted order.
 * This function effectively "bubbles" the element to its correct position.
 * @param {number} valueToInsert - The numeric value to be inserted.
 * @param {Array<number>} remainingElements - The rest of the array, assumed to be sorted.
 * @returns {Array<number>} A new array with the value inserted in its sorted place.
 */
const placeElement = (valueToInsert, remainingElements) => {
  // If the remaining part of the array is empty, just return the value in a new array.
  if (remainingElements.length === 0) {
    return [valueToInsert];
  }

  const firstItem = remainingElements[0]; // Get the first element
  const arrayTail = remainingElements.slice(1); // Get the rest of the elements

  // Compare the value to insert with the first item of the remaining array
  if (valueToInsert < firstItem) {
    // If the value is smaller, it comes before the first item.
    // Recursively place the first item into the tail.
    return [valueToInsert].concat(placeElement(firstItem, arrayTail));
  } else {
    // If the value is larger or equal, the first item stays in place.
    // Increment the swap counter as an element is effectively "moved past".
    swapTally++;
    // Recursively place the original value to insert into the tail.
    return [firstItem].concat(placeElement(valueToInsert, arrayTail));
  }
};

/**
 * Recursively sorts an array using a bubble-like insertion method.
 * @param {Array<number>} inputCollection - The array to be sorted.
 * @returns {Array<number>} The sorted array.
 */
const recursiveSort = (inputCollection) => {
  // Base case: an array with 0 or 1 element is already sorted.
  if (inputCollection.length <= 1) {
    return inputCollection;
  }

  const firstEntry = inputCollection[0];      // Take the first element
  const subList = inputCollection.slice(1); // Take the rest of the elements

  // Recursively sort the sublist, then insert the first entry into the sorted sublist.
  return placeElement(firstEntry, recursiveSort(subList));
};

// Process the second line of input: split by space, convert to integers, sort, and join back with space.
console.log(
  recursiveSort(
    dataRows[1]
      .split(' ')
      .map(strVal => parseInt(strVal, 10))
  ).join(' ')
);

// Output the total number of swaps/movements counted during the sorting process.
console.log(swapTally);