var outputFunc = console.log;

// Check if running in a Node.js-like environment to handle input
if (typeof process !== "undefined") {
  /*
   * Original commented-out input handling block.
   * Preserving its structure and content as it is non-executable.
   */
  // var input = "";
  // process.stdin.resume();
  // process.stdin.setEncoding('utf8');
  // process.stdin.on('data', function(chunk) {
  //     input += chunk;
  // });
  // process.stdin.on('end', function() {
  //     var lines = input.split("\n");
  //     main(lines);
  // });

  // Read input from standard input file path
  var rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  var inputRows = rawInputContent.split("\n");

  // Call the primary processing function
  processInputData(inputRows);
}

// Main function to process the input data
function processInputData(inputRows) {
  // Transform each input row based on its content
  inputRows = inputRows.map(function (currentEntry) {
    // If a row contains multiple space-separated values, parse them as numbers
    if (currentEntry.split(" ").length >= 2) {
      return currentEntry.split(" ").map(function (numericPart) {
        return Number(numericPart);
      });
    } else {
      // Otherwise, parse the entire row as a single number
      return Number(currentEntry);
    }
  });

  // Extract the first line which contains configuration data
  var firstLineData = inputRows.shift();

  // Get the number of items from the configuration data
  var itemCount = firstLineData.shift();

  // Get the maximum weight capacity from the configuration data
  var maxWeightCapacity = firstLineData.shift();

  // The remaining rows are the item details (value and weight)
  var itemDetails = inputRows;

  // An unused variable from the original code, kept for structural similarity
  var loopCounter = itemCount;

  // Another unused variable from the original code, kept for structural similarity
  var dataStructures = {};

  // Call the knapsack calculation function
  calculateMaxValue(itemDetails, maxWeightCapacity);
}

// Function to calculate the maximum value that can be obtained
// using a dynamic programming approach (0/1 Knapsack variant)
function calculateMaxValue(availableItems, capacityLimit) {
  // 'currentMaxValues' will store the maximum value for each weight
  // in the current iteration of items.
  var currentMaxValues = {};

  // 'previousMaxValues' will temporarily hold the values from the previous iteration.
  var previousMaxValues = {};

  // Iterate through each available item
  for (var itemIndex = 0; itemIndex < availableItems.length; itemIndex++) {
    // Extract the value and weight of the current item
    var itemValue = availableItems[itemIndex][0];
    var itemWeight = availableItems[itemIndex][1];

    // Swap current and previous maps for the next iteration
    previousMaxValues = currentMaxValues;
    currentMaxValues = {};

    // Iterate through all possible weights from the previous state
    for (var currentWeightKey in previousMaxValues) {
      // Ensure the weight key is treated as a number
      currentWeightKey = Number(currentWeightKey);

      // If the current weight already has a value in 'currentMaxValues'
      // or if it's empty, update it with the value from 'previousMaxValues'
      if (currentMaxValues[currentWeightKey] <= previousMaxValues[currentWeightKey] || !currentMaxValues[currentWeightKey]) {
        currentMaxValues[currentWeightKey] = previousMaxValues[currentWeightKey];
      }

      // Check if adding the current item's weight exceeds the capacity limit
      if (currentWeightKey + itemWeight <= capacityLimit) {
        // Calculate the new value if the current item is added
        var potentialNewValue = previousMaxValues[currentWeightKey] + itemValue;

        // If the new value is greater than what's currently stored for this new weight,
        // or if there's no value stored yet, update 'currentMaxValues'.
        // Also check against 'previousMaxValues' to ensure we're not overwriting a better value.
        if ((previousMaxValues[currentWeightKey + itemWeight] <= potentialNewValue || !previousMaxValues[currentWeightKey + itemWeight]) &&
          (currentMaxValues[currentWeightKey + itemWeight] <= potentialNewValue || !currentMaxValues[currentWeightKey + itemWeight])) {
          currentMaxValues[currentWeightKey + itemWeight] = potentialNewValue;
        }
      } else {
        // If adding the current item's weight exceeds capacity,
        // and weights are processed in increasing order,
        // further iterations for this item won't fit either.
        // This 'break' implies that the keys in 'previousMaxValues' are somewhat ordered,
        // or that the problem constraints allow this optimization.
        break;
      }
    }

    // Handle the case where only the current item is taken (if it fits)
    // If the current item's value is greater than what's currently stored for its weight,
    // or if there's no value stored yet, update 'currentMaxValues'.
    if ((previousMaxValues[itemWeight] <= itemValue || !previousMaxValues[itemWeight]) &&
      (currentMaxValues[itemWeight] <= itemValue || !currentMaxValues[itemWeight])) {
      currentMaxValues[itemWeight] = itemValue;
    }
  }

  // After processing all items, find the maximum value in 'currentMaxValues'
  // by iterating downwards from the maximum capacity.
  for (var weightIterator = capacityLimit; weightIterator > 0; weightIterator--) {
    // If a value exists for the current weight, it's the maximum possible value
    // because we are iterating downwards from the maximum capacity.
    if (!!currentMaxValues[weightIterator]) {
      outputFunc(currentMaxValues[weightIterator]);
      break; // Found the maximum, no need to check further
    }
  }
}
