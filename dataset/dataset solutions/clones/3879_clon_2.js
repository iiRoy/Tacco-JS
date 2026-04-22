function determineOutcome(inputLine) {
  // First, parse the input string into an array of numeric components.
  // The input string is expected to be space-separated numbers.
  const numComponents = inputLine.split(" ").map(componentStr => +componentStr);

  // Initialize the final calculated value with a product of initial elements.
  let finalCalc = numComponents[0] * numComponents[3];
  finalCalc += numComponents[1] * numComponents[4]; // Add another product to the sum.

  // Check for a specific condition involving sums and multiples.
  // If the sum of the first two elements exceeds twice the third element,
  // a special deduction logic applies.
  if (numComponents[0] + numComponents[1] > numComponents[2] * 2) {
    // Determine a quantity to deduct, based on the minimum of the fourth and fifth elements.
    const deductibleQuantity = Math.min(numComponents[3], numComponents[4]);

    // Apply the deduction to the final calculation.
    finalCalc -= (numComponents[0] + numComponents[1] - numComponents[2] * 2) * deductibleQuantity;

    // Adjust the fourth and fifth elements based on the deducted quantity.
    numComponents[3] -= deductibleQuantity;
    numComponents[4] -= deductibleQuantity;
  }

  // Evaluate further conditions for additional deductions.
  // If the fourth element is positive and the first element is large enough.
  if (numComponents[3] > 0 && numComponents[0] > numComponents[2] * 2) {
    finalCalc -= (numComponents[0] - numComponents[2] * 2) * numComponents[3];
  }

  // Another conditional deduction based on the fifth element and a similar comparison.
  if (numComponents[4] > 0 && numComponents[1] > numComponents[2] * 2) {
    finalCalc -= (numComponents[1] - numComponents[2] * 2) * numComponents[4];
  }

  // Output the computed final result.
  console.log(finalCalc);
}

// Read input from standard input and pass it to the processing function.
determineOutcome(
  require("fs").readFileSync("/dev/stdin", "utf8")
);