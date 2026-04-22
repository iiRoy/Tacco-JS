'use strict'; // Activates strict parsing and error handling for the script.

/**
 * Top-level function to manage data ingestion and transformation.
 * @param {string} rawSourceData - The complete data block received for processing.
 */
function manageDataFlow(rawSourceData) {
  // Break down the monolithic input string into individual records by newline.
  let dataRecords = rawSourceData.split('\n');

  // Eliminate the very first record, as it's typically a header or irrelevant.
  dataRecords.shift();

  // Prepare a storage structure for grouping elements by their primary key.
  // This array will hold sub-arrays, each corresponding to a unique primary key.
  let groupedElements = [];

  // First pass: Parse each record, populate the grouped storage, and retain parsed data.
  dataRecords = dataRecords
    .map(singleRecordText => {
      // Convert the current text record into an array of numbers.
      let numericalParts = singleRecordText.split(' ').map(strPart => parseInt(strPart, 10));

      // If the group for the first numerical part doesn't yet exist, initialize it.
      if (groupedElements[numericalParts[0]] === undefined) {
        groupedElements[numericalParts[0]] = [];
      }
      // Add the second numerical part to its corresponding group.
      groupedElements[numericalParts[0]].push(numericalParts[1]);

      // Return the array of numerical parts for subsequent operations.
      return numericalParts;
    });

  // Sort each individual group of elements numerically in ascending order.
  groupedElements.forEach(elementCollection => elementCollection.sort((itemA, itemB) => itemA - itemB));

  // Second pass: Generate a unique formatted identifier for each original data record.
  dataRecords = dataRecords
    .map(currentNumericalPair => {
      // Construct the first segment of the identifier, zero-padded to six digits.
      let generatedIdentifier = ('000000' + currentNumericalPair[0].toString(10)).slice(-6);

      // Calculate the 1-based index of the second number within its sorted group,
      // then format it (zero-padded) and append to the identifier.
      generatedIdentifier += ('000000' + (groupedElements[currentNumericalPair[0]].indexOf(currentNumericalPair[1]) + 1).toString(10)).slice(-6);

      // Output the final generated identifier.
      console.log(generatedIdentifier);
    });
}

// Execute the primary data processing routine using content from standard input.
manageDataFlow(require('fs').readFileSync('/dev/stdin', 'utf8'));