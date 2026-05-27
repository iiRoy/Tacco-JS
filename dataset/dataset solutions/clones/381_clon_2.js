var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lineData = (rawData.replace(/\n$/, "")).split("\n"); // Process raw input: remove trailing newline, then split into lines

var numCases = lineData.shift() - 0; // Get the number of test cases from the first line, convert to number

// Iterate through each test case
for (var caseIndex = 0; caseIndex < numCases; caseIndex++) {
  var currentPair = lineData[caseIndex].split(" ").map(Number); // Split the current line by space and convert parts to numbers

  var startVal = currentPair[0]; // Extract the starting value
  var goalVal = currentPair[1]; // Extract the goal value

  var pathSequence = [startVal]; // Initialize the sequence with the starting value
  var stepDirection = 1; // Initialize a variable to control the step direction for specific cases

  // Determine the path based on startVal and goalVal
  if (startVal < goalVal) {
    // If start is less than goal, increment until goal is reached
    do {
      startVal++;
      pathSequence.push(startVal);
    } while (startVal != goalVal);
  } else if (startVal > goalVal && startVal <= 5) {
    // If start is greater than goal and start is in the lower range (1-5), decrement
    do {
      startVal--;
      pathSequence.push(startVal);
    } while (startVal != goalVal);
  } else if (startVal > goalVal && startVal >= 6 && goalVal >= 6) {
    // If start is greater than goal, both are in the upper range (6-9), increment with wrap-around
    do {
      startVal++;
      if (startVal == 10) {
        startVal = 5; // Wrap around from 9 to 5 (effectively 10 becomes 5)
      }
      pathSequence.push(startVal);
    } while (startVal != goalVal);
  } else if (startVal > goalVal && startVal >= 6 && goalVal <= 5) {
    // If start is greater than goal, start is upper range, goal is lower range, mixed increment/decrement with wrap
    do {
      startVal += stepDirection;
      if (startVal == 10) {
        startVal = 5; // Wrap around from 9 to 5
        stepDirection = -1; // Change direction to decrement after wrap
      }
      pathSequence.push(startVal);
    } while (startVal != goalVal);
  }

  console.log(pathSequence.join(" ")); // Output the generated sequence, joined by spaces
}
