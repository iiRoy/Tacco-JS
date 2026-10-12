function ProcessInput(rawData) {
  // Split the raw input string into lines
  rawData = rawData.split("\n");

  // Parse the number of elements from the first line
  let elementCount = parseInt(rawData[0].split(" ")[0]);

  // Split the second line into an array of number strings
  let numStrings = rawData[1].split(" ");

  // Initialize the main data array with zeros
  let dataArray = new Array(elementCount).fill(0);

  // Initialize an array to store operation pairs
  let operationList = [];

  // Initialize variables for tracking maximum and minimum values
  // Using a large negative number for initial max and large positive for initial min
  let currentMax = -Math.pow(10, 6);
  let currentMin = Math.pow(10, 6);

  // Iterate through the input numbers to populate dataArray and find initial max/min
  for (let idx = 0; idx < elementCount; idx++) {
    dataArray[idx] = parseInt(numStrings[idx]);
    currentMax = Math.max(dataArray[idx], currentMax);
    currentMin = Math.min(dataArray[idx], currentMin);
  }

  // Conditional logic based on the range of numbers in the array
  if (currentMin >= 0) {
    // Case 1: All numbers are non-negative
    // Iterate from left to right, ensuring non-decreasing order
    for (let idx = 0; idx < elementCount; idx++) {
      // If a number is smaller than its predecessor, add the predecessor to it
      if (idx > 0 && dataArray[idx] < dataArray[idx - 1]) {
        let opPair = [idx + 1, idx + 2]; // Store 1-based indices for the operation
        operationList.push(opPair);
        dataArray[idx] = dataArray[idx - 1] + dataArray[idx];
      }
    }
  } else if (currentMax < 0) {
    // Case 2: All numbers are negative
    // Iterate from right to left, ensuring non-increasing order
    for (let idx = elementCount - 1; idx >= 0; idx--) {
      // If a number is larger than its successor, add the successor to it
      if (idx < elementCount - 1 && dataArray[idx] > dataArray[idx + 1]) {
        let opPair = [idx + 2, idx + 1]; // Store 1-based indices for the operation
        operationList.push(opPair);
        dataArray[idx] = dataArray[idx + 1] + dataArray[idx];
      }
    }
  } else if (currentMax > Math.abs(currentMin)) {
    // Case 3: Mixed positive/negative, and the maximum positive value is greater than the absolute minimum negative value
    // First, propagate the maximum value to all other elements
    for (let idx = 0; idx < elementCount; idx++) {
      // If the current element is not the maximum element itself
      if (dataArray.indexOf(currentMax) !== idx) {
        let opPair = [dataArray.indexOf(currentMax) + 1, idx + 1]; // Store 1-based indices
        operationList.push(opPair);
        dataArray[idx] = dataArray[idx] + currentMax;
      }
    }
    // Then, ensure non-decreasing order from left to right
    for (let idx = 0; idx < elementCount; idx++) {
      if (idx > 0 && dataArray[idx] < dataArray[idx - 1]) {
        let opPair = [idx, idx + 1]; // Store 1-based indices
        operationList.push(opPair);
        dataArray[idx] = dataArray[idx - 1] + dataArray[idx];
      }
    }
  } else if (Math.abs(currentMin) > currentMax) {
    // Case 4: Mixed positive/negative, and the absolute minimum negative value is greater than the maximum positive value
    // First, propagate the minimum value to all other elements
    for (let idx = 0; idx < elementCount; idx++) {
      // If the current element is not the minimum element itself
      if (dataArray.indexOf(currentMin) !== idx) {
        let opPair = [dataArray.indexOf(currentMin) + 1, idx + 1]; // Store 1-based indices
        operationList.push(opPair);
        dataArray[idx] = dataArray[idx] + currentMin;
      }
    }
    // Then, ensure non-increasing order from right to left
    for (let idx = elementCount - 1; idx >= 0; idx--) {
      if (idx < elementCount - 1 && dataArray[idx] > dataArray[idx + 1]) {
        let opPair = [idx + 2, idx + 1]; // Store 1-based indices
        operationList.push(opPair);
        dataArray[idx] = dataArray[idx + 1] + dataArray[idx];
      }
    }
  }

  // Prepare the final output string
  let resultOutput = operationList.length; // Start with the count of operations
  for (let idx = 0; idx < operationList.length; idx++) {
    // Append each operation pair on a new line
    resultOutput += "\n" + operationList[idx][0] + " " + operationList[idx][1];
  }

  // Print the final result to the console
  console.log('%s', resultOutput);
}

// Read input from stdin and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
