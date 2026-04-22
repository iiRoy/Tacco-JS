"use strict";

// --- Configuration Constants (Type II - renaming, Type III - adding new constants) ---
const BASE_ITEM_PRICE = 700; // The fundamental cost of the item.
const FEATURE_MODIFIER_AMOUNT = 100; // Monetary value added for each selected feature.
const FEATURE_ACTIVATION_SYMBOL = "○"; // Character representing an active feature in the configuration string.
const MAX_PROCESSABLE_FEATURES = 3; // The maximum number of initial features to evaluate from the input string.
const STANDARD_INPUT_FILE_PATH = "/dev/stdin"; // System path to read standard input from.
const INPUT_FILE_ENCODING = "utf8"; // Character encoding to use when reading the input file.

// --- Helper Functions (Type III - adding new fragments/functions) ---

/**
 * Safely retrieves content from a specified file path using synchronous file system operations.
 * Includes basic error handling for file reading failures.
 *
 * @param {string} sourceFilePath - The complete path to the file from which to read data.
 * @param {string} characterEncoding - The character encoding to apply during file reading (e.g., 'utf8').
 * @returns {string} The content of the file as a string. Returns an empty string if an error occurs
 *                   during file access, after logging a warning.
 */
const retrieveFileContent = (sourceFilePath, characterEncoding) => {
  try {
    // Using 'require' for the 'fs' module to maintain compatibility with the original script's environment.
    const fileSystemModule = require("fs");
    return fileSystemModule.readFileSync(sourceFilePath, characterEncoding);
  } catch (fileReadError) {
    console.error(
      `WARNING: Failed to read input file at '${sourceFilePath}'. Error details: ${fileReadError.message}`
    );
    // In a production system, this might throw an exception or return a specific error object.
    // For this demonstration, an empty string is returned to allow the main logic to proceed without crashing.
    return "";
  }
};

/**
 * Calculates the total cost of an item based on its configuration string.
 * Each occurrence of the 'FEATURE_ACTIVATION_SYMBOL' within the first
 * 'MAX_PROCESSABLE_FEATURES' characters of the input string contributes
 * 'FEATURE_MODIFIER_AMOUNT' to the 'BASE_ITEM_PRICE'.
 *
 * @param {string} itemConfigurationString - The input string detailing the item's configuration.
 * @returns {number} The final computed total cost of the item.
 */
const computeItemFinalCost = (itemConfigurationString) => {
  // Initialize the cost with the predefined base price.
  let finalComputedCost = BASE_ITEM_PRICE;

  // --- Input Validation (Type III - adding guard clauses/validations) ---
  // Ensure the configuration string is valid before processing.
  if (typeof itemConfigurationString !== "string" || itemConfigurationString === null) {
    console.warn("NOTICE: Invalid or null configuration string provided. Returning base price only.");
    return finalComputedCost; // Return base price for invalid input.
  }

  // Extract the relevant segment of the configuration string, limiting to 'MAX_PROCESSABLE_FEATURES'.
  // This ensures we only process the expected number of features, even if the input is longer.
  const relevantConfigSegment = itemConfigurationString.substring(0, MAX_PROCESSABLE_FEATURES);

  // Calculate the additional cost by iterating over the relevant configuration segment.
  // A functional approach using 'reduce' is employed for clarity and conciseness,
  // demonstrating a different pattern compared to sequential 'if' statements.
  const additionalFeatureCost = relevantConfigSegment
    .split("") // Convert the string segment into an array of individual characters (intermediate step).
    .reduce((currentAccumulatedCost, charIdentifier) => {
      // If the current character matches the activation symbol, add the modifier amount.
      if (charIdentifier === FEATURE_ACTIVATION_SYMBOL) {
        return currentAccumulatedCost + FEATURE_MODIFIER_AMOUNT;
      }
      return currentAccumulatedCost; // Otherwise, the cost remains unchanged.
    }, 0); // Start the accumulation from an initial cost of zero for additional features.

  // Add the total calculated additional cost to the base cost to get the final price.
  finalComputedCost += additionalFeatureCost;

  return finalComputedCost;
};

// --- Main Execution Block (Type II - renaming, Type III - orchestrating new functions) ---

/**
 * The primary entry point for the application. This function orchestrates
 * reading the item configuration from standard input, calculating its cost,
 * and displaying the result.
 */
const executeApplicationLogic = () => {
  // Read the raw configuration data from standard input using the helper function.
  const itemConfigurationRawData = retrieveFileContent(
    STANDARD_INPUT_FILE_PATH,
    INPUT_FILE_ENCODING
  );

  // Calculate the final cost using the dedicated computation function.
  // '.trim()' is used to remove any leading/trailing whitespace or newline characters
  // that might be present in the input file content.
  const calculatedOutputCost = computeItemFinalCost(itemConfigurationRawData.trim());

  // Output the final computed cost to the console.
  console.log(calculatedOutputCost);
};

// Initiate the application's core logic.
executeApplicationLogic();