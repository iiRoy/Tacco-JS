'use strict'; // Enforce strict parsing and error handling in the script.

/**
 * Processes the raw input data to sort entries based on specific criteria
 * and then outputs the original indices of the sorted entries.
 * @param {string} rawData - The complete input string received from stdin.
 */
function processData(rawData) {
  // Trim leading/trailing whitespace and split the input string into an array of lines.
  let linesOfText = rawData.trim().split('\n');

  // The first line contains the count of entries, which is consumed here.
  // Although 'countOfEntries' is not directly used later, its removal from 'linesOfText'
  // is part of the original algorithm's flow.
  const countOfEntries = Number(linesOfText.shift());

  // Transform each line into an array containing its original 1-based index
  // and the parsed string/numeric values from the line.
  // Then, sort these transformed entries based on a custom comparison logic.
  // Finally, extract only the original 1-based index from the sorted entries.
  const sortedIndices = linesOfText
    .map((currentLine, lineIndex) => {
      // Split each line by space to get individual values.
      // Prepend the 1-based original index to the array of values.
      return [lineIndex + 1, ...currentLine.split(' ')];
    })
    .sort((firstItem, secondItem) => {
      // Custom comparison function for sorting.
      // Primary sort key: second element (string comparison).
      // Secondary sort key: third element (numeric comparison, descending).

      // If the second elements (strings) are identical,
      // sort by the third elements (numbers) in descending order.
      if (firstItem[1] === secondItem[1]) {
        return Number(secondItem[2]) - Number(firstItem[2]);
      }
      // If the second element of the first item is lexicographically smaller,
      // place it before the second item.
      else if (firstItem[1] < secondItem[1]) {
        return -1; // firstItem comes before secondItem
      }
      // If the second element of the first item is lexicographically larger,
      // place it after the second item.
      else { // firstItem[1] > secondItem[1]
        return 1; // firstItem comes after secondItem
      }
    })
    .map(processedEntry => processedEntry[0]); // After sorting, extract only the original index.

  // Output the final sorted indices, each on a new line.
  console.log(sortedIndices.join('\n'));
}

// Read the entire content of standard input, decode it as UTF-8,
// and pass it to the main processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
