function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  rawData = rawData.split("\n");

  // Parse the first number from the first line to get the array size.
  let elementCount = parseInt(rawData[0].split(" ")[0]);

  // Split the second line into an array of number strings.
  const numStrings = rawData[1].split(" ");

  // Initialize the main numeric array with 'elementCount' zeros.
  const numericArray = new Array(elementCount).fill(0);

  // Initialize an empty array to store the operations performed.
  const operationList = new Array();

  // Initialize variables to track the maximum and minimum values in the array.
  // Using scientific notation for clarity and slight variation.
  let maxValue = -1e6; // Equivalent to -Math.pow(10, 6)
  let minValue = 1e6;  // Equivalent to Math.pow(10, 6)

  // Populate the numeric array and find the initial max and min values.
  for (let idx = 0; idx < elementCount; idx++) {
    numericArray[idx] = parseInt(numStrings[idx]);
    maxValue = Math.max(numericArray[idx], maxValue);
    minValue = Math.min(numericArray[idx], minValue);
  }

  // Conditional logic based on the range of values in the array.
  if (minValue >= 0) {
    // If all numbers are non-negative, sort in ascending order.
    for (let idx = 0; idx < elementCount; idx++) {
      // Check if the current element is smaller than the previous one.
      if (idx > 0 && numericArray[idx] < numericArray[idx - 1]) {
        // Record the operation: add previous element to current.
        const currentOperation = [idx, idx + 1];
        operationList.push(currentOperation);
        // Perform the addition.
        numericArray[idx] = numericArray[idx - 1] + numericArray[idx];
      }
    }
  } else if (maxValue < 0) {
    // If all numbers are negative, sort in descending order.
    for (let idx = elementCount - 1; idx >= 0; idx--) {
      // Check if the current element is larger than the next one.
      if (idx < elementCount - 1 && numericArray[idx] > numericArray[idx + 1]) {
        // Record the operation: add next element to current.
        const currentOperation = [idx + 1, idx];
        operationList.push(currentOperation);
        // Perform the addition.
        numericArray[idx] = numericArray[idx + 1] + numericArray[idx];
      }
    }
  } else if (maxValue > Math.abs(minValue)) {
    // If positive max is greater than absolute negative min.
    // First, make all numbers positive by adding the max value.
    for (let idx = 0; idx < elementCount; idx++) {
      // If the current element is not the max value itself.
      if (numericArray.indexOf(maxValue) !== idx) {
        // Record the operation: add max value to current.
        const currentOperation = [numericArray.indexOf(maxValue), idx];
        operationList.push(currentOperation);
        // Perform the addition.
        numericArray[idx] = numericArray[idx] + maxValue;
      }
    }
    // Then, sort in ascending order (all numbers are now positive).
    for (let idx = 0; idx < elementCount; idx++) {
      if (idx > 0 && numericArray[idx] < numericArray[idx - 1]) {
        const currentOperation = [idx, idx + 1];
        operationList.push(currentOperation);
        numericArray[idx] = numericArray[idx - 1] + numericArray[idx];
      }
    }
  } else if (Math.abs(minValue) > maxValue) {
    // If absolute negative min is greater than positive max.
    // First, make all numbers negative by adding the min value.
    for (let idx = 0; idx < elementCount; idx++) {
      // If the current element is not the min value itself.
      if (numericArray.indexOf(minValue) !== idx) {
        // Record the operation: add min value to current.
        const currentOperation = [numericArray.indexOf(minValue), idx];
        operationList.push(currentOperation);
        // Perform the addition.
        numericArray[idx] = numericArray[idx] + minValue;
      }
    }
    // Then, sort in descending order (all numbers are now negative).
    for (let idx = elementCount - 1; idx >= 0; idx--) {
      if (idx < elementCount - 1 && numericArray[idx] > numericArray[idx + 1]) {
        const currentOperation = [idx + 1, idx];
        operationList.push(currentOperation);
        numericArray[idx] = numericArray[idx + 1] + numericArray[idx];
      }
    }
  }

  // Prepare the final output string.
  let resultOutput = operationList.length;
  for (let idx = 0; idx < operationList.length; idx++) {
    resultOutput += "\n" + operationList[idx][0] + " " + operationList[idx][1];
  }

  // Print the result to the console.
  console.log('%s', resultOutput);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
