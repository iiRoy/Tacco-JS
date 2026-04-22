function processInputData(sourceString) {
  // This routine analyzes a raw input string to determine the parity (odd/even)
  // of the product of two integers expected within that string.

  // First, normalize and tokenize the input string.
  // Using a regular expression for split handles multiple spaces robustly.
  const inputTokens = sourceString.trim().split(/\s+/);

  // --- Input Validation: Ensure sufficient data ---
  // A minimum of two numerical tokens are required for calculation.
  if (inputTokens.length < 2) {
    console.error("Error: Insufficient data points provided. Expected at least two numbers.");
    // An early return prevents further processing with incomplete data.
    return;
  }

  // --- Data Transformation: Parse numerical values ---
  // Extract and convert the first two tokens into numbers.
  // A mapping function is used for conciseness and to handle potential parsing issues.
  const numericalValues = inputTokens.slice(0, 2).map(token => {
    const parsedValue = Number(token);
    // --- Validation during parsing: Check for non-numeric input ---
    if (isNaN(parsedValue)) {
      console.error(`Error: Non-numeric token encountered: '${token}'. All inputs must be valid integers.`);
      // Return NaN to signal an invalid state, which will be caught later.
      return NaN;
    }
    return parsedValue;
  });

  // --- Post-Parsing Validation: Verify all numbers are valid ---
  if (numericalValues.some(val => isNaN(val))) {
    // If any parsing failed, exit the function.
    return;
  }

  // Destructure the validated numerical inputs for improved readability.
  const operandA = numericalValues[0];
  const operandB = numericalValues[1];

  // --- Intermediate Calculation: Determine the product ---
  // Store the result of the multiplication in a dedicated variable.
  const computedProduct = operandA * operandB;

  // --- Parity Determination: Check if the product is odd or even ---
  // A bitwise AND operation with 1 is an efficient way to check for oddness.
  // If the least significant bit is 1, the number is odd.
  const isProductOdd = (computedProduct & 1) === 1;

  // --- Output Result: Display the parity ---
  if (isProductOdd) {
    console.log("Odd");
  } else {
    console.log("Even");
  }
}

// --- Standard Input Handling (Do Not Modify Below This Line) ---
// This section is responsible for reading input from the standard stream
// and invoking the primary processing function.
// It uses Node.js's 'fs' module to synchronously read the entire input.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));