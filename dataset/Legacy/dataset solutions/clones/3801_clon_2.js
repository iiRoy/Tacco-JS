"use strict";

const processInput = (inputData) => {
  // Clean up the raw input string and split it into lines
  inputData = inputData.trim().split("\n");

  // Parse the total number of elements from the first line
  const totalElements = parseInt(inputData[0].split(" ")[0]);

  // Get the sequence of elements from the second line
  const elementSequence = inputData[1].split("");

  // Calculate the initial total count of 'E' elements
  const eastCountTotal = elementSequence.filter((directionChar) => directionChar === "E").length;

  // Calculate the initial total count of 'W' elements (not directly used in this algorithm, but conceptually present)
  // const westCountTotal = totalElements - eastCountTotal;

  // Initialize counters for 'E' and 'W' elements encountered so far
  let eastPassed = 0;
  let westPassed = 0;

  // Initialize the minimum number of turns required to a very large value
  let minTurns = Infinity;

  // Iterate through each position in the sequence
  for (let idx = 0; idx < totalElements; idx++) {
    // Determine the number of 'W' elements to the left of the current position
    const currentWestMoves = westPassed;

    // Determine the number of 'E' elements to the right of the current position
    let remainingEastMoves = eastCountTotal - eastPassed;

    // If the current element is 'E', it means it's part of the 'remainingEastMoves' calculation
    // and should not be counted as needing to move if we consider it the "pivot"
    if (elementSequence[idx] === "E") {
      remainingEastMoves--;
    }

    // Update the minimum turns if the current configuration yields a smaller sum
    minTurns = Math.min(minTurns, currentWestMoves + remainingEastMoves);

    // Update the counters based on the current element
    if (elementSequence[idx] === "W") {
      westPassed++;
    } else {
      eastPassed++;
    }
  }

  // Output the final minimum number of turns
  console.log(minTurns);
};

// Read input from standard input and pass it to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
