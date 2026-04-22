// This script processes input data from standard input.
// It reads lines, performs calculations, and outputs results based on specific patterns.

// Load the necessary file system module to read data.
var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into individual lines.
var inputLines = (sourceData.trim()).split("\n");

// Initialize an array to accumulate numerical results before processing.
var scoreCollector = [];

// Iterate through each line of the processed input.
for (var lineIterator = 0; lineIterator < inputLines.length; lineIterator++) {

  // Check for the termination condition: if the collector is empty and the current line is "0 0".
  if (scoreCollector.length === 0 && inputLines[lineIterator] === "0 0") {
    break; // Exit the loop if the termination sequence is found.
  }

  // If the score collector has gathered exactly four entries, it's time to process them.
  if (scoreCollector.length === 4) {
    // Find the maximum value among the collected scores.
    var highestValue = scoreCollector.reduce(function(currentMax, currentElement) {
      return Math.max(currentMax, currentElement);
    });

    // Define an array of character identifiers for output.
    var charIdentifiers = "ABCD".split("");

    // Determine the character corresponding to the index of the highest value.
    var finalCharacter = charIdentifiers[scoreCollector.indexOf(highestValue)];

    // Output the identified character along with its highest value.
    console.log(finalCharacter + " " + highestValue);

    // Reset the score collector for the next set of entries.
    scoreCollector = [];

  } else {
    // If the collector has less than four entries, parse the current line and add to the collection.

    // Split the current line by space and convert the parts to numbers.
    var numericalPair = inputLines[lineIterator].split(" ").map(Number);

    // Add the sum of the two numbers to the score collector.
    scoreCollector.push(numericalPair[0] + numericalPair[1]);
  }
}