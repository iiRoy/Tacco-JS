function ProcessInput(rawData) {
  // Trim leading/trailing whitespace and split into lines, then split each line by space.
  // This prepares the input for parsing numerical values.
  let processedLines = rawData.trim().split("\n").map(function(lineContent) {
    return lineContent.split(" ");
  });

  // Extract the lower bound (L) from the first line of input.
  let lowerBound = parseInt(processedLines[0][0], 10);
  // Extract the upper bound (R) from the first line of input.
  let upperBound = parseInt(processedLines[0][1], 10);
  // Extract the divisor (d) from the first line of input.
  let divisorValue = parseInt(processedLines[0][2], 10);

  // Initialize a counter for numbers divisible by 'd'.
  let resultCount = 0;

  // Iterate through all numbers from L to R, inclusive.
  for (let currentNumber = lowerBound; currentNumber <= upperBound; currentNumber++) {
    // Check if the current number is perfectly divisible by the divisor.
    if (currentNumber % divisorValue === 0) {
      // If it is, increment the counter.
      resultCount++;
    }
  }

  // Output the final count of divisible numbers to the console.
  console.log(resultCount);
}

// Read input from standard input asynchronously and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
