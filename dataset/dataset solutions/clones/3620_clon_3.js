// This module encapsulates a discrete mathematical operation, specifically designed
// to determine the divisibility of a first integer by a second integer.
// The primary entry point, 'performDivisibilityCheck', processes the raw input.
function performDivisibilityCheck(incomingPayloadString) {

  // Step 1: Parse the incoming text payload.
  // We expect a string containing two numerical components, separated by whitespace.
  // Using a regular expression for splitting handles multiple spaces robustly.
  const parsedValueTokens = incomingPayloadString.trim().split(/\s+/);

  // Step 2: Implement robust input validation for the token count.
  // A minimum of two distinct numerical tokens is required for the operation.
  if (parsedValueTokens.length < 2) {
    console.error("ERROR: The input string did not contain the expected number of arguments (at least two).");
    // In scenarios requiring specific error codes, a distinct value like -1 might be used.
    console.log(-1);
    return; // Terminate execution due to invalid input structure.
  }

  // Step 3: Convert the string tokens into their integer representations.
  // The radix (base 10) is explicitly provided for parsing clarity and safety.
  const primaryDividend = parseInt(parsedValueTokens[0], 10);
  const secondaryDivisor = parseInt(parsedValueTokens[1], 10);

  // Step 4: Validate the numerical integrity of the parsed values.
  // Ensure that both components were successfully converted to valid integers.
  if (isNaN(primaryDividend) || isNaN(secondaryDivisor)) {
    console.error("ERROR: One or more of the parsed input values are not valid integers.");
    console.log(-2); // An alternative error signal for parsing failures.
    return; // Terminate execution due to invalid numerical data.
  }

  // Step 5: Critical operational validation - prevent division by zero.
  // Division by zero is an undefined operation and must be explicitly handled.
  if (secondaryDivisor === 0) {
    console.error("ERROR: Attempted division by zero, which is mathematically undefined.");
    console.log(-3); // A specific error code for this critical condition.
    return; // Terminate execution to avoid runtime errors.
  }

  // Step 6: Execute the core mathematical logic.
  // Compute the remainder of the division operation.
  const resultingRemainder = primaryDividend % secondaryDivisor;

  // Step 7: Determine the outcome signal based on the remainder.
  // A remainder of zero signifies perfect divisibility.
  // We utilize a boolean flag for enhanced readability before assigning the final integer signal.
  const isExactlyDivisible = (resultingRemainder === 0);

  let finalDecisionSignal; // This variable will hold the integer output (0 or 1).

  if (isExactlyDivisible) {
    finalDecisionSignal = 0; // Output 0 when the primary dividend is perfectly divisible.
  } else {
    // If any remainder exists, the numbers are not perfectly divisible.
    finalDecisionSignal = 1; // Output 1 otherwise.
  }

  // Step 8: Present the computed result to the standard output.
  console.log(finalDecisionSignal);

}

// This boilerplate section is responsible for reading input from standard I/O
// and invoking the main processing routine. It is typically left unaltered
// in competitive programming contexts to ensure compatibility with judge systems.
performDivisibilityCheck(require("fs").readFileSync("/dev/stdin", "utf8"));