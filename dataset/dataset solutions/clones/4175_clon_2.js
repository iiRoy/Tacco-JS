function ProcessData(rawData) {
  // Split the input string into lines
  rawData = rawData.split('\n');

  // Parse the number of elements from the first line
  const countElements = parseInt(rawData[0].split(' ')[0], 10);

  // Split the second line into an array of string numbers
  let strNumbers = rawData[1].split(' ');

  // Initialize an array to store numeric values, filled with zeros
  const numArray = new Array(countElements).fill(0);

  // Initialize a list to store transformation operations
  const operationsList = [];

  // Initialize variables for tracking the highest and lowest values in the array
  let highestVal = -Math.pow(10, 6);
  let lowestVal = Math.pow(10, 6);

  // Iterate through the input numbers to populate the array and find min/max
  for (let idx = 0; idx < countElements; idx++) {
    numArray[idx] = parseInt(strNumbers[idx], 10);
    highestVal = Math.max(numArray[idx], highestVal);
    lowestVal = Math.min(numArray[idx], lowestVal);
  }

  // Conditional logic based on the range of values in the array
  if (lowestVal >= 0) {
    // Case 1: All numbers are non-negative
    for (let idx = 0; idx < countElements; idx++) {
      if (idx > 0 && numArray[idx] < numArray[idx - 1]) {
        // If an element is smaller than its predecessor, apply an operation
        const currentOp = [idx + 1, idx + 2];
        operationsList.push(currentOp);
        numArray[idx] = numArray[idx - 1] + numArray[idx];
      }
    }
  } else if (highestVal < 0) {
    // Case 2: All numbers are negative
    for (let idx = countElements - 1; idx >= 0; idx--) {
      if (idx < countElements - 1 && numArray[idx] > numArray[idx + 1]) {
        // If an element is larger than its successor, apply an operation
        const currentOp = [idx + 2, idx + 1];
        operationsList.push(currentOp);
        numArray[idx] = numArray[idx + 1] + numArray[idx];
      }
    }
  } else if (highestVal > Math.abs(lowestVal)) {
    // Case 3: Mixed signs, and the positive maximum has a larger absolute value
    for (let idx = 0; idx < countElements; idx++) {
      if (numArray.indexOf(highestVal) !== idx) {
        // Add the maximum value to elements that are not the maximum itself
        const currentOp = [numArray.indexOf(highestVal) + 1, idx + 1];
        operationsList.push(currentOp);
        numArray[idx] = numArray[idx] + highestVal;
      }
    }
    // After the first pass, ensure non-decreasing order
    for (let idx = 0; idx < countElements; idx++) {
      if (idx > 0 && numArray[idx] < numArray[idx - 1]) {
        // If an element is smaller than its predecessor, apply an operation
        const currentOp = [idx, idx + 1];
        operationsList.push(currentOp);
        numArray[idx] = numArray[idx - 1] + numArray[idx];
      }
    }
  } else if (Math.abs(lowestVal) > highestVal) {
    // Case 4: Mixed signs, and the negative minimum has a larger absolute value
    for (let idx = 0; idx < countElements; idx++) {
      if (numArray.indexOf(lowestVal) !== idx) {
        // Add the minimum value to elements that are not the minimum itself
        const currentOp = [numArray.indexOf(lowestVal) + 1, idx + 1];
        operationsList.push(currentOp);
        numArray[idx] = numArray[idx] + lowestVal;
      }
    }
    // After the first pass, ensure non-increasing order
    for (let idx = countElements - 1; idx >= 0; idx--) {
      if (idx < countElements - 1 && numArray[idx] > numArray[idx + 1]) {
        // If an element is larger than its successor, apply an operation
        const currentOp = [idx + 2, idx + 1];
        operationsList.push(currentOp);
        numArray[idx] = numArray[idx + 1] + numArray[idx];
      }
    }
  }

  // Prepare the final output string
  let resultString = operationsList.length.toString();
  for (let idx = 0; idx < operationsList.length; idx++) {
    resultString += '\n' + operationsList[idx][0] + ' ' + operationsList[idx][1];
  }

  // Print the collected operations
  console.log(resultString);
}

// Read input from standard input and pass it to the processing function
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));