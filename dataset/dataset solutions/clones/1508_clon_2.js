// This function serves as the primary entry point for processing the provided data.
function ProcessInput(rawData) {
  // The entire raw input string is split into an array of individual lines.
  rawData = rawData.split("\n");

  // The first line of the input is parsed to determine the total number of entries.
  // It's assumed the first line contains a single integer representing this count.
  let numEntries = parseInt(rawData[0].split(" ")[0]);

  // An index variable is initialized to traverse through the data lines.
  let idx = 0;

  // A variable to store the final determination, defaulting to "No".
  let outcome = "No";

  // A loop iterates through the data, checking for a specific pattern of three consecutive matching pairs.
  // The loop continues as long as there are at least three lines remaining to be checked.
  while (idx < numEntries - 2) {
    // The current line (offset by 1 from the index) is split into its constituent parts.
    const currentLineParts = rawData[idx + 1].split(" ");
    const firstVal = parseInt(currentLineParts[0]);
    const secondVal = parseInt(currentLineParts[1]);

    // Checks if the two numerical values on the current line are identical.
    if (firstVal === secondVal) {
      // If the current line's values match, the subsequent line (offset by 2) is examined.
      const nextLineParts = rawData[idx + 2].split(" ");
      if (parseInt(nextLineParts[0]) === parseInt(nextLineParts[1])) {
        // If the second line's values also match, the third consecutive line (offset by 3) is checked.
        const thirdLineParts = rawData[idx + 3].split(" ");
        if (parseInt(thirdLineParts[0]) === parseInt(thirdLineParts[1])) {
          // If all three consecutive lines contain matching pairs, the outcome is set to "Yes", and the search concludes.
          outcome = "Yes";
          break;
        } else {
          // If the third line does not have matching values, the index is advanced by three steps to skip these lines.
          idx += 3;
        }
      } else {
        // If the second line does not have matching values, the index is advanced by two steps.
        idx += 2;
      }
    } else {
      // If the current line does not have matching values, the index is simply advanced by one step.
      idx++;
    }
  }

  // The determined outcome is printed to the console.
  console.log(outcome);
}

// This section handles reading input from standard input and invoking the main processing function.
// It is typically used in competitive programming environments and should remain unaltered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
