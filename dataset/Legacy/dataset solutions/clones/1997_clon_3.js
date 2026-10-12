const RADIX_DECIMAL = 10;

/**
 * Converts a string representation of a number to an integer.
 * @param {string} inputString - The string to be converted.
 * @param {number} conversionRadix - The base (radix) of the number in the string.
 * @returns {number} The parsed integer value.
 */
function convertToInteger(inputString, conversionRadix) {
  return parseInt(inputString, conversionRadix);
}

function processInputData(rawInputContent) {
  const dataSegments = rawInputContent.split(" ");

  // Extract string values from specific positions
  const segmentForB = dataSegments[0];
  const segmentForC = dataSegments[1];
  const segmentForA = dataSegments[2];

  // Parse the extracted string values into integers
  const valueB = convertToInteger(segmentForB, RADIX_DECIMAL);
  const valueC = convertToInteger(segmentForC, RADIX_DECIMAL);
  const valueA = convertToInteger(segmentForA, RADIX_DECIMAL);

  // Construct the output string in the required order (A B C)
  const resultParts = [valueA, valueB, valueC];
  console.log(resultParts.join(" "));
}

// Main execution block
const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(fileData);
