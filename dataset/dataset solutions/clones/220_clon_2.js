function computeGreatestCommonDivisor(firstNumber, secondNumber) {
  // Initialize variables to hold the larger and smaller of the two input numbers.
  let largerValue = Math.max(firstNumber, secondNumber);
  let smallerValue = Math.min(firstNumber, secondNumber);

  // Apply the Euclidean algorithm to find the greatest common divisor.
  // The loop continues as long as the smaller value is not zero.
  while (smallerValue !== 0) {
    // Temporarily store the current smaller value.
    const tempValue = smallerValue;
    // Calculate the remainder when the larger value is divided by the smaller value.
    smallerValue = largerValue % smallerValue;
    // Update the larger value to be the previous smaller value.
    largerValue = tempValue;
  }
  // When the loop terminates, the largerValue holds the GCD.
  return largerValue;
}

// Read all input data from standard input, assuming UTF-8 encoding.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into an array of lines.
const lineSegments = rawData.trim().split("\n");

// Iterate through each individual line segment obtained from the input.
for (let lineIndex = 0; lineIndex < lineSegments.length; lineIndex++) {
  // For the current line, split it by spaces and convert each resulting part into a number.
  const numericParts = lineSegments[lineIndex].split(" ").map(Number);

  // Compute the greatest common divisor for the first two numbers in the current line.
  const commonDivisor = computeGreatestCommonDivisor(numericParts[0], numericParts[1]);

  // Calculate the fractional result. The division by commonDivisor in both numerator and denominator
  // effectively simplifies the fraction before the final division.
  const fractionResult = (numericParts[0] / commonDivisor) / (numericParts[1] / commonDivisor);

  // Extract the third number from the line, which dictates the number of iterations for the next step.
  let iterationCount = numericParts[2];

  // Initialize a variable to accumulate the sum of specific digits.
  let totalSumOfDigits = 0;

  // Loop 'iterationCount' times. The post-decrement operator handles the loop condition and decrements.
  while (iterationCount--) {
    // Format the fraction result to a string with (iterationCount + 2) decimal places.
    // Then, extract the last two characters (digits) from this formatted string.
    const decimalString = (fractionResult.toFixed(iterationCount + 2)).slice(-2);

    // Convert the first character of the extracted two digits (which represents the tens place
    // of the last two decimal digits) to a number and add it to the running total.
    totalSumOfDigits += (decimalString[0] - 0);
  }

  // Print the final accumulated sum of digits for the current input line.
  console.log(totalSumOfDigits);
}
