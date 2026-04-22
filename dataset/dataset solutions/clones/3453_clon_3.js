function processInputData(rawDataString) {
  // This function orchestrates the parsing, processing, and output generation for input data.

  if (!rawDataString || rawDataString.trim() === '') {
    // Guard clause: Handle cases where input data is empty or consists only of whitespace.
    console.error("Input data is empty or invalid. No processing will occur.");
    return;
  }

  let dataLines = rawDataString.split('\n');

  // The first line often contains metadata (like the total number of entries).
  // For this problem, we simply discard it as it's not used in the subsequent logic.
  const initialMetadataLine = dataLines.shift();

  // This array will store lists of values, grouped by their respective categories (first number in a pair).
  // It functions as a sparse array where indices correspond to category keys.
  const categoryGroupedValues = [];

  // This array will hold the original parsed numeric pairs for a second pass,
  // preserving the original order of input entries.
  const originalEntryOrder = [];

  // Define constants for output formatting.
  const DESIRED_PADDING_LENGTH = 6;
  const PADDING_CHARACTER = '0';

  // Helper function to format a number with leading zeros to a specified length.
  const padNumberWithZeros = (numericValue, length) => {
    return String(numericValue).padStart(length, PADDING_CHARACTER);
  };

  // First pass: Iterate through each line to parse data and populate category groups.
  for (let i = 0; i < dataLines.length; i++) {
    const currentInputLine = dataLines[i].trim();
    if (!currentInputLine) {
      // Skip any completely empty lines that might result from splitting.
      continue;
    }

    const lineSegments = currentInputLine.split(' ');
    if (lineSegments.length !== 2) {
      // Basic validation: Ensure each line contains exactly two space-separated values.
      console.warn(`Skipping malformed input line: "${currentInputLine}". Expected 2 numbers, found ${lineSegments.length}.`);
      continue;
    }

    const primaryCategoryIdentifier = parseInt(lineSegments[0], 10);
    const secondaryItemValue = parseInt(lineSegments[1], 10);

    if (isNaN(primaryCategoryIdentifier) || isNaN(secondaryItemValue)) {
      // Validation: Ensure parsed values are indeed numbers.
      console.warn(`Skipping line with non-numeric content: "${currentInputLine}".`);
      continue;
    }

    // Initialize the list for this category if it doesn't exist yet.
    // This ensures `categoryGroupedValues[primaryCategoryIdentifier]` is an array.
    if (!Array.isArray(categoryGroupedValues[primaryCategoryIdentifier])) {
      categoryGroupedValues[primaryCategoryIdentifier] = [];
    }
    // Add the secondary value to its corresponding category list.
    categoryGroupedValues[primaryCategoryIdentifier].push(secondaryItemValue);

    // Store the parsed numeric pair in its original order for the next processing stage.
    originalEntryOrder.push([primaryCategoryIdentifier, secondaryItemValue]);
  }

  // Post-processing step: Sort each individual list within the category groups.
  // This prepares the data for determining the rank of each item.
  for (let i = 0; i < categoryGroupedValues.length; i++) {
    const currentCategoryList = categoryGroupedValues[i];
    if (Array.isArray(currentCategoryList)) {
      // Sort numerically in ascending order.
      currentCategoryList.sort((valueA, valueB) => valueA - valueB);
    }
  }

  // Second pass: Generate and output the final unique identifiers.
  // This step iterates through the original order of entries and calculates their final ID.
  originalEntryOrder.forEach(individualEntry => {
    const currentCategoryKey = individualEntry[0];
    const currentItemValue = individualEntry[1];

    // Retrieve the sorted list for the current entry's category.
    const relevantSortedList = categoryGroupedValues[currentCategoryKey];

    if (!relevantSortedList) {
      // This scenario indicates a data inconsistency if the category key was processed
      // in the first pass but somehow doesn't have a corresponding list here.
      console.error(`Critical Error: Sorted list missing for category key ${currentCategoryKey}.`);
      return;
    }

    // Format the category identifier with leading zeros.
    const formattedCategoryPart = padNumberWithZeros(currentCategoryKey, DESIRED_PADDING_LENGTH);

    // Determine the 1-based rank (position) of the current item within its sorted list.
    // `indexOf` returns a 0-based index, so we add 1.
    const itemRankWithinCategory = relevantSortedList.indexOf(currentItemValue) + 1;
    const formattedRankPart = padNumberWithZeros(itemRankWithinCategory, DESIRED_PADDING_LENGTH);

    // Concatenate the two formatted parts to form the complete unique identifier.
    const finalGeneratedIdentifier = formattedCategoryPart + formattedRankPart;
    console.log(finalGeneratedIdentifier);
  });
}

// Main execution block: Reads input from standard input and initiates the processing.
try {
  // Access the Node.js 'fs' (file system) module to read from stdin.
  const fileSystemModule = require('fs');
  const stdinContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  processInputData(stdinContent);
} catch (ioError) {
  // Catch and report any errors that occur during file reading.
  console.error("An error occurred while reading input from /dev/stdin:", ioError.message);
}