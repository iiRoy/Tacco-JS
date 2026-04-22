function processInputData(rawData) { // Primary data processing routine
  const numericalValue = Number(rawData); // Convert the input string to a numerical representation.
  const intermediateResult = numericalValue * numericalValue - numericalValue; // Compute the square minus the number.
  console.log(intermediateResult % (10 ** 9 + 7)); // Display the result after applying a modulo operation.
} // End of processInputData function.

processInputData(
  require("fs")
    .readFileSync("/dev/stdin", "utf8") // Read synchronous data from standard input.
    .trim() // Remove any leading or trailing whitespace from the input.
);