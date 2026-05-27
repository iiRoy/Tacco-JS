function processInputData(rawDataString) {
  // Split the entire input string into individual lines.
  const lineSegments = rawDataString.split('\n');

  // The first line contains space-separated numbers.
  const numberSequenceStr = lineSegments[0];

  // The second line contains the integer representing the number of iterations.
  const iterationCount = parseInt(lineSegments[1]);

  // Convert the string of numbers into an array of integers.
  let numericValues = numberSequenceStr.split(' ').map(singleNumberStr => parseInt(singleNumberStr));

  // Perform the doubling operation for the specified number of iterations.
  for (let loopIndex = 0; loopIndex < iterationCount; loopIndex++) {
    numericValues = multiplyLargestElement(numericValues);
  }

  // The original code had a commented-out line for logging the sum.
  // We preserve this as a comment to maintain the Type II clone definition.
  // console.log(numericValues.reduce((accumulator, currentElement) => accumulator + currentElement));
}

/**
 * Finds the largest element in an array and doubles its value, returning a new array.
 * @param {number[]} numericValues - The array of numbers to process.
 * @returns {number[]} A new array with the largest element doubled.
 */
function multiplyLargestElement(numericValues) {
  // Create a shallow copy of the input array to avoid modifying the original directly.
  const modifiedCollection = numericValues.concat();

  // Determine the maximum value present in the array.
  const greatestValue = Math.max.apply(null, numericValues);

  // Find the index of the first occurrence of the maximum value.
  const positionOfMax = modifiedCollection.indexOf(greatestValue);

  // Double the value at the identified position.
  modifiedCollection[positionOfMax] = greatestValue * 2;

  // Return the array with the modified element.
  return modifiedCollection;
}

// Execute the primary function by reading input from standard input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
