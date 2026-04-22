// Helper function to safely parse a string into an integer.
// If the input string is not a valid number, it defaults to 0,
// ensuring that arithmetic or comparisons can still proceed without errors.
function safelyParseInteger(numericString) {
  const parsedValue = Number.parseInt(numericString, 10); // Always specify radix for robustness
  // Return the parsed value, or 0 if parsing resulted in NaN (Not-a-Number).
  return isNaN(parsedValue) ? 0 : parsedValue;
}

// Helper function to extract and deduplicate elements from a string.
// It handles various forms of empty or malformed input strings by
// returning an empty Set, which represents no unique elements.
function extractUniqueElements(inputLineContent) {
  // Validate input: ensure it's a non-empty string before processing.
  if (typeof inputLineContent !== 'string' || inputLineContent.trim() === '') {
    return new Set(); // Return an empty set if no valid content is provided.
  }

  // Trim whitespace and split the string by one or more whitespace characters.
  // This approach is more resilient to varying spacing in the input.
  const elementStrings = inputLineContent.trim().split(/\s+/);
  
  // Create and return a Set from the extracted strings, automatically handling deduplication.
  return new Set(elementStrings);
}

// The primary routine for processing application input data.
// It determines if the quantity of distinct items in a list matches a specified target count.
function processInputData(sourceDataLines) {
  // Initial validation: Check if the input array contains the expected number of lines.
  // If the input is malformed or insufficient, output 'NO' to indicate failure
  // and terminate execution for this input set.
  if (!Array.isArray(sourceDataLines) || sourceDataLines.length < 2) {
    console.log('NO');
    return;
  }

  // Step 1: Obtain the expected count from the first line of the input.
  // The helper function ensures a valid numeric value for comparison.
  const expectedItemCount = safelyParseInteger(sourceDataLines[0]);

  // Step 2: Process the second line to get a collection of unique items.
  // The helper function handles splitting and deduplication.
  const distinctItemCollection = extractUniqueElements(sourceDataLines[1]);
  
  // Retrieve the actual number of unique items found in the collection.
  const actualUniqueCount = distinctItemCollection.size;

  // Step 3: Compare the expected count against the actual count of unique items.
  // This boolean variable clearly states the outcome of the core condition check.
  const isConditionMet = (expectedItemCount === actualUniqueCount);

  // Step 4: Determine the final output string based on the comparison result.
  // A ternary operator provides a clean way to select between 'YES' and 'NO'.
  const finalOutputString = isConditionMet ? 'YES' : 'NO';
  
  // Display the final result to the console.
  console.log(finalOutputString);
}

// --- Application Entry Point ---
// This section handles reading raw input from the standard input stream,
// preparing it, and then invoking the main processing logic.
// The 'fs' module is a core Node.js module used for file system interactions.
const fileSystemModule = require('fs');

// Read all data from '/dev/stdin' (standard input) as UTF-8.
const rawInputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input:
// 1. '.trim()' removes any leading or trailing whitespace from the entire input block.
// 2. '.split("\n")' divides the input string into an array of individual lines.
const preparedInputLines = rawInputBuffer.trim().split("\n");

// Execute the main data processing function with the prepared input lines.
processInputData(preparedInputLines);