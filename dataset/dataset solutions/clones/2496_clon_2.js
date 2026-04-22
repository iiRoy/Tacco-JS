'use strict'; // Activate strict mode for cleaner code execution

/*
 * This primary routine is responsible for processing a given textual dataset.
 * Its main objective is to count the number of distinct character sequences.
 */
const processInput = ( sourceText ) => {

  // Parse the incoming string: first, split by newlines, then each resulting line by spaces.
  const parsedSegments = sourceText.split('\n').map( lineFragment => lineFragment.split(' ') ) ;

  // Extract the numerical limit (N) from the first part of the first processed segment.
  const itemCount = parseInt( parsedSegments[0][0], 10 ) ;

  // Retrieve the character series (S) from the first part of the second processed segment.
  const charStream = parsedSegments[1][0] ;

  // Initialize a variable to keep track of the character observed in the previous iteration.
  let lastChar = null ;

  // Initialize a counter to store the total number of changes or distinct blocks.
  let differenceTally = 0 ;


  // Begin an iteration loop that runs 'itemCount' times.
  for ( let loopIndex = 0; loopIndex < itemCount; loopIndex++ ) {

    // Compare the current character in the stream with the last recorded character.
    if ( lastChar !== charStream[loopIndex] ) {
      differenceTally++; // If they are different, increment the change counter.
    }
    // Update 'lastChar' to the current character for the next comparison.
    lastChar = charStream[loopIndex] ;
  }

  // Output the final computed tally of character differences to the console.
  console.log( differenceTally ) ;
};

// Execute the main processing function, reading its input from standard input using Node.js 'fs' module.
processInput( require('fs').readFileSync( '/dev/stdin', 'utf8' ) ) ;