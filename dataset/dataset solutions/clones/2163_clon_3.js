function CalculateMinimumOperations(inputStringData) {
  // Process raw input: split into lines and remove any blank lines to ensure valid data.
  // This step replaces the original method of splitting and then conditionally removing a trailing empty element.
  let processedLines = inputStringData.split('\n').filter(lineContent => lineContent.trim() !== '');

  // Guard clause: If no valid lines remain after processing, log an error and exit.
  if (processedLines.length === 0) {
    console.error("Error: No meaningful numeric sequence found in the provided input data.");
    return;
  }

  // The primary numeric sequence for calculation is assumed to be the first non-empty line.
  const targetNumericSequence = processedLines[0];

  // Guard clause: Handle cases where the numeric sequence itself is empty.
  if (targetNumericSequence.length === 0) {
    console.warn("Warning: The target numeric sequence is empty. The result is conventionally zero.");
    console.log(0); // An empty sequence implies zero operations.
    return;
  }

  // Initialize dynamic programming state variables.
  // 'costToIncrement' tracks the minimum operations to achieve a state where the current digit is effectively 'incremented' (e.g., pushed up).
  // 'costToDecrement' tracks the minimum operations to achieve a state where the current digit is effectively 'decremented' (e.g., pushed down or kept).
  let costToIncrement = 1; // Initial cost for the 'up' state.
  let costToDecrement = 0; // Initial cost for the 'down' state.

  // Temporary variables to store the computed costs for the next iteration step.
  let nextIterationIncrementCost;
  let nextIterationDecrementCost;

  // Iterate through each character of the numeric string, treating each as a digit.
  for (let digitPosition = 0; digitPosition < targetNumericSequence.length; digitPosition++) {
    // Convert the current character digit from string to integer.
    // Using parseInt for explicit type conversion and radix specification.
    const currentDigitValue = parseInt(targetNumericSequence[digitPosition], 10);

    // Calculate potential costs for the 'increment' path for the current digit.
    // Option A: Adjust from previous 'increment' state by 'decrementing' (9 - currentDigitValue).
    const optionA_forIncrement = (9 - currentDigitValue) + costToIncrement;
    // Option B: Adjust from previous 'decrement' state by 'incrementing' (1 + currentDigitValue).
    const optionB_forIncrement = (1 + currentDigitValue) + costToDecrement;

    // Select the minimum cost for the 'increment' state for the current digit.
    nextIterationIncrementCost = Math.min(optionA_forIncrement, optionB_forIncrement);

    // Calculate potential costs for the 'decrement' path for the current digit.
    // Option A: Adjust from previous 'increment' state by 'decrementing' more aggressively (10 - currentDigitValue).
    const optionA_forDecrement = (10 - currentDigitValue) + costToIncrement;
    // Option B: Adjust from previous 'decrement' state by 'incrementing' or keeping (currentDigitValue).
    const optionB_forDecrement = currentDigitValue + costToDecrement;

    // Select the minimum cost for the 'decrement' state for the current digit.
    nextIterationDecrementCost = Math.min(optionA_forDecrement, optionB_forDecrement);

    // Update the state variables for the next iteration of the loop.
    costToIncrement = nextIterationIncrementCost;
    costToDecrement = nextIterationDecrementCost;
  }

  // After processing all digits, the final minimum total operations is typically represented by 'costToDecrement'.
  console.log(`Calculated total minimum operations: ${costToDecrement}`);
}

// This section handles reading from standard input and invoking the main processing function.
// It is typically outside the scope of the core algorithm but necessary for execution in a specific environment.
CalculateMinimumOperations(require("fs").readFileSync("/dev/stdin", "utf8"));