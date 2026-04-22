// This script is designed to process incoming stream data to compute a specific numerical outcome.
// It leverages Node.js standard input/output mechanisms.

process.stdin.resume(); // Ensure the standard input stream remains active.
process.stdin.setEncoding("utf8"); // Define the character encoding for input data.

// Event handler for when data becomes available on the standard input stream.
process.stdin.on("data", (receivedBuffer) => {
  // Validate the incoming data block to prevent processing of empty or null inputs.
  if (!receivedBuffer || receivedBuffer.toString().trim().length === 0) {
    console.error("Error: Received an empty or invalid data block from stdin.");
    return; // Terminate processing for this event if data is invalid.
  }

  // Convert the buffer to a string and then parse it into a more structured format.
  const processedPayload = parseStreamData(receivedBuffer.toString());

  // Perform a check on the parsed data to ensure all necessary components are present.
  if (!processedPayload || !processedPayload.targetQuantity || !processedPayload.priceArray) {
    console.error("Error: Essential data components missing after parsing input.");
    return; // Exit if parsing failed or data is incomplete.
  }

  // Execute the core calculation logic using the extracted data.
  const computedOutcome = determineMinimumValueSum(
    processedPayload.targetQuantity,
    processedPayload.priceArray
  );

  // Output the final calculated result to the standard output stream.
  console.log(computedOutcome);
});

/**
 * Transforms a raw string of input data into a structured object.
 * This function expects two lines of input:
 * - The first line contains space-separated numbers, where the second number represents 'K'.
 * - The second line contains space-separated numbers representing an array of prices.
 * @param {string} rawInputString - The full string received from the input stream.
 * @returns {object|null} An object containing 'targetQuantity' (K) and 'priceArray',
 *                        or null if the input format is incorrect.
 */
const parseStreamData = (rawInputString) => {
  // Split the raw string into an array of lines, trimming leading/trailing whitespace.
  const dataLines = rawInputString.trim().split("\n");

  // Input validation: Ensure at least two lines of data are provided.
  if (dataLines.length < 2) {
    console.error("Parsing error: Insufficient number of input lines. Expected at least two.");
    return null;
  }

  // Extract and parse the parameters from the first line.
  const parameterTokens = dataLines[0].split(" ");

  // Input validation: Check if the first line has enough parameters.
  if (parameterTokens.length < 2) {
    console.error("Parsing error: First line does not contain enough parameters (N, K).");
    return null;
  }

  // The first number (N) is not utilized in the subsequent calculation,
  // so we only focus on the second number (K).
  // const totalItemsAvailable = parseInt(parameterTokens[0], 10); // N, currently unused.
  const quantityToSelect = parseInt(parameterTokens[1], 10); // K

  // Process the second line to get the array of item prices.
  const rawPriceTokens = dataLines[1].split(" ");

  // Convert each price token to a number, filtering out any invalid numeric entries.
  const numericPrices = rawPriceTokens
    .map((token) => {
      const parsedValue = Number(token);
      // Explicitly check for NaN to ensure only valid numbers are included.
      return isNaN(parsedValue) ? null : parsedValue;
    })
    .filter((value) => value !== null); // Remove any nulls (invalid numbers) from the array.

  // Construct and return the structured data object.
  return {
    targetQuantity: quantityToSelect,
    priceArray: numericPrices,
  };
};

/**
 * Computes the sum of the 'countToSum' smallest values from a given array of numbers.
 * This function handles various edge cases for robustness.
 * @param {number} countToSum - The number of smallest values to include in the sum.
 * @param {number[]} arrayOfValues - The array of numbers from which to select and sum.
 * @returns {number} The cumulative sum of the smallest values, or 0 if inputs are invalid.
 */
const determineMinimumValueSum = (countToSum, arrayOfValues) => {
  // Robustness check 1: Ensure the input array is valid and contains elements.
  if (!Array.isArray(arrayOfValues) || arrayOfValues.length === 0) {
    // console.warn("Warning: Input array for sum calculation is empty or invalid. Returning 0.");
    return 0;
  }

  // Robustness check 2: Ensure the count of items to sum is a positive number.
  if (countToSum <= 0) {
    // console.warn("Warning: Count of items to sum is non-positive. Returning 0.");
    return 0;
  }

  // Robustness check 3: Adjust 'countToSum' if it exceeds the available number of values.
  let effectiveCountToSum = countToSum;
  if (effectiveCountToSum > arrayOfValues.length) {
    // console.warn(`Warning: Requested ${countToSum} items, but only ${arrayOfValues.length} available. Summing all available.`);
    effectiveCountToSum = arrayOfValues.length;
  }

  // Create a shallow copy of the array and sort it in ascending numerical order.
  // This prevents modifying the original 'arrayOfValues' and ensures correct sorting.
  const sortedValues = [...arrayOfValues].sort((valA, valB) => valA - valB);

  let totalAccumulator = 0; // Initialize the variable to hold the running sum.
  let currentIdx = 0; // Initialize a loop counter.

  // Iterate through the sorted array for the specified 'effectiveCountToSum'
  // and accumulate the values. A 'while' loop is used here as a structural alternative
  // to array methods like slice().reduce().
  while (currentIdx < effectiveCountToSum) {
    totalAccumulator += sortedValues[currentIdx];
    currentIdx++; // Move to the next smallest value.
  }

  return totalAccumulator;
};