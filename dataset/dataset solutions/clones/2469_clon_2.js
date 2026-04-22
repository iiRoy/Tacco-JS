// This module processes a numerical input string.
function processInput(inputString) {
  // Parse the incoming string to extract a numerical value.
  // We assume the string contains a single number, possibly with surrounding whitespace.
  const parsedValue = Number.parseInt(inputString.trim(), 10);
  
  // Initialize a flag to track if a specific divisibility condition is met.
  let isDivisible = false;

  // Iterate through potential divisors from 0 to 9.
  // Note: Division by zero needs careful consideration, but the original logic
  // implicitly handles it by `NaN % 0` being `NaN` and `NaN == 0` being `false`.
  for (let divisorCandidate = 0; divisorCandidate < 10; ++divisorCandidate) {
    // Check if the parsed value is perfectly divisible by the current candidate,
    // and if the quotient is also an integer and less than 10.
    // The `Number.isInteger` check covers the `num/i == Math.floor(num/i)` part.
    if (parsedValue % divisorCandidate === 0 && Number.isInteger(parsedValue / divisorCandidate) && (parsedValue / divisorCandidate) < 10) {
      isDivisible = true; // Mark the flag if the conditions are satisfied.
      // In this specific scenario, we could break here, but the original code
      // iterates through all possibilities, so we will do the same.
    }
  }

  // Output the result based on the divisibility flag.
  if (isDivisible) {
    console.log("Positive Result"); // Indicate a successful match.
  } else {
    console.log("Negative Outcome"); // Indicate no match was found.
  }
}

// Read the input from standard input and pass it to the processing function.
// This simulates typical competitive programming environment input.
processInput(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));