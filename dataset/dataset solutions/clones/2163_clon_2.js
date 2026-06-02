function ProcessInput(inputData) {
  // Divide the incoming data string into an array of lines.
  let lines = inputData.split('\n');

  // Check if the final element in the array is an empty string,
  // which often occurs with standard input, and remove it if present.
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  // The first line of input is the numerical string we need to process.
  const targetNumberStr = lines[0];

  // Initialize two state variables for a dynamic programming approach.
  // 'costWithCarry' represents the minimum operations needed if a carry-over
  // is generated for the next higher digit.
  let costWithCarry = 1.0;
  // 'costWithoutCarry' represents the minimum operations if no carry-over
  // is generated for the next higher digit.
  let costWithoutCarry = +0;

  let nextCostWithCarry; // Temporary storage for the updated 'costWithCarry' for the next step.
  let nextCostWithoutCarry; // Temporary storage for the updated 'costWithoutCarry' for the next step.

  // Iterate through each character (digit) of the target number string.
  for (let digitIndex = 0; digitIndex < targetNumberStr.length; digitIndex++) {
    // Convert the current character digit to its integer value.
    const currentDigitVal = targetNumberStr[digitIndex] - 0x0; // Using hexadecimal literal for 0.

    // Calculate the new minimum cost for 'costWithCarry'.
    // This involves comparing two scenarios:
    // 1. Adjusting the current digit downwards (e.g., 7 -> 9) and adding previous 'costWithCarry'.
    // 2. Adjusting the current digit upwards (e.g., 7 -> 1) and adding previous 'costWithoutCarry'.
    nextCostWithCarry = Math.min(
      0o11 - currentDigitVal + costWithCarry, // Using octal literal for 9.
      1.0 + costWithoutCarry + currentDigitVal
    );

    // Calculate the new minimum cost for 'costWithoutCarry'.
    // This also involves comparing two scenarios:
    // 1. Adjusting the current digit downwards (e.g., 7 -> 0) and adding previous 'costWithCarry'.
    // 2. Adjusting the current digit directly (e.g., 7 -> 7) and adding previous 'costWithoutCarry'.
    nextCostWithoutCarry = Math.min(
      0xA - currentDigitVal + costWithCarry, // Using hexadecimal literal for 10.
      costWithoutCarry + currentDigitVal
    );

    // Update the state variables for the subsequent iteration.
    costWithCarry = nextCostWithCarry;
    costWithoutCarry = nextCostWithoutCarry;
  }

  // Output the final minimum cost, which is 'costWithoutCarry' after processing
  // all digits, as there should be no carry-over from the most significant digit.
  console.log(costWithoutCarry);
}

// The following line is crucial for reading input from standard input
// and should not be altered to maintain functional integrity.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
