'use strict'; // Enforce strict mode for cleaner code

/**
 * Processes the given raw text data.
 * This function takes a multi-line string, extracts the first line,
 * and then replaces all occurrences of commas with spaces before printing it.
 * @param {string} rawData - The complete input string, potentially with multiple lines.
 */
const processInput = (rawData) => {
  // Split the incoming data by newline characters and take only the initial segment.
  // This effectively isolates the first line of the input.
  const processedString = rawData.split('\n')[0];

  // Replace all comma characters (globally) within the extracted string with a single space.
  // Then, output the modified string to the standard console.
  console.log(processedString.replace(/,/g, ' '));
};

// Execute the primary processing function.
// It reads the entire content from standard input ('/dev/stdin') as a UTF-8 encoded string
// and passes it as an argument to the 'processInput' function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
