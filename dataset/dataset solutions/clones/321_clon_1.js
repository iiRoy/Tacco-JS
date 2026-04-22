/*
 * This script reads input from /dev/stdin,
 * processes each line, replacing a specific word,
 * and then prints the modified line to the console.
 *
 * This is a Type I clone, focusing on whitespace and comments.
 */

// Declare and initialize the 'input' variable.
// It reads the entire content from '/dev/stdin' as UTF-8,
// and then removes any leading/trailing whitespace.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) . trim ( ) ;

// Split the 'input' string into an array of individual lines.
// Each line is separated by the newline character.
var lines = input . split ( '\n' ) ;


// Declare a variable 'line' which will hold the current line
// being processed during the loop iteration.
var line ;

// Start a loop that continues as long as there are lines to process.
// The 'lines.shift()' method removes the first element from the 'lines' array
// and assigns it to 'line', effectively consuming the array.
while ( line = lines . shift ( ) )
{
  // Inside the loop, process the current 'line'.

  // Split the current line into an array of words based on spaces.
  // Then, use the 'map' function to transform each word.
  var str = line . split ( ' ' ) . map ( function ( word )
  {
    // This is a ternary operation:
    // If the 'word' is exactly 'Hoshino', it's replaced with 'Hoshina'.
    // Otherwise, the original 'word' is retained.
    return word == 'Hoshino' ? 'Hoshina' : word ;
  } ) . join ( ' ' ) ; // After mapping, join the words back into a single string,
                       // using a space as the separator between words.

  // Output the resulting modified string 'str' to the standard output.
  console . log ( str ) ;
}

// End of script execution.
/*
 * All lines processed. Script finished.
 */