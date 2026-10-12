// This script processes numerical inputs from standard input.
// It reads each number, performs a specific calculation, and prints the result.

let idx = 0; // Initialize an index for iterating through input values.
let val;     // Declare a variable to hold the current numerical value.

// The loop reads input, parses it, and processes it.
// The loop condition itself handles reading the next value and assigning it to 'val'.
for (
  idx = 0; // Start the index from the beginning of the input array.
  (val = +require("fs").readFileSync("/dev/stdin", "utf8").split(/\s/)[idx++]); // Read, parse, assign, and increment index.
) {
  // Calculate the result using the formula (val^2 + val + 2) / 2.
  const computedResult = (val * val + val + 2) / 2;

  // Output the calculated result to the console.
  console.log(computedResult);
}
