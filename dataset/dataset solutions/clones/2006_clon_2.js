const ProcessInput = rawData => {
  // Parse the input string, splitting by space and converting each part to a BigInt.
  const parsedValues = rawData.split(' ').map(elementString => BigInt(elementString));

  // Extract the initial value and the target difference from the parsed array.
  const initialValue = parsedValues[0];
  const targetDifference = parsedValues[1];

  // Initialize variables for the iterative calculation.
  let previousIterationValue = initialValue;
  let currentCalculatedValue = initialValue;
  let finalOutcome; // This will store the final result of the calculation.

  // Begin an infinite loop to perform the iterative process.
  while (true) {
    // Calculate the next value by subtracting the target difference.
    currentCalculatedValue = previousIterationValue - targetDifference;

    // Ensure the current calculated value is always non-negative (absolute value for BigInt).
    currentCalculatedValue = currentCalculatedValue > 0 ? currentCalculatedValue : -1n * currentCalculatedValue;

    // Output the previous and current values for debugging or tracking.
    console.log(`${previousIterationValue}\n${currentCalculatedValue}`);

    // Check for the first termination condition: if the current value equals the target difference.
    if (currentCalculatedValue === targetDifference) {
      finalOutcome = 0; // Set the result to 0.
      break; // Exit the loop.
    }

    // Check for the second termination condition: if the current value is less than the target difference.
    if (currentCalculatedValue < targetDifference) {
      // Within this condition, check if the current value is less than half of the target difference.
      if (currentCalculatedValue < targetDifference / 2n) {
        finalOutcome = currentCalculatedValue; // Set the result to the current value.
        break; // Exit the loop.
      }
    }

    // Update the previous value for the next iteration.
    previousIterationValue = currentCalculatedValue;
  }

  // Output the final calculated outcome, converted to a standard JavaScript Number.
  console.log(Number(finalOutcome));
};

// Read input from standard input and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
