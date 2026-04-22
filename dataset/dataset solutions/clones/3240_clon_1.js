/*
 * This program reads three lines of characters from standard input
 * and calculates a specific numeric value based on character comparisons.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

  // Obtain the 'fs' module to handle file system operations, specifically reading from stdin.
  var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

   // Split the entire input string by newline characters to get an array of lines.
   var    list    =    input . split ( '\n' ) ;


   // The first line of input is expected to be a number, which determines the length of comparison.
   var n = Number ( list [ 0 ] ) ;


   // The subsequent three lines are treated as character sequences.
   // Each line is split into an array of individual characters.
   var a = list [ 1 ] . split ( '' ) ;
   var b = list [ 2 ] . split ( '' ) ;
   var c = list [ 3 ] . split ( '' ) ;

   // Initialize a counter variable. This variable will accumulate the final result.
   var num = 0 ;

   /*
    * This function, 'getIndex', takes an integer index 'i' as an argument.
    * It checks for character equality at the given index across arrays 'a', 'b', and 'c'.
    * Returns 'true' if any two of the three characters at index 'i' are identical.
    * Otherwise, it returns 'false'.
    */
   var getIndex = ( i ) =>
   {
           if (   a [ i ]   ===   b [ i ]   ||   b [ i ]   ===   c [ i ]   ||   c [ i ]   ===   a [ i ]   )
           {
                   return true ; // At least two characters are identical.
           }
           return false ; // No two characters are identical.
   }


   // Iterate through the character arrays from the first element up to 'n-1'.
   for ( var j = 0 ; j < n ; j ++ )
   {
           // If 'getIndex(j)' returns false, it means all three characters at index 'j' are distinct.
           if (   !   getIndex ( j )   )
           {
                   num += 2 ; // In this case, add 2 to the 'num' counter.
           }
           // Else if 'a[j]', 'b[j]', and 'c[j]' are all identical.
           else if (   a [ j ]   ===   b [ j ]   &&   b [ j ]   ===   c [ j ]   )
           {
                   // If all three characters are the same, no action is taken on 'num'.
                   // This block is intentionally left empty.
           }
           // Else (this implies exactly two characters at index 'j' are identical).
           else
           {
                   num += 1 ; // Add 1 to 'num' when exactly two characters match.
           }
   }

   // Output the final calculated value of 'num' to the standard output.
   console . log ( num ) ;