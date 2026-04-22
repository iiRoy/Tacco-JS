// This script reads input from stdin and performs a substring search operation.

var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Synchronously read all data from the standard input.

var arr = input . trim ( ) . split ( "\n" ) ; // Clean up the input string by trimming whitespace and then splitting it into an array of lines.


var a = arr [ 0 ] ; // Assign the first line of input to the variable 'a'.

var b = arr [ 1 ] ; // Assign the second line of input to the variable 'b'.


// This outer loop iterates through each possible starting position in string 'a'
// where string 'b' could potentially begin.
for ( var i = 0 ; i < a . length ; i ++ )
{
   var flag = true ; ; // Initialize a boolean flag to true, assuming a match until proven otherwise.
                      // Note: The double semicolon is preserved from the original.

   // This inner loop compares string 'b' with a substring of 'a' starting at index 'i'.
   for ( var j = 0 ; j < b . length ; j ++ )
   {
      // Check if the character in 'a' at the current offset (i+j)
      // does not match the character in 'b' at position 'j'.
      if ( a [ i + j ] != b [ j ] )
      {
         flag = false ; // If a mismatch is found, set the flag to false.
         break ; // No need to continue checking this starting position; break out of the inner loop.
      }
   }

   // After checking all characters of 'b' (or breaking early due to mismatch),
   // if the flag is still true, it means 'b' was found starting at index 'i'.
   if ( flag )
   {
     console.log ( i ) ; // Output the starting index 'i' where 'b' was successfully matched in 'a'.
   }
}