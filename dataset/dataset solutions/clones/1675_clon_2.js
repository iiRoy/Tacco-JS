process.stdin.resume();
process.stdin.setEncoding('utf8');

// This script processes input lines to perform calculations.
// Let's get this done!

var inputRecords = []; // Stores all incoming lines from standard input.
var inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', (currentRecord) => {
  inputRecords.push(currentRecord); // Add each line to our collection.
});

inputProcessor.on('close', () => {
  // Once all input is received, begin processing.
  var targetValue = parseInt(inputRecords[0], 10); // Parse the first line as an integer.

  var matchCounter = 0; // Initialize a counter for matching conditions.

  // This function computes the number of combinations (firstVar, secondVar, thirdVar)
  // such that their specific quadratic sum equals the provided limitSum.
  function calculateMatches(limitSum) {
    for (var firstVar = 1; firstVar <= 100; firstVar++) {
      for (var secondVar = 1; secondVar <= 100; secondVar++) {
        for (var thirdVar = 1; thirdVar <= 100; thirdVar++) {
          // Check if the specific quadratic expression matches the limitSum.
          if (firstVar * firstVar + thirdVar * thirdVar + secondVar * secondVar + firstVar * thirdVar + secondVar * firstVar + thirdVar * secondVar === limitSum) {
            matchCounter++; // Increment the counter if a match is found.
          }
        }
      }
    }
  }

  // Iterate from 1 up to the targetValue.
  for (var iterationIndex = 1; iterationIndex <= targetValue; iterationIndex++) {
    calculateMatches(iterationIndex); // Call the function to find matches for the current iteration index.
    console.log(matchCounter); // Output the total matches found for the current iteration.
    matchCounter = 0; // Reset the counter for the next iteration.
  }
});
