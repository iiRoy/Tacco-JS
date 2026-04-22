process.stdin.setEncoding('utf8');

let collectedInputBuffer = '';

// Event listener for incoming data segments from standard input
process.stdin.on('data', dataSegment => {
  collectedInputBuffer += dataSegment;
});

// Event listener for the end of the input stream
process.stdin.on('end', () => {
  // Step 1: Clean and segment the raw input string
  // Type III: Utilizing trimEnd for efficient trailing whitespace removal
  const cleanedInputString = collectedInputBuffer.trimEnd();

  // Type III: Splitting the string by one or more whitespace characters
  // and filtering out any empty string segments that might result from the split.
  const stringFactors = cleanedInputString
    .split(/\s+/)
    .filter(segment => segment.length > 0);

  const parsedNumericFactors = [];
  // Type III: Explicitly converting each string segment to a numeric value.
  // This makes the conversion process transparent, unlike implicit conversions in reduce.
  for (const strVal of stringFactors) {
    const numValue = Number(strVal);
    parsedNumericFactors.push(numValue);
  }

  // Type III: Determine the initial product value, especially for edge cases.
  // Original behavior for empty input (e.g., "") results in 0.
  let multiplicativeIdentity = 1; // Default for multiplication
  if (parsedNumericFactors.length === 0) {
    multiplicativeIdentity = 0; // Align with original behavior for no numeric input
  }

  // Type III: Invoke the core computation and display logic, passing the prepared data.
  processAndDisplayProduct(parsedNumericFactors, multiplicativeIdentity);
});

/**
 * Calculates the product of an array of numbers and outputs the result.
 * This function handles cases where the input array is empty or contains non-numeric values.
 *
 * @param {number[]} factors - An array of numbers to be multiplied.
 * @param {number} fallbackResultForNoFactors - The value to return if the factors array is empty.
 */
function processAndDisplayProduct(factors, fallbackResultForNoFactors) {
  let computedMultiplicationResult;

  // Type III: Replacing the `reduce` method with an explicit loop for better control
  // and to demonstrate a structural rewrite.
  if (factors.length === 0) {
    computedMultiplicationResult = fallbackResultForNoFactors;
  } else {
    // Type III: Initialize the accumulator with the first factor.
    computedMultiplicationResult = factors[0];

    // Type III: Iterate through the remaining factors to compute the product.
    for (let i = 1; i < factors.length; i++) {
      const nextFactor = factors[i];
      // Type III: Optimization - if the product becomes NaN, further multiplication
      // will also result in NaN, so we can break early.
      if (isNaN(computedMultiplicationResult)) {
        break;
      }
      computedMultiplicationResult *= nextFactor;
    }
  }

  // Type III: Output the final result, adding a newline for better console readability.
  process.stdout.write(computedMultiplicationResult.toString() + '\n');
}