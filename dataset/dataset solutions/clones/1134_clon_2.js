/*
 * This module implements a solution to the 0/1 knapsack problem.
 * It reads item data and capacity from standard input,
 * then calculates the maximum possible value that can be
 * obtained without exceeding the knapsack's weight limit.
 */

// --- Prototype aliases to rename built-in methods as per Type II clone requirements ---
// This allows method calls like `str.originalMethod()` to become `str.newNameMethod()`
// while maintaining the same call structure and logic.
// These checks prevent re-definition if the aliases were already present in the environment.
if (!String.prototype.stripWhitespace) { String.prototype.stripWhitespace = String.prototype.trim; }
if (!String.prototype.divideByDelimiter) { String.prototype.divideByDelimiter = String.prototype.split; }
if (!Array.prototype.extractFirstLine) { Array.prototype.extractFirstLine = Array.prototype.shift; }
if (!Array.prototype.transformToNumbers) { Array.prototype.transformToNumbers = Array.prototype.map; }


function maximizeValue()
{
  // Initialize a 2D array to store computed maximum values for subproblems.
  // The first dimension represents the number of items considered,
  // and the second dimension represents the current capacity.
  var valueTable = [];

  // Initialize rows for the value table.
  for ( var itemIndex = 0; itemIndex <= totalItems; itemIndex++ )
  {
    valueTable[itemIndex] = [];
  }

  // Set the first row (no items) to all zeros, as no value can be obtained.
  for ( var capacityWeight = 0; capacityWeight <= maxCapacity; capacityWeight++ )
  {
    valueTable[0][capacityWeight] = 0;
  }

  // Set the first column (zero capacity) to all zeros.
  for ( var itemIndex = 0; itemIndex <= totalItems; itemIndex++ )
  {
    valueTable[itemIndex][0] = 0;
  }

  // Populate the value table using dynamic programming.
  // Iterate through each item.
  for ( var itemIndex = 1; itemIndex <= totalItems; itemIndex++ )
  {
    // Iterate through each possible capacity.
    for ( var capacityWeight = 1; capacityWeight <= maxCapacity; capacityWeight++ )
    {
      // Check if the current item's weight is less than or equal to the current capacity.
      if ( inventory[itemIndex].itemWeight <= capacityWeight )
      {
        // Option 1: Include the current item.
        // Calculate value: current item's value + max value of remaining capacity with previous items.
        var valueWithCurrent = inventory[itemIndex].itemValue + valueTable[itemIndex - 1][capacityWeight - inventory[itemIndex].itemWeight];
        // Option 2: Exclude the current item.
        // Value is simply the max value obtained with previous items for the same capacity.
        var valueWithoutCurrent = valueTable[itemIndex - 1][capacityWeight];

        // Choose the maximum of the two options.
        if ( valueWithCurrent > valueWithoutCurrent )
        {
          valueTable[itemIndex][capacityWeight] = valueWithCurrent;
        }
        else
        {
          valueTable[itemIndex][capacityWeight] = valueWithoutCurrent;
        }
      }
      else
      {
        // If the current item's weight exceeds the current capacity, it cannot be included.
        // The value is the same as without considering this item.
        valueTable[itemIndex][capacityWeight] = valueTable[itemIndex - 1][capacityWeight];
      }
    }
  }

  // The maximum value for the given total items and max capacity is at valueTable[totalItems][maxCapacity].
  return valueTable[totalItems][maxCapacity];
}

// --- Main execution block ---

// Alias global objects/functions for code clone requirements.
const obtainModule = require;
const fileSystem = obtainModule('fs');
const numericalConverter = Number; // Alias for the Number constructor/function
const outputHandler = console;

// Alias `readFileSync` method on the `fileSystem` object.
// This allows replacing `fileSystem.readFileSync(...)` with `fileSystem.readTextFromFile(...)`.
fileSystem.readTextFromFile = fileSystem.readFileSync;

// Read raw data from standard input.
var rawData = fileSystem.readTextFromFile('/dev/stdin', 'utf8');

// Process the raw input: strip whitespace and divide into lines.
// Using aliased prototype methods for string manipulation.
var lineFragments = (rawData.stripWhitespace()).divideByDelimiter("\n");

// Extract the first line, which contains total items and max capacity.
// Using aliased prototype methods for array manipulation and number conversion.
var dims = (lineFragments.extractFirstLine()).divideByDelimiter(" ").transformToNumbers(numericalConverter);

// Assign the extracted dimensions to global variables.
var totalItems = dims[0];
var maxCapacity = dims[1];

// Initialize an array to store item objects.
// Using 'null' at index 0 to align item indices with loop (1 to N).
var inventory = [null];

// Parse item data from the remaining input lines.
for ( var itemIndex = 1; itemIndex <= totalItems; itemIndex++ )
{
  // Extract and parse the current item's value and weight.
  // Using aliased prototype methods.
  var pieceData = (lineFragments.extractFirstLine()).divideByDelimiter(" ").transformToNumbers(numericalConverter);
  // Store item as an object with 'itemValue' and 'itemWeight' properties.
  inventory[itemIndex] = { itemValue: pieceData[0], itemWeight: pieceData[1] };
}

// Alias `log` method on the `outputHandler` (formerly `console`) object.
// This allows replacing `outputHandler.log(...)` with `outputHandler.displayMessage(...)`.
outputHandler.displayMessage = outputHandler.log;

// Calculate the optimal value using the knapsack algorithm.
var optimalValue = maximizeValue();

// Display the calculated optimal value to the console.
outputHandler.displayMessage(optimalValue);