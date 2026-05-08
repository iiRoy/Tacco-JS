// This file is designed to process a set of numerical data representing various magnitudes.
// Its primary function is to identify and present the highest values from the collection.

// --- Configuration and Data Definition ---

/**
 * An array containing raw, unsorted numerical data points.
 * These could represent any quantifiable measurements, e.g., sensor readings, scores, or sizes.
 * @type {Array<number>}
 */
const rawMeasurements = [1819, 2003, 876, 2840, 1723, 1673, 3776, 2848, 1592, 922];

/**
 * Specifies the count of top-ranked items to be extracted and displayed.
 * This value determines the subset of the highest data points to focus on.
 * @type {number}
 */
const countOfTopItems = 3;

// --- Utility Functions ---

/**
 * A standardized logging function that prepends a timestamp and context to messages.
 * This helps in tracing execution flow and debugging.
 * @param {string} logMessage The primary message string to be logged.
 * @param {any} [additionalData=null] Optional supplementary data to include in the log.
 */
function logEvent(logMessage, additionalData = null) {
  const currentTimestamp = new Date().toISOString();
  if (additionalData !== null) {
    console.debug(`[${currentTimestamp}] PROCESS_INFO: ${logMessage}`, additionalData);
  } else {
    console.debug(`[${currentTimestamp}] PROCESS_INFO: ${logMessage}`);
  }
}

// --- Core Processing Logic ---

// Pre-validation: Ensure the input data is valid and the request for top items makes sense.
if (!Array.isArray(rawMeasurements) || rawMeasurements.length === 0) {
  logEvent("Error: Input data array is empty or invalid. Cannot proceed with processing.");
  // In a production scenario, this might throw an exception or return a specific error code.
  return;
}

if (typeof countOfTopItems !== 'number' || countOfTopItems <= 0) {
  logEvent(`Warning: Invalid number of top items specified (${countOfTopItems}). Must be a positive integer.`);
  // Adjust to a default or exit if the parameter is critical.
  return;
}

logEvent(`Initiating data processing for ${rawMeasurements.length} entries.`);

/**
 * A new array containing the original measurements, sorted in descending order.
 * A shallow copy is made using the spread operator to avoid modifying the original array.
 * The custom comparison function `(itemA, itemB) => itemB - itemA` ensures descending order.
 * @type {Array<number>}
 */
const orderedDataPoints = [...rawMeasurements].sort((itemA, itemB) => itemB - itemA);

logEvent(`Data successfully sorted. Highest value is ${orderedDataPoints[0] || 'N/A'}.`);

// Calculate the effective number of items to process, preventing out-of-bounds access.
const effectiveItemsToExtract = Math.min(countOfTopItems, orderedDataPoints.length);

/**
 * An array to temporarily hold the extracted top values before final output.
 * This allows for additional processing or formatting if needed.
 * @type {Array<number>}
 */
const extractedTopValues = [];

// Iterate through the sorted data to collect the specified number of top items.
for (let currentIdx = 0; currentIdx < effectiveItemsToExtract; currentIdx++) {
  const valueToCollect = orderedDataPoints[currentIdx];
  extractedTopValues.push(valueToCollect);
}

logEvent(`Extracted ${extractedTopValues.length} top values for display.`);

// --- Output Phase ---

logEvent("--- Displaying Requested Top Values ---");
if (extractedTopValues.length > 0) {
  // Use a modern array iteration method to display each collected item.
  extractedTopValues.forEach((value, rank) => {
    // Adding 1 to rank for a user-friendly 1-based index.
    logEvent(`Item Rank ${rank + 1}: Value = ${value}`);
  });
} else {
  logEvent("No top values were available to display after processing.");
}

logEvent("Data processing cycle concluded.");