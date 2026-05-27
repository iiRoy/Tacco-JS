/*
 * This function computes (baseValue ^ exponentValue) % modulusValue using the method of exponentiation by squaring.
 * It leverages the property that a^b can be expressed as a product of a^(2^k) terms,
 * where k corresponds to the set bits in the binary representation of the exponent.
 * For example, a^22 = a^16 * a^4 * a^2 (since 22 in binary is 10110).
 */
function calculateModularPower(baseValue, exponentValue, modulusValue) {
  let resultAccumulator = 1n; // Initialize the result to 1 (BigInt).

  // Loop while the exponent is greater than zero.
  while (exponentValue > 0) {
    // If the least significant bit of the exponent is 1,
    // multiply the current result by the baseValue (modulo modulusValue).
    if (exponentValue & 1n) {
      resultAccumulator = (resultAccumulator * baseValue) % modulusValue;
    }

    // Square the baseValue and take modulo modulusValue for the next iteration.
    baseValue = (baseValue * baseValue) % modulusValue;

    // Right-shift the exponent by 1, effectively dividing it by 2.
    exponentValue >>= 1n;
  }

  // Return the final computed modular power.
  return resultAccumulator;
}

// The primary function to process the input data.
function processInputData(rawData) {
  // Split the entire input string into an array of lines.
  let processedLines = rawData.split("\n");

  // Get the first line and split it by space to extract numerical parts.
  const firstLineParts = processedLines[0].split(" ");

  // Parse the first part as the base number (m) and the second as the exponent number (n).
  const baseNum = parseInt(firstLineParts[0], 10);
  const expNum = parseInt(firstLineParts[1], 10);

  // Calculate the modular power using BigInts and a specific modulus, then convert to string for output.
  console.log(calculateModularPower(BigInt(baseNum), BigInt(expNum), 1000000007n).toString());
}

// Do not modify the following line; it handles reading input and calling the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
