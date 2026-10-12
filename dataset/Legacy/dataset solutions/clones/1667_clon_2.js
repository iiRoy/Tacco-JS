function ProcessInput(rawData) {
  // Parse the input string to extract the lower bound, upper bound, and divisor.
  const [lowerBound, upperBound, divisorValue] = rawData.split(" ").map(Number);

  // Initialize a counter for numbers divisible by the specified value.
  let resultCount = 0;

  // Iterate through the range of numbers from the lower bound to the upper bound, inclusive.
  for (let currentNumber = lowerBound; currentNumber <= upperBound; currentNumber++) {
    // Check if the current number is perfectly divisible by the divisor.
    if (currentNumber % divisorValue === 0) {
      // If it is divisible, increment the counter.
      resultCount++;
    }
  }

  // Output the final count of divisible numbers to the console.
  console.log(resultCount);
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
