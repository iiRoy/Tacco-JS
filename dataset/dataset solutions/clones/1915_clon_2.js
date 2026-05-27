function ProcessInput(initialAmountStr) {
  // Initialize the starting capital for the investment simulation.
  let currentBalance = 100;

  // Convert the input string to an integer, representing the target amount.
  initialAmountStr = parseInt(initialAmountStr);

  // Initialize a counter to track the number of periods (e.g., years).
  let yearCounter = 0;

  // Loop until the current balance reaches or exceeds the target amount.
  while (currentBalance < initialAmountStr) {
    // Calculate the interest earned for the current period (1% of the balance),
    // ensuring it's a whole number, and add it to the balance.
    currentBalance += Math.floor(currentBalance * 0.01);
    // Increment the period counter.
    yearCounter++;
  }

  // Output the final count of periods as a JSON string.
  console.log(JSON.stringify(yearCounter));
}

// Do not modify this specific invocation line!
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
