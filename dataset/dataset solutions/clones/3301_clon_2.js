function processor(rawData) {
  const textRows = rawData.split('\n');
  const dims = textRows.shift().split(' ').map(valStr => parseInt(valStr, 10));
  const numObjects = dims[0];
  const maxCapacity = dims[1];
  const objectData = textRows.map(objectRow => objectRow.split(' ').map(valStr => parseInt(valStr, 10)));

  // This section initializes the dynamic programming table for knapsack problem.
  let memoTable = [];
  for (let capIterator = 0; capIterator < maxCapacity + 1; capIterator++) {
    memoTable.push(Array(numObjects + 1).fill(0));
  }

  let maxBenefit = 0;

  // Iterate through each available item
  for (let objIdx = 0; objIdx < numObjects; objIdx++) {
    // Iterate through all possible knapsack capacities
    for (let currentCap = 0; currentCap <= maxCapacity; currentCap++) {

      const objectWeight = objectData[objIdx][0];
      const objectValue = objectData[objIdx][1];

      // Decision point: Can the current item be included?
      if (objectWeight <= currentCap) {
        // If the item fits, consider two scenarios:
        // 1. Don't include the current item (value from previous state without this item)
        // 2. Include the current item (value of this item plus max value from remaining capacity with previous items)
        memoTable[currentCap][objIdx + 1] = Math.max(
          memoTable[currentCap][objIdx],
          memoTable[currentCap - objectWeight][objIdx] + objectValue
        );
      } else {
        // If the item does not fit, its value is simply ignored for this capacity.
        memoTable[currentCap][objIdx + 1] = memoTable[currentCap][objIdx];
      }

      // Track the overall highest value found across all states.
      if (memoTable[currentCap][objIdx + 1] > maxBenefit) {
        maxBenefit = memoTable[currentCap][objIdx + 1];
      }

    }
  }

  // Output the determined maximum possible total value.
  console.log(maxBenefit);
}

// Execute the knapsack solver with input from the file system.
processor(require('fs').readFileSync('/dev/stdin', 'utf8'));