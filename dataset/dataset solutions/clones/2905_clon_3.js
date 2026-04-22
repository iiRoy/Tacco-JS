'use strict';

/**
 * Represents a single parsed data entry from an input line.
 * This structure enhances readability over simple array indexing.
 * @typedef {Object} DataEntry
 * @property {string} category - The primary identifier for grouping, derived from the first part of the input line.
 * @property {number} sortValue - The numeric value used for sorting items within their respective categories, derived from the second part of the input line.
 * @property {number} initialIndex - The 1-based original index of the line in the input stream, crucial for the final output.
 */

/**
 * Core function to process raw input data, perform categorization, sorting,
 * and generate the final sequence of indices.
 * This function is designed to handle a typical competitive programming input format
 * where the first line specifies the number of subsequent data entries.
 * @param {string} rawInputString - The entire raw input as a single string,
 *                                  usually read from standard input.
 */
function processCategorizedData(rawInputString) {
  // Validate the input string to prevent errors with unexpected types or empty content.
  if (typeof rawInputString !== 'string' || rawInputString.trim() === '') {
    // In a production system, an error might be thrown. For competitive programming,
    // often an empty output is sufficient or a specific error message.
    console.log('');
    return;
  }

  // Split the raw input into individual lines.
  // Filter out any empty lines that might occur from trailing newlines or malformed input.
  const allInputLines = rawInputString.split('\n').filter(line => line.trim() !== '');

  // If after splitting and filtering, no meaningful lines remain, exit early.
  if (allInputLines.length === 0) {
    console.log('');
    return;
  }

  // The first line typically contains the count of data entries that follow.
  const numberOfEntriesString = allInputLines[0];
  const expectedDataEntryCount = parseInt(numberOfEntriesString, 10);

  // Add a validation step for the expected count (Type III: guard clause/validation).
  if (isNaN(expectedDataEntryCount) || expectedDataEntryCount < 0) {
    // Log a warning if the count is invalid but proceed with available data.
    console.error("Warning: The first line does not contain a valid positive integer for the entry count.");
    // Optionally, could throw an error or return immediately here.
  }

  // Extract the actual data lines by skipping the first line (the count).
  // This is an update from `shift()` to `slice(1)` for a non-mutating approach.
  const actualDataLines = allInputLines.slice(1);

  // Another validation: check if the number of actual data lines matches the expected count.
  if (expectedDataEntryCount > 0 && actualDataLines.length !== expectedDataEntryCount) {
      console.warn(`Warning: Expected ${expectedDataEntryCount} data entries, but found ${actualDataLines.length}. Processing available data.`);
  }

  /** @type {DataEntry[]} */
  const structuredDataRecords = [];

  // Iterate over each data line to parse it into a structured object.
  // Using a traditional for loop for explicit index control and potential early exits/continues.
  for (let currentLineZeroBasedIndex = 0; currentLineZeroBasedIndex < actualDataLines.length; currentLineZeroBasedIndex++) {
    const currentInputLine = actualDataLines[currentLineZeroBasedIndex];
    const lineComponents = currentInputLine.split(' '); // Split by space.

    // Validate the structure of the line; expect at least two components.
    if (lineComponents.length < 2) {
      console.warn(`Skipping malformed input line (too few components): "${currentInputLine}" at original index ${currentLineZeroBasedIndex + 1}.`);
      continue; // Move to the next line.
    }

    const categoryKey = lineComponents[0];
    const valueComponentString = lineComponents[1];
    const numericSortValue = parseInt(valueComponentString, 10);

    // Validate that the second component is a valid integer.
    if (isNaN(numericSortValue)) {
      console.warn(`Skipping input line due to invalid numeric value: "${currentInputLine}" at original index ${currentLineZeroBasedIndex + 1}.`);
      continue; // Move to the next line.
    }

    // Create a `DataEntry` object for better semantic representation (Type III: data structure change).
    const recordEntry = {
      category: categoryKey,
      sortValue: numericSortValue,
      initialIndex: currentLineZeroBasedIndex + 1 // Store the 1-based original index.
    };
    structuredDataRecords.push(recordEntry);
  }

  // Use a `Map` to group `DataEntry` objects by their `category`.
  // `Map` offers better performance and flexibility for key-value pairs compared to plain objects.
  /** @type {Map<string, DataEntry[]>} */
  const groupedByCategoryMap = new Map();

  // Populate the map by iterating through the structured records.
  for (const dataRecord of structuredDataRecords) {
    // If the category doesn't exist as a key in the map, initialize it with an empty array.
    if (!groupedByCategoryMap.has(dataRecord.category)) {
      groupedByCategoryMap.set(dataRecord.category, []);
    }
    // Add the current record to the array associated with its category.
    groupedByCategoryMap.get(dataRecord.category).push(dataRecord);
  }

  // Extract all unique category keys from the map and sort them alphabetically.
  // `Array.from()` is used to convert the Map's key iterator into a sortable array.
  const sortedCategoryIdentifiers = Array.from(groupedByCategoryMap.keys()).sort();

  // An array to collect all output lines before printing them at once.
  // This is an optimization for I/O performance (Type III: add intermediate storage).
  const collectedOutputIndices = [];

  // Iterate through each category identifier in alphabetical order.
  for (const currentCategoryIdentifier of sortedCategoryIdentifiers) {
    // Retrieve all data entries belonging to the current category.
    const entriesInCurrentCategory = groupedByCategoryMap.get(currentCategoryIdentifier);

    // Sort these entries in descending order based on their `sortValue`.
    // The comparison function `entryB.sortValue - entryA.sortValue` ensures descending order.
    const sortedEntriesWithinCategory = entriesInCurrentCategory.sort((entryA, entryB) => {
      return entryB.sortValue - entryA.sortValue;
    });

    // For each entry that has been sorted within its category, append its original 1-based index
    // to the `collectedOutputIndices` array.
    for (const sortedItem of sortedEntriesWithinCategory) {
      collectedOutputIndices.push(sortedItem.initialIndex.toString());
    }
  }

  // Finally, print all collected indices, each on a new line.
  // Using `join('\n')` is more efficient than multiple `console.log()` calls.
  console.log(collectedOutputIndices.join('\n'));
}

/**
 * A utility function to retrieve input from standard input.
 * This is typical for environments like competitive programming platforms.
 * @returns {string} The content read from `/dev/stdin` or an empty string if an error occurs.
 */
function retrieveStandardInput() {
  try {
    // Node.js specific: read synchronously from the standard input file path.
    return require('fs').readFileSync('/dev/stdin', 'utf8');
  } catch (err) {
    // Log an error if input cannot be read, which might happen in non-standard environments.
    console.error("Failed to read from /dev/stdin. Please ensure input is properly piped or redirected.", err);
    return ''; // Return empty string to allow `processCategorizedData` to handle it gracefully.
  }
}

// Initiate the processing by calling the main function with input from stdin.
processCategorizedData(retrieveStandardInput());