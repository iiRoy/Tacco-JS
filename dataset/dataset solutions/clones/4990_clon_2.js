function ProcessInput(rawData) {
  // This section prepares the raw input string for processing.
  // It removes any trailing newline characters and then splits the string
  // into an array of lines, using newline as the delimiter.
  var parsedLines = rawData.replace(/\n+$/, '').split(/\n/);

  // A variable is initialized to store the cumulative sum.
  var totalValue = 0;

  // The main loop iterates a number of times specified by the first element
  // of the parsed input array.
  for (iterationCount = 0; iterationCount < parsedLines[0]; iterationCount++) {
    // Inside the loop, a conditional check is performed.
    // It compares the current iteration count with the second element
    // from the input array.
    if (iterationCount < parsedLines[1]) {
      // If the condition is true, the numeric value of the third
      // input element is added to the running total.
      totalValue += Number(parsedLines[2]);
    } else {
      // If the condition is false, the numeric value of the fourth
      // input element is added to the running total instead.
      totalValue += Number(parsedLines[3]);
    }
  }

  // After the loop completes, the final calculated total is printed
  // to the standard output.
  console.log(totalValue);
}

// This line executes the primary function by reading content from
// standard input, typically a file, and passing it as a string.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
