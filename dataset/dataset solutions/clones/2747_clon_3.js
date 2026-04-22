function ProcessInputData(rawDataString) {
  // Split the entire input string into an array of individual lines.
  const linesOfData = rawDataString.split('\n');

  // The first line contains the count of elements.
  // Convert it to a number. Add validation for non-numeric or negative input.
  const elementCount = Number(linesOfData[0]);
  if (isNaN(elementCount) || elementCount < 0) {
    console.log('Error: Provided element count is invalid or negative.');
    return; // Exit if the count is not a valid positive number.
  }

  // The second line contains the space-separated numeric sequence.
  // Split it and map each string part to a number.
  let numericSequence = linesOfData[1].split(' ').map(valStr => Number(valStr));

  // For the circular XOR property check to be meaningful, we need at least 3 elements.
  // If fewer elements are present, the condition cannot be satisfied in a circular sense.
  if (elementCount < 3) {
    console.log('No');
    return;
  }

  // Helper function to determine if the XOR property holds for a given element
  // in a circular array.
  const verifyXORProperty = (arr, currentIdx, totalCount) => {
    // Calculate the index of the element preceding the current one,
    // ensuring circularity (e.g., for index 0, the predecessor is the last element).
    const previousIdx = (currentIdx - 1 + totalCount) % totalCount;

    // Calculate the index of the element succeeding the current one,
    // ensuring circularity (e.g., for the last element, the successor is index 0).
    const nextIdx = (currentIdx + 1) % totalCount;

    // The condition is met if the current element's value is equal to
    // the bitwise XOR sum of its circular neighbors.
    return (arr[previousIdx] ^ arr[nextIdx]) === arr[currentIdx];
  };

  // Initialize a boolean flag, assuming the condition holds true until a violation is found.
  let isConditionMet = true;

  // Iterate through every element in the sequence.
  for (let idx = 0; idx < elementCount; idx++) {
    // Check the XOR property for the current element using the helper function.
    // If the property does not hold, set the flag to false and terminate early.
    if (!verifyXORProperty(numericSequence, idx, elementCount)) {
      isConditionMet = false;
      break; // No need to check further, the condition is already violated.
    }
  }

  // Based on the final state of the flag, print the appropriate message.
  console.log(isConditionMet ? 'Yes' : 'No');
}

// Execute the processing function by reading input from standard input.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));