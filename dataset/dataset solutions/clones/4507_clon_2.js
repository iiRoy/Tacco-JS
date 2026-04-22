"use strict";

const processInput = ( inputString ) => {
  // Begin by parsing the provided raw input string
  let totalElements = Number( inputString.split( "\n" )[ 0 ] );
  let sequenceValues = inputString.split( "\n" ) .slice( 1, totalElements + 1 ) .map( valueStr => Number( valueStr ) );
  
  // Initialize the step counter
  let iterationCounter = 0;
  
  // Set the starting index for our traversal (current position in the sequence)
  let currentPosition = 1;
  
  // Continue looping until the target position (value 2) is reached
  while ( currentPosition !== 2 ) {
    // Determine the next position using the current position as an index into the sequence data
    currentPosition = sequenceValues[ currentPosition - 1 ];
    
    // Increment the step counter for each move
    iterationCounter++;
    
    // If the number of steps exceeds the total number of elements, it indicates an infinite loop; report an error.
    if ( iterationCounter > totalElements ) {
      console.log( "-1" );
      return;
    }
  }
  console.log( iterationCounter );
};

processInput( require( 'fs' ) .readFileSync( '/dev/stdin', 'utf8' ) );