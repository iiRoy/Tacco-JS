/*
 * This script processes multi-line input to determine if the first line
 * can be rotated to match the second line.
 * It performs character-by-character comparison after potential rotations.
 */
function processInputData( rawTextContent )
{
  // Split the entire input content by newline characters into an array of lines.
  const lineFragments = rawTextContent .split( '\n' ) ;

  // Extract the first line and convert it into an array of individual characters.
  let firstCharSequence = lineFragments [ 0 ] .split( '' ) ;

  // Extract the second line and convert it into an array of individual characters.
  const secondCharSequence = lineFragments [ 1 ] .split( '' ) ;

  // Initialize a boolean-like flag to track if a match is found.
  let isMatchFound = 0 ; // 0 indicates no match, 1 indicates a match.

  // First, check if the sequences are identical without any rotation.
  if ( firstCharSequence .toString() === secondCharSequence .toString() )
  {
    isMatchFound = 1 ; // Set flag to 1 if they are already the same.
  }
  else
  {
    // If not identical, proceed to rotate the first sequence and compare.
    // Loop through possible rotations. We only need to rotate length-1 times
    // because the last rotation would bring it back to the original state.
    for ( let rotationIndex = 0 ; rotationIndex < firstCharSequence.length - 1 ; rotationIndex++ )
    {
      // Store the last character of the sequence.
      const finalElement = firstCharSequence [ firstCharSequence.length - 1 ] ;

      // Remove the last character from the sequence.
      firstCharSequence .pop() ;

      // Add the stored character to the beginning of the sequence.
      firstCharSequence .unshift( finalElement ) ;

      // After rotation, compare the modified first sequence with the second.
      if ( firstCharSequence .toString() === secondCharSequence .toString() )
      {
        isMatchFound = 1 ; // A match is found after rotation.
        break ;            // No need to check further rotations, exit loop.
      }
    }
  }

  // Define a constant for the standard output mechanism.
  const outputDevice = console;

  // Based on the final state of the match flag, print the appropriate result.
  if ( isMatchFound === 1 )
  {
    outputDevice .log( 'Yes' ) ; // Output 'Yes' if a match was found.
  }
  else
  {
    outputDevice .log( 'No' ) ;  // Output 'No' if no match was found after all checks.
  }
}

// Acquire the file system module.
const fileSystemModule = require( 'fs' );

// Invoke the main processing function with content read from standard input.
processInputData( fileSystemModule .readFileSync( '/dev/stdin' , 'utf8' ) );