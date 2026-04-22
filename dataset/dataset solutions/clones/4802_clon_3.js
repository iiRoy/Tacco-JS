// This module handles the execution of a simple arithmetic expression provided via standard input.
// It parses the input string, performs the specified operation, and prints the result.

/**
 * Executes a basic arithmetic calculation based on a provided expression string.
 * The expression should be in the format "operand1 operator operand2".
 * Supported operators are '+' and '-'.
 *
 * @param {string} inputExpression The raw string containing the arithmetic expression.
 */
function processInputAndComputeResult(inputExpression) {
  // --- Stage 1: Input Validation and Pre-processing ---

  // Check for null, undefined, or empty input string as an initial safeguard.
  if (inputExpression === null || inputExpression === undefined || inputExpression.trim().length === 0) {
    console.error("Critical Error: The provided input expression is empty or invalid. Please supply a valid string.");
    // In a production system, this might throw an exception or return a specific error code.
    return;
  }

  // Normalize whitespace and split the expression into its constituent parts.
  // Using a regular expression to handle multiple spaces between components gracefully.
  const expressionSegments = inputExpression.trim().split(/\s+/);

  // Validate the number of segments to ensure it matches the expected "operand operator operand" format.
  const expectedSegmentCount = 3;
  if (expressionSegments.length !== expectedSegmentCount) {
    console.error(`Input Format Error: Expected exactly ${expectedSegmentCount} parts (operand1 operator operand2), but received ${expressionSegments.length}.`);
    console.error(`Received segments: ${JSON.stringify(expressionSegments)}`);
    return;
  }

  // --- Stage 2: Extract and Convert Operands ---

  // Assign the extracted segments to more descriptive variable names.
  const operandStringOne = expressionSegments[0];
  const operationSymbol = expressionSegments[1];
  const operandStringTwo = expressionSegments[2];

  // Convert the string operands to floating-point numbers.
  // This explicitly handles potential string concatenation issues with the '+' operator
  // and ensures numeric operations are performed as intended.
  const numericValueOne = parseFloat(operandStringOne);
  const numericValueTwo = parseFloat(operandStringTwo);

  // Validate that both operands were successfully converted to numbers.
  if (isNaN(numericValueOne) || isNaN(numericValueTwo)) {
    console.error(`Data Conversion Error: One or both operands are not valid numbers.`);
    console.error(`Attempted to convert: '${operandStringOne}' and '${operandStringTwo}'.`);
    return;
  }

  // --- Stage 3: Perform the Calculation ---

  let finalCalculationResult; // Variable to store the outcome of the arithmetic operation.

  // Employ a switch statement for clearer handling of different arithmetic operations.
  // This provides an alternative to a simple if-else chain.
  switch (operationSymbol) {
    case '+':
      finalCalculationResult = numericValueOne + numericValueTwo;
      break;
    case '-':
      finalCalculationResult = numericValueOne - numericValueTwo;
      break;
    default:
      // Handle unsupported operators gracefully.
      console.error(`Operation Error: The operator '${operationSymbol}' is not recognized or supported.`);
      console.error("Supported operators are: '+' and '-'.");
      return;
  }

  // --- Stage 4: Output the Result ---

  // Prepare a formatted output message.
  const formattedOutput = `Calculation Complete: ${numericValueOne} ${operationSymbol} ${numericValueTwo} = ${finalCalculationResult}`;

  // Display the final result to the standard output.
  console.log(formattedOutput);
}

// --- Main Execution Block: Read Input and Invoke Processing ---

// Define the standard input file path, common in competitive programming environments.
const standardInputSourcePath = '/dev/stdin';

// Dynamically load the 'fs' module, which is essential for file system operations in Node.js.
// Encapsulate in a try-catch for robust error handling if the environment lacks 'fs'.
let fileSystemUtility;
try {
  fileSystemUtility = require('fs');
} catch (importError) {
  console.error("Environment Error: Failed to load the 'fs' (file system) module. This script requires a Node.js environment.");
  process.exit(1); // Terminate execution if a critical dependency is missing.
}

let rawInputContentFromFile;
try {
  // Read the entire content of the standard input file synchronously.
  // 'utf8' encoding ensures correct interpretation of text.
  rawInputContentFromFile = fileSystemUtility.readFileSync(standardInputSourcePath, 'utf8');
} catch (readError) {
  console.error(`Input Read Error: Could not read data from the specified path '${standardInputSourcePath}'.`);
  console.error(`Details: ${readError.message}`);
  process.exit(1); // Terminate execution upon failure to read input.
}

// Finally, invoke the primary processing function with the obtained input.
processInputAndComputeResult(rawInputContentFromFile);