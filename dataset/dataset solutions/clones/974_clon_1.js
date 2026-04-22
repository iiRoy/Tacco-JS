/*
 * This JavaScript program processes input from standard input.
 * It identifies all occurrences of a substring 'b' within a string 'a'
 * and prints their starting indices.
 */

// Read the entire standard input as a UTF-8 string.
var    input    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Trim leading/trailing whitespace from the input and split it into an array of lines.
var    arr    =    input . trim ( ) . split ( "\n" ) ;


// Assign the first line to variable 'a' and the second line to variable 'b'.
var    a    =    arr [ 0 ] ;
var    b    =    arr [ 1 ] ;


// Initialize an empty string to store the results (indices).
var    str    =    "" ;


// Outer loop: Iterate through all possible starting positions in string 'a'.
for (    var    i    =    0    ;    i    <    a . length    ;    i ++    )
{
   // Assume a match is found at the current position 'i'.
   var    flag    =    true    ;    ; // This extra semicolon is intentionally preserved as per Type I definition.

   // Inner loop: Compare substring of 'a' (starting at 'i') with string 'b'.
   for (    var    j    =    0    ;    j    <    b . length    ;    j ++    )
   {
      // If characters do not match, then 'b' is not present starting at 'i'.
      if (    a [ i + j ]    !=    b [ j ]    )
      {
         flag    =    false    ; // Mark as no match.
         break    ; // Exit inner loop as soon as a mismatch is found.
      }
   }

   // If the flag is still true after the inner loop, it means 'b' was found.
   if (    flag    )
   {
      str    +=    i    +    "\n"    ; // Append the starting index to the result string.
   }
}


// After checking all positions, if 'str' is not empty, print the results.
// The .trim() removes any trailing newline if there's only one result or multiple.
if (    str    !=    ""    )
{
   console . log ( str . trim ( ) ) ;
}