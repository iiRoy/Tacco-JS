// This module serves as a utility to process incoming data, typically from standard input,
// to perform a specific numerical computation.
const processInputData = (rawInputData) => {
  // It's assumed that the raw input is a string, where lines are delineated by newline characters.
  // We first split this into an array of individual lines for easier processing.
  const parsedLines = rawInputData.split('\n');

  // --- Section: Input Data Validation and Initial Parsing ---

  // A fundamental check: the input must contain at least two lines.
  // The first line specifies the count of numbers, and the second line contains the numbers themselves.
  if (parsedLines.length < 2) {
    // If this condition isn't met, an error message is logged, and the function terminates prematurely.
    console.error('Error: The provided input data is incomplete. Expected a minimum of two lines.');
    return;
  }

  // Extract and sanitize the string representing the count of numbers from the first line.
  // .trim() is used to remove any leading or trailing whitespace.
  const countStr = parsedLines[0].trim();
  // Convert the string representation of the count into a numerical type.
  const countOfNumbers = Number(countStr);

  // Validate the parsed count: it must be a valid, non-negative integer.
  if (isNaN(countOfNumbers) || countOfNumbers < 0) {
    console.error('Error: The specified count of numbers is invalid. It must be a non-negative integer.');
    return;
  }

  // The second line contains the actual numeric values, space-separated.
  // We split this line into an array of string-formatted numbers.
  const numberStrings = parsedLines[1].split(' ');

  // A crucial validation: ensure that the number of provided numeric strings
  // is at least equal to the count declared on the first line.
  if (numberStrings.length < countOfNumbers) {
    console.error(`Error: Expected to process ${countOfNumbers} numbers, but only ${numberStrings.length} were found.`);
    return;
  }

  // --- Section: Core Product Calculation Logic ---

  // Initialize a BigInt accumulator for the product.
  // BigInt is used to handle potentially very large integer results without loss of precision.
  let finalProduct = 1n; // Starting with 1n ensures correct multiplication.

  // Define a constant representing the upper bound for the product.
  // This is 10 raised to the power of 8, explicitly as a BigInt.
  const MAX_ALLOWED_PRODUCT_THRESHOLD = 100000000n; // Equivalent to 10^8n

  // Iterate through the array of numeric strings, up to the specified count.
  for (let iteratorIndex = 0; iteratorIndex < countOfNumbers; ++iteratorIndex) {
    const currentNumberString = numberStrings[iteratorIndex];

    let currentBigIntValue;
    // Attempt to convert each string element into a BigInt.
    // A try-catch block is added for robustness, to handle potential conversion failures gracefully.
    try {
      currentBigIntValue = BigInt(currentNumberString);
    } catch (conversionProblem) {
      // If a string cannot be converted to BigInt, it indicates malformed input.
      console.error(`Error: Failed to convert input "${currentNumberString}" to a large integer. Details: ${conversionProblem.message}`);
      // In such a scenario, we cease further processing.
      return;
    }

    // Multiply the running product by the current BigInt value.
    finalProduct *= currentBigIntValue;

    // Optimization: If the product becomes zero at any point, it will remain zero.
    // We can break early from the loop in this case, saving unnecessary computations.
    if (finalProduct === 0n) {
      break;
    }
  }

  // --- Section: Final Result Evaluation and Output ---

  // After the loop, check if the calculated product exceeds the predefined maximum threshold.
  if (finalProduct > MAX_ALLOWED_PRODUCT_THRESHOLD) {
    // If it does, the requirement is to set the product to -1n.
    finalProduct = -1n;
  }

  // Output the final computed product.
  // .toString() is explicitly used to convert the BigInt to its string representation for console output.
  console.log(finalProduct.toString());
};

// The entry point for execution: read all data from standard input,
// decode it as UTF-8, and pass it to our processing function.
// Using 'node:fs' for explicit Node.js module import and 'utf8' for encoding consistency.
processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));