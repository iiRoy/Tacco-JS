const computeSumOfPowers = (inputStringData) => {
  // Parse the input string to an integer, representing the initial threshold.
  let currentLimitValue = parseInt(inputStringData, 10);

  // Initialize a multiplier, typically starting at 1.
  let nodesInCurrentLevel = 1;

  // Initialize the accumulator for the final result.
  let totalAggregatedValue = 1;

  while (true) { // Loop indefinitely until a condition is met to exit.
    currentLimitValue /= 2; // Halve the current limit for the next iteration.

    if (currentLimitValue < 1) { // Check if the limit has fallen below 1.
      break; // Exit the loop if the condition is met.
    }

    nodesInCurrentLevel *= 2; // Double the node count for the next level.
    totalAggregatedValue += nodesInCurrentLevel; // Add the current level's nodes to the total.
  }

  console.log(totalAggregatedValue); // Display the final computed sum.
};

// Entry point: Read data from standard input and execute the computation.
computeSumOfPowers(
  require("fs").readFileSync(
    "/dev/stdin",
    "utf8" // Specify UTF-8 encoding for file reading.
  )
);