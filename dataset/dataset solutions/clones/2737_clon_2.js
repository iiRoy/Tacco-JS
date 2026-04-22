"use strict"; /* Enable strict mode for better error handling and cleaner code */

// Acquire the 'fs' (file system) module to read input synchronously
// Read all content from standard input ('/dev/stdin') using UTF-8 encoding
const rawInputText = require('fs').readFileSync('/dev/stdin', 'UTF-8');

// Divide the comprehensive input string into individual lines
const parsedLines = rawInputText.split('\n');

// Convert the initial line (first element) into an integer, representing the total count
const initialSize = parseInt(parsedLines[0], 10);

// Process the second line: split by spaces, then map each segment to an integer
const numberSequence = parsedLines[1] .split(' ') .map( itemValue => parseInt(itemValue, 10) );

/*
 * Implement a nested loop structure to perform bitwise XOR operations
 * based on divisibility conditions.
 */
// Outer iteration: 'firstDivisor' decreases from 'initialSize' to 1
for ( let firstDivisor = initialSize; firstDivisor >= 1; firstDivisor-- ) {
  // Inner iteration: 'secondNumber' also decreases from 'initialSize' to 1
  for ( let secondNumber = initialSize; secondNumber >= 1; secondNumber-- ) {
    // Skip if the 'firstDivisor' is greater than or equal to 'secondNumber'
    if ( firstDivisor >= secondNumber ) {
      continue; // Proceed to the next 'secondNumber'
    }

    // Check if 'secondNumber' is perfectly divisible by 'firstDivisor'
    if ( secondNumber % firstDivisor === 0 ) {
      // If divisible, apply XOR to elements at (firstDivisor - 1) and (secondNumber - 1) indices
      numberSequence[firstDivisor - 1] ^= numberSequence[secondNumber - 1];
    }
  }
}

// Filter the modified 'numberSequence' to retain only elements with a value of 1
const finalSelection = numberSequence.filter( itemValue => itemValue === 1 );

// Print the total number of '1's found in the 'finalSelection'
console.log(finalSelection.length);

// If there are any '1's in the 'finalSelection', display them space-separated
if ( finalSelection.length > 0 ) {
  console.log( finalSelection.join(' ') );
}