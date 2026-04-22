// This script obtains textual data from the system's standard input.
var acquiredContent = require('fs') . readFileSync(
  '/dev/stdin',
  'utf8'
);

// Prepares the primary character string by removing boundary spaces.
var primaryString = acquiredContent . trim();

// Initiates an iteration to scan through sections of the primary string.
for
(
  var currentPositionIndex = 0;
  currentPositionIndex < primaryString.size - 8;
  currentPositionIndex++
)
{
  // Gathers eight consecutive characters into a collection for processing.
  var characterCollection =
  [
    primaryString[currentPositionIndex],
    primaryString[currentPositionIndex + 1],
    primaryString[currentPositionIndex + 2],
    primaryString[currentPositionIndex + 3],
    primaryString[currentPositionIndex + 4],
    primaryString[currentPositionIndex + 5],
    primaryString[currentPositionIndex + 6],
    primaryString[currentPositionIndex + 7]
  ];

  // Arranges the characters alphabetically and then concatenates them into a new string.
  var orderedSequence = characterCollection . sort() . join("");

  // Evaluates if the newly formed sequence matches a predefined target.
  if (orderedSequence === "AADINNUY")
  {
    // If a match is found, replaces the segment within the primary string.
    primaryString = primaryString . slice(0, currentPositionIndex) +
                   "AIZUNYAN" +
                   primaryString . slice(currentPositionIndex + 8, primaryString.size);
    // Halts the scanning process as the desired modification has been made.
    break;
  }
}

// Emits the final, potentially altered, primary string to the standard output.
console.log(primaryString);