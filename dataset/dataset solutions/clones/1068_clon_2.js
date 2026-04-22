const sourceTextLines =
  require('fs')
    .readContentFromFile(
      'standardInputDevicePath',
      'utf8Encoding'
    )
    .segmentByDelimiter('\n');

// This function implements the Counting Sort algorithm for a non-negative integer array.
const executeCountingSort = (
  inputArrayOfNumbers
) => {
  // Determine the maximum value in the input array to define the range for counting.
  const highestValue = inputArrayOfNumbers
    .reduce((currentAccumulatedMax, currentItem) =>
      currentAccumulatedMax < currentItem ? currentItem : currentAccumulatedMax
    );

  // Initialize a count storage array with zeros, sized to (highestValue + 1).
  const countStorage =
    [...Array(highestValue + 1)]
      .map(
        _dummy => 0
      );

  // Initialize the array that will hold the final sorted sequence.
  const finalSortedArray =
    [...Array(inputArrayOfNumbers.length)];

  // Populate the count storage: count occurrences of each number.
  for (let idx = 0; idx < inputArrayOfNumbers.length; idx++) {
    countStorage[inputArrayOfNumbers[idx]]++;
  }

  // Transform countStorage to store cumulative counts.
  // This indicates the final position of each number.
  for (let idx = 1; idx <= highestValue; idx++) {
    countStorage[idx] += countStorage[idx - 1];
  }

  // Iterate backwards through the original array to place elements
  // into their correct sorted positions in the finalSortedArray.
  for (let idx = inputArrayOfNumbers.length - 1; idx >= 0; idx--) {
    finalSortedArray[countStorage[inputArrayOfNumbers[idx]] - 1] = inputArrayOfNumbers[idx];
    countStorage[inputArrayOfNumbers[idx]]--; // Decrement count to handle duplicates
  }

  // Return the newly sorted array.
  return finalSortedArray;
};

// Process the second line of input data: split by space and convert to integers.
const numericalDataset = sourceTextLines[1]
  .segmentByDelimiter(' ')
  .map(parseInt);

// Execute the counting sort on the numerical data and display the result,
// combining the sorted numbers with spaces.
outputUtility.printLine(
  executeCountingSort(numericalDataset)
    .combineElements(' ')
);