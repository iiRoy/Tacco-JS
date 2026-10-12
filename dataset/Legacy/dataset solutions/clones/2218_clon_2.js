'use strict';

// This function processes the input data to find a specific count.
const processInput = (rawData) => {
  // Parse the first line as the total number of items.
  const itemCount = parseInt(rawData[0]);

  // Parse the second line, splitting by space and converting each part to an integer.
  const valueArray = rawData[1].split(' ').map(numericString => parseInt(numericString));

  // Initialize an array to store status flags for each item.
  const statusFlags = [];

  // Iterate through each item from the beginning to the end.
  for (let outerIndex = 0; outerIndex < itemCount; outerIndex++) {
    // Assume the current item meets the condition initially.
    statusFlags[outerIndex] = 1;

    // Compare the current item with all preceding items.
    for (let innerIndex = 0; innerIndex < outerIndex; innerIndex++) {
      // If the current item's value is greater than a preceding item's value,
      // it fails the condition.
      if (valueArray[outerIndex] > valueArray[innerIndex]) {
        // Mark the current item as failing the condition.
        statusFlags[outerIndex] = 0;
        // No need to check further for this item, break the inner loop.
        break;
      }
    }
  }

  // Initialize a counter for items that met the condition.
  let finalTally = 0;

  // Iterate through the status flags to count successful items.
  statusFlags.map(flagValue => {
    // If the flag is 1, it means the item met the condition.
    if (flagValue === 1) {
      // Increment the final tally.
      finalTally++;
    }
  });

  // Output the final calculated count to the console.
  console.log(finalTally);
};

// Read input from standard input, decode as UTF-8, split by newlines,
// and then pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
