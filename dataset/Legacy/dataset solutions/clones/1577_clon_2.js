function ProcessInput(rawData) {
  // This line extracts the first number from the input string, which represents the count of elements.
  const countElements = parseInt(rawData.split('\n')[0]);

  // This line parses the second line of the input into an array of numbers.
  const dataArray = rawData.split('\n')[1].split(' ').map(Number);

  // Initialize a variable to accumulate the total adjustments made.
  let totalAdjustment = 0;

  // Iterate through the array, comparing each element with its successor.
  for (let idx = 0; idx < countElements - 1; idx++) {
    // If the current element is greater than or equal to the next element, an adjustment is needed.
    if (dataArray[idx] >= dataArray[idx + 1]) {
      // Calculate the difference required to make the next element equal to the current one.
      totalAdjustment = totalAdjustment + dataArray[idx] - dataArray[idx + 1];
      // Update the next element to be equal to the current one, ensuring non-decreasing order.
      dataArray[idx + 1] = dataArray[idx];
    }
  }

  // Output the final accumulated adjustment value to the console.
  console.log(totalAdjustment);
}

// Read the entire content of standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
