// This module is designed to process a multi-line string input, extracting numerical data
// and performing a specific parity check on a derived sum.
function ProcessInputData(incomingText) {

  // First, we segment the raw input string into an array of individual lines.
  // Using a regular expression to handle both Windows (\r\n) and Unix (\n) line endings robustly.
  const dataSegments = incomingText.split(/\r?\n/);

  // Implement a basic validation check: ensure there are enough lines to parse.
  // If not, log an error and terminate the function gracefully.
  if (dataSegments.length < 3) {
    console.error("Input data malformed: Expected at least three lines (count, first set, second set).");
    return;
  }

  // Parse the first line to determine the expected number of elements in the subsequent data sets.
  // We use the unary plus operator for concise string-to-number conversion.
  const expectedElementCount = +dataSegments[0];

  // Process the second line: split it by spaces, convert each part to a number,
  // and filter out any values that couldn't be successfully converted (e.g., empty strings).
  const primaryValues = dataSegments[1].split(' ').map(valueStr => Number(valueStr)).filter(num => !isNaN(num));

  // Process the third line similarly, for the comparison data set.
  const secondaryValues = dataSegments[2].split(' ').map(valueStr => Number(valueStr)).filter(num => !isNaN(num));

  // Another validation step: confirm that the actual number of parsed elements
  // matches the count declared on the first line.
  if (primaryValues.length !== expectedElementCount || secondaryValues.length !== expectedElementCount) {
    console.error("Data length mismatch: The declared element count does not match the actual number of values parsed.");
    return;
  }

  // --- Core Calculation Logic (Rewritten for Type III transformation) ---
  // The original code calculated sum(B[i] - A[i]).
  // This is mathematically equivalent to sum(B[i]) - sum(A[i]).
  // We will compute the sum of each array separately for a different execution path.

  let totalSumPrimary = 0; // Accumulator for the sum of elements in the primary data set.
  let totalSumSecondary = 0; // Accumulator for the sum of elements in the secondary data set.

  // Iterate through the arrays to compute their respective sums.
  // Using a modern 'for...of' loop for clarity, if applicable, or traditional 'for' with 'let'.
  // Sticking to traditional 'for' to align with original's iterative nature.
  for (let currentIdx = 0; currentIdx < expectedElementCount; currentIdx++) {
    totalSumPrimary += primaryValues[currentIdx];
    totalSumSecondary += secondaryValues[currentIdx];
  }

  // Calculate the final aggregate difference between the two sums.
  const netDifferenceAccumulation = totalSumSecondary - totalSumPrimary;

  // Determine the parity of the accumulated difference.
  // A number is odd if its remainder when divided by 2 is 1 or -1.
  const isResultOdd = (netDifferenceAccumulation % 2) !== 0;

  // Prepare the response string based on the parity check.
  let finalVerdict;
  if (isResultOdd) {
    finalVerdict = "Yes";
  } else {
    finalVerdict = "No";
  }

  // Output the final verdict to the console.
  console.log(finalVerdict);
}

// The following line is for standard input/output handling and should not be altered.
// It reads the entire content of standard input and passes it to our processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));