// Define constants for common values to improve readability and maintainability.
const VALUE_ADDED_TAX_RATE = 0.08; // Represents an 8% sales tax rate.
const TAX_CALCULATION_FACTOR = 1 + VALUE_ADDED_TAX_RATE; // Factor to apply for tax-inclusive price.

/**
 * Reads raw input data from the standard input stream.
 * Attempts to use a more direct file descriptor read method first,
 * falling back to the standard readFileSync for robustness.
 *
 * @returns {string} The trimmed raw content from stdin.
 */
function obtainInputText() {
  const fs = require("fs");
  const stdInFileDescriptor = 0; // File descriptor for stdin.
  const bufferCapacity = 1024 * 1024; // Allocate a 1MB buffer for reading.
  let dataBuffer = Buffer.alloc(bufferCapacity);
  let bytesTransferred = 0;

  try {
    // Attempt to read synchronously from stdin's file descriptor.
    bytesTransferred = fs.readSync(stdInFileDescriptor, dataBuffer, 0, bufferCapacity, 0);
  } catch (error) {
    // If direct fd read fails (e.g., not a file), fall back to common readFileSync.
    // This ensures compatibility across different execution environments.
    return fs.readFileSync("/dev/stdin", "utf8").trim();
  }

  // Convert the buffer content to a UTF-8 string and trim any leading/trailing whitespace.
  return dataBuffer.toString("utf8", 0, bytesTransferred).trim();
}

/**
 * Displays the final calculated result to the console.
 * Uses a template literal for output, allowing for future formatting enhancements.
 *
 * @param {number|string} finalOutputValue The value to be printed.
 */
function presentCalculatedResult(finalOutputValue) {
  console.log(`${finalOutputValue}`);
}

/**
 * A versatile utility for transforming input strings based on a specified type.
 * This version is streamlined to only include the integer conversion,
 * as other types from the original utility were not utilized in the main logic.
 *
 * @param {string} rawStringData The input string to be transformed.
 * @param {number} transformOption The type of transformation to apply (e.g., 1 for integer).
 * @returns {number|string} The transformed data, or original string if no matching transformation.
 */
function processInputConversion(rawStringData, transformOption) {
  switch (transformOption) {
    case 1: // Option 1: Convert to an integer.
      const integerValue = parseInt(rawStringData, 10);
      // Add a validation step: if parsing results in NaN, return a default/error value.
      // In competitive programming, input is often guaranteed valid, but this adds robustness.
      if (isNaN(integerValue)) {
        return 0; // Returning 0 or throwing an error are typical responses for invalid input.
      }
      return integerValue;
    default:
      // For any other unexpected transformation option, return the original data.
      // This acts as a guard clause for unhandled cases.
      return rawStringData;
  }
}

/**
 * The core business logic function. It takes a raw input string,
 * processes it to determine a base price before tax,
 * and outputs the result based on specific rounding rules and floating-point comparisons.
 *
 * @param {string} incomingRawData The raw string data read from input.
 */
function ExecutePriceAnalysis(incomingRawData) {
  // Convert the raw string to an integer, representing the total amount including tax.
  let finalPriceWithTax = processInputConversion(incomingRawData, 1);

  // Guard clause: Ensure the input is a valid positive number for processing.
  // This prevents unexpected behavior with zero or negative inputs.
  if (finalPriceWithTax <= 0) {
    presentCalculatedResult(":("); // Indicate an invalid or unprocessable input.
    return;
  }

  // Calculate an initial approximation of the price before tax.
  // This is the total amount divided by the tax factor (1 + tax rate).
  let preliminaryBaseCost = finalPriceWithTax / TAX_CALCULATION_FACTOR;

  // Re-calculate the taxed amount using both floor and ceil rounding on the preliminary base cost.
  // These calculations are sensitive to floating-point precision and are critical
  // for replicating the original code's conditional logic.
  let priceFloorRounded = Math.floor(preliminaryBaseCost * TAX_CALCULATION_FACTOR);
  let priceCeilRounded = Math.ceil(preliminaryBaseCost * TAX_CALCULATION_FACTOR);

  // Compare the original finalPriceWithTax against the floor-rounded and ceil-rounded values.
  // The specific branch taken depends on floating-point behavior during multiplication/division.
  if (finalPriceWithTax === priceFloorRounded) {
    // If the original price matches the floor-rounded value, output the ceiling of the base cost.
    // This suggests the original base price, when taxed, was floored to reach finalPriceWithTax.
    presentCalculatedResult(Math.ceil(preliminaryBaseCost));
  } else if (finalPriceWithTax === priceCeilRounded) {
    // If the original price matches the ceil-rounded value, output the floor of the base cost.
    // This suggests the original base price, when taxed, was ceiled to reach finalPriceWithTax.
    presentCalculatedResult(Math.floor(preliminaryBaseCost));
  } else {
    // If neither comparison holds true, the input does not fit the expected pattern,
    // or there's a significant floating-point discrepancy.
    presentCalculatedResult(":(");
  }
}

// Initiate the entire process by first getting the input and then executing the analysis.
ExecutePriceAnalysis(obtainInputText());