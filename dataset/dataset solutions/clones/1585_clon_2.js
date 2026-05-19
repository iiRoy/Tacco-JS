const matrixFlipper = (inputArray) => {
  // This function transposes a 2D array (matrix).
  // It takes the first row's length to determine the number of columns,
  // then iterates through each column index.
  // For each column, it maps over all rows to pick the element at that column index.
  return inputArray[0].map((_ignoredArg, colIndex) =>
    inputArray.map((rowArray) => rowArray[colIndex])
  );
};

// Extending the Array prototype to include a method for finding the mode (most frequent element).
Array.prototype.getFrequentItem = function () {
  // If the array is empty, it's an error as there's no mode.
  if (this.length === 0) {
    throw new Error("error");
  }

  // Object to store the frequency of each unique item.
  var frequencyTracker = {};
  // Object to store the original value associated with its stringified key (value_type).
  var originalItemMap = {};
  // Variable to keep track of the highest frequency found so far.
  var highestCount = 0;
  // Variable to store the value that has the highest frequency.
  var mostCommonValue = null;

  // First pass: populate frequencyTracker and originalItemMap.
  // We use value_typeofValue as keys to handle different types correctly (e.g., 1 and "1").
  for (var elementIterator = 0; elementIterator < this.length; elementIterator++) {
    const itemKey = this[elementIterator] + "_" + typeof this[elementIterator];
    if (!frequencyTracker[itemKey]) {
      frequencyTracker[itemKey] = 0; // Initialize count if not seen before.
    }
    frequencyTracker[itemKey]++; // Increment frequency.
    originalItemMap[itemKey] = this[elementIterator]; // Store the actual value.
  }

  // Second pass: find the item with the highest frequency.
  const allKeys = Object.keys(frequencyTracker);
  for (var keyIterator = 0; keyIterator < allKeys.length; keyIterator++) {
    const currentMapKey = allKeys[keyIterator];
    // If the current item's frequency is greater than the highestCount found so far,
    // update highestCount and mostCommonValue.
    if (frequencyTracker[currentMapKey] > highestCount) {
      highestCount = frequencyTracker[currentMapKey];
      mostCommonValue = originalItemMap[currentMapKey];
    }
  }
  // Return the value that appeared most frequently.
  return mostCommonValue;
};

/**
 * Main function to process input data and calculate a specific value based on modes.
 * @param {string} rawInputContent - The raw input string from stdin.
 */
function processMeasurementData(rawInputContent) {
  // Parse the input string into numbers.
  // The first line contains H, W, M. Subsequent lines are measurement entries.
  var [[matrixHeight, matrixWidth, magicNumber], ...measurementEntries] = rawInputContent
    .split('\n') // Split by newline to get individual lines.
    .map((lineString) => lineString.split(' ').map(Number)); // Split each line by space and convert to numbers.

  // Transpose the measurement entries to group X coordinates and Y coordinates.
  let flippedMeasurements = matrixFlipper(measurementEntries);

  // Find the mode (most frequent value) for the first column (X coordinates).
  let dominantXValue = flippedMeasurements[0].getFrequentItem();
  // Find the mode (most frequent value) for the second column (Y coordinates).
  let dominantYValue = flippedMeasurements[1].getFrequentItem();

  // Count occurrences of the dominant X value in the original X coordinate list.
  let dominantXCount = flippedMeasurements[0].filter((currentValue) => currentValue === dominantXValue).length;
  // Count occurrences of the dominant Y value in the original Y coordinate list.
  let dominantYCount = flippedMeasurements[1].filter((currentValue) => currentValue === dominantYValue).length;

  // Determine the output based on the magicNumber and counts.
  if (magicNumber === 1) {
    console.log(1); // Special case for magicNumber being 1.
  } else if (dominantXCount === 1 || dominantYCount === 1) {
    // If either dominant X or Y appears only once, sum their counts.
    console.log(dominantXCount + dominantYCount);
  } else {
    // Otherwise, sum their counts and subtract 1.
    console.log(dominantXCount + dominantYCount - 1);
  }
}

// Read input from standard input and pass it to the main processing function.
processMeasurementData(require("fs").readFileSync("/dev/stdin", "utf8"));
