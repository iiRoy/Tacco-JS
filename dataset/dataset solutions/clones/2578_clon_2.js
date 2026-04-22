// This function performs a specific numeric aggregation based on input values.
function ProcessData(dataSource) {
  // Extract the total number of items from the first element of the input.
  var itemCount = parseInt(dataSource[0], 10);
  /*
   * Convert the rest of the input array elements into a series of integers.
   * This forms the primary data set for the calculation.
   */
  var valueArray = dataSource.slice(1).map(currentVal => parseInt(currentVal));

  // Initialize the aggregate result with the first element of the processed data.
  var totalResult = valueArray[0];

  // Iterate through the processed data starting from the second element.
  for (var idx = 1; idx < itemCount; idx++) {
    // Check if we are at the very last element to be processed.
    if (idx === itemCount - 1) {
      // If it's the final element, add the preceding value directly to the total.
      totalResult += valueArray[idx - 1];
    } else {
      // For all other elements, add the minimum of the current and preceding value.
      totalResult += Math.min(valueArray[idx - 1], valueArray[idx]);
    }
  }
  // Output the final computed aggregate to the standard console.
  console.log(totalResult);
}

// Invoke the primary processing function with data read from standard input.
ProcessData(
  require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split(/\n|\s/)
);