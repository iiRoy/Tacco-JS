// Obtain raw textual content from the standard input stream.
var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw data: remove leading/trailing whitespace characters.
var processedSequence = sourceData.trim();

// Initialize an empty collection to store relevant numerical values derived from patterns.
var collectedCounts = [];

// Iterate through the processed sequence, performing replacements based on a regular expression.
// The regex pattern targets sequences of one or more 'J's, followed by one or more 'O's, and then one or more 'I's.
processedSequence = processedSequence.replace(/(J+)(O+)(I+)/g, function (completeMatch, firstGroup, middleGroup, lastGroup) {

  // Check if the length of the initial and final groups are both greater than or equal to the length of the central group.
  if (firstGroup.length >= middleGroup.length && lastGroup.length >= middleGroup.length) {
    // If the condition is satisfied, append the length of the middle group to our results collection.
    collectedCounts.push(middleGroup.length);
  }
});

// Display the maximum numerical value found within the collection to the standard output.
// If the collection happens to be empty, this operation will result in -Infinity.
console.log(Math.max.apply(null, collectedCounts));