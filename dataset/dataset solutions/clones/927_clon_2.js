(function executeProgram() {
  // This function encapsulates the main logic of the application.
  // It calculates a Fibonacci-like sequence value based on an input from stdin.

  // Read the input from standard input, convert it to a number, and increment by one.
  const inputVal = Number(require('fs').readFileSync('/dev/stdin', 'utf8')) + 1;

  // Pre-calculate the square root of five for repeated use in the formula.
  const sqrtFive = Math.sqrt(5.0);

  // Apply Binet's formula for the nth Fibonacci number (or a similar sequence).
  // The formula is F(n) = (phi^n - psi^n) / sqrt(5), where phi = (1 + sqrt(5))/2 and psi = (1 - sqrt(5))/2.
  // The result is rounded to the nearest whole number before being printed to the console.
  console.log(Math.round(1.0 / sqrtFive * (Math.pow((1.0 + sqrtFive) / 2.0, inputVal) - Math.pow((1.0 - sqrtFive) / 2.0, inputVal))));
})();
