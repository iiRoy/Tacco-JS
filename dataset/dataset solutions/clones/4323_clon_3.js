'use strict';

/**
 * Orchestrates the primary data processing task.
 * This function takes a raw string input, parses it, identifies
 * the maximum primary value, and computes a sum with its
 * corresponding secondary value.
 * @param {string} rawInputText The raw string input from a source.
 */
function executeProcessing(rawInputText) {
  // Step 1: Normalize and convert the input string into an array of numeric values.
  // This involves trimming leading/trailing whitespace, splitting by any sequence of whitespace,
  // and then converting each resulting string segment into a number.
  const numericTokens = rawInputText.trim().split(/\s+/).map(token => Number(token));

  // Step 2: Extract the initial count. This value is part of the input format
  // but is not utilized in the subsequent calculations, effectively discarded.
  numericTokens.shift(); // The variable assignment for discardedCount is removed as it's truly unused.

  // Guard clause: Ensure there are enough tokens left to form at least one pair.
  if (numericTokens.length < 2) {
    console.error("Error: Insufficient numeric tokens to form data pairs after initial discard.");
    return; // Terminate execution gracefully if input is malformed.
  }

  // Step 3: Populate a structured array of data pairs.
  // Instead of processing elements into two separate arrays (like A and B in the original),
  // we create an array of objects. Each object explicitly links a primary value
  // with its associated secondary value, enhancing readability and maintainability.
  const dataPairsCollection = [];
  // Loop through the numeric tokens, taking two at a time to form a pair.
  // This iterative approach replaces the original's reverse-order 'pop()' method.
  for (let i = 0; i < numericTokens.length; i += 2) {
    // Validate that a complete pair can be formed.
    if (i + 1 < numericTokens.length) {
      dataPairsCollection.push({
        primaryComponent: numericTokens[i],     // Corresponds to 'A' values
        secondaryComponent: numericTokens[i + 1] // Corresponds to 'B' values
      });
    } else {
        // Log a warning if an odd number of elements results in an incomplete pair at the end.
        console.warn(`Warning: Encountered an incomplete data pair at token index ${i}. This token will be ignored.`);
    }
  }

  // Another guard clause: Verify that valid pairs were successfully constructed.
  if (dataPairsCollection.length === 0) {
      console.error("Error: No valid data pairs could be constructed from the provided input.");
      return;
  }

  // Step 4: Identify the maximum primary value and its corresponding secondary value.
  // We iterate through the structured `dataPairsCollection` to find the required elements
  // in a single pass, which is more efficient than separate `Math.max` and `indexOf` calls.
  let highestPrimaryValue = -Infinity; // Initialize with the smallest possible number to ensure any valid primary value is greater.
  let linkedSecondaryValue = 0;       // Initialize with a default or zero value.

  // Traverse each pair in the collection.
  for (const currentDataItem of dataPairsCollection) {
    // If the current primary component is strictly greater than the previously recorded highest...
    if (currentDataItem.primaryComponent > highestPrimaryValue) {
      highestPrimaryValue = currentDataItem.primaryComponent;     // Update the highest primary value.
      linkedSecondaryValue = currentDataItem.secondaryComponent; // Update its directly associated secondary value.
    }
    // If multiple primary components share the same maximum value, this logic
    // ensures that the secondary component associated with the *first* occurrence
    // of that maximum primary value (in the order of parsing) is retained,
    // mirroring the behavior of `Array.prototype.indexOf`.
  }

  // Step 5: Compute the final aggregate result.
  // Using an intermediate variable explicitly clarifies the calculation.
  const finalAggregateSum = highestPrimaryValue + linkedSecondaryValue;

  // Step 6: Output the calculated result to the standard console.
  console.log(finalAggregateSum);
}

// Entry point for execution: Reads the entire content of standard input
// as a UTF-8 string and passes it to the `executeProcessing` function.
// This setup is typical for competitive programming environments in Node.js.
executeProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));