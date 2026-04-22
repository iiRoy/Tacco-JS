// --- Core System Input/Output Utilities ---

// Defines the standard path for input, typically used in Unix-like environments.
const SYSTEM_INPUT_RESOURCE_PATH = "/dev/stdin";

/**
 * Fetches the complete raw data from the designated system input stream.
 * This routine performs a synchronous read operation, ensuring all input
 * is captured before proceeding, and then trims any extraneous whitespace.
 *
 * @returns {string} The processed input content, free of leading/trailing spaces or newlines.
 */
function acquireSystemInput() {
  try {
    const fileSystem = require("fs");
    // Attempt to read the entire file synchronously, interpreting it as UTF-8 text.
    let contentBuffer = fileSystem.readFileSync(SYSTEM_INPUT_RESOURCE_PATH, "utf8");
    return contentBuffer.trim(); // Normalize by removing boundary whitespace.
  } catch (operationError) {
    // In scenarios where input might fail (e.g., missing file, permissions),
    // an error is logged, and the program terminates gracefully.
    console.error("Critical: Failed to retrieve data from standard input. Reason:", operationError.message);
    process.exit(1); // Exit with a non-zero status indicating an error.
  }
}

/**
 * Transmits a given data unit to the standard output stream, followed by a line break.
 * This function standardizes the output format for console display.
 *
 * @param {any} itemForDisplay - The value or object slated for output.
 */
function emitOutputValue(itemForDisplay) {
  // Coerce the input into a string and direct it to the standard output, appended with a newline.
  process.stdout.write(String(itemForDisplay) + '\n');
}

// --- Data Transformation & Utility Functions ---

/**
 * Computes the square of a numerical value.
 * This is a simple mathematical helper.
 *
 * @param {number} numericalOperand - The number to be squared.
 * @returns {number} The result of squaring the input number.
 */
const calculateSquare = (numericalOperand) => numericalOperand * numericalOperand;

/**
 * Applies a specific transformation rule to an input string based on a provided directive.
 * This utility facilitates various parsing, splitting, and type conversion operations.
 *
 * @param {string} sourceString - The initial string data awaiting transformation.
 * @param {number} transformationDirective - An integer code dictating the processing method.
 *   - `0`: Returns the `sourceString` unmodified.
 *   - `1`: Parses the `sourceString` into an integer.
 *   - `2`: Divides the `sourceString` into an array of substrings using space as a delimiter.
 *   - `3`: Divides the `sourceString` into an array of substrings using newline as a delimiter.
 *   - `4`: Splits by space, then converts each resulting segment to a number, returning a number array.
 *   - `5`: Splits by newline, then converts each resulting segment to a number, returning a number array.
 *   - `6`: Breaks the `sourceString` into an array of single characters.
 *   - `7`: Breaks into single characters, then converts each character to a number, returning a number array.
 * @returns {any} The transformed data, which can be a string, number, or an array of either.
 * @throws {Error} If the `transformationDirective` is not recognized or supported.
 */
function performDataTransformation(sourceString, transformationDirective) {
  if (transformationDirective === 0) {
    return sourceString;
  } else if (transformationDirective === 1) {
    const parsedInteger = parseInt(sourceString, 10);
    // Introduce a validation step for successful integer parsing.
    if (isNaN(parsedInteger)) {
      console.warn(`Note: Input segment "${sourceString}" could not be accurately parsed as an integer. Defaulting to 0.`);
      return 0; // Provide a default or error value in case of parsing failure.
    }
    return parsedInteger;
  } else if (transformationDirective === 2) {
    return sourceString.split(" ");
  } else if (transformationDirective === 3) {
    return sourceString.split("\n");
  } else if (transformationDirective === 4) {
    return sourceString.split(" ").map((segment) => {
      const numericValue = Number(segment);
      if (isNaN(numericValue)) {
        console.warn(`Note: Non-numeric segment "${segment}" encountered during array conversion. Defaulting to 0.`);
        return 0;
      }
      return numericValue;
    });
  } else if (transformationDirective === 5) {
    return sourceString.split("\n").map((segment) => {
      const numericValue = Number(segment);
      if (isNaN(numericValue)) {
        console.warn(`Note: Non-numeric segment "${segment}" encountered during array conversion. Defaulting to 0.`);
        return 0;
      }
      return numericValue;
    });
  } else if (transformationDirective === 6) {
    return sourceString.split("");
  } else if (transformationDirective === 7) {
    return sourceString.split("").map((character) => {
      const numericValue = Number(character);
      if (isNaN(numericValue)) {
        console.warn(`Note: Non-numeric character "${character}" encountered during array conversion. Defaulting to 0.`);
        return 0;
      }
      return numericValue;
    });
  } else {
    // For any unhandled directive, an explicit error is thrown.
    throw new Error(`Invalid or unsupported data transformation directive received: ${transformationDirective}`);
  }
}

// --- Main Program Logic Flow ---

/**
 * Executes the primary algorithm: computing the sum of products for all unique
 * pairs within a given numerical sequence.
 *
 * The mathematical identity used for optimization is:
 * (Sum of all elements)^2 = (Sum of squares of elements) + 2 * (Sum of products of unique pairs, i < j)
 *
 * Rearranging this, the desired sum of products (for i < j) is:
 * [ (Sum of all elements)^2 - (Sum of squares of elements) ] / 2
 *
 * @param {string} rawInputContent - The original, untransformed string obtained from input.
 */
function executePairwiseProductSumCalculation(rawInputContent) {
  // Phase 1: Deconstruct and validate the incoming raw input.
  // First, parse the entire input block by newline characters.
  let processedInputLines = performDataTransformation(rawInputContent, 3);

  // Implement a guard clause to ensure sufficient input lines are present.
  if (processedInputLines.length < 2) {
    console.error("Error: Insufficient input data. Expected at least two lines for N and the sequence.");
    emitOutputValue(0); // Emit a default zero result for invalid input scenarios.
    return;
  }

  // Extract the declared count of elements (N) from the first line.
  let declaredElementCount = performDataTransformation(processedInputLines[0], 1);

  // Further validate the parsed element count.
  if (typeof declaredElementCount !== 'number' || isNaN(declaredElementCount) || declaredElementCount < 0) {
    console.error(`Error: The declared element count "${processedInputLines[0]}" is invalid or non-positive.`);
    emitOutputValue(0);
    return;
  }

  // Extract the actual numeric sequence from the second line.
  let actualNumericSequence = performDataTransformation(processedInputLines[1], 4);

  // Cross-verify the length of the actual sequence against the declared count.
  if (actualNumericSequence.length !== declaredElementCount) {
    console.warn(`Warning: Declared element count (${declaredElementCount}) does not match the actual sequence length (${actualNumericSequence.length}). Adjusting N to actual length.`);
    declaredElementCount = actualNumericSequence.length; // Prioritize the actual length if a mismatch occurs.
  }

  // If the sequence has fewer than two elements, no unique pairs can be formed.
  if (declaredElementCount < 2) {
    emitOutputValue(0); // The sum of products for zero or one element is zero.
    return;
  }

  // Phase 2: Compute the required sums using the optimized approach.
  let aggregateSumOfElements = 0;
  let aggregateSumOfSquares = 0;

  // Iterate through the sequence to accumulate both the sum and sum of squares.
  for (let currentNumericalItem of actualNumericSequence) {
    aggregateSumOfElements += currentNumericalItem;
    aggregateSumOfSquares += calculateSquare(currentNumericalItem); // Leverage the helper function.
  }

  // Calculate the square of the total sum of all elements.
  const totalSumOfElementsSquared = calculateSquare(aggregateSumOfElements);

  // Apply the derived formula to find the sum of products of unique pairs.
  const computedPairwiseProductSum = (totalSumOfElementsSquared - aggregateSumOfSquares) / 2;

  // Phase 3: Deliver the final computed result.
  emitOutputValue(computedPairwiseProductSum);
}

// --- Program Initialization ---
// The program begins execution by first acquiring all necessary input
// and subsequently invoking the main calculation routine with that input.
executePairwiseProductSumCalculation(acquireSystemInput());