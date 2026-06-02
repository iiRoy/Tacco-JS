function processInput(rawData) {
  const LINES = rawData.split("\n");
  const LARGE_NUMBER_MAGNITUDE = 1_000_000; // Constant for 10^6, replacing Math.pow(10,6)

  const arrayLength = parseInt(LINES[0].split(" ")[0]);
  const initialValuesStr = LINES[1].split(" ");

  let numericArray = []; // Initialize as empty, then populate
  let operationsList = [];

  let maxValue = -LARGE_NUMBER_MAGNITUDE;
  let minValue = LARGE_NUMBER_MAGNITUDE;
  let maxIdx = -1; // Stores 0-based index of the maximum value
  let minIdx = -1; // Stores 0-based index of the minimum value

  for (let idx = 0; idx < arrayLength; idx++) {
    const currentValue = parseInt(initialValuesStr[idx]);
    numericArray.push(currentValue); // Add element to the array

    if (currentValue > maxValue) {
      maxValue = currentValue;
      maxIdx = idx;
    }
    if (currentValue < minValue) {
      minValue = currentValue;
      minIdx = idx;
    }
  }

  // Conditional logic based on min/max values to determine transformation strategy
  if (minValue >= 0) {
    // All elements are non-negative, ensure non-decreasing order
    for (let idx = 0; idx < arrayLength; idx++) {
      if (idx > 0 && numericArray[idx] < numericArray[idx - 1]) {
        const previousElementValue = numericArray[idx - 1]; // Helper variable for clarity
        const operationPair = [idx + 1, idx + 2]; // Replicating original bsub logic
        operationsList.push(operationPair);
        numericArray[idx] = previousElementValue + numericArray[idx];
      }
    }
  } else if (maxValue < 0) {
    // All elements are negative, ensure non-increasing order (iterate backwards)
    for (let idx = arrayLength - 1; idx >= 0; idx--) {
      if (idx < arrayLength - 1 && numericArray[idx] > numericArray[idx + 1]) {
        const nextElementValue = numericArray[idx + 1]; // Helper variable for clarity
        const operationPair = [idx + 2, idx + 1]; // Replicating original bsub logic
        operationsList.push(operationPair);
        numericArray[idx] = nextElementValue + numericArray[idx];
      }
    }
  } else if (maxValue > Math.abs(minValue)) {
    // Maximum value has a larger absolute magnitude, make all elements positive then sort
    // First pass: Add the maximum value to all other elements
    for (let idx = 0; idx < arrayLength; idx++) {
      if (maxIdx !== idx) { // Use stored index to avoid re-scanning
        const sourceIndexForMax = maxIdx + 1; // 1-based index of the max element
        const targetIndex = idx + 1; // 1-based index of the current element
        const operationPair = [sourceIndexForMax, targetIndex];
        operationsList.push(operationPair);
        numericArray[idx] = numericArray[idx] + maxValue;
      }
    }
    // Second pass: Ensure non-decreasing order after the first transformation
    for (let idx = 0; idx < arrayLength; idx++) {
      if (idx > 0 && numericArray[idx] < numericArray[idx - 1]) {
        const previousElementValue = numericArray[idx - 1];
        const operationPair = [idx, idx + 1]; // Replicating original bsub logic
        operationsList.push(operationPair);
        numericArray[idx] = previousElementValue + numericArray[idx];
      }
    }
  } else if (Math.abs(minValue) > maxValue) {
    // Minimum value has a larger absolute magnitude, make all elements negative then sort
    // First pass: Add the minimum value to all other elements
    for (let idx = 0; idx < arrayLength; idx++) {
      if (minIdx !== idx) { // Use stored index to avoid re-scanning
        const sourceIndexForMin = minIdx + 1; // 1-based index of the min element
        const targetIndex = idx + 1; // 1-based index of the current element
        const operationPair = [sourceIndexForMin, targetIndex];
        operationsList.push(operationPair);
        numericArray[idx] = numericArray[idx] + minValue;
      }
    }
    // Second pass: Ensure non-increasing order (reversed loop) after the first transformation
    for (let idx = arrayLength - 1; idx >= 0; idx--) {
      if (idx < arrayLength - 1 && numericArray[idx] > numericArray[idx + 1]) {
        const nextElementValue = numericArray[idx + 1];
        const operationPair = [idx + 2, idx + 1]; // Replicating original bsub logic
        operationsList.push(operationPair);
        numericArray[idx] = nextElementValue + numericArray[idx];
      }
    }
  }

  let resultOutput = operationsList.length.toString(); // Start with the count of operations

  // Construct the output string for operations using map and join
  const operationStrings = operationsList.map(op => `${op[0]} ${op[1]}`);
  if (operationStrings.length > 0) {
    resultOutput += "\n" + operationStrings.join("\n");
  }

  console.log(resultOutput);
}

// Read input from stdin and pass to the main processing function
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInput(fileContent);
