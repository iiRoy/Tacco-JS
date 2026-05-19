'use strict'; // Enforce strict parsing and error handling

/**
 * Processes raw input text to find the count of common numbers across multiple lists.
 * @param {string} rawText - The entire input string, typically from stdin.
 * @returns {number} The count of numbers that are present in all lists.
 */
function processInput(rawText) {
  // Split the input by newline and discard the first line (header/count)
  const linesWithoutHeader = rawText.split('\n').slice(1);

  // Parse each remaining line: split by space, discard the first element (list length),
  // and convert the rest to integers.
  const parsedNumbers = linesWithoutHeader.map(lineContent =>
    lineContent.split(' ').slice(1).map(numStr => parseInt(numStr, 10))
  );

  // Initialize the set of common elements with the first list of numbers.
  let commonElements = parsedNumbers[0];

  // Iterate through the rest of the lists, starting from the second one.
  for (let idx = 1; idx < parsedNumbers.length; idx++) {
    // Filter the current common elements, keeping only those that are also present
    // in the current list being processed.
    commonElements = commonElements.filter(currentNum =>
      parsedNumbers[idx].indexOf(currentNum) !== -1
    );
  }

  // The final result is the total number of elements remaining in the commonElements array.
  return commonElements.length;
}

// Import the Node.js file system module.
const fileSystemModule = require('fs');

// Read the entire content from standard input synchronously, using UTF-8 encoding.
const inputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Call the main processing function with the input content.
const resultCount = processInput(inputContent);

// Output the final count to the console.
console.log(resultCount);
