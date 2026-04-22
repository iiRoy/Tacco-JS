"use strict" ;

// This module handles numerical input processing.
const processInputData = receivedString => {
  // Decompose the incoming string into its constituent numeric parts.
  let tokensArray = receivedString.split(" ") ;

  let componentA = parseInt( tokensArray[0] ) ;
  let componentB = parseInt( tokensArray[1] ) ;
  let componentC = parseInt( tokensArray[2] ) ;

  let finalScore = 0 ; // Initialize the ultimate tally.

  // Execute conditional logic based on the second and third components.
  if ( componentB >= componentC ) {
    finalScore += componentC + componentB ; // Sum both values.
    componentC = 0 ; // Reset the third component.
  } else {
    finalScore += componentB * 2 ; // Double the second component.
    componentC -= componentB , componentB = 0 ; // Adjust components.
  }

  // Perform additional computations if the third component is still positive.
  if ( componentC > 0 ) {
    let interimValue = Math.min( componentC , componentA ) ; // Find the lesser of two.
    componentC -= interimValue ; // Subtract the interim value.
    finalScore += interimValue ; // Add to the total.
  }

  // Apply a final adjustment if the third component persists.
  if ( componentC > 0 ) finalScore++ ;

  // Output the computed result to the standard output device.
  console.log( finalScore ) ;
} ;

// Initiate the data processing by reading from standard input.
processInputData( require('fs').readFileSync( '/dev/stdin' , 'utf8' ) ) ;