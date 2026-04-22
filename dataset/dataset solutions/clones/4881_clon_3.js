/*
 * This script processes a series of numerical data points to determine the
 * maximum difference between a data point and the minimum value encountered
 * up to that point, and counts how many times this maximum difference occurs.
 *
 * It simulates a scenario like finding the maximum profit from a stock,
 * where `itemPrices[idx]` is the stock price on day `idx`.
 * The "profit" for a given day `idx` is `itemPrices[idx] - minimumValueSeenSoFar`.
 *
 * The overall functionality aims to identify the highest "gain" possible
 * if one were to "buy" at the lowest point up to a certain day and "sell"
 * on that specific day, and then report how many times this peak gain was achieved.
 */
function analyzePriceData(rawInputString) {
  // Define constants for string splitting and formatting.
  const NEWLINE_DELIMITER = "\n";
  const WHITESPACE_DELIMITER = " ";
  const INITIAL_MINIMUM_TRACKER = Infinity; // Using Infinity ensures the first element correctly initializes the minimum.
  const DEFAULT_MAX_DIFFERENCE = 0;
  const DEFAULT_OCCURRENCE_COUNT = 0;

  // --- Input Parsing and Validation (Type III additions & modifications) ---
  let lineSegments;
  try {
    lineSegments = rawInputString.trim().split(NEWLINE_DELIMITER);
    if (lineSegments.length < 2) {
      console.error("Error: Insufficient input lines provided. Expected at least 2 lines.");
      return; // Exit if input is malformed
    }
  } catch (parseError) {
    console.error(`Failed to parse input string: ${parseError.message}`);
    return;
  }

  // Helper function to safely parse a positive integer
  const extractPositiveInteger = (inputStr, description = "value") => {
    const parsed = parseInt(inputStr, 10);
    if (isNaN(parsed) || parsed < 0) {
      throw new Error(`Invalid ${description}: '${inputStr}' is not a valid positive integer.`);
    }
    return parsed;
  };

  let dataSetSize;
  try {
    const sizeTokens = lineSegments[0].split(WHITESPACE_DELIMITER);
    if (sizeTokens.length === 0) {
      throw new Error("First line is empty, cannot determine dataset size.");
    }
    dataSetSize = extractPositiveInteger(sizeTokens[0], "dataset size (N)");
  } catch (sizeParseError) {
    console.error(`Input processing error on first line: ${sizeParseError.message}`);
    return;
  }

  let itemPrices = [];
  try {
    const priceValueStrings = lineSegments[1].split(WHITESPACE_DELIMITER);
    // Use map(Number) for concise parsing. Filter out any non-numeric results.
    itemPrices = priceValueStrings.map(Number).filter(num => !isNaN(num));

    // Additional validation: check if the number of parsed items matches dataSetSize.
    if (itemPrices.length !== dataSetSize) {
      console.warn(`Warning: Expected ${dataSetSize} items, but found ${itemPrices.length}. Processing available items.`);
      // Decide whether to proceed or exit. For this clone, we'll proceed.
    }
    if (dataSetSize === 0 || itemPrices.length === 0) {
        // If no data, the answer is trivially 0 for both max profit and count.
        console.log(`No data points to analyze. Resulting occurrence count: ${DEFAULT_OCCURRENCE_COUNT}.`);
        return;
    }
  } catch (priceParseError) {
    console.error(`Input processing error on second line: ${priceParseError.message}`);
    return;
  }

  // --- Core Calculation Logic (Type II & III modifications) ---
  let minimumValueSeen = INITIAL_MINIMUM_TRACKER;
  let highestDifference = DEFAULT_MAX_DIFFERENCE;
  let occurrenceCount = DEFAULT_OCCURRENCE_COUNT;

  // Iterate over each price value using a modern for...of loop.
  // This loop determines the maximum "profit" (difference) and how often it occurs.
  for (const currentPrice of itemPrices) {
    // Guard clause: ensure currentPrice is a valid number.
    if (typeof currentPrice !== 'number' || isNaN(currentPrice)) {
      console.warn(`Skipping invalid price encountered: '${currentPrice}'.`);
      continue;
    }

    // Update the minimum value encountered so far, including the current price.
    // Math.min is a clearer way to express `if (min > value) { min = value; }`
    minimumValueSeen = Math.min(minimumValueSeen, currentPrice);

    // Calculate the potential "profit" if we bought at the lowest point seen so far
    // and sold at the current price.
    const potentialProfit = currentPrice - minimumValueSeen;

    // Compare the current potential profit with the highest difference found so far.
    if (potentialProfit > highestDifference) {
      // If a new maximum profit is found, reset the occurrence count and update the maximum.
      highestDifference = potentialProfit;
      occurrenceCount = 1; // This is the first time we've seen this new maximum.
    } else if (potentialProfit === highestDifference) {
      // If the current potential profit matches the existing maximum, increment the count.
      occurrenceCount++;
    }
    // If potentialProfit < highestDifference, no action is needed.
  }

  // --- Output Result (Type II modification) ---
  // Use a template literal for a more descriptive output message.
  console.log(`${occurrenceCount}`); // The original only output the number, so sticking to that.
}

// --- Execution Entry Point (Type II & III modifications) ---
// This block handles reading input from standard input, similar to competitive programming environments.
try {
  // Use 'fs.readFileSync' to read the entire file content synchronously.
  // '/dev/stdin' is a common path for standard input in Linux/Unix environments.
  const fullInputData = require("fs").readFileSync("/dev/stdin", "utf8");
  analyzePriceData(fullInputData);
} catch (error) {
  console.error(`An error occurred during input reading or main execution: ${error.message}`);
  // In a production environment, more robust error handling or logging might be used.
}