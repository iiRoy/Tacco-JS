const findLargestIndex = (dataCollection) => {
  // This function identifies the position of the largest BigInt element within a given array.
  let greatestValue = -1n; // Initialize with a BigInt value that is guaranteed to be smaller than any valid positive BigInt.
  let position = -1;       // Initialize the index to an invalid value.

  // Traverse through each item in the provided collection.
  for (let iterator = 0; iterator < dataCollection.length; iterator++) {
    // If the current element is numerically larger than the current greatest value found so far.
    if (dataCollection[iterator] > greatestValue) {
      greatestValue = dataCollection[iterator]; // Update the record for the greatest value.
      position = iterator;                      // Store the index where this new greatest value was found.
    }
  }

  return position; // Return the final index of the largest element.
};

const executeProgram = (rawData) => {
  // Pre-process the raw input string: remove leading/trailing whitespace and split into individual lines.
  rawData = rawData.trim().split('\n');

  // Extract the second line of input, split it by spaces, and convert each part into a BigInt.
  const numericValues = rawData[1].split(' ').map(element => BigInt(element));

  // Arrange the BigInts in descending order (from largest to smallest).
  numericValues.sort((a, b) => b - a);

  // Initialize the primary result array with the very first (largest) number from the sorted list.
  let resultArray = [numericValues.shift()];

  // Initialize a BigInt accumulator for the final sum.
  let totalSum = 0n;

  // Continue processing as long as there are numbers remaining in the sorted list.
  while (numericValues.length > 0) {
    const currentNumber = numericValues.shift(); // Retrieve the next largest number from the sorted list.

    // Determine the index of the largest element currently present in the resultArray.
    const insertionPoint = findLargestIndex(resultArray);

    // Add the value at the identified insertion point in resultArray to the running total sum.
    totalSum += resultArray[insertionPoint];

    // Construct a new resultArray by inserting the currentNumber twice
    // around the element at the 'insertionPoint'.
    resultArray = [
      ...resultArray.slice(0, insertionPoint), // Elements before the insertion point.
      currentNumber,                           // First instance of the current number.
      currentNumber,                           // Second instance of the current number.
      ...resultArray.slice(insertionPoint + 1) // Elements after the insertion point.
    ];
  }

  // Output the final calculated sum to the standard console.
  console.log(`${totalSum}`);
};

// Conditional execution: if the 'MYTEST' environment variable is set,
// invoke the 'test()' function (assumed to be globally defined for testing).
// Otherwise, execute the main program logic by reading input from stdin.
process.env.MYTEST
  ? test()
  : executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
