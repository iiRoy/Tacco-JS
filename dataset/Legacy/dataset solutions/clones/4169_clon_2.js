"use strict";

// This function processes the input to determine how many times
// all numbers in a sequence can be divided by two simultaneously.
function solveProblem(inputString) {
  // Split the entire input string by newline characters.
  const lineSegments = inputString.split('\n');

  // The first line contains the count of numbers (N), stored as a string.
  const arraySizeStr = lineSegments[0];

  // The second line contains space-separated numbers, stored as an array of strings.
  const numberStrings = lineSegments[1].split(' ');

  // A boolean flag to track if an odd number is encountered.
  let foundOdd = false;

  // A counter for the number of successful division rounds.
  let divisionRounds = 0;

  // Loop indefinitely until an odd number prevents further divisions.
  while (true) {
    // Iterate through each element in the array of numbers.
    for (let currentIdx = 0; currentIdx < arraySizeStr; currentIdx++) {
      // Check if the current number (implicitly converted from string) is odd.
      if (numberStrings[currentIdx] % 2 !== 0) {
        foundOdd = true; // Mark that an odd number was found.
        break; // Exit the inner loop as we can't proceed with this round.
      }
      // If the number is even, divide it by 2 and update its value.
      numberStrings[currentIdx] = numberStrings[currentIdx] / 2;
    }

    // If an odd number was found in the current iteration,
    // it means we cannot perform another full round of division.
    if (foundOdd) {
      break; // Exit the main processing loop.
    }

    // If all numbers were even, increment the division rounds counter.
    divisionRounds++;
  }

  // Output the final count of successful division rounds.
  console.log(divisionRounds);
}

// Standard input/output handling. Do not modify this part.
solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
