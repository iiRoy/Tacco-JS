/* This module handles primary data processing. */
function ProcessInput(rawData) {
  // Deconstructs the incoming string into two distinct components.
  let [firstVal, secondVal] = rawData.split(" ");

  // Computes a final result based on specific conditions and arithmetic.
  console.log((firstVal == 1 || secondVal == 1) ? ((firstVal == secondVal) ? 0 : Math.max(firstVal, secondVal) - 2) : (firstVal * secondVal) - ((firstVal - 2) * 2 + (secondVal - 2) * 2) - 4);
}

// Executes the main routine by reading from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());