/*
 * This module processes incoming text data to check specific character patterns.
 * It's designed to read from standard input.
 */
function ProcessInputData( rawTextContent )
{
  // First, split the entire input string into an array of individual lines.
  const lineFragments = rawTextContent.split( "\n" ) ;

  // Extract the very first line and then break it down into an array of characters.
  let charSequence = lineFragments[0].split( "" ) ;

  // Begin the primary pattern validation check.
  // We're comparing the character at index 2 with the character at index 3.
  if ( charSequence[2] == charSequence[3] )
  {
    // If the first condition is met, proceed to the secondary check.
    // This checks if the character at index 4 matches the character at index 5.
    if ( charSequence[4] == charSequence[5] )
    {
      // Both conditions are true, indicating a successful pattern match.
      console.log( "Yes" ) ;
    }
    else
    {
      // The first condition was true, but the second one was false.
      console.log( "No" ) ;
    }
  }
  // Note: If the initial condition (charSequence[2] == charSequence[3]) is false,
  // no output will be produced, adhering to the original logic structure.
}

// Execute the main processing function by reading content from standard input.
// We use Node.js's 'fs' module to synchronously read the file.
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;