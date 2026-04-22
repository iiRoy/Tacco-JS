// This script is designed to process standard input, specifically a single line containing four space-separated numerical values.
// It then calculates the number of non-negative integer solutions to a linear Diophantine equation
// of the form A*x + B*y + C*z = D, where A, B, C, and D are derived from the input,
// and x, y, z are the non-negative integer multipliers.

// Ensure the standard input stream remains open and active to receive incoming data.
process.stdin.resume();
// Configure the input stream to interpret incoming byte data as UTF-8 encoded characters.
process.stdin.setEncoding('utf8');

// A dynamic array to accumulate all lines of text received from standard input.
const capturedInputLines = [];

// Instantiate a 'readline' interface to handle input stream processing,
// allowing for line-by-line data consumption.
const inputLineProcessor = require('readline').createInterface({
  input: process.stdin,   // Specifies the input source as standard input.
  output: process.stdout  // While not directly used for output in this logic,
                          // it's a standard parameter for readline interface creation.
});

// Attach an event listener to the 'line' event. This function executes
// every time a complete line of input is detected and parsed.
inputLineProcessor.on('line', (currentLineOfText) => {
  // Add the newly read line to our collection of input data.
  capturedInputLines.push(currentLineOfText);
});

// Attach an event listener to the 'close' event. This function executes
// once the input stream has ended (e.g., when EOF is reached).
inputLineProcessor.on('close', () => {
  // Initialize a variable to keep track of the total number of valid solutions found.
  let totalValidSolutions = 0;

  // --- Input Data Validation and Parameter Extraction ---
  // Perform an initial check to ensure some data was actually received.
  if (capturedInputLines.length === 0) {
    console.error("Execution Error: No input data was provided. Please ensure input is piped or typed.");
    process.exit(1); // Terminate the process with an error code.
  }

  // Split the first (and expected only) line of input into individual string tokens.
  const rawInputTokens = capturedInputLines[0].split(" ");

  // Validate that the expected number of parameters (four) are present.
  if (rawInputTokens.length < 4) {
      console.error("Execution Error: Insufficient parameters. Expected four space-separated numbers.");
      process.exit(1);
  }

  // Convert the string tokens into numerical coefficients and the target sum.
  // These correspond to 'r', 'g', 'b', and 'limit' from the original problem.
  const factorCoefficientX = Number(rawInputTokens[0]);
  const factorCoefficientY = Number(rawInputTokens[1]);
  const factorCoefficientZ = Number(rawInputTokens[2]);
  const equationTargetSum = Number(rawInputTokens[3]);

  // --- Further Input Constraint Validation (Type III addition for robustness) ---
  // Ensure all coefficients are positive. A non-positive coefficient would either
  // lead to infinite solutions (for 0) or complex logic for negative values,
  // which is outside the scope of typical counting problems like this.
  if (factorCoefficientX <= 0 || factorCoefficientY <= 0 || factorCoefficientZ <= 0) {
      console.error("Execution Error: All three coefficients (A, B, C) must be positive integers.");
      process.exit(1);
  }
  // Ensure the target sum is not negative, as we are looking for non-negative integer solutions.
  if (equationTargetSum < 0) {
      console.error("Execution Error: The target sum (D) cannot be a negative value.");
      process.exit(1);
  }

  // --- Core Algorithm: Counting Solutions (Type III: Restructured and Optimized) ---
  // The algorithm iterates through all possible non-negative integer values for 'x' (multiplierX).
  for (let multiplierX = 0; ; multiplierX++) {
    // Calculate the contribution of the first term (A*x).
    const termXValue = multiplierX * factorCoefficientX;

    // If the value of A*x alone already exceeds the target sum,
    // then no further increments of 'x' can lead to a valid solution.
    // Break out of the outer loop early for efficiency.
    if (termXValue > equationTargetSum) {
      break;
    }

    // Calculate the remaining sum that needs to be accounted for by B*y + C*z.
    const remainingSumAfterX = equationTargetSum - termXValue;

    // Iterate through all possible non-negative integer values for 'y' (multiplierY).
    for (let multiplierY = 0; ; multiplierY++) {
      // Calculate the contribution of the second term (B*y).
      const termYValue = multiplierY * factorCoefficientY;

      // If the value of B*y alone exceeds the remaining sum (desiredTotal - A*x),
      // then no further increments of 'y' for the current 'x' can lead to a valid solution.
      // Break out of the inner loop early.
      if (termYValue > remainingSumAfterX) {
        break;
      }

      // Calculate the sum that must be accounted for by C*z.
      // This is (desiredTotal - A*x - B*y).
      const sumForTermZ = remainingSumAfterX - termYValue;

      // Check if this remaining sum can be perfectly divided by the third coefficient (C).
      // If it can, it implies that 'z' is a non-negative integer (sumForTermZ / C).
      if (sumForTermZ % factorCoefficientZ === 0) {
        // A valid combination (x, y, z) has been found. Increment the solution counter.
        totalValidSolutions++;
      }
      // The original code had an 'else if' for breaking the inner loop.
      // This has been integrated into the 'termYValue > remainingSumAfterX' check,
      // making the logic more direct and efficient.
    }
  }

  // After exhausting all possible combinations, print the final tally of solutions.
  console.log(totalValidSolutions);
});