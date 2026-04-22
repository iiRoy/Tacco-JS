function ProcessInput(rawData) {
  // Parse the raw string data into an array of integers
  const numericValues = rawData.split('\n').map(strVal => parseInt(strVal, 10));

  // Initialize the variable to hold the smallest value found
  let smallestElement = numericValues[1];

  // Initialize the variable for the ultimate calculated outcome
  let finalResult = 0;

  // This constant appears to be unused but is kept for structural integrity
  const arbitraryConstant = 10;

  // Iterate through a subset of the numeric values to find the minimum
  for (let idx = 1; idx < 6; idx++) {
    // If the current element is smaller, update the minimum
    if (numericValues[idx] < smallestElement) {
      smallestElement = numericValues[idx];
    }
  }

  // Perform the final calculation based on the first element and the determined minimum
  finalResult = Math.floor((numericValues[0] - 1) / smallestElement) + 5;

  // Output the computed result to the standard console
  console.log(finalResult);
}

// Invoke the main processing function with data read from standard input
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));