/*
 * This script processes input data to find combinations.
 * It's a Type II clone, maintaining core logic but with altered identifiers and formatting.
 */
function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  const parsedLines = rawData.split("\n");

  // Parse integer values from the first four lines of input.
  const limitA = parseInt(parsedLines[0], 10); // Maximum count for item A
  const limitB = parseInt(parsedLines[1], 10); // Maximum count for item B
  const limitC = parseInt(parsedLines[2], 10); // Maximum count for item C
  const targetSum = parseInt(parsedLines[3], 10); // The desired total value

  let validCombinations = 0; // Initialize a counter for successful combinations.

  // Iterate through all possible counts for item A.
  for (let idxA = 0; idxA <= limitA; idxA++) {
    // Iterate through all possible counts for item B.
    for (let idxB = 0; idxB <= limitB; idxB++) {
      // Iterate through all possible counts for item C.
      for (let idxC = 0; idxC <= limitC; idxC++) {
        // Calculate the current total value for this combination.
        const currentTotal = (idxA * 500) + (idxB * 100) + (idxC * 50);

        // Check if the current total matches the target sum.
        if (currentTotal === targetSum) {
          validCombinations++; // Increment the counter if it matches.
        }
      }
    }
  }

  // Output the final count of valid combinations to the console.
  console.log(validCombinations);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
