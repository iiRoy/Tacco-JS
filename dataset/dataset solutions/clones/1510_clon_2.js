'use strict'; // Enforcing strict mode for better code quality and error handling.

/*
 * This primary function processes a numerical input to calculate
 * a specific count based on a nested loop pattern.
 * It identifies pairs of numbers whose product is not equal to the target value.
 */
function CalculateCombinations( rawInputText ) {
  // Parse the incoming string data into an integer, after removing any surrounding whitespace.
  let targetNumber = parseInt( rawInputText.trim() );

  // A variable declared but ultimately unused due to shadowing in the inner loop.
  let dummyVal = 1;

  // Initialize a counter to keep track of the successful conditions.
  let resultCount = 0;

  // Outer iteration: 'firstMultiplier' goes from 1 up to (but not including) the target number.
  for ( let firstMultiplier = 1; firstMultiplier < targetNumber; firstMultiplier++ ) {
    // Inner iteration: 'secondMultiplier' also goes from 1 up to (but not including) the target number.
    for ( let secondMultiplier = 1; secondMultiplier < targetNumber; secondMultiplier++ ) {
      // Efficiency check: If the product of the current multipliers exceeds the target,
      // subsequent products with this 'firstMultiplier' will also exceed it,
      // so we can exit the inner loop early.
      if ( firstMultiplier * secondMultiplier > targetNumber ) {
        break;
      }

      // Condition check: If the target number is not exactly equal to the product of the multipliers.
      // This is equivalent to checking if their difference is non-zero.
      if ( targetNumber - firstMultiplier * secondMultiplier !== 0 ) {
        // If the condition holds true, increment our result counter.
        resultCount++;
      }
    }
  }

  // Display the final computed count to the standard output.
  console.log( resultCount );
}


// The following section handles the standard input/output operations.
// It reads data from '/dev/stdin' and passes it to our main calculation routine.
// This part should not be altered for execution within the specific environment.
CalculateCombinations( require("fs").readFileSync("/dev/stdin", "utf8") );