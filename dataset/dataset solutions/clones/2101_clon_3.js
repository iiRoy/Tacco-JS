// Function designed to process incoming raw data and identify a specific numeric value
// based on given tax rate conditions.
function ProcessInputData(rawData) {
  // First, clean up the input string by removing leading/trailing whitespace.
  // Then, split the string into an array of substrings using space as the delimiter.
  // This assumes the input contains two space-separated numbers.
  const inputParts = rawData.trim().split(' ');

  // Attempt to convert the first part of the input into an integer.
  // This integer represents the expected amount when a base value is taxed at 8%.
  const expectedEightPercentTaxAmount = parseInt(inputParts[0], 10);

  // Similarly, convert the second part into an integer.
  // This integer represents the expected amount when the same base value is taxed at 10%.
  const expectedTenPercentTaxAmount = parseInt(inputParts[1], 10);

  // Initialize a variable to store the final determined base amount.
  // A value of -1 indicates that no suitable base amount has been found yet.
  let finalDeterminedBaseAmount = -1;

  // Define a practical upper limit for our search space for the base amount.
  // Given typical problem constraints for 'A' and 'B' (e.g., up to 1000),
  // the base amount 'X' could be up to approximately 12500 (1000 / 0.08).
  // A slightly larger constant ensures we cover all plausible scenarios.
  const SEARCH_RANGE_MAX = 15000;

  // Calculate an optimized starting point for our search loop.
  // For an integer X, if floor(X * 0.08) == expectedEightPercentTaxAmount,
  // then X * 0.08 must be >= expectedEightPercentTaxAmount.
  // Thus, X >= expectedEightPercentTaxAmount / 0.08.
  // Similarly, X >= expectedTenPercentTaxAmount / 0.10.
  // We must start checking from the largest of these two lower bounds, rounded up to the nearest integer.
  const searchRangeMin = Math.max(
    Math.ceil(expectedEightPercentTaxAmount / 0.08),
    Math.ceil(expectedTenPercentTaxAmount / 0.10)
  );

  // Iterate through possible integer base amounts, starting from our calculated minimum
  // up to the predefined maximum search range.
  for (let currentEvaluatedBase = searchRangeMin; currentEvaluatedBase <= SEARCH_RANGE_MAX; ++currentEvaluatedBase) {
    // For the current base amount, calculate what the 8% tax would be.
    // The problem implies integer tax amounts, so we use Math.floor.
    const calculatedEightPercentTax = Math.floor(currentEvaluatedBase * 0.08);

    // Similarly, calculate the 10% tax for the current base amount.
    const calculatedTenPercentTax = Math.floor(currentEvaluatedBase * 0.10);

    // Check if both calculated tax amounts match their respective expected values.
    if (calculatedEightPercentTax === expectedEightPercentTaxAmount && calculatedTenPercentTax === expectedTenPercentTaxAmount) {
      // If a match is found, this 'currentEvaluatedBase' is our answer.
      // Store it and immediately exit the loop as we've found the solution.
      finalDeterminedBaseAmount = currentEvaluatedBase;
      break;
    }
  }

  // Output the final determined base amount (or -1 if none was found) to the standard console.
  console.log(finalDeterminedBaseAmount);

  // Return the result, which can be useful for testing or integration with other modules.
  return finalDeterminedBaseAmount;
}

// The following line executes the main processing function.
// It reads the entire content from standard input (usually /dev/stdin in competitive programming environments),
// decodes it as a UTF-8 string, and passes it to the ProcessInputData function.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));