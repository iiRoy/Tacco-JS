const processValueCalculations = (inputStrings) => {
  // Parse the raw input string to extract the two target integer values.
  // These targets represent the floored results of applying specific tax rates.
  const [expectedTaxValueA, expectedTaxValueB] = inputStrings[0].split(" ").map(s => parseInt(s, 10));

  // Define the constant tax rates for clarity and potential future modification.
  const TAX_RATE_EIGHT_PERCENT = 0.08;
  const TAX_RATE_TEN_PERCENT = 0.10;

  // Initialize the variable to hold the smallest base amount that satisfies both conditions.
  // A value of -1 indicates that no such amount has been found yet.
  let matchingBaseAmount = -1;

  // Initialize a counter for the potential base amount, starting from zero.
  let currentCandidateAmount = 0;

  // Establish a reasonable upper boundary for the search loop.
  // The logic for 'expectedTaxValueB' (10% tax) dictates that
  // currentCandidateAmount * 0.10 must be less than expectedTaxValueB + 1.
  // Therefore, currentCandidateAmount must be less than 10 * (expectedTaxValueB + 1).
  // Adding a small buffer ensures we don't miss edge cases due to floating-point
  // inaccuracies or off-by-one errors in logic.
  const MAX_SEARCH_ITERATIONS = 10 * (expectedTaxValueB + 1) + 100; // Increased buffer for safety

  // Iterate through potential base amounts using a while loop with explicit break conditions.
  // This structure emphasizes the search nature until a specific condition is met.
  while (true) {
    // Implement an escape clause to prevent infinite loops and limit computation.
    // If we exceed a predefined maximum search limit, it implies no solution exists
    // within a practical range or the problem constraints.
    if (currentCandidateAmount > MAX_SEARCH_ITERATIONS) {
      break; // Exit the loop if the search becomes too extensive.
    }

    // Calculate the floored tax amounts for the current candidate amount using Math.trunc.
    // Math.trunc behaves identically to Math.floor for positive numbers but is more explicit
    // about simply removing the fractional part.
    const calculatedTaxValueA = Math.trunc(currentCandidateAmount * TAX_RATE_EIGHT_PERCENT);
    const calculatedTaxValueB = Math.trunc(currentCandidateAmount * TAX_RATE_TEN_PERCENT);

    // Check if both calculated tax values precisely match their respective expected targets.
    // This combines the logic that was previously handled by separate boolean flags.
    if (calculatedTaxValueA === expectedTaxValueA && calculatedTaxValueB === expectedTaxValueB) {
      matchingBaseAmount = currentCandidateAmount; // Store the first (smallest) matching amount.
      break; // Terminate the loop immediately as the problem seeks the minimum such value.
    }

    // Increment the candidate amount to check the next integer value.
    currentCandidateAmount++;
  }

  // Output the final determined base amount to the console.
  console.log(matchingBaseAmount);
};

// Entry point for execution in a Node.js environment.
// This block is responsible for reading input from standard input,
// processing it, and then invoking the main calculation function.
// It uses 'node:fs' for explicit module reference and 'utf8' encoding for text.
processValueCalculations(
  require('node:fs')
    .readFileSync('/dev/stdin', { encoding: 'utf8' }) // Read the entire content of stdin.
    .trim()                                            // Remove leading/trailing whitespace.
    .split("\n")                                       // Split the content into an array of lines.
);