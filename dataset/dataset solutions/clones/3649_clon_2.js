function ProcessInput(rawData) {
  // This function processes the given raw string data.
  // It calculates the sum of absolute differences between adjacent sorted numbers.

  let numericValues = rawData.split(' '); // Split the input string by spaces into an array of string values.
  let totalDifference = 0; // Initialize a variable to accumulate the differences.

  // Convert each string element to an integer.
  numericValues = numericValues.map((strVal) => {
    return parseInt(strVal, 10); // Use radix 10 for parseInt for consistency.
  });

  // Sort the array of numbers in ascending order.
  numericValues.sort((a, b) => a - b);

  // Iterate through the sorted array, excluding the last element.
  for (let idx = 0; idx < numericValues.length - 1; ++idx) {
    // Calculate the absolute difference between the current and next element.
    // Add this difference to the running total.
    totalDifference += Math.abs(numericValues[idx] - numericValues[idx + 1]);
  }

  // Output the final calculated total difference to the console.
  console.log(totalDifference);
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
