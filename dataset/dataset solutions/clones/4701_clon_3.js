// This module processes a text input to perform a specific calculation.
// It parses numeric values from the first line and applies a conditional formula.
function executeNumericCalculation(sourceContent) {
  // Ensure the input is a string and handle potential null/undefined cases gracefully.
  const rawInputString = String(sourceContent || '').trim();

  if (!rawInputString) {
    // Log an error for empty input and terminate processing.
    console.error("Input content is empty or invalid. Cannot proceed with calculation.");
    return;
  }

  // Split the input into individual lines based on the newline character.
  const contentLines = rawInputString.split('\n');

  // We are primarily interested in the first line for our values.
  const primaryDataLine = contentLines[0];

  if (!primaryDataLine || primaryDataLine.trim() === '') {
    console.error("The first line of input data is missing or empty.");
    return;
  }

  // Split the first line into segments based on spaces to extract individual tokens.
  const numericTokens = primaryDataLine.trim().split(' ');

  // Validate that we have at least two numeric tokens as expected for the calculation.
  if (numericTokens.length < 2) {
    console.error("Insufficient numeric tokens found on the first line. Expected at least two values.");
    return;
  }

  // Parse the first and second tokens into numbers.
  // Using Number() for explicit type conversion and to handle potential non-numeric strings safely.
  const firstOperand = Number(numericTokens[0]);
  const secondOperand = Number(numericTokens[1]);

  // Perform comprehensive validation to ensure both parsed values are indeed finite numbers.
  if (isNaN(firstOperand) || !isFinite(firstOperand) || isNaN(secondOperand) || !isFinite(secondOperand)) {
    console.error(`Invalid numeric values detected in input: A=${numericTokens[0]}, B=${numericTokens[1]}.`);
    return;
  }

  // Introduce an intermediate variable to store the result of doubling the first operand.
  const doubledFirstOperand = firstOperand * 2;

  let computedOutcome; // Declare a variable to store the final calculated result.

  // Apply the primary conditional logic.
  // The condition checks if the doubled first operand is greater than or equal to the second operand.
  if (doubledFirstOperand >= secondOperand) {
    // If the condition is met, the outcome is half of the second operand, rounded down to the nearest whole number.
    computedOutcome = Math.floor(secondOperand / 2);
  } else {
    // Otherwise, calculate the difference between the second operand and the doubled first operand.
    const residualValue = secondOperand - doubledFirstOperand;
    // Then, find a quarter of this residual value, also rounded down.
    const quarteredResidual = Math.floor(residualValue / 4);
    // The final outcome for this branch is the first operand added to this quartered residual.
    computedOutcome = firstOperand + quarteredResidual;
  }

  // Output the final calculated result to the console for the user.
  console.log(computedOutcome);
}

// --- Standard input/output handling mechanism. Do not modify below this line for core logic. ---
// This section is responsible for reading data from standard input (e.g., from a file or piped stream)
// and passing it to the main processing function for execution.
executeNumericCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));