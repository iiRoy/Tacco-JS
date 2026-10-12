function parseInteger(s) {
  // Converts a string to an integer
  return parseInt(s);
}

function parseFloatValue(s) {
  // Converts a string to a floating-point number
  return parseFloat(s);
}

// Extend Array prototype with custom sorting and filtering methods
Array.prototype.orderNumbersAsc = function () {
  // Sorts numbers in ascending order
  return this.sort((a, b) => (a - b));
};

Array.prototype.orderNumbersDesc = function () {
  // Sorts numbers in descending order
  return this.sort((a, b) => (b - a));
};

Array.prototype.orderStringsAsc = function () {
  // Sorts strings in ascending order (lexicographical)
  return this.sort();
};

Array.prototype.orderStringsDesc = function () {
  // Sorts strings in descending order (lexicographical)
  return this.sort().reverse();
};

Array.prototype.excludeElement = function (x) {
  // Returns a new array without occurrences of element x
  return this.filter(e => e !== x);
};

function processInputData(inputRows) {
  // Parse the first line for N and W
  var initialParams = inputRows[0].split(' ').map(parseInteger);
  var itemCount = initialParams[0]; // Number of items
  var maxWeight = initialParams[1]; // Maximum allowed weight

  // Process the remaining lines for item data (weight and value)
  var itemData = inputRows.slice(1).map(l => l.split(' ').map(parseInteger));

  // Initialize a map to store the maximum value for each achievable weight
  // Key: weight, Value: maximum value for that weight
  var currentWeightValueMap = { 0: 0 }; // Start with 0 weight, 0 value

  // Iterate through each item
  for (var itemIndex = 0; itemIndex < itemCount; itemIndex++) {
    var currentItemWeight = itemData[itemIndex][0]; // Weight of the current item
    var currentItemValue = itemData[itemIndex][1];   // Value of the current item

    // Create a new map for the next iteration
    var nextWeightValueMap = {};

    // Iterate through all existing weight-value pairs in the current map
    for (var existingWeightStr in currentWeightValueMap) {
      var parsedExistingWeight = parseInteger(existingWeightStr); // Convert string key to number
      var existingValue = currentWeightValueMap[existingWeightStr]; // Value for this weight

      // If the current weight-value pair is not yet in the next map, or
      // if the current value is better, add/update it.
      if (!(nextWeightValueMap[existingWeightStr] && existingValue < nextWeightValueMap[existingWeightStr])) {
        nextWeightValueMap[existingWeightStr] = existingValue;
      }

      // Consider adding the current item to the existing weight
      var potentialNewWeight = parsedExistingWeight + currentItemWeight;
      var potentialNewValue = existingValue + currentItemValue;

      // Check if the new weight is within the maximum allowed weight
      // And if this new combination offers a better value for the new weight
      if ((potentialNewWeight <= maxWeight) && (!(nextWeightValueMap[potentialNewWeight] && potentialNewValue < nextWeightValueMap[potentialNewWeight]))) {
        nextWeightValueMap[potentialNewWeight] = potentialNewValue;
      }
    }
    // Update the current map for the next item iteration
    currentWeightValueMap = nextWeightValueMap;
  }

  // Find the maximum value among all achievable weights
  var finalResult = 0;
  for (var finalWeightStr in currentWeightValueMap) {
    finalResult = Math.max(finalResult, currentWeightValueMap[finalWeightStr]);
  }

  // Output the final maximum value
  console.log(finalResult);
}

// Read input from stdin, split by newlines, trim each line, and pass to the main processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));
