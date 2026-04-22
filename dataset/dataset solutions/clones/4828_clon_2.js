"use strict"; /* This directive enforces strict parsing and error handling in the script. */

/*
 *  Function: AnalyzeInput
 *  Purpose: This is the primary entry point for processing a given string.
 *  It attempts to determine if the string can be constructed by reversing
 *  and concatenating a predefined set of words.
 *  Parameter: originalText - The string input to be analyzed.
 */
function AnalyzeInput ( originalText ) {
  // Define a collection of specific terms that the input string will be matched against.
  const targetWords = [ "dream", "dreamer", "erase", "eraser" ];

  // Iterate over each term within the 'targetWords' array.
  // The goal is to reverse each word in place within the array.
  for ( let wordPos in targetWords ) {
    targetWords[ wordPos ] = flipContent( targetWords[ wordPos ] );
  }

  // Reverse the main input string itself. This prepares it for comparison
  // with the already-reversed target words.
  originalText = flipContent( originalText );

  // Initiate a continuous loop for iterative processing of the 'originalText'.
  // This loop will continue indefinitely until an explicit 'break' statement is encountered.
  while ( true ) {
    let noMatchCounter = 0; // Initialize a counter to track consecutive non-matches.

    // Loop through each of the reversed 'targetWords'.
    // In each iteration, we attempt to match a prefix of 'originalText' with a 'currentTargetWord'.
    for ( let currentTargetWord of targetWords ) {
      // Extract a portion from the beginning of 'originalText'.
      // The length of this portion is determined by the length of the 'currentTargetWord'.
      var segmentToCheck = originalText.slice( 0, currentTargetWord.length );

      // Compare the extracted segment with the current reversed target word.
      if ( segmentToCheck === currentTargetWord ) {
        // If a match is found, remove the matched segment from the 'originalText'.
        // This effectively "consumes" the matched portion.
        originalText = originalText.substr( currentTargetWord.length );
        break; // Exit the inner loop, as a successful match has been processed.
      }
      noMatchCounter++; // Increment the counter if the current word did not match.
    }

    // Check if the 'noMatchCounter' has exceeded a threshold.
    // If it has, it implies that no target word could be matched with the current 'originalText' prefix.
    if ( noMatchCounter > 3 ) {
      break; // Terminate the main processing loop.
    }
  }

  // After the main processing loop concludes, evaluate the state of 'originalText'.
  // If 'originalText' is empty, it means the entire string was successfully decomposed.
  if ( originalText === "" ) {
    console.log( "YES" ); // Output "YES" to indicate successful decomposition.
  } else {
    // If 'originalText' is not empty, it means some parts could not be matched.
    console.log( "NO" ); // Output "NO" to indicate unsuccessful decomposition.
  }
} // End of the AnalyzeInput function definition.

/*
 *  Function: flipContent
 *  Purpose: A utility function designed to reverse the characters of any given string.
 *  Parameter: sourceString - The string whose characters are to be reversed.
 *  Returns: The new string with its characters in reverse order.
 */
function flipContent ( sourceString ) {
  // The string is first split into an array of individual characters.
  // This array is then reversed.
  // Finally, the reversed array of characters is joined back into a single string.
  return sourceString.split( "" ).reverse().join( "" );
}

// The script execution begins by calling the 'AnalyzeInput' function.
// The input for 'AnalyzeInput' is obtained by reading the entire content
// of the standard input file ('/dev/stdin') as a UTF-8 encoded string.
AnalyzeInput( require( "fs" ).readFileSync( "/dev/stdin", "utf-8" ) );