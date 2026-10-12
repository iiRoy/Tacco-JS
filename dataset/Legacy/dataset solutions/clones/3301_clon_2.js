function processInputData(rawData) {
  // Split the raw input string into individual lines
  const inputLines = rawData.split('\n');

  // Extract the number of items and maximum weight from the first line
  const dimensions = inputLines.shift().split(' ').map(valStr => parseInt(valStr, 10));
  const numItems = dimensions[0]; // N
  const maxWeight = dimensions[1]; // W

  // Parse the remaining lines to get item details (weight and value)
  const itemDetails = inputLines.map(lineContent =>
    lineContent.split(' ').map(numStr => parseInt(numStr, 10))
  );

  // Initialize a 2D array (dynamic programming table)
  // The table will store the maximum value that can be obtained for a given weight and number of items
  const memoTable = [];
  for (let currentIdx = 0; currentIdx < maxWeight + 1; currentIdx++) {
    // Each row represents a capacity, each column represents an item count
    memoTable.push(Array(numItems + 1).fill(0));
  }

  let finalMaxVal = 0; // Variable to keep track of the overall maximum value found

  // Iterate through each item
  for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
    // Iterate through each possible weight capacity
    for (let currentWeight = 0; currentWeight <= maxWeight; currentWeight++) {
      // Extract the weight and value of the current item
      const itemWeight = itemDetails[itemIndex][0];
      const itemValue = itemDetails[itemIndex][1];

      // If the current item's weight is less than or equal to the current capacity
      if (itemWeight <= currentWeight) {
        // Option 1: Include the current item
        // Value = current item's value + max value from remaining capacity (currentWeight - itemWeight)
        // with previous items (itemIndex)
        const valueIfIncluded = memoTable[currentWeight - itemWeight][itemIndex] + itemValue;

        // Option 2: Exclude the current item
        // Value = max value from the same capacity (currentWeight) with previous items (itemIndex)
        const valueIfExcluded = memoTable[currentWeight][itemIndex];

        // Take the maximum of including or excluding the current item
        memoTable[currentWeight][itemIndex + 1] = Math.max(valueIfIncluded, valueIfExcluded);
      } else {
        // If the current item's weight is greater than the current capacity, it cannot be included
        // So, the value remains the same as without considering this item
        memoTable[currentWeight][itemIndex + 1] = memoTable[currentWeight][itemIndex];
      }

      // Update the overall maximum value if a new higher value is found in the table
      if (memoTable[currentWeight][itemIndex + 1] > finalMaxVal) {
        finalMaxVal = memoTable[currentWeight][itemIndex + 1];
      }
    }
  }

  // Output the computed maximum value
  console.log(finalMaxVal);
}

// Read input from standard input and pass it to the main processing function
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
