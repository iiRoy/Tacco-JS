"use strict"; /* Enforce strict mode for cleaner code */

/**
 * Primary function to process the input dataset.
 * This routine calculates a specific sum based on sorted and filtered lists.
 * @param {string[]} dataLines - An array of strings, each representing a line of input.
 */
function processData(dataLines) {
  // Extract initial configuration parameters from the first line of input.
  const initialConfig = dataLines[0]
                          .trim()
                          .split(" ")
                          .map(numericString => Number.parseInt(numericString, 10));

  // Initialize three distinct lists of numerical values from subsequent input lines.
  let primaryValues = dataLines[1]
                        .trim()
                        .split(" ")
                        .map(strVal => Number.parseInt(strVal, 10));

  let secondaryValues = dataLines[2]
                          .trim()
                          .split(" ")
                          .map(strVal => Number.parseInt(strVal, 10));

  let tertiaryValues = dataLines[3]
                         .trim()
                         .split(" ")
                         .map(strVal => Number.parseInt(strVal, 10));

  // Destructure configuration parameters for easier access.
  const firstLimit = initialConfig[0];
  const secondLimit = initialConfig[1];
  const configA = initialConfig[2]; /* Unused in current logic */
  const configB = initialConfig[3]; /* Unused in current logic */
  const configC = initialConfig[4]; /* Unused in current logic */

  // Sort the primary values in descending order and truncate to 'firstLimit'.
  primaryValues.sort( (itemOne, itemTwo) => itemTwo - itemOne );
  primaryValues = primaryValues.slice(0, firstLimit);

  // Sort the secondary values in descending order and truncate to 'secondLimit'.
  secondaryValues.sort( (itemOne, itemTwo) => itemTwo - itemOne );
  secondaryValues = secondaryValues.slice(0, secondLimit);

  // Sort the tertiary values in descending order and truncate to 'firstLimit + secondLimit'.
  // Note: The slice limit here is derived from the first two limits, which might be specific to the problem context.
  tertiaryValues.sort( (itemOne, itemTwo) => itemTwo - itemOne );
  tertiaryValues = tertiaryValues.slice(0, firstLimit + secondLimit);

  // Combine the primary and secondary lists, then sort the combined list.
  let mergedResults = primaryValues.concat(secondaryValues);
  mergedResults.sort( (valX, valY) => valY - valX );

  // Iterate through tertiary values and conditionally update 'mergedResults'.
  // If a tertiary value is greater than an element in 'mergedResults', replace it.
  for (let tertiaryIdx = 0; tertiaryIdx < tertiaryValues.length; ++tertiaryIdx) {
    for (let mergedIdx = 0; mergedIdx < mergedResults.length; ++mergedIdx) {
      if (tertiaryValues[tertiaryIdx] > mergedResults[mergedIdx]) {
        mergedResults[mergedIdx] = tertiaryValues[tertiaryIdx];
        break; // Stop after the first replacement for the current tertiary value.
      }
    }
  }

  // Calculate the final sum of all elements in the modified 'mergedResults' list.
  let finalAccumulation = 0;
  for (let currentValIndex = 0; currentValIndex < mergedResults.length; ++currentValIndex) {
    finalAccumulation += mergedResults[currentValIndex];
  }

  // Output the computed total.
  console.log(finalAccumulation);
}

// Entry point: Read input from standard input, process it, and execute the main logic.
processData(
  require('node:fs') // Use 'node:fs' for explicit Node.js module.
    .readFileSync('/dev/stdin', 'utf8') // Read entire file as UTF-8 string.
    .trim() // Remove leading/trailing whitespace.
    .split("\n") // Split into an array of lines.
);