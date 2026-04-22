function ProcessInputData(sourceDataString) {
  // Preliminary validation: Ensure the input string is valid and not empty.
  if (!sourceDataString || typeof sourceDataString !== 'string' || sourceDataString.trim().length === 0) {
    // If the input is invalid, output an error message and terminate execution.
    console.error("Error: Provided input data is either null, not a string, or completely empty. Cannot proceed.");
    return;
  }

  // Divide the complete input string into an array of individual lines.
  const allInputLines = sourceDataString.split('\n');

  // The first line is often an indicator of length or some other metadata.
  // Here, we'll attempt to parse it, but it's not directly used in the core logic's calculation.
  let lineCountMetadata = null;
  if (allInputLines.length > 0) {
    const firstLineTrimmed = allInputLines[0].trim();
    if (firstLineTrimmed !== '') {
      lineCountMetadata = parseInt(firstLineTrimmed, 10);
      // Log a warning if the metadata isn't a valid number, but allow processing to continue.
      if (isNaN(lineCountMetadata)) {
        console.warn("Warning: The first line's metadata could not be parsed as a valid integer. Proceeding without its numerical value.");
      }
    }
  }

  // Ensure that there is at least a second line from which to extract item data.
  if (allInputLines.length < 2) {
    console.error("Error: Insufficient data. Input must contain at least two lines for proper processing.");
    return;
  }

  // Extract the raw string containing space-separated items from the second line.
  const rawItemSequenceString = allInputLines[1].trim();

  // Initialize an array to hold the individual items after splitting.
  let processedItemTokens = [];

  // If the raw item sequence string is not empty, split it by spaces.
  if (rawItemSequenceString.length > 0) {
    processedItemTokens = rawItemSequenceString.split(' ');
  }

  // Utilize a JavaScript Set object to efficiently obtain all unique elements from the token array.
  // This approach is distinct from filtering with indexOf and generally more performant for large arrays.
  const collectionOfUniqueItems = new Set(processedItemTokens);

  // Get the total count of distinct items found.
  const totalDistinctItemCount = collectionOfUniqueItems.size;

  // Declare a variable to store the final computed numerical result.
  let finalComputedOutcome;

  // Based on the parity of the unique item count, determine the final outcome.
  // If the count is odd, it's used as-is. If even, it's decremented by one.
  // This logic is expressed using a ternary operator for conciseness.
  finalComputedOutcome = (totalDistinctItemCount % 2 !== 0)
    ? totalDistinctItemCount        // Case: Odd number of distinct items.
    : totalDistinctItemCount - 1;   // Case: Even number of distinct items.

  // Output the final calculated value to the console.
  console.log(finalComputedOutcome);
}

// The script's entry point: reads data from standard input and passes it to the processing function.
// Ensure the file system module is correctly loaded and the input path is specified.
const systemRawDataSource = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the main processing function with the obtained input.
ProcessInputData(systemRawDataSource);