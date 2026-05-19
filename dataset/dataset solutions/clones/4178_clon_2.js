function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  rawData = rawData.split("\n");

  // Extract the count of elements from the first line
  let elementCount = parseInt(rawData[0].split(" ")[0]);

  // Split the second line into an array of string numbers
  const stringNumbers = rawData[1].split(" ");

  // Initialize a numeric array with the given count, filled with zeros
  const numericArray = new Array(elementCount).fill(0);

  // Initialize an empty array to store operations
  const operationList = new Array();

  // Initialize variables for tracking the greatest and smallest values
  // Use extreme values to ensure any input number will be within range
  let greatestValue = -Math.pow(10, 6) - 1; // A very small number
  let smallestValue = Math.pow(10, 6) + 1;  // A very large number

  // Populate the numeric array and find the initial max and min values
  for (let idx = 0; idx < elementCount; idx++) {
    numericArray[idx] = parseInt(stringNumbers[idx]);
    greatestValue = Math.max(numericArray[idx], greatestValue);
    smallestValue = Math.min(numericArray[idx], smallestValue);
  }

  // Determine the processing strategy based on the absolute values of max and min
  if (greatestValue >= Math.abs(smallestValue)) {
    // If the maximum value is greater than or equal to the absolute minimum
    // Apply operations to make all elements non-decreasing
    for (let idx = 0; idx < elementCount; idx++) {
      // If the current element is not the one holding the maximum value
      if (numericArray.indexOf(greatestValue) !== idx) {
        // Record the operation: add max_value to current_element
        const currentOperation = [numericArray.indexOf(greatestValue) + 1, idx + 1];
        operationList.push(currentOperation);
        numericArray[idx] = numericArray[idx] + greatestValue;
      }
    }

    // Ensure the array is non-decreasing from left to right
    for (let idx = 0; idx < elementCount; idx++) {
      // If a previous element is larger than the current one
      if (idx > 0 && numericArray[idx] < numericArray[idx - 1]) {
        // Record the operation: add previous_element to current_element
        const currentOperation = [idx, idx + 1];
        operationList.push(currentOperation);
        numericArray[idx] = numericArray[idx - 1] + numericArray[idx];
      }
    }
  } else if (Math.abs(smallestValue) > greatestValue) {
    // If the absolute minimum value is greater than the maximum
    // Apply operations to make all elements non-increasing
    for (let idx = 0; idx < elementCount; idx++) {
      // If the current element is not the one holding the minimum value
      if (numericArray.indexOf(smallestValue) !== idx) {
        // Record the operation: add min_value to current_element
        const currentOperation = [numericArray.indexOf(smallestValue) + 1, idx + 1];
        operationList.push(currentOperation);
        numericArray[idx] = numericArray[idx] + smallestValue;
      }
    }

    // Ensure the array is non-increasing from right to left
    for (let idx = elementCount - 1; idx >= 0; idx--) {
      // If a next element is smaller than the current one
      if (idx < elementCount - 1 && numericArray[idx] > numericArray[idx + 1]) {
        // Record the operation: add next_element to current_element
        const currentOperation = [idx + 2, idx + 1];
        operationList.push(currentOperation);
        numericArray[idx] = numericArray[idx + 1] + numericArray[idx];
      }
    }
  }

  // Prepare the final output string
  let resultOutput = operationList.length; // Start with the total number of operations

  // Append each operation to the output string, formatted as "source_index target_index"
  for (let idx = 0; idx < operationList.length; idx++) {
    resultOutput += "\n" + operationList[idx][0] + " " + operationList[idx][1];
  }

  // Print the final result to the console
  console.log('%s', resultOutput);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
