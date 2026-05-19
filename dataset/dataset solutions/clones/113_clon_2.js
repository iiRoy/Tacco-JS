let mostFrequentItems = [],
  currentSequenceCount = 0,
  highestFrequency = 0,
  lastProcessedItem = 0; // Initialized to 0, mirroring the original's 'p=0'

// Utilize the Node.js 'fs' module to read the input from standard input.
require("fs")
  .readFileSync("/dev/stdin", "utf8") // Read the entire file content as a UTF-8 string.
  .trim() // Remove any leading or trailing whitespace from the input string.
  .split('\n') // Divide the string into an array of lines, using newline as a delimiter.
  .sort() // Arrange the lines in alphabetical order, which groups identical items together.
  .map(function(currentInputLine) { // Iterate over each sorted line.
    // Compare the current line with the one processed immediately before it.
    if (currentInputLine === lastProcessedItem) {
      currentSequenceCount++; // If they are identical, increment the count for the current sequence.
    } else {
      // If the current line is different, the previous sequence has concluded.
      // Now, evaluate the frequency of that completed sequence.
      if (currentSequenceCount > highestFrequency) {
        // If the count of the just-finished sequence is greater than the highest frequency found so far,
        // update 'highestFrequency' and reset 'mostFrequentItems' to include only this item.
        mostFrequentItems = [lastProcessedItem];
        highestFrequency = currentSequenceCount;
      } else if (currentSequenceCount === highestFrequency) {
        // If the count matches the highest frequency, add this item to the list
        // of most frequent items (as there can be multiple items with the same max frequency).
        mostFrequentItems.push(lastProcessedItem);
      }
      // Prepare for the new sequence: set 'lastProcessedItem' to the current line
      // and reset 'currentSequenceCount' to 0. This specific reset to 0 (rather than 1)
      // replicates the exact counting behavior of the original code, including its initial state for new items.
      lastProcessedItem = currentInputLine;
      currentSequenceCount = 0;
    }
  });

// Output the item(s) identified as most frequent, each on a new line.
// Note: Due to the algorithm's structure, the very last sequence of items in the input
// might not be fully evaluated against 'highestFrequency' if it happens to be the most frequent.
console.log(mostFrequentItems.join('\n'));
