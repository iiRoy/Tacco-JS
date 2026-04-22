/*
 *  Utility function to convert a string to an integer.
 *  @param {string} inputString - The string to parse.
 *  @returns {number} The parsed integer value.
 */
function parseInteger(inputString)
{
  return parseInt(inputString);
}

/*
 *  Utility function to convert a string to a floating-point number.
 *  @param {string} strValue - The string to parse.
 *  @returns {number} The parsed float value.
 */
function parseDecimal(strValue)
{
  return parseFloat(strValue);
}

/*
 *  Extends Array prototype to sort numeric elements in ascending order.
 *  Uses the default JavaScript sort with a numeric comparator.
 */
Array.prototype.orderNumbersAscending = function()
{
  // Compares two numbers for ascending sort.
  return this.sort((val1, val2) => (val1 - val2));
};

/*
 *  Extends Array prototype to sort numeric elements in descending order.
 *  Uses the default JavaScript sort with a numeric comparator.
 */
Array.prototype.orderNumbersDescending = function()
{
  // Compares two numbers for descending sort.
  return this.sort((itemA, itemB) => (itemB - itemA));
};

/*
 *  Extends Array prototype to sort string elements alphabetically (ascending).
 *  Relies on the default string comparison of Array.prototype.sort().
 */
Array.prototype.orderStringsAlphabetically = function()
{
  return this.sort();
};

/*
 *  Extends Array prototype to sort string elements in reverse alphabetical order (descending).
 *  First sorts alphabetically, then reverses the order.
 */
Array.prototype.orderStringsReverse = function()
{
  return this.sort().reverse();
};

/*
 *  Extends Array prototype to create a new array without a specific element.
 *  Filters out all occurrences of the specified element.
 *  @param {*} elementToRemove - The element to exclude from the new array.
 *  @returns {Array} A new array containing all elements except 'elementToRemove'.
 */
Array.prototype.filterOutElement = function(elementToRemove)
{
  // Creates a new array with elements not equal to elementToRemove.
  return this.filter(currentElement => currentElement !== elementToRemove);
};

/*
 *  Main program function to process input data for a knapsack-like problem.
 *  Calculates the maximum value that can be obtained within a given weight capacity.
 *  @param {string[]} inputLines - An array of strings, where each string is a line of input.
 */
function processInputData(inputLines)
{
  // Parse the first line to get the number of items and the maximum capacity.
  var numericValues = inputLines[0].split(' ').map(parseInteger);
  var itemCount = numericValues[0]; // N: number of items
  var maxWeightCapacity = numericValues[1]; // W: maximum allowed weight

  // Process remaining lines to get item weights and values.
  // Each line represents an item: [weight, value]
  inputLines = inputLines.slice(1).map(lineEntry => lineEntry.split(' ').map(parseInteger));

  // Initialize a map to store the maximum value for each possible total weight.
  // Represents (weight: value) pairs. Start with 0 weight, 0 value.
  var currentWeightValueMap = { 0: 0 };

  // Iterate through each item to update the possible weight-value combinations.
  for (var idx = 0; idx < itemCount; idx++)
  {
    var currentItemWeight = inputLines[idx][0]; // Weight of the current item
    var currentItemValue = inputLines[idx][1];  // Value of the current item

    // Create a temporary map to store combinations for the next iteration.
    var nextWeightValueMap = {};

    // Iterate through all existing weight-value combinations from the previous step.
    for (var currentWeightKey in currentWeightValueMap)
    {
      var totalWeightSoFar = parseInteger(currentWeightKey); // Convert key string to number
      var totalValueSoFar = currentWeightValueMap[currentWeightKey];

      // Option 1: Do not include the current item.
      // If this weight-value pair is not yet in next map, or if its value is better.
      if (!(nextWeightValueMap[currentWeightKey] && totalValueSoFar < nextWeightValueMap[currentWeightKey]))
      {
        nextWeightValueMap[currentWeightKey] = totalValueSoFar;
      }

      // Option 2: Include the current item if it fits within the capacity.
      var newCombinedWeight = totalWeightSoFar + currentItemWeight;
      var newCombinedValue = totalValueSoFar + currentItemValue;

      // Check if adding the current item exceeds capacity.
      // Also, check if this new combination offers a better value for the new weight.
      if ((newCombinedWeight <= maxWeightCapacity) &&
          (!(nextWeightValueMap[newCombinedWeight] && newCombinedValue < nextWeightValueMap[newCombinedWeight])))
      {
        nextWeightValueMap[newCombinedWeight] = newCombinedValue;
      }
    }
    // Update the main map for the next iteration with the newly calculated combinations.
    currentWeightValueMap = nextWeightValueMap;
  }

  // After processing all items, find the maximum value among all possible weights.
  var finalMaximumValue = 0;
  for (var weightKey in currentWeightValueMap)
  {
    finalMaximumValue = Math.max(finalMaximumValue, currentWeightValueMap[weightKey]);
  }

  // Output the highest value found.
  console.log(finalMaximumValue);
}

// Read input from standard input, process it, and call the main function.
processInputData(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .split('\n')
    .map(rawLine => rawLine.trim()) // Remove leading/trailing whitespace from each line
);