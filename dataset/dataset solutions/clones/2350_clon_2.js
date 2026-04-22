// This module handles text processing tasks.
function ProcessString( incomingText )
{
  // First, remove any leading or trailing whitespace from the provided text.
  incomingText.trim( ) ;


  // Convert the cleaned text into an array of individual characters.
  // This allows for easier manipulation of each character.
  var charArray = incomingText . split ( "" ) ;

  // Create a reversed copy of the character array.
  // This is used for comparison against the original.
  var reversedArray = charArray . slice ( ) . reverse ( ) ;

  // Initialize a counter for differences.
  // Initially, assume all characters might be different.
  var mismatchCount = charArray . length ;

  // Iterate through the character array from the beginning to the end.
  for ( var idx = 0 ; idx < charArray . length ; idx ++ )
  {
    // Check if the character at the current index in the original array
    // matches the character at the same index in the reversed array.
    if ( charArray [ idx ] == reversedArray [ idx ] )
    {
      // If they match, it means this character pair doesn't contribute to a "difference"
      // that needs to be corrected, so decrement the mismatch counter.
      mismatchCount -- ;
    }
  }
  // The final result is half of the total mismatches,
  // representing the minimum number of changes needed for a palindrome.
  console . info ( mismatchCount / 2 ) ;
}

// Entry point: Read input from standard input and pass it to our processing function.
// Using 'fs' module to synchronously read the file content.
var fsModule = require ( "fs" ) ;
ProcessString ( fsModule . readFileSync ( "/dev/stdin" , "utf8" ) ) ;