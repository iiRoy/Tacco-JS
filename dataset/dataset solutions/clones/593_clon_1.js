/*
 * This JavaScript file processes numerical data from standard input.
 * It calculates a sum based on specific rules involving two arrays, 'si' and 'ai',
 * and then prints the final sum modulo 100000.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Purpose: Demonstrate Type I code cloning by altering only whitespace and comments.
 */


var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ; // Read the entire content of standard input as a UTF-8 string.


// Process the raw input string: first, remove any leading or trailing whitespace,
// then split the string into an array of lines using the newline character as a delimiter.
var arr = input . trim ( ) . split ( "\n" ) ;


var cnt = 0 ; // Initialize a counter variable. This counter will be used to track the current line index
              // being processed within the 'arr' array.


// The very first line of input is expected to contain two space-separated numbers.
// These numbers represent problem parameters 'm' and 'n'.
// We split the line by space and then map each resulting string segment to a Number type.
var mn = arr [ cnt ] . split ( " " ) . map ( Number ) ;


cnt ++ ; // Increment the line counter, as the line containing 'm' and 'n' has now been consumed.


var m = mn [ 0 ] ; // Extract the first parameter, 'm', from the 'mn' array.
var n = mn [ 1 ] ; // Extract the second parameter, 'n', from the 'mn' array.


var si = [ ] ; // Initialize an empty array named 'si'. This array will store 'm-1' integer values from the input.
for ( var i = 0 ;  i < m - 1 ;  i ++ )
{
   si [ i ] = arr [ cnt ] - 0 ; // Convert the string representation of a number to an actual number.
                               // The '- 0' is a common JavaScript idiom for type coercion to number.
   cnt ++ ; // Move the counter to the next line in the input array.
}


var ai = [ ] ; // Initialize another empty array named 'ai'. This array will store 'n' integer values from the input.
for ( var i = 0 ;  i < n ;  i ++ )
{
   ai [ i ] = arr [ cnt ] - 0 ; // Convert the string line to a number.
   cnt ++ ; // Advance the counter.
}


var sum = 0 ; // Initialize the primary accumulator variable for the final sum.
var i = 0 ; // Initialize an index 'i'. This index will be used to traverse the 'si' array.


// Begin iterating over each element 'v' present in the 'ai' array.
ai . forEach ( function ( v )
{

   // Determine the 'direction' or 'step' value, 'k', based on the sign of the current 'v'.
   // If 'v' is positive, 'k' is set to 1 (indicating a forward movement).
   // If 'v' is negative, 'k' is set to -1 (indicating a backward movement).
   var k = ( v > 0 ) ? 1 : -1 ;


   // Reassign the variable 'v' to its absolute value.
   // After this line, 'v' will effectively serve as a loop counter, representing the magnitude of the original 'v'.
   var v = Math . abs ( v ) ;


   // Start a while loop that executes 'v' times. The 'v--' decrements 'v' in each iteration until it becomes zero.
   while ( v -- )
   {
      if ( k == 1 ) // If the direction is forward (k is 1)...
      {
         sum += si [ i ] ; // ...add the element at the current index 'i' of 'si' to the 'sum'.
      }

      i = i + k ; // Update the index 'i' by adding 'k'. This moves 'i' either forward or backward in the 'si' array.

      if ( k == -1 ) // If the direction is backward (k is -1)...
      {
         sum += si [ i ] ; // ...add the element at the *newly updated* index 'i' of 'si' to the 'sum'.
      }
   }

   // After processing all steps for the current 'v' from 'ai', apply a modulo operation to 'sum'.
   // This ensures that the 'sum' remains within the specified range [0, 99999].
   sum = sum % 100000 ;

} ) ; // Concludes the forEach loop, having processed all elements in 'ai'.


// Finally, print the computed 'sum' to the standard output.
console . log ( sum ) ;