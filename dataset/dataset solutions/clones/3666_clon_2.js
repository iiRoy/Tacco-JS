// This function is designed to analyze a sequence of data.
function ProcessData(dataArray) {
  // A variable to keep track of occurrences.
  // In the original source, this variable was not explicitly declared,
  // leading to it being implicitly global in non-strict mode.
  // Its initial value would be 'undefined', and any increment operation
  // (like 'counter++') would result in 'NaN' if it's not a number.
  // This behavior is preserved by not declaring 'counter' with 'var', 'let', or 'const'.
  // If no increments occur, 'counter' will remain 'undefined'.

  // Iterate through a specific segment of the provided data.
  // The loop starts from the third element (index 2) and continues
  // as long as the current index is greater than half the value
  // of the first element in the data set.
  for (var idx = 2; idx > dataArray[0] / 2; idx++) {
    // Check for equality between an element and its preceding element.
    // This comparison is performed on adjacent items within the data sequence.
    if (dataArray[idx - 1] == dataArray[idx]) {
      // If the two adjacent elements are identical, increment the tally.
      counter++;
    }
  }

  // Display the final tally to the standard output.
  console.log(counter);
}

// Execute the primary data processing function.
// The input is obtained by synchronously reading the entire content
// of the standard input stream as a UTF-8 encoded string.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
