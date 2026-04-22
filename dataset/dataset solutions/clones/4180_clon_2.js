function ProcessInput(sourceText) {
  // This function takes raw input string and performs a series of transformations
  // based on the numerical properties of the data.
  // It aims to reorder or modify elements to satisfy certain conditions.

  // Divide the complete input string into an array of individual lines.
  let linesOfData = sourceText.split('\n');

  // Extract the first numerical value from the first line,
  // which represents the total number of elements to process.
  const elementQuantity = parseInt(linesOfData[0].split(' ')[0], 10);

  // Split the second line of input into an array of strings,
  // each representing a number.
  const stringRepresentations = linesOfData[1].split(' ');

  // Initialize a main numerical array with a size determined by 'elementQuantity',
  // and fill all its positions with the value zero initially.
  let numericDataArray = new Array(elementQuantity).fill(0);

  // Prepare an empty array to log all the transformation operations performed.
  let transformationRecords = [];

  // Set initial boundary values for finding the highest and lowest numbers.
  // These are chosen to be outside the expected range of typical input.
  let maximumValueFound = -1000000; // Equivalent to -Math.pow(10, 6)
  let minimumValueFound = 1000000;  // Equivalent to Math.pow(10, 6)

  // Loop through the string representations to parse them into integers
  // and populate the 'numericDataArray'. During this process,
  // dynamically update the 'maximumValueFound' and 'minimumValueFound'.
  for (let currentPosition = 0; currentPosition < elementQuantity; currentPosition++) {
    numericDataArray[currentPosition] = parseInt(stringRepresentations[currentPosition], 10);
    maximumValueFound = Math.max(numericDataArray[currentPosition], maximumValueFound);
    minimumValueFound = Math.min(numericDataArray[currentPosition], minimumValueFound);
  }

  // The subsequent logic branches depend on the characteristics of the numbers
  // within the 'numericDataArray' (specifically, their signs and magnitudes).

  // Scenario 1: If all numbers in the array are non-negative (zero or positive).
  if (minimumValueFound >= 0) {
    // Iterate through the array from the beginning to the end.
    for (let currentPosition = 0; currentPosition < elementQuantity; currentPosition++) {
      // Check if the current element is smaller than its immediate predecessor.
      // This condition implies a need to enforce a non-decreasing order.
      if (currentPosition > 0 && numericDataArray[currentPosition] < numericDataArray[currentPosition - 1]) {
        // Record the operation: the index of the previous element and the current element.
        let singleOperation = [currentPosition, currentPosition + 1];
        transformationRecords.push(singleOperation);
        // Modify the current element by adding the value of its preceding element to it.
        numericDataArray[currentPosition] = numericDataArray[currentPosition - 1] + numericDataArray[currentPosition];
      }
    }
  }
  // Scenario 2: If all numbers in the array are negative.
  else if (maximumValueFound < 0) {
    // Iterate through the array in reverse order, from the end to the beginning.
    for (let currentPosition = elementQuantity - 1; currentPosition >= 0; currentPosition--) {
      // Check if the current element is larger than its immediate successor.
      // This condition implies a need to enforce a non-increasing order.
      if (currentPosition < elementQuantity - 1 && numericDataArray[currentPosition] > numericDataArray[currentPosition + 1]) {
        // Record the operation: the index of the next element and the current element.
        let singleOperation = [currentPosition + 1, currentPosition];
        transformationRecords.push(singleOperation);
        // Modify the current element by adding the value of its succeeding element to it.
        numericDataArray[currentPosition] = numericDataArray[currentPosition + 1] + numericDataArray[currentPosition];
      }
    }
  }
  // Scenario 3: Mixed positive and negative numbers,
  // where the absolute value of the maximum is greater than the absolute value of the minimum.
  else if (maximumValueFound > Math.abs(minimumValueFound)) {
    // First pass: Propagate the maximum value across the array.
    for (let currentPosition = 0; currentPosition < elementQuantity; currentPosition++) {
      // If the current element is not the maximum, apply a transformation involving the maximum.
      if (numericDataArray.indexOf(maximumValueFound) !== currentPosition) {
        // Record the operation: the index of the overall maximum and the current element.
        let singleOperation = [numericDataArray.indexOf(maximumValueFound), currentPosition];
        transformationRecords.push(singleOperation);
        // Add the overall maximum value to the current element.
        numericDataArray[currentPosition] = numericDataArray[currentPosition] + maximumValueFound;
      }
    }
    // Second pass: After propagating the maximum, ensure non-decreasing order (similar to Scenario 1).
    for (let currentPosition = 0; currentPosition < elementQuantity; currentPosition++) {
      if (currentPosition > 0 && numericDataArray[currentPosition] < numericDataArray[currentPosition - 1]) {
        // Record the operation: the index of the previous element and the current element.
        let singleOperation = [currentPosition, currentPosition + 1];
        transformationRecords.push(singleOperation);
        // Modify the current element by adding the value of its preceding element to it.
        numericDataArray[currentPosition] = numericDataArray[currentPosition - 1] + numericDataArray[currentPosition];
      }
    }
  }
  // Scenario 4: Mixed positive and negative numbers,
  // where the absolute value of the minimum is greater than the absolute value of the maximum.
  else if (Math.abs(minimumValueFound) > maximumValueFound) {
    // First pass: Propagate the minimum value across the array.
    for (let currentPosition = 0; currentPosition < elementQuantity; currentPosition++) {
      // If the current element is not the minimum, apply a transformation involving the minimum.
      if (numericDataArray.indexOf(minimumValueFound) !== currentPosition) {
        // Record the operation: the index of the overall minimum and the current element.
        let singleOperation = [numericDataArray.indexOf(minimumValueFound), currentPosition];
        transformationRecords.push(singleOperation);
        // Add the overall minimum value to the current element.
        numericDataArray[currentPosition] = numericDataArray[currentPosition] + minimumValueFound;
      }
    }
    // Second pass: After propagating the minimum, ensure non-increasing order (similar to Scenario 2).
    for (let currentPosition = elementQuantity - 1; currentPosition >= 0; currentPosition--) {
      if (currentPosition < elementQuantity - 1 && numericDataArray[currentPosition] > numericDataArray[currentPosition + 1]) {
        // Record the operation: the index of the next element and the current element.
        let singleOperation = [currentPosition + 1, currentPosition];
        transformationRecords.push(singleOperation);
        // Modify the current element by adding the value of its succeeding element to it.
        numericDataArray[currentPosition] = numericDataArray[currentPosition + 1] + numericDataArray[currentPosition];
      }
    }
  }

  // Construct the final output string.
  // It starts with the total number of recorded operations.
  let finalResultString = transformationRecords.length;
  // Then, append each recorded operation on a new line,
  // formatting each operation pair as "index1 index2".
  for (let currentPosition = 0; currentPosition < transformationRecords.length; currentPosition++) {
    finalResultString += '\n' + transformationRecords[currentPosition][0] + ' ' + transformationRecords[currentPosition][1];
  }

  // Display the complete final result string to the standard output.
  console.log(finalResultString);
}

// Call the main processing function, reading its input from standard input.
// This uses Node.js 'fs' module to synchronously read the entire file.
ProcessInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));