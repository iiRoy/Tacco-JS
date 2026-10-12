var MAX_ITEM_VAL = 1000; // Maximum possible value for a single item

var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataLines = rawInputData.trim().split('\n');

var firstLineVals = dataLines[0].split(' ').map(Number);
var numItems = firstLineVals[0];
var maxWeight = firstLineVals[1];

var itemDetails = dataLines.slice(1).map(currentLine => currentLine.split(' ').map(Number));

// Initialize a 2D array for dynamic programming
var memoTable = Array.from({ length: numItems + 1 }, () => Array(numItems * MAX_ITEM_VAL + 1).fill(0));

// Set the first row (base case for 0 items)
memoTable[0] = Array(numItems * MAX_ITEM_VAL + 1).fill(Infinity);
memoTable[0][0] = 0;


function calculateOptimalValue() {

  // Iterate through each item
  for (var itemIndex = 0; itemIndex < numItems; itemIndex++) {
    // Iterate through all possible accumulated values
    for (var currentValue = 0; currentValue <= numItems * MAX_ITEM_VAL; currentValue++) {

      // Check if the current item's value can be included
      if (itemDetails[itemIndex][1] <= currentValue) {
        // Option A: Include the current item
        var optionA = memoTable[itemIndex][currentValue - itemDetails[itemIndex][1]] + itemDetails[itemIndex][0];
        // Option B: Exclude the current item
        var optionB = memoTable[itemIndex][currentValue];
        
        // Take the minimum weight for the current value
        memoTable[itemIndex + 1][currentValue] = Math.min(optionA, optionB);
      } else {
        // If current item's value is too large, it cannot be included
        memoTable[itemIndex + 1][currentValue] = memoTable[itemIndex][currentValue];
      }
    }
  }

  var finalOutcome = 0;
  // Find the maximum value whose total weight does not exceed maxWeight
  for (var itemIndex = 0; itemIndex <= numItems * MAX_ITEM_VAL; itemIndex++) {
    if (memoTable[numItems][itemIndex] <= maxWeight) {
      finalOutcome = itemIndex;
    }
  }
  return finalOutcome;
}

console.log(calculateOptimalValue());
