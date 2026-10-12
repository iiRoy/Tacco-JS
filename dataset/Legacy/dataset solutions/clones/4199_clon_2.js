function findMaximum(dataCollection) {
  // Initialize the maximum value to negative infinity to ensure any number in the collection is greater.
  let currentMax = Number.NEGATIVE_INFINITY;

  // Iterate through each element in the provided data collection.
  for (const elementValue of dataCollection) {
    // If the current element is greater than the recorded maximum, update the maximum.
    if (currentMax < elementValue) {
      currentMax = elementValue;
    }
  }
  // Return the highest value found in the collection.
  return currentMax;
}

function processInputData(rawData) {
  // Split the raw input string into individual lines.
  const inputLines = rawData.split('\n');

  // Parse each line: split by space, then convert each part to an integer.
  const parsedNumbers = inputLines.map(singleLine => singleLine.split(' ').map(strVal => parseInt(strVal, 10)));

  // Extract the first line which contains configuration values (N and C).
  const configValues = parsedNumbers.shift();
  const numEntries = configValues[0]; // N
  const numCategories = configValues[1]; // C

  // Initialize a temporary array for accumulating counts within each category.
  const tempCounts = Array(200002);
  // Initialize an array to store the maximum recorders for each time point across all categories.
  const totalCategoryCounts = Array(200002);
  totalCategoryCounts.fill(0); // Ensure all initial values are zero.

  // Process each category.
  for (let categoryIndex = 1; categoryIndex <= numCategories; categoryIndex++) {
    // Reset temporary counts for the new category.
    tempCounts.fill(0);

    // Iterate through all entries to apply category-specific counts.
    for (let entryIndex = 0; entryIndex < numEntries; entryIndex++) {
      // Check if the current entry belongs to the current category.
      if (parsedNumbers[entryIndex][2] === categoryIndex) {
        // Apply difference array technique: increment at start time, decrement at end time.
        tempCounts[parsedNumbers[entryIndex][0] * 2 - 1]++;
        tempCounts[parsedNumbers[entryIndex][1] * 2]--;
      }
    }

    // Calculate prefix sums for the temporary counts to get actual counts at each time point.
    for (let loopCounter = 1; loopCounter < 200002; loopCounter++) {
      tempCounts[loopCounter] = tempCounts[loopCounter - 1] + tempCounts[loopCounter];
    }

    // Add the current category's counts to the overall total category counts.
    for (let loopCounter = 1; loopCounter < 200002; loopCounter++) {
      totalCategoryCounts[loopCounter] += tempCounts[loopCounter];
    }
  }

  // Output the maximum value found in the total category counts array.
  console.log(findMaximum(totalCategoryCounts));
}

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
