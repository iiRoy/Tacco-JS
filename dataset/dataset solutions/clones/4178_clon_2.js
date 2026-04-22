/*
 * This module processes a given input string to perform a series of array manipulations.
 * It aims to make the array sorted (either ascending or descending) based on the absolute
 * magnitudes of its maximum and minimum elements.
 */
let ProcessInput = function (dataString) {
  // Split the entire input string into individual lines.
  const lines = dataString.split("\n");

  // Parse the first line to get the count of elements.
  const firstLineTokens = lines[0].split(" ");
  let countElements = parseInt(firstLineTokens[0], 10); // Base 10 for clarity

  // Extract the string representations of array elements from the second line.
  const elementStrings = lines[1].split(" ");

  // Initialize the main numeric array with the specified size, filled with zeros.
  let numericArray = new Array(countElements).fill(0);

  // Initialize an empty array to store the operations performed.
  let operationsList = [];

  // Define initial boundary values for maximum and minimum.
  // Using large negative and positive numbers to ensure any input element will be within range.
  let maximumValue = -(10 ** 6) - 1; // A very small number
  let minimumValue = (10 ** 6) + 1; // A very large number

  // First pass: populate the numeric array and find the true max/min values.
  for (let idx = 0; idx < countElements; idx++) {
    numericArray[idx] = parseInt(elementStrings[idx], 10);
    maximumValue = Math.max(numericArray[idx], maximumValue);
    minimumValue = Math.min(numericArray[idx], minimumValue);
  }

  // Determine the primary manipulation strategy based on the absolute magnitudes of max and min.
  if (maximumValue >= Math.abs(minimumValue)) {
    // Strategy 1: Max value has greater or equal absolute magnitude.
    // Apply operations to make the array elements grow towards positive infinity.
    // First, add the maximum value to other elements to amplify them.
    for (let currentIdx = 0; currentIdx < countElements; currentIdx++) {
      // Avoid adding to the element that already holds the maximum value itself.
      if (numericArray.indexOf(maximumValue) !== currentIdx) {
        // Record the operation: [source_index + 1, target_index + 1]
        const subOperation = [numericArray.indexOf(maximumValue) + 1, currentIdx + 1];
        operationsList.push(subOperation);
        numericArray[currentIdx] = numericArray[currentIdx] + maximumValue;
      }
    }

    // Second, ensure the array is non-decreasing by adding previous elements.
    for (let jdx = 0; jdx < countElements; jdx++) {
      if (jdx > 0 && numericArray[jdx] < numericArray[jdx - 1]) {
        // Record the operation: [source_index, target_index + 1]
        const opPair = [jdx, jdx + 1];
        operationsList.push(opPair);
        numericArray[jdx] = numericArray[jdx - 1] + numericArray[jdx];
      }
    }
  } else if (Math.abs(minimumValue) > maximumValue) {
    // Strategy 2: Min value has greater absolute magnitude.
    // Apply operations to make the array elements grow towards negative infinity (or decrease).
    // First, add the minimum value to other elements to make them smaller.
    for (let kdx = 0; kdx < countElements; kdx++) {
      // Avoid adding to the element that already holds the minimum value itself.
      if (numericArray.indexOf(minimumValue) !== kdx) {
        // Record the operation: [source_index + 1, target_index + 1]
        const opDetails = [numericArray.indexOf(minimumValue) + 1, kdx + 1];
        operationsList.push(opDetails);
        numericArray[kdx] = numericArray[kdx] + minimumValue;
      }
    }

    // Second, ensure the array is non-increasing by adding subsequent elements.
    for (let ldx = countElements - 1; ldx >= 0; ldx--) {
      if (ldx < countElements - 1 && numericArray[ldx] > numericArray[ldx + 1]) {
        // Record the operation: [source_index + 2, target_index + 1]
        const reverseOp = [ldx + 2, ldx + 1];
        operationsList.push(reverseOp);
        numericArray[ldx] = numericArray[ldx + 1] + numericArray[ldx];
      }
    }
  }

  // Construct the final output string.
  // Start with the total number of operations.
  let finalOutput = operationsList.length.toString();

  // Append each operation to the output string, formatted as "source target".
  for (let mdx = 0; mdx < operationsList.length; mdx++) {
    finalOutput += "\n" + operationsList[mdx][0] + " " + operationsList[mdx][1];
  }

  // Print the final result to the console.
  console.log(finalOutput);
};

// Invoke the main processing function with data read from standard input.
ProcessInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));