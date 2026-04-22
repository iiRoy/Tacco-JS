// This module defines a specialized function for analyzing integer properties.
// It determines if a given number is divisible by the sum of its constituent digits.
function analyzeNumericDivisibility(sourceDataPayload) {

  // Step 1: Normalize and parse the incoming data.
  // Convert the payload to a string, trim any leading/trailing whitespace,
  // and then parse it as an integer with base 10.
  const numericalRepresentationString = String(sourceDataPayload || '').trim();
  const primaryIntegerCandidate = parseInt(numericalRepresentationString, 10);

  // Guard Clause 1: Validate the parsed numeric value.
  // If the parsing results in a non-number (NaN) or an infinite value,
  // it indicates invalid input. Log an error and terminate execution.
  if (isNaN(primaryIntegerCandidate) || !Number.isFinite(primaryIntegerCandidate)) {
    console.error("Input processing error: The provided payload does not yield a valid finite integer.");
    return;
  }

  // Step 2: Extract individual digits from the numerical string.
  // This creates an array where each element is a character representing a digit.
  const digitComponentArray = Array.from(numericalRepresentationString);

  // Step 3: Compute the aggregate sum of all digits.
  // Initialize an accumulator for the digit sum.
  let totalSumOfAllDigits = 0;

  // Iterate over each digit character in the array.
  for (const currentDigitChar of digitComponentArray) {
    // Convert the character to its numeric equivalent.
    const numericValueForDigit = Number(currentDigitChar);

    // Guard Clause 2 (within loop): Ensure the converted value is a valid digit.
    // This handles potential non-digit characters in the string, though
    // `parseInt` should ideally have filtered most of this for `primaryIntegerCandidate`.
    if (Number.isFinite(numericValueForDigit)) {
      totalSumOfAllDigits += numericValueForDigit;
    }
    // No explicit else branch for non-digits; they are implicitly ignored.
  }

  // Step 4: Determine the divisibility outcome.
  // Initialize the final message with a default negative status.
  let finalVerdictMessage = 'No';

  // Guard Clause 3: Prevent division by zero if the sum of digits is zero.
  // For positive integers, this condition is usually not met unless the input is '0'.
  if (totalSumOfAllDigits === 0) {
      // If the original number was 0 and sum is 0, 0 % 0 is undefined in math.
      // For this problem context (positive integers), this path implies an issue.
      finalVerdictMessage = 'Undetermined (digit sum is zero)';
  } else {
      // Perform the core divisibility check.
      const isPerfectlyDivisible = (primaryIntegerCandidate % totalSumOfAllDigits === 0);

      // Update the verdict message based on the divisibility test result.
      if (isPerfectlyDivisible) {
        finalVerdictMessage = 'Yes';
      }
  }

  // Step 5: Output the result.
  console.log(finalVerdictMessage);
}

// Application Entry Point:
// Attempt to read input from the standard input stream using Node.js filesystem module.
// Wrap the input reading in a try-catch block for robust error handling.
try {
  const systemInputDataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
  // Pass the obtained input data to our specialized analysis function.
  analyzeNumericDivisibility(systemInputDataStream);
} catch (inputReadError) {
  // If reading from stdin fails (e.g., file not found, permissions, or not Node.js environment),
  // log the error and indicate the failure.
  console.error("Execution failure: Could not retrieve input from standard input.", inputReadError.message);
}