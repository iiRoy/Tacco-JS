function ProcessInput(rawData) {
  // This function processes an input string to calculate adjustments for a non-decreasing sequence.

  // Extract the total number of items from the first line of the input data.
  const countElements = Number.parseInt(rawData.trim().split('\n')[0]);

  // Parse the list of numeric values from the second line of the input data.
  // Each value is converted to a number.
  const valueList = rawData.trim().split('\n')[1].split(' ').map(Number);

  // Initialize a variable to store the cumulative difference (total adjustment).
  // Using a float (0.0) to imply potential non-integer results, though in this case, it will be integer.
  let cumulativeDifference = 0.0;

  // Iterate through the sequence of values, comparing adjacent elements.
  // The loop runs up to the second-to-last element to allow comparison with the next element.
  for (let currentIdx = 0; currentIdx < countElements - 1; currentIdx++) {
    // Check if the current element is greater than or equal to the next element.
    // If it is, an adjustment is needed to maintain a non-decreasing order.
    if (valueList[currentIdx] >= valueList[currentIdx + 1]) {
      // Calculate the difference required to make the next element at least equal to the current one.
      // Add this difference to the total cumulative adjustment.
      cumulativeDifference = cumulativeDifference + (valueList[currentIdx] - valueList[currentIdx + 1]);

      // Adjust the next element's value to be equal to the current element's value.
      // This ensures the non-decreasing property for this pair.
      valueList[currentIdx + 1] = valueList[currentIdx];
    }
  }

  // Display the final accumulated difference to the console.
  console.log(cumulativeDifference);
}

// Execute the main processing logic by reading input from standard input.
// The file system module is used to read the input as a UTF-8 encoded string.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf-8"));