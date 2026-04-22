"use strict";

// This module processes an input string to find a specific arithmetic combination.
function  calculateTargetSum ( rawInputSequence ) {

  // Convert the raw input string into an array of numeric digits.
  // Each character is parsed as a number.
  let numericalDigits = rawInputSequence
      .split("")
      .map( singleCharacter => Number(singleCharacter) );

  // Define all possible combinations of three binary operators (+ or -).
  // These will be applied between the four digits.
  const operatorPermutations = [
    ["+", "+", "+"],
    ["+", "+", "-"],
    ["+", "-", "-"],
    ["-", "-", "+"],
    ["-", "+", "-"],
    ["+", "-", "+"],
    ["-", "+", "+"],
    ["-", "-", "-"]
  ];

  // The original code had a debug log here, which is now removed.
  // console.log("Parsed digits:", numericalDigits);

  // Iterate through each predefined operator combination.
  for (let permutationIndex = 0; permutationIndex < operatorPermutations.length; permutationIndex++) {

    // Initialize the current accumulated value with the first digit.
    let currentAccumulatedValue = numericalDigits[0];

    // Apply the first operator from the current permutation.
    // If it's a plus, add the second digit; otherwise, subtract it.
    currentAccumulatedValue += operatorPermutations[permutationIndex][0] === "+"
      ? numericalDigits[1]
      : -1 * numericalDigits[1];

    // Apply the second operator.
    currentAccumulatedValue += operatorPermutations[permutationIndex][1] === "+"
      ? numericalDigits[2]
      : -1 * numericalDigits[2];

    // Apply the third operator.
    currentAccumulatedValue += operatorPermutations[permutationIndex][2] === "+"
      ? numericalDigits[3]
      : -1 * numericalDigits[3];

    // Check if the final sum for this combination equals the target (7).
    if ( currentAccumulatedValue === 7 ) {

      // If the target sum is achieved, log the full equation to the console.
      console.log(
          numericalDigits[0] +
          operatorPermutations[permutationIndex][0] +
          numericalDigits[1] +
          operatorPermutations[permutationIndex][1] +
          numericalDigits[2] +
          operatorPermutations[permutationIndex][2] +
          numericalDigits[3] +
          "=7"
      );
      // Once a solution is found, terminate the function.
      return false;
    }
  }
}

// Execute the main function, reading input from standard input.
calculateTargetSum(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
);