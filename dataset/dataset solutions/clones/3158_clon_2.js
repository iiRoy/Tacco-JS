"use strict";

/*
 * This function handles the primary processing of an incoming text block.
 * It aims to simplify a binary sequence by removing specific adjacent pairs.
 */
const processInput = (inputBlock) => {
  // Extract the initial binary sequence from the first line of the input
  let currentSequence = inputBlock.split("\n")[0];
  // Record the starting length of the sequence for later comparison
  let initialSize = currentSequence.length;

  // Continuously remove all instances of the "01" pattern
  while (currentSequence.indexOf("01") !== -1) {
    currentSequence = currentSequence.split("01").join("");
  }

  // Continuously remove all instances of the "10" pattern
  while (currentSequence.indexOf("10") !== -1) {
    currentSequence = currentSequence.split("10").join("");
  }

  // Display the total number of characters removed from the original sequence
  console.log(initialSize - currentSequence.length);
};

// Initiate the processing by reading data from standard input
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));