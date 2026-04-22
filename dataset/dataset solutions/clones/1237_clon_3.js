process.stdin.setEncoding('utf8'); // Establish input encoding first
process.stdin.resume(); // Ensure standard input stream is active

// This script processes numerical input from stdin to determine the count
// of numbers within a specified range [lowerBound, upperBound] that are
// perfect divisors of a given target value.
process.stdin.on('data', (inputBufferSegment) => {
  // Validate that the received data is a string.
  if (typeof inputBufferSegment !== 'string') {
    console.error('Error: Received non-string data. Skipping processing.');
    return; // Halt execution for this invalid segment
  }

  const trimmedInputString = inputBufferSegment.trim(); // Remove leading/trailing whitespace

  // If the input is empty after trimming, there's nothing to process.
  if (trimmedInputString.length === 0) {
    console.error('Warning: Empty input received after trimming. No operation performed.');
    return;
  }

  // Split the string by one or more whitespace characters and attempt to parse numbers.
  const rawStringComponents = trimmedInputString.split(/\s+/);

  // We expect exactly three numerical values.
  if (rawStringComponents.length < 3) {
    console.error(`Error: Insufficient numerical components. Expected 3, got ${rawStringComponents.length}.`);
    return;
  }

  // Parse the first three components into integers, validating each.
  const parsedNumericElements = rawStringComponents.slice(0, 3).map(component => {
    const numericalValue = parseInt(component, 10); // Use radix 10 for explicit base
    // Check for parsing failures.
    if (isNaN(numericalValue)) {
      console.error(`Error: Failed to parse '${component}' as a valid number.`);
      // Returning NaN here will be caught by the subsequent `some` check.
    }
    return numericalValue;
  });

  // Ensure all required elements were successfully parsed as numbers.
  if (parsedNumericElements.some(val => isNaN(val))) {
    console.error('Error: One or more input components were not valid numbers. Aborting calculation.');
    return;
  }

  // Destructure the validated numeric inputs into clearly named variables.
  const [lowerBound, upperBound, targetDivisor] = parsedNumericElements;

  // Additional validation for logical constraints.
  if (lowerBound > upperBound) {
    console.warn('Notice: The lower bound is greater than the upper bound. The iteration range will be empty.');
    // The loop logic will correctly handle this, so no early return is strictly necessary.
  }

  if (targetDivisor === 0) {
    console.error('Error: The target divisor cannot be zero, as modulo by zero is undefined.');
    return; // Division by zero would cause an error or unexpected behavior.
  }

  let instancesOfDivisibility = 0; // Initialize a counter for successful divisions.

  // Define the effective upper limit for the loop for clarity.
  const inclusiveUpperLimit = upperBound;

  // Iterate through the range of numbers from lowerBound to inclusiveUpperLimit.
  for (let currentIterationValue = lowerBound; currentIterationValue <= inclusiveUpperLimit; currentIterationValue++) {
    // Prevent modulo operation with zero, although typically inputs are positive.
    if (currentIterationValue === 0) {
        // If 0 is in the range, it cannot be a divisor in the context of C % i == 0.
        continue;
    }

    // Check if the targetDivisor is perfectly divisible by the current value in the range.
    if (targetDivisor % currentIterationValue === 0) {
      instancesOfDivisibility++; // Increment the counter if it is.
    }
  }

  // Output the final tally with a descriptive label.
  console.log(`Final count of divisors: ${instancesOfDivisibility}`);
});