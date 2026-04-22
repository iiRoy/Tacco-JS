/**
 * This function processes a multi-line string of data.
 * It parses numerical values from each line and performs an operation.
 * @param {string} inputStringData - A string containing multiple lines of data, separated by newlines.
 */
function ProcessInputData(inputStringData) {
  // The first line of the input string becomes dataLines[0], the second dataLines[1], and so on.
  let dataLines = inputStringData.split("\n");
  let totalDataSets = parseInt(dataLines[0], 10);

  // Iterate through the subsequent lines, starting from the second line up to the number specified by totalDataSets.
  for (const currentDataSetLine of dataLines.slice(1, 1 + totalDataSets)) {
    // For each data line, split it by spaces and convert the parts to integers.
    // The first part (ignoredCount) is not used in this specific logic.
    const [ignoredCount, expenseValues] = currentDataSetLine.split(' ').map(stringValue => parseInt(stringValue, 10));

    // Output the processed expense values, joined by spaces.
    console.log(expenseValues.join(' '));
  }
} // End of the data processing function definition.

// The following section should not be altered. It manages reading from standard input
// and invoking the primary data processing function with the collected data.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));