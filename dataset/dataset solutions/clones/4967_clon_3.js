/**
 * @file This module handles the processing of input data to calculate the area of a trapezoid.
 * @author CodeCloneExpert
 * @version 1.0.1
 */

/**
 * Computes the area of a trapezoid given its two parallel bases and its height.
 * The input is expected to be a string where each dimension is on a new line.
 *
 * @param {string} inputStringData - A string containing three newline-separated numeric values:
 *                                   the first base, the second base, and the height.
 */
function computeTrapezoidSurface(inputStringData) {
  // Validate the input string for basic integrity.
  if (!inputStringData || typeof inputStringData !== 'string' || inputStringData.trim() === '') {
    console.error("Error: Input data must be a non-empty string for processing.");
    return; // Exit if input is invalid or empty
  }

  // Define a constant for the division factor in area calculation, enhancing readability.
  const AREA_DIVISION_FACTOR = 2.0; // Explicitly float for numerical operation clarity.

  // Split the raw input string into an array of lines.
  const dimensionLines = inputStringData.split('\n');

  // Ensure we have at least three distinct lines to extract the required dimensions.
  if (dimensionLines.length < 3) {
    console.error("Error: Insufficient input lines provided. Expected 3 dimensions (base1, base2, height).");
    return;
  }

  // Parse the numeric values from the input lines using parseFloat for flexibility with decimals.
  const firstBaseMeasurement = parseFloat(dimensionLines[0]);
  const secondBaseMeasurement = parseFloat(dimensionLines[1]);
  const verticalElevation = parseFloat(dimensionLines[2]);

  // Perform validation on the parsed numbers to ensure they are indeed valid numeric quantities.
  if (isNaN(firstBaseMeasurement) || isNaN(secondBaseMeasurement) || isNaN(verticalElevation)) {
    console.error("Error: One or more input dimensions could not be successfully parsed as valid numbers.");
    return;
  }

  // Optional: Add a check for non-negative dimensions, as area is typically a positive value.
  // This serves as a guard clause for physically meaningful results.
  if (firstBaseMeasurement < 0 || secondBaseMeasurement < 0 || verticalElevation < 0) {
      console.warn("Warning: Negative dimensions were provided. The resulting area might not be physically meaningful or could indicate erroneous input.");
      // For this clone, we will proceed with the calculation, but in a production system,
      // one might throw an error or return a specific invalid value.
  }

  // Calculate the sum of the parallel bases as an explicit intermediate step.
  const sumOfParallelSides = firstBaseMeasurement + secondBaseMeasurement;

  // Calculate the product of the sum of bases and the height.
  const productOfSumAndHeight = sumOfParallelSides * verticalElevation;

  // Perform the final division to obtain the trapezoid's area.
  const calculatedTrapezoidArea = productOfSumAndHeight / AREA_DIVISION_FACTOR;

  // Output the computed area to the standard console.
  console.log(calculatedTrapezoidArea);
}

// The following section handles reading input from standard I/O (stdin)
// and then invokes the main calculation function. This part is typically
// environment-specific and is kept separate from the core logic.
// It reads the entire standard input as a UTF-8 string.
computeTrapezoidSurface(require("fs").readFileSync("/dev/stdin", "utf8"));