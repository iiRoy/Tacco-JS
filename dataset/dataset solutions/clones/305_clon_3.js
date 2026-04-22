// This script is designed to accept two space-separated numeric values from standard input,
// process them, and output a calculated result to standard output.
// The calculation involves multiplying the two numbers and then dividing by a specific constant.

// Ensure the standard input stream is active and ready to emit data.
// This is crucial for event listeners to receive information.
process.stdin.resume();

// Set the character encoding for the standard input stream.
// 'utf8' is a common and robust encoding for text data.
process.stdin.setEncoding('utf8');

// Declare a string variable to accumulate all chunks of data received from stdin.
// Using 'let' for potential reassignments, though in this case it's only appended to.
let accumulatedInputContent = '';

// Define a constant for the conversion factor used in the final calculation.
// This specific value (3.305785) is approximately the number of square meters in one 'tsubo'
// (a traditional Japanese unit of area), suggesting an area conversion context.
const AREA_CONVERSION_FACTOR_TSUBO_TO_SQM = 3.305785;

/**
 * Executes the core arithmetic operation on an array of string-represented numbers.
 * It includes validation to ensure the inputs are valid for computation.
 *
 * @param {string[]} numericStrings - An array expected to contain exactly two string representations of numbers.
 * @returns {number | string} The computed floating-point result, or an error message if input is invalid.
 */
const calculateProcessedValue = (numericStrings) => {
  // First, check if the input array contains the expected number of elements.
  // If not, it indicates a malformed input and an error message is returned.
  if (!numericStrings || numericStrings.length !== 2) {
    return "Error: Expected two space-separated numeric values.";
  }

  // Parse the first string into a floating-point number.
  const firstDimensionValue = parseFloat(numericStrings[0]);
  // Parse the second string into a floating-point number.
  const secondDimensionValue = parseFloat(numericStrings[1]);

  // Validate if both parsed values are indeed valid numbers (not NaN).
  // If either conversion failed, an error message is returned.
  if (isNaN(firstDimensionValue) || isNaN(secondDimensionValue)) {
    return "Error: One or both input values are not valid numbers.";
  }

  // Compute the product of the two validated numeric values.
  const productOfDimensions = firstDimensionValue * secondDimensionValue;

  // Perform the final division using the predefined conversion factor.
  // This yields the final result of the calculation.
  const finalConvertedResult = productOfDimensions / AREA_CONVERSION_FACTOR_TSUBO_TO_SQM;

  // Return the successfully calculated result.
  return finalConvertedResult;
};

// Register an event listener for the 'data' event on the standard input stream.
// This event fires whenever a chunk of data is available to be read.
process.stdin.on('data', (dataChunk) => {
  // Append the received data chunk to our accumulating buffer.
  // This ensures all parts of the input are collected before processing.
  accumulatedInputContent += dataChunk;
});

// Register an event listener for the 'end' event on the standard input stream.
// This event signals that no more data will be coming from stdin.
process.stdin.on('end', () => {
  // Once all input has been collected, prepare it for processing.
  // Trim any leading or trailing whitespace and split the string by one or more spaces.
  // This makes the input parsing more robust to varied spacing.
  const separatedInputValues = accumulatedInputContent.trim().split(/\s+/);

  // Invoke the dedicated calculation function with the prepared input values.
  // The function handles both the arithmetic and input validation.
  const computedOutput = calculateProcessedValue(separatedInputValues);

  // Print the final computed result (or any error message) to standard output.
  console.log(computedOutput);
});

// No explicit call to process.stdin.pause() is typically needed here,
// as the 'end' event naturally concludes the input stream processing for this type of script.