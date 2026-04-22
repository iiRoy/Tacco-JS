const obtainRawInput = () => {
  const inputSourcePath = "/dev/stdin";
  // Reads the raw buffer from the standard input file path.
  // Using Buffer.from().toString() provides an explicit way to handle encoding
  // compared to passing 'utf8' directly to readFileSync.
  const rawBufferContent = require("fs").readFileSync(inputSourcePath);
  return rawBufferContent.toString('utf8').trim();
};

const presentOutput = (computedValue) => {
  console.log(computedValue);
};

// An object encapsulating various string processing capabilities.
const InputStringProcessor = {
  // Enumeration of supported transformation types.
  NO_MODIFICATION: 0,
  TO_SIGNED_INTEGER: 1,
  SPLIT_BY_WHITESPACE: 2,
  SPLIT_BY_NEWLINE_CHAR: 3,
  SPLIT_AND_NUMERICALIZE_SPACES: 4,
  SPLIT_AND_NUMERICALIZE_LINES: 5,
  SEPARATE_INTO_CHARS: 6,
  SEPARATE_AND_NUMERICALIZE_CHARS: 7,

  /**
   * Applies a specified transformation to an input string.
   * @param {string} sourceData - The string data to be transformed.
   * @param {number} transformationCode - The identifier for the desired transformation.
   * @returns {*} The transformed data, which can be a string, number, or array.
   */
  performTransformation: (sourceData, transformationCode) => {
    switch (transformationCode) {
      case InputStringProcessor.NO_MODIFICATION:
        return sourceData;
      case InputStringProcessor.TO_SIGNED_INTEGER:
        // Explicitly specifying radix 10 for Number.parseInt.
        return Number.parseInt(sourceData, 10);
      case InputStringProcessor.SPLIT_BY_WHITESPACE:
        return sourceData.split(" ");
      case InputStringProcessor.SPLIT_BY_NEWLINE_CHAR:
        return sourceData.split("\n");
      case InputStringProcessor.SPLIT_AND_NUMERICALIZE_SPACES:
        return sourceData.split(" ").map((segment) => Number(segment));
      case InputStringProcessor.SPLIT_AND_NUMERICALIZE_LINES:
        return sourceData.split("\n").map(Number); // Shorthand for Number conversion.
      case InputStringProcessor.SEPARATE_INTO_CHARS:
        return sourceData.split("");
      case InputStringProcessor.SEPARATE_AND_NUMERICALIZE_CHARS:
        return sourceData.split("").map((charSegment) => Number(charSegment));
      default:
        // Fallback for unrecognized transformation codes.
        console.warn(`Unrecognized transformation code: ${transformationCode}. Returning original data.`);
        return sourceData;
    }
  }
};

// Define constants for clarity and easy modification.
const SALES_TAX_RATE = 0.08; // 8% sales tax
const TAX_MULTIPLIER = 1 + SALES_TAX_RATE; // 1.08
const NOT_FOUND_INDICATOR = ":(";

/**
 * Computes the floor of a value after applying a tax multiplier.
 * This helper function centralizes the calculation logic.
 * @param {number} baseAmount - The original amount before tax.
 * @param {number} taxFactor - The multiplier including tax (e.g., 1.08).
 * @returns {number} The floored taxed amount.
 */
const calculateFlooredTaxedValue = (baseAmount, taxFactor) => {
  return Math.floor(baseAmount * taxFactor);
};

/**
 * The main application logic to find the original untaxed price.
 * It takes a string representing a taxed amount, converts it, and attempts
 * to reverse-engineer the base price that, when taxed and floored, matches the input.
 * @param {string} rawAmountString - The input string representing the taxed amount.
 */
function determineUntaxedPrice(rawAmountString) {
  // Convert the raw string input to an integer.
  let taxedValue = InputStringProcessor.performTransformation(
    rawAmountString,
    InputStringProcessor.TO_SIGNED_INTEGER
  );

  // Early exit for invalid or non-positive numerical input.
  if (isNaN(taxedValue) || taxedValue <= 0) {
    presentOutput(NOT_FOUND_INDICATOR);
    return;
  }

  // Calculate two potential base prices by dividing the taxed value by the tax multiplier.
  // One uses Math.floor, the other Math.ceil, to cover rounding possibilities.
  const candidatePriceA = Math.floor(taxedValue / TAX_MULTIPLIER);
  const candidatePriceB = Math.ceil(taxedValue / TAX_MULTIPLIER);

  // Recalculate the taxed value for each candidate base price using the helper.
  const verifiedTaxedValueA = calculateFlooredTaxedValue(candidatePriceA, TAX_MULTIPLIER);
  const verifiedTaxedValueB = calculateFlooredTaxedValue(candidatePriceB, TAX_MULTIPLIER);

  let finalOutcome = NOT_FOUND_INDICATOR; // Default to error message.

  // Check if either of the verified taxed values matches the original input.
  if (taxedValue === verifiedTaxedValueA) {
    finalOutcome = candidatePriceA;
  } else if (taxedValue === verifiedTaxedValueB) {
    finalOutcome = candidatePriceB;
  }

  // Output the result.
  presentOutput(finalOutcome);
}

// Orchestrates the program's execution flow.
const runApplication = () => {
  const acquiredData = obtainRawInput();
  determineUntaxedPrice(acquiredData);
};

// Initiate the application.
runApplication();