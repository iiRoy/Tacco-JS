// This module provides a solution for a specific numerical problem.
// It processes input data to determine a particular relationship between two integers.
function solveProblem(dataBundle) {
  // A variable to store the final computed outcome or message.
  let finalResultIndicator;

  // The input 'dataBundle' is expected to be a string, possibly multi-lined.
  // We isolate the first line which contains the numerical operands.
  const primaryDataLine = dataBundle.split('\n')[0];

  // Split the primary data line by spaces to get individual string representations of numbers.
  const operandStrings = primaryDataLine.split(' ');

  // Parse the string operands into their numerical integer equivalents.
  // The unary plus operator is used for efficient type conversion.
  const firstNumericValue = +operandStrings[0];
  const secondNumericValue = +operandStrings[1];

  // A new fragment: Input validation. If parsed values are not numbers,
  // it implies malformed input. The problem's "IMPOSSIBLE" output for
  // odd sums can be extended to cover invalid numerical input as well.
  if (isNaN(firstNumericValue) || isNaN(secondNumericValue)) {
    finalResultIndicator = 'IMPOSSIBLE';
  } else {
    // Calculate the combined sum of the two numeric values. This is an intermediate step.
    const aggregatedSum = firstNumericValue + secondNumericValue;

    // Determine the parity of the aggregated sum. This is a key condition.
    // An even sum implies that an integer solution might be possible.
    const isTotalSumEven = (aggregatedSum % 2 === 0);

    // Apply the problem's core logic based on the values and their sum's parity.
    // The objective is to find an integer 'k' such that firstNumericValue + k = secondNumericValue - k.
    // This equation simplifies to 2k = secondNumericValue - firstNumericValue.
    // The common value (firstNumericValue + k) would be (firstNumericValue + secondNumericValue) / 2.

    if (firstNumericValue === secondNumericValue) {
      // If the two numbers are identical, the required 'k' is 0.
      // The problem specifically dictates printing '0' in this scenario.
      finalResultIndicator = 0;
    } else if (isTotalSumEven) {
      // If the numbers are distinct but their total sum is even, an integer 'k' exists.
      // In this case, the problem requests the common midpoint value.
      const calculatedEquilibriumPoint = aggregatedSum / 2;
      finalResultIndicator = calculatedEquilibriumPoint;
    } else {
      // If the total sum is odd, it's mathematically impossible to find an integer 'k'
      // that satisfies the equality condition.
      finalResultIndicator = 'IMPOSSIBLE';
    }
  }

  // Output the final determined result to the standard console.
  console.log(finalResultIndicator);
}

// This boilerplate code handles reading input from standard I/O and invoking the primary function.
// It is typically provided by the execution environment and should remain untouched to ensure
// compatibility with how competitive programming platforms deliver input.
solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));