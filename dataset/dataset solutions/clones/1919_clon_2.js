function processInputData(inputParameters) {
  // Parse the first input parameter as the desired threshold.
  const desiredThreshold = Number.parseInt(inputParameters[0]);

  // Initialize the current value and the number of passed periods.
  let currentValue = 100; // Starting amount
  let passedPeriods = 0;  // Counter for periods

  // Loop until the current value reaches or exceeds the desired threshold.
  while (currentValue < desiredThreshold) {
    // Increase the current value by 1%
    currentValue *= 1.01;

    // Floor the current value to an integer, simulating integer currency units.
    currentValue = Math.floor(currentValue);

    // Increment the period counter.
    passedPeriods++;
  }

  // Output the total number of periods required.
  console.log(passedPeriods);
}

// Read input from standard input, trim whitespace, and split by newlines.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
