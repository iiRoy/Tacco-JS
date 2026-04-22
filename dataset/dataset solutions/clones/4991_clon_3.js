/**
 * A utility function designed to process specific financial or quantity-based data
 * provided as a raw string input. It calculates a final weighted sum based on
 * initial and additional quantities, each with distinct billing rates.
 *
 * This function serves as the primary entry point for the calculation logic.
 *
 * @param {string} rawInputContent - The complete input string, typically originating from
 *                                   a standard input stream or a file, where each
 *                                   relevant data point is on a new line.
 */
function processFinancialData(rawInputContent) {
  // First, parse the entire input string into an array of individual lines.
  // This assumes that each required numeric value is provided on its own line.
  const inputLines = rawInputContent.split('\n');

  // Implement a basic validation check to ensure that all expected data points are present.
  // In this scenario, we anticipate at least four lines of numeric data.
  const EXPECTED_MIN_LINES = 4;
  if (inputLines.length < EXPECTED_MIN_LINES) {
    // If the input is incomplete, log an error and terminate the process gracefully.
    console.error("Input Error: Not enough data lines provided. Expected a minimum of " + EXPECTED_MIN_LINES + " lines.");
    return; // Exit the function to prevent further processing with insufficient data.
  }

  // Extract and convert the string representations of numbers from the input lines
  // into actual numeric values. Using Number() for flexible parsing.
  // Line 0: Represents the grand total or overall capacity/limit.
  const grandTotalQuantity = Number(inputLines[0]);
  // Line 1: Represents the quantity that falls under the 'initial' pricing tier.
  const initialBlockQuantity = Number(inputLines[1]);
  // Line 2: Represents the per-unit rate for the 'initial' quantity block.
  const initialBlockRate = Number(inputLines[2]);
  // Line 3: Represents the per-unit rate for any 'additional' quantity beyond the initial block.
  const additionalBlockRate = Number(inputLines[3]);

  // --- Begin Detailed Calculation Steps ---

  // Calculate the cost associated with the initial quantity block.
  // This is a direct multiplication of the quantity by its specific rate.
  const costOfInitialPortion = initialBlockQuantity * initialBlockRate;

  // Determine the quantity that exceeds the initial block.
  // We use Math.max(0, ...) to ensure that the additional quantity is never negative,
  // even if the grand total is less than the initial block quantity. This prevents
  // negative billing for the 'additional' part in such scenarios.
  const quantityBeyondInitial = Math.max(0, grandTotalQuantity - initialBlockQuantity);

  // Calculate the cost for the quantity that falls into the 'additional' category.
  // This uses the quantity determined above and the specific rate for additional units.
  const costOfAdditionalPortion = quantityBeyondInitial * additionalBlockRate;

  // Finally, sum up the costs from both the initial and additional portions
  // to arrive at the total calculated financial value.
  const finalCalculatedValue = costOfInitialPortion + costOfAdditionalPortion;

  // Output the computed result to the standard output stream.
  // This is the primary way the script communicates its result.
  console.log(finalCalculatedValue);
}

// The following line serves as the execution entry point when the script is run.
// It reads the entire content from standard input (typically '/dev/stdin' on Unix-like systems),
// decodes it as UTF-8, and then passes this raw string to our processing function.
processFinancialData(require("fs").readFileSync("/dev/stdin", "utf8"));