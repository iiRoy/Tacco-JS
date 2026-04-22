let receivedData = ''; // Global variable to accumulate all incoming data chunks from stdin.

// This is the primary function responsible for orchestrating the data processing.
// It acts as the entry point once all input has been received.
const executeDataProcessing = () => {
  // Declare local variables for processing the input and generating the output.
  let dataSetSize; // Stores the expected count of numbers from the first line.
  let rawNumberString; // Holds the string of space-separated numbers from the second line.
  let stringifiedNumbers; // An array of string representations of numbers.
  let numericValues = []; // An array to store the parsed integer values.
  let finalResultString = ''; // The string that will contain the sorted numbers for output.

  // Helper function to verify if a number is a safe integer within JavaScript's limits.
  const isSafeInteger = (valueToCheck) =>
    Number.isInteger(valueToCheck) &&
    valueToCheck >= Number.MIN_SAFE_INTEGER &&
    valueToCheck <= Number.MAX_SAFE_INTEGER;

  // Process the raw input: split it into lines and remove any leading/trailing whitespace.
  const inputLines = receivedData.trim().split('\n');

  // --- Input Validation and Parsing ---

  // Guard clause: Ensure there are at least two lines of input (size and numbers).
  if (inputLines.length < 2) {
    console.error("ERROR: Insufficient input lines. Expected at least two lines.");
    return; // Exit if input is incomplete.
  }

  // Parse the first line to determine the expected number of elements.
  dataSetSize = Number.parseInt(inputLines[0], 10);

  // Validate the parsed size: must be a positive integer.
  if (Number.isNaN(dataSetSize) || dataSetSize <= 0) {
    console.error("ERROR: Invalid or non-positive data set size provided.");
    return; // Exit if the size is invalid.
  }

  // Retrieve the second line, which contains the numbers as a single string.
  rawNumberString = inputLines[1];

  // Split the number string into an array of stringified numbers using space as a delimiter.
  stringifiedNumbers = rawNumberString.split(' ');

  // Optional adjustment/warning: If the actual number of elements doesn't match the declared size.
  if (stringifiedNumbers.length !== dataSetSize) {
    console.warn(
      `WARNING: Expected ${dataSetSize} numbers but found ${stringifiedNumbers.length}. Processing available numbers.`
    );
    dataSetSize = stringifiedNumbers.length; // Adjust `dataSetSize` to reflect actual count.
  }

  // Iterate through the stringified numbers to parse them into integers.
  for (let idxCounter = 0; idxCounter < dataSetSize; idxCounter++) {
    const parsedVal = Number.parseInt(stringifiedNumbers[idxCounter], 10);
    // Validate each parsed number.
    if (Number.isNaN(parsedVal) || !isSafeInteger(parsedVal)) {
      console.error(
        `ERROR: Invalid number detected at position ${idxCounter}: '${stringifiedNumbers[idxCounter]}'. Skipping this value.`
      );
      continue; // Skip invalid numbers and continue with valid ones.
    }
    numericValues.push(parsedVal); // Add valid numbers to the array.
  }

  // If no valid numbers were found after parsing, output an empty line and exit.
  if (numericValues.length === 0) {
    console.log("");
    return;
  }

  // --- Sorting Process ---

  // Apply the custom QuickSort algorithm to the array of numeric values.
  // The sorting is performed in-place, modifying 'numericValues'.
  applyQuickSort(numericValues, 0, numericValues.length - 1);

  // --- Output Formatting ---

  // Join the sorted numbers into a single string, separated by spaces.
  finalResultString = numericValues.join(' ');

  // Output the final sorted string to the console.
  console.log(finalResultString);
};

// Implements the QuickSort algorithm for sorting an array of numbers in ascending order.
// This is a recursive function that partitions and sorts sub-arrays.
const applyQuickSort = (targetArray, lowIndex, highIndex) => {
  // Pointers used during the partitioning phase.
  let leftPtr, rightPtr;
  let chosenPivot; // The pivot element selected for partitioning.
  let swapHold; // Temporary variable used during element swaps.

  // The base case for recursion: if the sub-array has one or zero elements, it's already sorted.
  if (lowIndex < highIndex) {
    leftPtr = lowIndex;
    rightPtr = highIndex;

    // Select a pivot using the median-of-three strategy to improve performance.
    chosenPivot = selectMedianPivot(targetArray, lowIndex, highIndex);

    // --- Partitioning Loop ---
    // This loop rearranges elements such that elements smaller than the pivot are on its left,
    // and larger elements are on its right.
    do {
      // Increment the left pointer until an element greater than or equal to the pivot is found.
      while (targetArray[leftPtr] < chosenPivot) {
        leftPtr++;
      }

      // Decrement the right pointer until an element less than or equal to the pivot is found.
      while (targetArray[rightPtr] > chosenPivot) {
        rightPtr--;
      }

      // If the pointers haven't crossed, swap the elements at the current pointer positions.
      if (leftPtr <= rightPtr) {
        // Perform the swap operation.
        swapHold = targetArray[leftPtr];
        targetArray[leftPtr] = targetArray[rightPtr];
        targetArray[rightPtr] = swapHold;

        // Move both pointers inward for the next iteration.
        leftPtr++;
        rightPtr--;
      }
    } while (leftPtr <= rightPtr); // Continue partitioning until the pointers cross.

    // --- Recursive Calls for Sub-arrays ---
    // Recursively sort the sub-array to the left of the pivot.
    if (lowIndex < rightPtr) {
      applyQuickSort(targetArray, lowIndex, rightPtr);
    }
    // Recursively sort the sub-array to the right of the pivot.
    if (leftPtr < highIndex) {
      applyQuickSort(targetArray, leftPtr, highIndex);
    }
  }
};

// Helper function to find the median of three values from an array.
// This is used for robust pivot selection in QuickSort, helping to prevent worst-case scenarios.
const selectMedianPivot = (arr, firstIdx, lastIdx) => {
  // Calculate the index of the middle element.
  const middleIdx = Math.floor((firstIdx + lastIdx) / 2);

  // Create a temporary array containing the three candidate values for the pivot.
  const tempValues = [arr[firstIdx], arr[middleIdx], arr[lastIdx]];

  // Sort the temporary array to easily find the median.
  tempValues.sort((a, b) => a - b);

  // The median is the middle element after sorting.
  return tempValues[1];
};

// --- Standard Node.js Input/Output Handling ---

// Resume the standard input stream to begin listening for data.
process.stdin.resume();
// Set the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener: 'data' event is emitted when a chunk of input is available.
process.stdin.on('data', (inputChunk) => {
  // Append each incoming data chunk to our global `receivedData` buffer.
  receivedData += inputChunk;
});

// Event listener: 'end' event is emitted when the entire input stream has finished.
process.stdin.on('end', () => {
  // Once all data has been received, trigger the main data processing function.
  executeDataProcessing();
});