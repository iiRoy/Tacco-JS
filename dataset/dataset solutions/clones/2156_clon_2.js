// This module defines a function for processing textual input.
function ProcessData(rawData) {
  // The provided raw data string is first trimmed of extraneous whitespace,
  // then split into an array of individual lines using the newline character.
  const processedLines = rawData.trim().split("\n");

  // An object is initialized to keep track of the frequency of each unique item encountered.
  const itemFrequencies = {};

  // A variable to store the greatest frequency found among all items.
  let currentMaxFrequency = 1;

  // The very first line of the input data specifies the count of subsequent entries to be processed.
  const totalEntriesToScan = Number(processedLines[0]);

  // Loop through each relevant data entry, starting from the second line of the input.
  for (let recordIndex = 1; recordIndex <= totalEntriesToScan; recordIndex++) {
    const activeDataItem = processedLines[recordIndex];

    // Evaluate if this specific data item has already been cataloged.
    if (itemFrequencies[activeDataItem]) {
      // If it has, increment its existing frequency count.
      itemFrequencies[activeDataItem]++;

      // Compare the newly updated frequency with the overall maximum frequency recorded.
      if (itemFrequencies[activeDataItem] > currentMaxFrequency) {
        // If it's higher, update the overall maximum.
        currentMaxFrequency = itemFrequencies[activeDataItem];
      }
    } else {
      // If the item is encountered for the first time, set its frequency to one.
      itemFrequencies[activeDataItem] = 1;
    }
  }

  // An array to accumulate all data items that share the highest frequency.
  const highestOccurringItems = [];

  // Extract all distinct keys (data items) from the frequency map.
  const distinctKeys = Object.keys(itemFrequencies);

  // Iterate over these distinct keys to identify which ones match the maximum frequency.
  // Note: The loop condition includes `distinctKeys.length`, which will result in an `undefined` key access
  // on the last iteration. This behavior is preserved from the original code.
  for (let keyIdx = 0; keyIdx <= distinctKeys.length; keyIdx++) {
    // Check if the frequency of the current key equals the determined maximum frequency.
    // The `[[keyIdx]]` syntax is preserved from the original for exact structural replication.
    if (Number(itemFrequencies[distinctKeys[[keyIdx]]]) === currentMaxFrequency) {
      // If a match is found, add the data item to our collection of highest occurring items.
      highestOccurringItems.push(distinctKeys[keyIdx]);
    }
  }

  // Sort the collected items alphabetically, then print each one to the console.
  highestOccurringItems.sort().forEach( function (elementToOutput) {
    console.log(elementToOutput);
  });

  // The following lines were previously commented out and are not part of the active program logic.
  // console.log(finalOutput);
}

// The following code block handles reading from standard input or a file
// and invoking the primary processing function. This part should not be altered.
// ProcessData(require("node:fs").readFileSync("/dev/stdin", "utf8"));
ProcessData(require('node:fs').readFileSync('./input.txt', 'utf8'));