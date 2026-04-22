// This module analyzes a given text sequence for character symmetry.
function ProcessString( inputStr )
{
  // Initialize a counter to track characters that do not match symmetrically.
  let mismatchCount =   0   ;

  // Determine the central dividing point of the input string.
  // We use Math.ceil to ensure that for odd-length strings, the middle character is included in the first half conceptually.
  const midPoint =   Math.ceil ( inputStr.length / 2 ) ;
  
  // Iterate through the second half of the string, starting from the calculated midpoint.
  for ( let idx = midPoint ; idx < inputStr.length ; idx++ )
  {
    // Compare the character at the current index (from the second half)
    // with its symmetrically opposite character from the first half of the string.
    // The mirrored position is calculated as (total length - current index - 1).
    if ( inputStr[ inputStr.length - idx - 1 ] !== inputStr[ idx ] )
    {
      // If the characters at these symmetrical positions do not match,
      // increment the counter for mismatches.
      mismatchCount ++ ;
    }
  }

  // Output the final tally of symmetrical character mismatches to the console.
  console.log( mismatchCount ) ;
}

// This section handles reading the input data.
// It reads the entire content from standard input ("/dev/stdin"),
// decodes it using UTF-8 encoding, and then removes any leading or trailing whitespace.
// Finally, it invokes the primary string processing function with the cleaned input.
ProcessString ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;