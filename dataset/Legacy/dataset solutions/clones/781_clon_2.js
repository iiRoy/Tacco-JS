var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var lineSegments = (rawData.trim()).split("\n");

// This variable is declared but not used in the original logic.
// It's kept for structural equivalence.
var unusedCounter = 0;

// Main processing loop
while (true) {
  // Read the target value for the current iteration
  var currentValue = lineSegments.shift() - 0;

  // If the value is zero, terminate the loop
  if (currentValue === 0) {
    break;
  }

  // Read the coin counts for the current iteration
  var coinCounts = (lineSegments.shift()).split(" ").map(Number);

  // Calculate the total money available and the change needed
  var changeAmount = (10 * coinCounts[0] + 50 * coinCounts[1] + 100 * coinCounts[2] + 500 * coinCounts[3]) - currentValue;

  // Initialize an array to store the count of coins to be returned
  var returnedCoins = [0, 0, 0, 0];

  // Distribute change using a greedy approach, starting with the largest denomination
  while (500 <= changeAmount) {
    returnedCoins[3]++;
    changeAmount -= 500;
  }
  while (100 <= changeAmount) {
    returnedCoins[2]++;
    changeAmount -= 100;
  }
  while (50 <= changeAmount) {
    returnedCoins[1]++;
    changeAmount -= 50;
  }
  while (10 <= changeAmount) {
    returnedCoins[0]++;
    changeAmount -= 10;
  }

  // Define the denominations for output
  var coinDenominations = [10, 50, 100, 500];

  // Build the output string
  var outputString = "";
  coinCounts.forEach(function(originalCount, denominationIndex) {
    // If the original count of a coin type is greater than the coins returned of that type
    if (originalCount > returnedCoins[denominationIndex]) {
      // Append the denomination and the difference to the output string
      outputString += coinDenominations[denominationIndex] + " " + (originalCount - returnedCoins[denominationIndex]) + "\n";
    }
  });

  // Print the accumulated output for the current iteration
  console.log(outputString);
}
