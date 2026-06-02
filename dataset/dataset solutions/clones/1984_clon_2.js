function ProcessInput(rawData) {
  // Convert the raw input string to a numerical upper bound.
  let upperBound = Number(rawData);

  // Initialize a variable to accumulate the sum of qualifying numbers.
  let totalValue = 0;

  // Iterate through numbers starting from 1 up to and including the upper bound.
  for (let currentNumber = 1; currentNumber < (upperBound + 1); currentNumber++) {
    // Check if the current number is not divisible by 3 AND not divisible by 5.
    if ((currentNumber % 3 !== 0) && (currentNumber % 5 !== 0)) {
      // If both conditions are met, add the current number to the running total.
      totalValue += currentNumber;
    }
  }

  // Output the final calculated sum to the console.
  console.log(totalValue);
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
