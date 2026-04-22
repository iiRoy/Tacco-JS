// A small utility function to determine if a number is odd.
// This helps in abstracting the parity check logic.
const checkParityStatus = (numericValue) => {
  // A number is odd if its remainder when divided by 2 is not zero.
  return numericValue % 2 !== 0;
};

/**
 * Processes a raw string input containing two space-separated numbers.
 * It determines if the product of these two numbers is odd or even,
 * and prints the corresponding classification.
 *
 * @param {string} rawInputContent - The input string, expected to contain two integers separated by a space.
 */
function AnalyzeNumericProductParity(rawInputContent) {
  // Constants for output messages, enhancing readability and future maintainability.
  const ODD_RESULT_MESSAGE = 'Odd';
  const EVEN_RESULT_MESSAGE = 'Even';

  // Step 1: Input Validation and Preprocessing
  // Check if the input is valid before proceeding.
  if (!rawInputContent || typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
    console.error("Input processing error: Received an empty, null, or invalid data string.");
    return; // Exit early if input is not suitable.
  }

  // Trim whitespace and split the string into parts based on space.
  const dataFragments = rawInputContent.trim().split(' ');

  // Ensure that we have at least two numerical fragments to process.
  if (dataFragments.length < 2) {
    console.error("Input parsing error: Not enough numeric components found. Expected two.");
    return;
  }

  // Step 2: Parse Numerical Values
  // Attempt to convert the string fragments into integer numbers.
  // Using parseInt with radix 10 for explicit base conversion.
  const primaryOperand = parseInt(dataFragments[0], 10);
  const secondaryOperand = parseInt(dataFragments[1], 10);

  // Validate that both parsed values are actual numbers.
  if (isNaN(primaryOperand) || isNaN(secondaryOperand)) {
    console.error(`Data conversion error: One or both input components ('${dataFragments[0]}', '${dataFragments[1]}') could not be converted to numbers.`);
    return; // Exit if parsing failed.
  }

  // Step 3: Determine Product Parity
  // The product of two integers is odd if and only if both integers are odd.
  // In all other cases (one even, both even), the product is even.
  let determinedOutcome; // Variable to store the final classification.

  // Utilize the helper function to check the parity of each operand.
  const isPrimaryOdd = checkParityStatus(primaryOperand);
  const isSecondaryOdd = checkParityStatus(secondaryOperand);

  if (isPrimaryOdd && isSecondaryOdd) {
    // If both numbers are odd, their product will also be odd.
    determinedOutcome = ODD_RESULT_MESSAGE;
  } else {
    // If at least one number is even, their product will be even.
    determinedOutcome = EVEN_RESULT_MESSAGE;
  }

  // Step 4: Output the Result
  console.log(determinedOutcome);
}

// Entry point for script execution.
// It reads the entire content from standard input and passes it to the main processing function.
try {
  const fileSystemModule = require("fs");
  const stdInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
  AnalyzeNumericProductParity(stdInputContent);
} catch (executionError) {
  console.error(`Program execution failed: ${executionError.message}`);
}