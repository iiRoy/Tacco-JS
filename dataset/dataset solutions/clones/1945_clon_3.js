// This module is designed to process a block of text input, extract a list of string entries,
// and then determine the total number of unique strings present within that list.
// It includes several robustness checks and uses a Set data structure for efficient uniqueness tracking.

const ProcessInputData = (inputPayloadText) => {
  // Input validation: Ensure the provided payload is a non-empty string.
  if (typeof inputPayloadText !== 'string' || inputPayloadText.trim() === '') {
    console.error('Error: The input data payload is either empty, null, or not a string type.');
    return; // Terminate execution if input is invalid.
  }

  // Step 1: Divide the monolithic input text into an array of individual lines.
  // We also filter out any lines that are empty or consist only of whitespace,
  // which can occur due to trailing newlines or malformed input.
  const structuredInputLines = inputPayloadText.split('\n').filter(lineSegment => lineSegment.trim() !== '');

  // Early exit if, after cleaning, no meaningful lines remain.
  if (structuredInputLines.length === 0) {
    console.log(0); // If no lines, then zero unique items.
    return;
  }

  // Step 2: Extract the expected number of data entries from the very first line.
  // This value typically indicates how many subsequent lines should be considered as data.
  const expectedLineCountRaw = structuredInputLines[0];
  const totalExpectedEntries = parseInt(expectedLineCountRaw.trim(), 10);

  // Validation: Check if the parsed count is a valid positive integer.
  if (isNaN(totalExpectedEntries) || totalExpectedEntries <= 0) {
    console.error(`Error: The first line "${expectedLineCountRaw.trim()}" does not represent a valid positive integer for expected entries.`);
    console.log(0); // Assume no valid entries if the count itself is invalid.
    return;
  }

  // Step 3: Isolate the actual data entries by discarding the first line (which was the count).
  // This creates a new array containing only the string items to be processed.
  const dataItemCollection = structuredInputLines.slice(1);

  // Optional Validation: Compare the number of actual data items found with the expected count.
  // This helps identify discrepancies between the header count and the actual content length.
  if (dataItemCollection.length !== totalExpectedEntries) {
    console.warn(`Warning: Mismatch in entry count. Expected ${totalExpectedEntries} items but found ${dataItemCollection.length}. Processing available items.`);
  }

  // Step 4: Utilize a Set to efficiently store and track unique string items.
  // Sets automatically handle duplicate entries, ensuring each item is stored only once.
  const uniqueElementsRepository = new Set();

  // Step 5: Iterate through the collection of data items.
  // For each item, clean it (trim whitespace) and add it to our unique elements repository.
  // Only non-empty strings are added to prevent counting empty lines as unique.
  for (let index = 0; index < dataItemCollection.length; index++) {
    const currentDataItem = dataItemCollection[index].trim();
    if (currentDataItem.length > 0) { // Add only if the item is not an empty string after trimming.
      uniqueElementsRepository.add(currentDataItem);
    }
  }

  // Step 6: The final result is the size of the unique elements repository.
  // This represents the total count of distinct string items encountered.
  const finalDistinctItemCount = uniqueElementsRepository.size;

  // Output the calculated number of unique items to the console.
  console.log(finalDistinctItemCount);
};

// Application entry point: Reads input from standard input stream and invokes the processor.
// This setup is common for command-line utilities and competitive programming environments.
try {
  const fileSystemAccessor = require('fs'); // Node.js 'fs' module for file system operations.
  const standardInputDevicePath = '/dev/stdin'; // Standard input file path on Unix-like systems.
  const textEncodingStandard = 'utf8'; // Specify UTF-8 for character encoding.

  // Read the entire content of the standard input file synchronously.
  const rawDataFromStdin = fileSystemAccessor.readFileSync(standardInputDevicePath, textEncodingStandard);

  // Pass the raw input content to our primary processing function.
  ProcessInputData(rawDataFromStdin);
} catch (operationError) {
  // Handle any exceptions that might occur during file reading or initial processing.
  console.error(`An unrecoverable error occurred during input processing: ${operationError.message}`);
  // In case of a critical error, it's often useful to output a default or error-indicating value.
  console.log(0); // Output 0 unique items on failure.
}