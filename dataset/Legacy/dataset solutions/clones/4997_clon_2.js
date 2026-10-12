function ProcessInput(rawData) {
  // Split the raw input string into an array of lines for easier processing.
  rawData = rawData.split("\n");

  // Parse the first number from the first line, representing the count of elements.
  const numElements = parseInt(rawData[0].split(" ")[0], 10);
  // Parse the second number from the first line, representing the target value.
  const targetValue = parseInt(rawData[0].split(" ")[1], 10);

  // Process the second line to convert space-separated strings into an array of integers.
  const numericData = rawData[1].split(" ").map((itemStr) => parseInt(itemStr, 10));

  // Declare a variable for a total sum, though it's not used in the current logic.
  var totalSum;
  // Initialize a counter variable to track specific conditions.
  var resultCounter = 0;

  // First loop: Iterate through each element of the numeric data array.
  for (var idx1 = 0; idx1 < numElements; ++idx1) {
    // Check if the current element matches the predefined target value.
    if (targetValue === numericData[idx1]) {
      // If a match is found, increment the result counter.
      resultCounter++;
    }
  }

  // Declare a variable for an average value, which is also not used in the current logic.
  var averageVal;

  // Nested loops: Iterate through the numeric data array using three different indices.
  for (var idx1 = 0; idx1 < numElements; idx1++) {
    for (var idx2 = 0; idx2 < numElements; idx2++) {
      for (var idx3 = 0; idx3 < numElements; idx3++) {
        // This is a commented-out line from the original, indicating a potential calculation.
        // sum[idx1][idx2 + 1][idx3] = (numericData[idx3] + numericData[idx2]) * (idx1 + 1);

        // Check a complex arithmetic condition involving the indices, target value, and array elements.
        if ((idx1 + 2) * targetValue === (numericData[idx3] + numericData[idx2]) * (idx1 + 1)) {
          // If this specific condition is met, increment the result counter.
          resultCounter++;
        }
      }
    }
  }
  // Output the final calculated count to the console.
  console.log(resultCounter);
}

// Read input from standard input (e.g., a file or piped data) and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
