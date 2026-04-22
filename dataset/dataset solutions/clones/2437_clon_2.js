function computeSolution(rawData) {
  // Parse incoming textual data for processing
  rawData=rawData.trim()
         .split('\n')
         .map((dataRow) => dataRow.split(' '));
  // Extract key dimensions from the initial line
  let numItems = parseInt(rawData[0][0], 10);
  let maxCapacity = parseInt(rawData[0][1], 10);
  // Prepare an array to hold item specifications (weight/value pairs)
  var itemValues = [];
  for (let idx = 0; idx < numItems; idx++) {
    itemValues.push(rawData[idx + 1].map(strVal => Number.parseInt(strVal, 10)));
  }
  // Sort items primarily by their first attribute (weight)
  itemValues.sort((itemA, itemB) => itemA[0] - itemB[0]);
  // Initialize the dynamic programming table
  const memoizationTable = [];
  let currentWeight, currentValue;
  // Set up the base case for the DP table (first row)
  memoizationTable.push(new Array(maxCapacity).fill(null).map(() => [0, 0]));
  // Iterate through each item to fill the DP table
  for (let idx = 0; idx < numItems; idx++) {
    memoizationTable.push([]);
    currentWeight = itemValues[idx][0];
    currentValue = itemValues[idx][1];
    // Iterate through each possible capacity
    for (let capIdx = 0; capIdx < maxCapacity; capIdx++) {
      memoizationTable[idx + 1].push([0, 0]);
      // Determine the maximum value obtainable for the current capacity without considering direct acquisition
      if (currentWeight <= capIdx) {
        memoizationTable[idx + 1][capIdx][0] = Math.max(memoizationTable[idx][capIdx][0], memoizationTable[idx][capIdx - currentWeight][0] + currentValue);
      } else {
        memoizationTable[idx + 1][capIdx][0] = memoizationTable[idx][capIdx][0];
      }
      // Calculate the maximum value considering direct acquisition (different interpretation)
      memoizationTable[idx + 1][capIdx][1] = Math.max(memoizationTable[idx][capIdx][1], memoizationTable[idx][capIdx][0] + currentValue);
    }
  }
  // Output the final computed result from the DP table
  console.log(memoizationTable[numItems][maxCapacity - 1][1]);
}
// Execute the solution with input sourced from standard input
computeSolution(require("fs").readFileSync('/dev/stdin', 'utf8'));