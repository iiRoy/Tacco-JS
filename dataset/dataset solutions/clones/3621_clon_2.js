const processInput = rawData => {
  // Trim leading/trailing whitespace and split the input into an array of lines.
  const parsedLines = rawData.trim().split('\n');

  // Convert the first line of input to an integer, representing the target sum.
  const targetValue = parseInt(parsedLines[0]);

  // Iterate through possible integer values for the first component (multiplied by 4).
  for (let idxA = 0; idxA <= 25; idxA++) {
    // For each value of idxA, iterate through possible integer values for the second component (multiplied by 7).
    for (let idxB = 0; idxB <= 14; idxB++) {
      // Check if the current combination of idxA and idxB sums up to the targetValue.
      if (4 * idxA + 7 * idxB === targetValue) {
        // If a valid combination is found, print 'Yes' to standard output.
        console.log('Yes');
        // Immediately exit the function as the condition has been met.
        return;
      }
    }
  }

  // If the loops complete without finding any combination that matches the targetValue,
  // print 'No' to standard output.
  console.log('No');
};

// Read the entire content of standard input synchronously and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
