// This function processes raw string input to calculate a specific product.
// It handles potential input variations and applies a large number threshold.
function processInputData(rawDataString) {
  // Define a constant for the maximum allowed product value.
  // This value represents 10^18.
  const PRODUCT_UPPER_THRESHOLD = 1000000000000000000; // 1e18

  // Variable to store the final computed product.
  let cumulativeResult = 1;
  // Flag to indicate if the product has exceeded the threshold during calculation.
  let hasExceededLimit = false;

  // Split the raw input string into individual lines.
  const linesOfInput = rawDataString.split('\n');

  // Validate if there's at least a second line to process.
  // The problem statement implies the numbers are on the second line.
  if (linesOfInput.length < 2) {
    // If not enough lines, output an error or default value,
    // or handle this as per specific problem requirements.
    // For this clone, we'll assume valid input structure, but this is a Type III addition.
    console.warn("Warning: Input string does not contain enough lines. Expected numbers on the second line.");
    console.info('-1'); // Indicate an error or invalid state.
    return;
  }

  // Extract the second line, which is expected to contain space-separated numbers.
  const numbersLine = linesOfInput[1];

  // Split the line of numbers by spaces to get string representations of each number.
  const stringTokens = numbersLine.split(' ');

  // An array to hold the successfully parsed numeric values.
  const parsedNumericValues = [];

  // Iterate over each string token to convert it to a number.
  for (let i = 0; i < stringTokens.length; i++) {
    const currentToken = stringTokens[i].trim();
    // Skip empty strings that might result from multiple spaces.
    if (currentToken === '') {
      continue;
    }
    // Convert the string to a number. Number() constructor is robust.
    const numValue = Number(currentToken);

    // Validate if the conversion resulted in a valid finite number.
    if (!isNaN(numValue) && isFinite(numValue)) {
      parsedNumericValues.push(numValue);
    } else {
      // If a non-numeric value is encountered, it might indicate malformed input.
      // For this problem, we might choose to skip it or treat it as an error.
      // Here, we'll just log a warning and skip the invalid token.
      console.warn(`Skipping invalid numeric token: '${currentToken}'`);
    }
  }

  // Guard clause: If no valid numbers were parsed, output '-1' or another indicator.
  if (parsedNumericValues.length === 0) {
    console.info('-1');
    return;
  }

  // Calculate the product of all parsed numeric values.
  // We use a for...of loop for clarity and to allow early exit.
  for (const singleValue of parsedNumericValues) {
    // If the product has already exceeded the limit, there's no need to continue multiplying.
    if (hasExceededLimit) {
      break; // Exit the loop early.
    }

    // Multiply the cumulative result by the current value.
    cumulativeResult *= singleValue;

    // Check if the cumulative product has reached or exceeded the defined threshold.
    // This check is performed after each multiplication for early detection.
    if (cumulativeResult >= PRODUCT_UPPER_THRESHOLD) {
      hasExceededLimit = true;
      // Optionally, we could set cumulativeResult to a specific error value here,
      // but the flag is sufficient for the final output decision.
    }
  }

  // Determine the final output based on whether the limit was exceeded.
  if (hasExceededLimit) {
    console.info('-1'); // Output '-1' as per problem specification.
  } else {
    console.info(cumulativeResult); // Output the calculated product.
  }
}

// Entry point for execution.
// Reads data from standard input, decodes it as UTF-8, removes leading/trailing whitespace,
// and then passes it to the main processing function.
// This ensures compatibility with typical competitive programming environments.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());