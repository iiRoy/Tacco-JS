// This module is designed to process a string of numeric inputs
// to determine a specific common divisor between two main numbers.
function analyzeNumericSequence(dataSourceString) {
  // First, we parse the raw input string into individual tokens.
  // The input is expected to be space-separated values.
  const inputTokens = dataSourceString.split(' ');

  // Basic validation: ensure we have enough parameters.
  // We expect at least three numbers: A, B, and K.
  if (inputTokens.length < 3) {
    console.error("Input processing error: Not enough numeric parameters provided. Expected at least three.");
    // In a real application, one might throw an error or return a specific status.
    // For this exercise, matching original behavior (which would likely fail later)
    // or providing a clear error message is sufficient.
    return;
  }

  // Convert string tokens into numerical values.
  // These represent the two numbers for which we'll find common divisors,
  // and an index 'K' to retrieve a specific divisor.
  let firstOperand = Number(inputTokens[0]);
  let secondOperand = Number(inputTokens[1]);
  let targetDivisorRank = Number(inputTokens[2]); // This 'K' value determines which divisor to pick from the end.

  // Additional validation for numeric conversion.
  if (isNaN(firstOperand) || isNaN(secondOperand) || isNaN(targetDivisorRank)) {
    console.error("Input processing error: One or more input values are not valid numbers.");
    return;
  }

  // Helper function to ascertain if a number is perfectly divisible by another.
  // Using the modulo operator is generally more efficient than floating-point division
  // followed by Number.isInteger for integer checks.
  const checkDivisibility = (dividend, divisor) => {
    // A divisor of zero is undefined in division, and modulo by zero is problematic.
    // For positive integers as divisors, this is usually not an issue.
    if (divisor === 0) {
      return false; // Or handle as an error, depending on requirements.
    }
    return dividend % divisor === 0;
  };

  // Determine the minimum and maximum of the two operands.
  // This helps in optimizing the search for common divisors,
  // as a divisor cannot be greater than the smaller of the two numbers.
  const minVal = Math.min(firstOperand, secondOperand);
  const maxVal = Math.max(firstOperand, secondOperand);

  // Initialize an array to store all common divisors found.
  // These will be collected in ascending order.
  const commonDivisorList = [];

  // Iterate from 1 up to the smaller of the two numbers (inclusive).
  // Each 'currentCheckValue' is a potential common divisor.
  for (let currentCheckValue = 1; currentCheckValue <= minVal; currentCheckValue++) {
    // Check if the current value divides both the minimum and maximum operands.
    // If it does, it's a common divisor.
    if (checkDivisibility(minVal, currentCheckValue) && checkDivisibility(maxVal, currentCheckValue)) {
      commonDivisorList.push(currentCheckValue);
    }
  }

  // Now, we need to retrieve the K-th common divisor from the end of the list.
  // The 'targetDivisorRank' (K) is 1-indexed from the end.
  // For example, if K=1, it's the last common divisor.
  let retrievedDivisor;
  const totalDivisorsFound = commonDivisorList.length;

  // Ensure targetDivisorRank is within the valid bounds of the found divisors.
  // If K is 1, index is length - 1. If K is length, index is 0.
  // So, valid range for targetDivisorRank is 1 to totalDivisorsFound.
  if (targetDivisorRank > 0 && targetDivisorRank <= totalDivisorsFound) {
    // Calculate the actual zero-based index.
    const desiredIndex = totalDivisorsFound - targetDivisorRank;
    retrievedDivisor = commonDivisorList[desiredIndex];
  } else {
    // If K is out of bounds, the original behavior would result in 'undefined'
    // after the splice operation. We'll replicate that by not assigning
    // a value to 'retrievedDivisor' if the condition is not met,
    // leaving it 'undefined'.
    // console.warn(`Warning: Target divisor rank (${targetDivisorRank}) is out of bounds for ${totalDivisorsFound} divisors.`);
  }

  // Display the final determined common divisor.
  console.log(retrievedDivisor);
}

// Entry point for executing the program.
// Reads input from standard input, typically '/dev/stdin' in competitive programming environments.
// The input is expected to be UTF-8 encoded.
analyzeNumericSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));