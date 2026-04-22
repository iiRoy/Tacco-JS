function AnalyzeSequence( inputBlob )
{
  // First, we process the raw input data by splitting it into individual lines.
  let processedLines = inputBlob.split( '\n' ) ;

  // Then, we extract the very first line and convert it into an array of characters.
  const charSequence = processedLines[ 0 ].split( '' ) ;

  // A boolean flag indicating if any modifications occurred during an iteration.
  let modificationOccurred = true ;

  // This variable keeps track of the starting index for our search within the character sequence.
  let searchStartIndex = 0 ;

  // A counter to tally the total number of transformations performed.
  let transformationCount = 0 ;

  // This main loop continues as long as there were changes in the previous pass.
  while ( modificationOccurred )
  {
    // Reset the flag at the beginning of each iteration.
    modificationOccurred = false ;

    // Iterate through the character sequence from the current search start index.
    for ( let currentPos = searchStartIndex ; currentPos < charSequence.length ; currentPos++ )
    {
      // Check for the specific pattern 'A', 'B', 'C' at the current position.
      if ( charSequence[ currentPos ] === 'A' && charSequence[ currentPos + 1 ] === 'B' && charSequence[ currentPos + 2 ] === 'C' )
      {
        // If the pattern is found, perform the character rearrangement.
        rearrangeChars( charSequence, currentPos ) ;

        // Increment the total transformation count.
        transformationCount = transformationCount + 1 ;

        // Set the flag to true, indicating a modification has taken place.
        modificationOccurred = true ;
      }
    }

    // Advance the search start index to avoid re-checking already processed or shifted parts.
    searchStartIndex = searchStartIndex + 2 ;
  }

  // Output the final count of transformations to the console.
  console.log( transformationCount ) ;
}

/*
 * This helper function takes a character array and a starting index.
 * It rearranges three characters starting from the given index from 'ABC' to 'BCA'.
 */
function rearrangeChars( sequenceToModify, startIndex )
{
  // The character at the start index becomes 'B'.
  sequenceToModify[ startIndex ] = 'B' ;

  // The character at the next position becomes 'C'.
  sequenceToModify[ startIndex + 1 ] = 'C' ;

  // The character at the subsequent position becomes 'A'.
  sequenceToModify[ startIndex + 2 ] = 'A' ;
}

// Execute the primary analysis function with input read from standard input.
AnalyzeSequence( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ) ;