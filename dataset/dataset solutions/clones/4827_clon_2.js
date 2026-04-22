/*
 * This module provides utility functions for string manipulation and pattern matching.
 */

/**
 * Transforms a given string by reversing its character order.
 * @param {string} originalText The string to be flipped.
 * @returns {string} The character-reversed string.
 */
function flipString( originalText )
{
  return originalText . split( '' ) . reverse() . join( '' ) ;
}


/**
 * Determines if an initial phrase, when reversed, can be constructed
 * by successively removing predefined reversed segments.
 * This is akin to checking if the original phrase can be formed by
 * specific words in reverse order at its end.
 * @param {string} initialPhrase The input string to be analyzed.
 * @returns {boolean} True if the reversed phrase can be decomposed, false otherwise.
 */
function checkReversedWords ( initialPhrase )
{
  // A collection of predefined phrases to match against.
  const fixedPhrases = [ 'dreamer' , 'dream' , 'eraser' , 'erase' ] ;

  // Pre-reverse the fixed phrases for efficient comparison.
  const flippedPhrases = fixedPhrases . map ( item => flipString ( item ) ) ;

  // Reverse the input phrase once to work with it in a consistent direction.
  var remainingPhrase = flipString ( initialPhrase ) ;

  // Begin the main decomposition loop.
  processRemainder :
  while ( remainingPhrase . length > 0 )
  {
    // Iterate through each of the pre-flipped segments.
    for ( let segment of flippedPhrases )
    {
      // Check if the current remaining phrase starts with the current segment.
      if ( remainingPhrase . startsWith ( segment ) )
      {
        // If it matches, remove the matched segment from the beginning of the remaining phrase.
        remainingPhrase = remainingPhrase . substring ( segment . length ) ;
        // Continue the outer loop to re-evaluate the shortened remaining phrase.
        continue processRemainder ;
      }
    }
    // If no segment matched the beginning of the remaining phrase in this iteration,
    // then the phrase cannot be fully decomposed.
    return false ;
  }
  // If the loop completes, it means the entire phrase was successfully decomposed.
  return true ;
}


/**
 * The primary execution point of the program.
 * Reads input from stdin, processes it, and prints 'YES' or 'NO'.
 * @param {string} programInput The string input received by the program.
 */
function executeProgram ( programInput )
{
  // Perform the core logic check.
  if ( checkReversedWords ( programInput ) )
  {
    // Output positive result.
    console . log ( 'YES' ) ;
  }
  else
  {
    // Output negative result.
    console . log ( 'NO' ) ;
  }
}


// Initiate the program by reading standard input and passing it to the main function.
executeProgram ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;