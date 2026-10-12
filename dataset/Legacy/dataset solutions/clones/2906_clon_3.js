'use strict';

function processInput(rawData) {
  const NEWLINE_DELIMITER = '\n';
  const SPACE_DELIMITER = ' ';

  const trimmedContent = rawData.trim();
  const lineArray = trimmedContent.split(NEWLINE_DELIMITER);

  const firstLine = lineArray.shift();
  const numEntries = Number(firstLine); // N from original

  // Helper function to parse each line into the desired format
  const parseEntryLine = (lineContent, originalIndex) => {
    const parts = lineContent.split(SPACE_DELIMITER);
    return [originalIndex + 1, ...parts];
  };

  // Map the remaining lines into an array of [originalIndex, value1, value2]
  const parsedData = lineArray.map(parseEntryLine);

  // Helper function for the custom sorting logic
  const compareEntries = (itemA, itemB) => {
    // Compare based on the second element (index 1) as strings
    const primaryComparisonResult = itemA[1].localeCompare(itemB[1]);

    if (primaryComparisonResult !== 0) {
      return primaryComparisonResult;
    }

    // If primary elements are equal, compare based on the third element (index 2) as numbers, in descending order
    const secondaryValA = Number(itemA[2]);
    const secondaryValB = Number(itemB[2]);
    return secondaryValB - secondaryValA; // Descending order
  };

  // Sort the parsed data using the custom comparison function
  const sortedData = parsedData.sort(compareEntries);

  // Extract only the original indices (first element, index 0) from the sorted data
  const finalIndices = sortedData.map(entry => entry[0]);

  // Output the result, joining the indices with newline characters
  console.log(finalIndices.join(NEWLINE_DELIMITER));
}

// Read input from stdin and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
