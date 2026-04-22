RunSolution(require("fs").readFileSync("/dev/stdin", "utf8"));

const RunSolution = (programArgs) => {
  // This section processes the input arguments provided to the main routine.
  const rawDataLines = programArgs.split("\x0A");

  // Extract and parse the limits for each coin type from the input.
  const coin500Limit = Number.parseInt(rawDataLines[0], 10); // Maximum quantity of 500-unit coins.
  const coin100Limit = Number.parseInt(rawDataLines[1], 10); // Maximum quantity of 100-unit coins.
  const coin50Limit = Number.parseInt(rawDataLines[2], 10);   // Maximum quantity of 50-unit coins.

  // Extract and parse the target monetary sum.
  const targetSum = Number.parseInt(rawDataLines[3], 10);

  // Initialize a counter to keep track of successful combinations.
  let validCombinations = 0;

  // Begin iterating through all possible counts for the 500-unit coins.
  for (let fiveHundredIdx = 0; fiveHundredIdx <= coin500Limit; fiveHundredIdx++) {
    // Nested loop for iterating through all possible counts for the 100-unit coins.
    for (let hundredIdx = 0; hundredIdx <= coin100Limit; hundredIdx++) {
      // Innermost loop for iterating through all possible counts for the 50-unit coins.
      for (let fiftyIdx = 0; fiftyIdx <= coin50Limit; fiftyIdx++) {
        // Calculate the total value of the current coin combination.
        const currentTotal = (fiveHundredIdx * 500) + (hundredIdx * 100) + (fiftyIdx * 50);

        // Check if the calculated total matches the desired target sum.
        if (currentTotal === targetSum) {
          validCombinations++; // If it matches, increment the combination counter.
        }
      }
    }
  }

  // Display the final tally of unique combinations that meet the target sum.
  console.log(validCombinations);
};