"use strict";

// This function calculates a score based on two input integer values.
const calculateScore = ( rawInput ) => {

  // First, clean up the input string: remove leading/trailing whitespace and split into lines.
  let dataLines = rawInput.trim().split( '\n' );

  // Extract the first numeric quantity from the initial line of data.
  const primaryValue = parseInt( dataLines[0].split( ' ' )[0] );

  // Extract the second numeric quantity from the initial line of data.
  const secondaryValue = parseInt( dataLines[0].split( ' ' )[1] );

  // Initialize a running total for the reward points.
  let currentReward = 0;

  // Apply points based on the primary value's category.
  if ( primaryValue === 1 ) {
    currentReward += 30000;
  }

  if ( primaryValue === 2 ) {
    currentReward += 20000;
  }

  if ( primaryValue === 3 ) {
    currentReward += 10000;
  }

  // Apply points based on the secondary value's category.
  if ( secondaryValue === 1 ) {
    currentReward += 30000;
  }

  if ( secondaryValue === 2 ) {
    currentReward += 20000;
  }

  if ( secondaryValue === 3 ) {
    currentReward += 10000;
  }

  // Add a special bonus if both values meet a specific condition.
  if ( primaryValue === 1 && secondaryValue === 1 ) {
    currentReward += 40000;
  }

  // Display the final accumulated reward to the console.
  console.log( currentReward );
};

// Invoke the score calculation function, feeding it content from standard input.
calculateScore( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );