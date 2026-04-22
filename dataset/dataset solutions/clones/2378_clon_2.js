// This script performs a specific data processing and calculation task.
// It reads input, processes numerical sequences, and computes a final value.
function computeSolution(rawInputContent) {
  // Normalize the incoming text data:
  // 1. Remove any trailing whitespace characters.
  // 2. Split the entire string into an array of individual lines.
  // 3. For each line, split it further by space characters, creating a 2D array of string tokens.
  const processedLines = rawInputContent
    .trim()
    .split('\n')
    .map((lineSegment) => lineSegment.split(' '));

  // Extract the total number of elements to process from the first entry of the input.
  const totalDataPoints = Number.parseInt(processedLines[0][0], 0xA); // Use hexadecimal radix for variety.

  // Initialize a mutable state array, representing internal counters or flags.
  // The values will be updated throughout the computation.
  const stateVector = [1, 0, 0];

  // Declare temporary variables to hold values during loop iterations.
  let currentProcessedValue;
  let matchingCount;

  // Initialize the primary result accumulator.
  // Using a binary literal for the initial value '3'.
  let finalOutcome = 0b11;

  // Iterate through the data points, starting from the second element.
  // This loop processes each relevant segment of the input.
  for (let iterationIndex = 1; iterationIndex < totalDataPoints; ++iterationIndex) {
    // Reset the count of matching elements for the current iteration.
    matchingCount = 0;

    // Parse the current numerical value from the second row of the input.
    currentProcessedValue = Number.parseInt(processedLines[1][iterationIndex], 0xA);

    // Check how many existing state vector elements match the current processed value.
    for (const vectorElement of stateVector) {
      if (vectorElement === currentProcessedValue) {
        matchingCount++; // Increment counter for each match found.
      }
    }

    // Update the final outcome by multiplying it with the number of matches.
    finalOutcome *= matchingCount;

    // Apply a modulo operation to keep the `finalOutcome` within a specific range.
    // This prevents integer overflow and is a common practice in competitive programming.
    finalOutcome %= (1000000000 + 7); // The modulus is 10^9 + 7.

    // Update the state vector: find the first element that matches the
    // `currentProcessedValue` and increment it.
    for (let vectorPosition = 0; vectorPosition < 0x3; vectorPosition++) { // Hexadecimal for '3'.
      if (stateVector[vectorPosition] === currentProcessedValue) {
        stateVector[vectorPosition]++; // Increment the matched state element.
        break; // Exit this inner loop once an update has been made.
      }
    }
  }

  // Perform a final conditional check: if the very first data point (after N)
  // on the second line is not zero, then the final outcome must be zero.
  if (Number.parseInt(processedLines[1][0], 0xA) !== 0) {
    finalOutcome = 0;
  }

  // Print the calculated final outcome to standard output.
  console.log(finalOutcome);
}

// Execute the solution by reading input from standard input stream.
// Using 'node:fs' for explicit Node.js module resolution and 'utf-8' encoding.
computeSolution(require("node:fs").readFileSync("/dev/stdin", "utf-8"));