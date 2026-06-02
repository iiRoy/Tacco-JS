/*
 This script processes a single numerical input.
 It calculates a specific difference and prints the result.
 */
function ProcessData(rawData) {
  // Parse the input string into an integer
  let valueA = parseInt(rawData);

  // Perform the core calculation
  let resultVal = 48 - valueA;

  // Output the computed value to the console
  console.log('%d', resultVal);
}

// The following line handles reading from standard input and invoking the main processing function.
// It should not be modified to ensure proper execution in the given environment.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
