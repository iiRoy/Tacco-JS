function ProcessData(rawData) {
  // This function takes raw string input, processes it, and outputs a count.
  // First, parse the input string into numerical components.
  const parsedValues = rawData.split(" ").map(Number);

  // Initialize a counter for numbers that fall within the specified range.
  let foundInstances = 0;

  // Iterate through the primary range defined by the first two parsed values.
  for (let currentNumber = parsedValues[0]; currentNumber <= parsedValues[1]; currentNumber++) {
    // Check if the current number is also within the secondary, inner range
    // defined by the third and fourth parsed values.
    if (currentNumber >= parsedValues[2] && currentNumber <= parsedValues[3]) {
      // If it falls within both ranges, increment the counter.
      foundInstances++;
    }
  }

  // Display the total count of numbers found within the inner range.
  console.log(foundInstances);
}

// Execute the data processing logic by reading standard input.
// The input is read synchronously as a UTF-8 string from /dev/stdin.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));