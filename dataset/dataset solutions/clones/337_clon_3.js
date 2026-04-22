const fileSystemModule = require('fs');

// Acquire raw input data from standard input
let fullInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw content: trim whitespace and split into individual lines
let inboundLines = fullInputContent.trim().split('\n');

// Declare variables for parsing and storing structured data
let currentParsedSegment = '';
let extractedComponents = [];
const aggregatedDataRecords = []; // Renamed 'map' to 'aggregatedDataRecords'

// Iterate through each line to parse and store the data
let lineIndex = 0;
while (lineIndex < inboundLines.length) {
  currentParsedSegment = inboundLines[lineIndex];
  lineIndex++; // Increment line index for the next iteration

  // Skip empty lines
  if (currentParsedSegment.length === 0) {
    continue;
  }

  // Split each line into its constituent parts (word and number)
  extractedComponents = currentParsedSegment.split(' ');

  // Validate the number of components
  if (extractedComponents.length < 2) {
    // Optionally, log an error or skip malformed lines
    continue;
  }

  const textualKey = extractedComponents[0];
  const numericValue = Number(extractedComponents[1]); // Explicit conversion to number

  // Validate the numeric value
  if (isNaN(numericValue)) {
    // Optionally, log an error or skip lines with invalid numbers
    continue;
  }

  // Add the validated key-value pair to our collection
  aggregatedDataRecords.push([textualKey, numericValue]);
}

// Sort the collected data based on specific criteria:
// Primary sort by textual key (alphabetically), secondary sort by numeric value (ascending)
aggregatedDataRecords.sort((recordA, recordB) => {
  const primaryIdentifierA = recordA[0];
  const primaryIdentifierB = recordB[0];
  const secondaryAttributeA = recordA[1];
  const secondaryAttributeB = recordB[1];

  // Compare the primary string identifiers
  const keyComparisonOutcome = primaryIdentifierA.localeCompare(primaryIdentifierB);
  if (keyComparisonOutcome !== 0) {
    return keyComparisonOutcome; // Keys are different, return the result
  }

  // If primary identifiers are identical, compare the secondary numeric attributes
  if (secondaryAttributeA < secondaryAttributeB) {
    return -1;
  }
  if (secondaryAttributeA > secondaryAttributeB) {
    return 1;
  }

  return 0; // Both key and value are identical
});

// Prepare for printing the grouped output
let previousKeyEncountered = '';
let collectedAssociatedNumbers = [];

// Handle the case where no data was successfully processed
if (aggregatedDataRecords.length === 0) {
  // If there's no data, simply exit or print an empty line, depending on desired behavior.
  // For this problem, no output is expected if input is empty or invalid.
} else {
  // Iterate through the sorted records to group and print them
  for (let recordIndex = 0; recordIndex < aggregatedDataRecords.length; recordIndex++) {
    const currentRecord = aggregatedDataRecords[recordIndex];
    const currentRecordKey = currentRecord[0];
    const currentRecordValue = currentRecord[1];

    // Check if the current key is different from the previously processed key
    if (currentRecordKey !== previousKeyEncountered) {
      // If we've processed previous records and collected numbers for them, print those numbers
      // This also handles the case for all records except the very first group
      if (recordIndex > 0 && collectedAssociatedNumbers.length > 0) {
        console.log(collectedAssociatedNumbers.join(' '));
        // Reset the collection for the new key group
        collectedAssociatedNumbers = [];
      }
      // Print the new key
      console.log(currentRecordKey);
      // Update the previous key to the current one
      previousKeyEncountered = currentRecordKey;
    }

    // Add the current record's numeric value to the collection for the current key group
    collectedAssociatedNumbers.push(currentRecordValue);
  }

  // After the loop finishes, there will be remaining collected numbers for the very last key group
  // Print these final collected numbers
  if (collectedAssociatedNumbers.length > 0) {
    console.log(collectedAssociatedNumbers.join(' '));
  }
}