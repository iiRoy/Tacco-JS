const processInputData = (rawDataString) => {
  // First, we normalize the raw input by removing any leading/trailing whitespace,
  // then split it into individual lines based on newline characters.
  const inputLines = rawDataString.trim().split('\n');

  // A guard clause to ensure that we have at least two numerical values to process.
  // If not, we log an error and terminate the function gracefully.
  if (inputLines.length < 2) {
    console.error('Error: Insufficient data provided. Expected at least two distinct numerical entries.');
    return;
  }

  // Attempt to parse the first two lines into integer numbers.
  // Using parseInt with radix 10 ensures explicit base conversion.
  const potentialFirstNumber = parseInt(inputLines[0], 10);
  const potentialSecondNumber = parseInt(inputLines[1], 10);

  // Another validation step: check if the parsed values are indeed valid numbers.
  // If either conversion results in NaN (Not a Number), an error is logged.
  if (isNaN(potentialFirstNumber) || isNaN(potentialSecondNumber)) {
    console.error('Error: Input values must be valid integers.');
    return;
  }

  // Initialize working variables with the validated numeric inputs.
  let currentAdjustableValue = potentialFirstNumber;
  const fixedComparisonValue = potentialSecondNumber;

  // Define a constant for the specific threshold used in the adjustment logic.
  // This improves readability and maintainability.
  const ADJUSTMENT_THRESHOLD = 500;

  // The core logic for adjusting the first number.
  // If the current value exceeds the defined threshold, it needs to be reduced.
  // The original problem's behavior for values like 1000 (becomes 500) and 501 (becomes 1)
  // suggests a modulo operation with a special case for exact multiples of the threshold.
  if (currentAdjustableValue > ADJUSTMENT_THRESHOLD) {
    const remainderAfterDivision = currentAdjustableValue % ADJUSTMENT_THRESHOLD;

    // If the remainder is zero, it means the value was an exact multiple of the threshold.
    // In this specific context, exact multiples (e.g., 1000) should be treated as the threshold itself (500),
    // not zero as a standard modulo operation would yield.
    if (remainderAfterDivision === 0) {
      currentAdjustableValue = ADJUSTMENT_THRESHOLD;
    } else {
      // Otherwise, the adjusted value is simply the remainder.
      currentAdjustableValue = remainderAfterDivision;
    }
  }

  // A boolean flag to store the result of the final comparison.
  let isConditionSatisfied = false;

  // Perform the final comparison between the adjusted first value
  // and the second, unaltered input value.
  if (currentAdjustableValue <= fixedComparisonValue) {
    isConditionSatisfied = true; // The condition holds true.
  } else {
    isConditionSatisfied = false; // The condition does not hold.
  }

  // Based on the comparison result, output the appropriate string.
  if (isConditionSatisfied) {
    console.log('Yes');
  } else {
    console.log('No');
  }
};

// This block handles reading input from the standard input stream,
// which is common in environments like competitive programming.
try {
  const fileSystemModule = require('fs');
  const programInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  processInputData(programInputContent);
} catch (error) {
  // A basic error handler for issues during input reading.
  console.error('Failed to read input from /dev/stdin:', error.message);
}