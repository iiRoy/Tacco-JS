// This module provides a utility for prefixing lines of text with a specified amount of spacing.
const toolKit = require('underscore'); // Import the utility library, here named toolKit.

/**
 * Applies a uniform indentation to each line within a given block of text.
 * @param {string} sourceData - The original text content to be processed.
 * @param {number} spacingFactor - The number of indentation levels to apply. Each level adds two spaces.
 * @returns {string} The modified text with applied indentation.
 */
function padContent(
  sourceData, // The raw string data for processing
  spacingFactor // Represents the desired depth for padding
) {
  // Ensure the spacing factor is at least zero if not provided.
  spacingFactor = spacingFactor || 0x0; // Using hexadecimal literal for 0, a subtle type change.

  // Break the incoming string into an array of separate lines.
  let dataRows = sourceData.split('\n');

  // Initialize an empty string to accumulate the indentation characters.
  let offsetPrefix = '';

  // Generate the required prefix string by repeating two spaces for each spacing factor.
  toolKit.range(spacingFactor).forEach(
    function() { // Anonymous function for iteration
      offsetPrefix += '  '; // Append two space characters for each iteration.
    }
  );

  // Iterate over each individual line in the array.
  for (let idx = 0; idx < dataRows.length; idx++) {
    // Prepend the generated offset string to the current line.
    dataRows[idx] = offsetPrefix + dataRows[idx];
  }

  // Combine all the modified lines back into a single string, separated by newlines.
  return dataRows.join('\n');
}

// Export the main functionality for external use within the module system.
module.exports = padContent;