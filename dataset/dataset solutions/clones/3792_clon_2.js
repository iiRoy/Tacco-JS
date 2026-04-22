'use strict'; // Enforce strict JavaScript parsing and execution rules

function ProcessInputData( rawTextData ) { // Primary function to manage input and calculate the result
  const totalElements = parseInt( rawTextData.split( '\n' )[ 0 ], 10 ) ; // Extract the first numerical value from input, treating it as base 10
  const characterSequence = rawTextData.split( '\n' )[ 1 ].split( '' ) ; // Obtain the second line of input and convert it into an array of individual characters

  let uniqueLeftSegment, uniqueRightSegment; // Variables to store unique characters from partitioned segments
  let matchingElementCount = 0; // Accumulator for the number of common unique characters between segments
  let maxOverlapValues = []; // Collection to hold the common character counts for each partition point


  // Iterate through the character sequence, creating split points from the second element up to the second-to-last
  for ( let segmentIndex = 1; segmentIndex < totalElements; segmentIndex++ ) {
    uniqueLeftSegment = characterSequence.slice( 0, segmentIndex ) // Isolate the left portion of the character array
      .filter( ( charValue, idx, currentArrayRef ) => currentArrayRef.indexOf( charValue ) === idx ); // Filter to keep only unique characters in the left segment
    
    uniqueRightSegment = characterSequence.slice( segmentIndex ) // Isolate the right portion of the character array
      .filter( ( charValue, idx, currentArrayRef ) => currentArrayRef.indexOf( charValue ) === idx ); // Filter to keep only unique characters in the right segment

    // Compare each unique character from the left segment against the unique characters in the right segment
    for ( let leftCharIndex = 0; leftCharIndex < uniqueLeftSegment.length; leftCharIndex++ ) {
      if ( uniqueRightSegment.some( comparedValue => comparedValue === uniqueLeftSegment[ leftCharIndex ] ) ) {
        matchingElementCount++; // Increment the counter if a character from the left segment is found in the right
      }
    }
    maxOverlapValues.push( matchingElementCount ); // Record the total count of common unique characters for the current split
    matchingElementCount = 0; // Reset the common character counter for the subsequent iteration
    
    // Optional debugging outputs for segment content and accumulated results (currently commented out)
    /*
    console.log( 'Left part:', uniqueLeftSegment );
    console.log( 'Right part:', uniqueRightSegment );
    console.log( 'All overlap counts:', maxOverlapValues );
    */
  }

  console.log( Math.max( ...maxOverlapValues ) ); // Print the highest common unique character count found across all splits
}

// Execute the main processing function by reading input from standard input stream
ProcessInputData( require( "node:fs" ).readFileSync( "/dev/stdin", { encoding: "utf8" } ).trim() );