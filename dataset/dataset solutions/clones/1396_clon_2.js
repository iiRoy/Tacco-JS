/*
 * This module processes a string of numerical data.
 * It performs arithmetic operations and outputs the results.
 */
function PerformCalculations(
  sourceString // Raw input text containing numbers
) {
  // Parse the input string into an array of floating-point numbers.
  // The numbers are expected to be space-separated.
  var numericOperands = sourceString.split(" ").map(parseFloat);

  // Compute and display the results of division, modulo, and division again.
  // The first number divided by the second, the remainder of the first by the second,
  // and the first number divided by the second (as a float).
  console.log(
    "%d %d %f",
    numericOperands[0] / numericOperands[1],
    numericOperands[0] % numericOperands[1],
    numericOperands[0] / numericOperands[1]
  );
}

// Entry point: Read input from standard input and pass it to the processing function.
// This uses Node.js's file system module to read the entire content of /dev/stdin.
PerformCalculations(require("fs").readFileSync("/dev/stdin"));