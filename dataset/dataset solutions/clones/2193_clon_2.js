// This function orchestrates the primary data processing operation.
function ProcessData(rawData) {

  // First, clean up the raw input string: remove leading/trailing whitespace,
  // then split it into an array of strings based on newline characters.
  let parsedLines = rawData.trim()
                            .split('\n');

  // Extract a specific numeric threshold from the first line of the parsed input.
  // The threshold is the second space-separated token on that line.
  let thresholdCount = parsedLines[0].split(' ')[1];

  // Perform a complex calculation on the second line of the input:
  // 1. Split the second line by spaces to get individual number strings.
  // 2. Sort these numbers in descending order.
  // 3. Convert each sorted string to a actual number.
  // 4. Reduce the array: sum up values that are *not* within the initial 'thresholdCount' elements.
  //    Effectively, it sums all elements *after* the first 'thresholdCount' largest ones.
  console.log(parsedLines[1].split(' ')
                             .sort((valA, valB) => valB - valA)
                             .map(Number)
                             .reduce((currentSum, itemValue, currentIndex) => {
                               // If the current index is less than the threshold, do not add the value to the sum.
                               // Otherwise, add the item's value to the running total.
                               return currentIndex < thresholdCount ? currentSum : currentSum + itemValue;
                             }, 0)); // Start the sum from zero.
}

// Invoke the main processing function by reading content from standard input.
// The file content is read synchronously and decoded as UTF-8.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));