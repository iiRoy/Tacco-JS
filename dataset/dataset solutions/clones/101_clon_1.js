/*
 * This JavaScript file processes input from stdin.
 * It reads pairs of lines, compares elements, and
 * outputs 'hit' and 'brow' counts for each pair.
 *
 * This is a Type I clone, meaning only whitespace
 * and comments have been altered from the original.
 */


// Begin global variable declarations for standard input processing.
var fs        = require('fs')                                            // Module for file system interactions.
  , length    = fs.fstatSync( process.stdin.fd ).size                    // Determine the total size of the incoming data.
  , buffer    = new Buffer( length )                                     // Create a buffer of the determined size.
  , bytesRead = fs.readSync( process.stdin.fd , buffer , 0 , length , 0 ) // Read the data into the buffer.
  , input     = buffer.toString( 'utf8' , 0 , bytesRead )                // Convert buffer content to a UTF-8 string.
                    .trim( )                                             // Remove leading/trailing whitespace.
                    .split( '\n' )                                       // Split the string into an array of lines.
; // End of global variable declarations.


// Initiate the primary execution flow of the program.
main ( ) ;


/**
 * The main function orchestrates the logic for processing input.
 * It iterates through the 'input' array, handling data in pairs.
 */
function main ( )
{
  // Outer loop: Processes input lines two at a time.
  // 'i' is the index for the first line of a pair.
  // 'len' stores the total number of input lines for loop termination.
  for ( var i = 0 , len = input.length ; i < len ; i += 2 )
  {
    // Initialize counters for 'hit' (exact matches) and 'brow' (any position matches).
    // The assignment `brow = 0` evaluates to 0, which is then assigned to `hit`.
    var hit = brow = 0 ;

    // Retrieve and parse the first line of the current pair.
    // It's trimmed and split into an array 'a' based on spaces.
    var a = input[i] . trim ( ) . split ( ' ' ) ;

    // Retrieve and parse the second line of the current pair.
    // It's trimmed and split into an array 'b' based on spaces.
    var b = input[i + 1] . trim ( ) . split ( ' ' ) ;

    // Middle loop: Iterates through each element in array 'a'.
    // 'j' is the current index for 'a'.
    // 'lenj' stores the length of array 'a'.
    for ( var j = 0 , lenj = a.length ; j < lenj ; j++ )
    {
      // Check if the element at index 'j' in 'a' is an exact match
      // with the element at the same index 'j' in 'b'.
      if ( a[j] == b[j] )
      {
        hit++ ; // Increment 'hit' counter if an exact match is found.
      }

      // Inner loop: Compares the current element a[j] with every element in array 'b'.
      // 'k' is the current index for 'b'.
      // 'lenk' stores the length of array 'a' (implicitly also the length of 'b' if they are same length).
      for ( var k = 0 , lenk = a.length ; k < lenk ; k++ )
      {
        // Check if the current element a[j] matches any element b[k]
        // regardless of their positions.
        if ( a[j] == b[k] )
        {
          brow++ ; // Increment 'brow' counter if a match is found at any position.
        }
      }
    }

    // After processing all elements for the current pair,
    // log the final 'hit' and 'brow' counts to the console.
    console . log ( hit , brow ) ;
  }
}