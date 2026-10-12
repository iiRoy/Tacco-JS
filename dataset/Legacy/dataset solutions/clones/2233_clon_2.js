// This script processes robot data from standard input to find the maximum number of non-overlapping intervals.

// Import the file system module to read input from standard input.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string: remove leading/trailing whitespace and split into an array of lines.
const parsedLines = rawData
  .trim()
  .split('\n');

// Transform the input lines into a list of "mechanisms".
// Each mechanism is represented by its start and end points.
// The first line of input (usually a count) is skipped.
const mechanisms = parsedLines
  .slice(1) // Discard the initial line (often a count of items)
  .map(item => item.split(' ').map(Number)) // Convert each line string "X Y" into a [X, Y] number array
  .map(item => [item[0] - item[1], item[0] + item[1]]); // Transform [position, radius] to [start_point, end_point]

// Sort the mechanisms based on their end points in ascending order.
// This is a crucial step for the greedy algorithm to work correctly.
mechanisms.sort((firstMech, secondMech) => firstMech[1] - secondMech[1]);

// Initialize a list to store the chosen non-overlapping mechanisms.
// The first mechanism (which has the earliest end point due to sorting) is always chosen initially.
const chosenMechanisms = [mechanisms[0]];

// Iterate through the remaining mechanisms starting from the second one.
for (let idx = 1; idx < mechanisms.length; idx++) {
  // Retrieve the end point of the last mechanism that was added to our chosen list.
  const finalChosenMechanism = chosenMechanisms[chosenMechanisms.length - 1];
  const finalChosenMechanismEnd = finalChosenMechanism[1];

  // Get the start point of the current mechanism being considered in the loop.
  const currentMechanismStart = mechanisms[idx][0];

  // If the current mechanism's start point is greater than or equal to the end point
  // of the last chosen mechanism, it means they do not overlap.
  // In this case, the current mechanism can be added to our list of chosen mechanisms.
  if (finalChosenMechanismEnd <= currentMechanismStart) {
    chosenMechanisms.push(mechanisms[idx]);
  }
}

// Output the total number of non-overlapping mechanisms found.
console.log(chosenMechanisms.length);
