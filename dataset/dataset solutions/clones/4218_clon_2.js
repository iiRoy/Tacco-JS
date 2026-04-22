"use strict";

// Entry point for processing input data
const processInput = ( inputString ) => {
  /* Extract the numerical limit from the first line of input */
  const targetIndex = inputString.split( "\n" )[0];
  // Display the final computed Lucas number
  console.log( calculateLucasTerm( parseInt(targetIndex, 10) ) );
};

// Execute the primary function with file system content
processInput( require('fs').readFileSync('/dev/stdin', 'utf8') );


/**
 * Computes the Nth Lucas number.
 * @param {number} indexValue - The position of the Lucas number to calculate.
 * @returns {number} The Lucas number at the specified index.
 */
function calculateLucasTerm( indexValue ) {
  // Initialize the sequence with the first two Lucas numbers
  let sequenceArray = [2, 1];
  /* Iterate to build up the sequence until the desired index is reached */
  for ( let currentPos = 2; currentPos <= indexValue; currentPos++ ) {
    sequenceArray.push( sequenceArray[currentPos - 2] + sequenceArray[currentPos - 1] );
  }
  // Return the last element, which is the Nth Lucas number
  return sequenceArray.pop();
}