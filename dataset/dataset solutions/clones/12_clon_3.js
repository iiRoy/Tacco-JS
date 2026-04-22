// This JavaScript module is designed to process multi-line string input,
// where each line is expected to contain two space-separated numerical values.
// It computes the sum of these numbers and then determines the character length
// of the resulting sum when represented as a string.

/**
 * Calculates the character length of a number's string representation.
 * @param {number} numericalValue - The number to convert and measure.
 * @returns {number} The length of the number when converted to a string.
 */
const measureNumericStringLength = (numericalValue) => {
  // Utilizing the String() constructor for explicit type conversion
  // and then accessing the length property.
  return String(numericalValue).length;
};

/**
 * Orchestrates the processing of raw input data, line by line.
 * It parses numerical pairs, calculates their sum, and reports the
 * string length of that sum. Robust error handling is included.
 * @param {string} rawInputContent - The entire input as a single string,
 *                                  potentially containing multiple lines.
 */
const analyzeNumericalPairs = (rawInputContent) => {
  // Define constants for delimiters to improve readability and maintainability.
  const LINE_SEPARATOR = "\n";
  const VALUE_DELIMITER = " ";

  // Early exit if input is not provided or is empty after trimming.
  if (!rawInputContent || rawInputContent.trim().length === 0) {
    console.error("Error: No valid input content provided for analysis.");
    return;
  }

  // Split the raw input into individual lines, filtering out any empty lines
  // that might result from trailing newlines or multiple consecutive newlines.
  const contentRows = rawInputContent
    .split(LINE_SEPARATOR)
    .filter((row) => row.trim().length > 0);

  // If no valid lines remain after filtering, inform the user.
  if (contentRows.length === 0) {
    console.warn("Warning: Input contained only empty or whitespace-only lines.");
    return;
  }

  // Iterate over each processed row using a modern for...of loop.
  for (const currentLineEntry of contentRows) {
    // Attempt to parse the line into its constituent string parts.
    const stringOperands = currentLineEntry.split(VALUE_DELIMITER);

    // Validate that we have at least two parts to process.
    if (stringOperands.length < 2) {
      console.warn(`Skipping malformed line (insufficient parts): "${currentLineEntry}"`);
      continue; // Move to the next line.
    }

    // Extract the first two potential number strings.
    const operandStringA = stringOperands[0];
    const operandStringB = stringOperands[1];

    // Convert string operands to actual numbers using the unary plus operator,
    // which is a concise way for type conversion.
    const numValueA = +operandStringA;
    const numValueB = +operandStringB;

    // Validate if the conversions resulted in actual numbers.
    if (isNaN(numValueA) || isNaN(numValueB)) {
      console.error(
        `Error: Non-numeric data encountered in line "${currentLineEntry}". ` +
          `Failed to parse "${operandStringA}" or "${operandStringB}".`
      );
      continue; // Skip this problematic line.
    }

    // Perform the core arithmetic operation.
    const calculatedResult = numValueA + numValueB;

    // Utilize the helper function to get the string length of the sum.
    const resultStringCharacterCount = measureNumericStringLength(calculatedResult);

    // Output the detailed result for the current line.
    console.log(
      `[LOG] Line: "${currentLineEntry}" => Sum: ${calculatedResult} (String Length: ${resultStringCharacterCount})`
    );
  }
};

// Entry point: Read data from standard input asynchronously and then process it.
// The "utf8" encoding ensures proper character interpretation.
const standardInputData = require("fs").readFileSync("/dev/stdin", "utf8");

// Initiate the processing pipeline with the retrieved input.
analyzeNumericalPairs(standardInputData);