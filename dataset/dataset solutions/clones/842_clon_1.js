/*
 * This JavaScript program processes input data from standard input.
 * It reads an array of numbers, sorts them based on a specific criterion,
 * and then performs calculations to find a maximum value.
 *
 * This version includes extensive whitespace variations and comments.
 */

// Import the 'fs' (file system) module to read input.
var input =  require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' );


// Trim any leading/trailing whitespace from the input string
// and then split it into an array of lines based on the newline character.
var Arr = ( input . trim() ) . split ( "\n" );


// The first line of input typically specifies the count of subsequent data entries.
// 'shift()' removes the first element from 'Arr' and returns it.
// Subtracting 0 is a common trick to ensure the string is coerced into a number.
var n = Arr . shift() - 0 ;


var arr = []; // Initialize an empty array that will hold our parsed data.

// Loop 'n' times to process each data entry.
for ( var i = 0 ; i < n ; i++ )
{
   // For each line (which is obtained by 'Arr.shift()'),
   // split it by space, and then convert each part to a Number.
   var ab = ( Arr . shift() ) . split ( " " ) . map ( Number ) ;

   // Add the resulting array of numbers (e.g., [a, b]) to our main 'arr'.
   arr . push ( ab ) ;
}


// Sort the 'arr' array using a custom comparison function.
// The sort order is descending based on the second element (index 1) of each inner array.
arr . sort ( function ( a , b )
{
   // Extract the second element from 'a' and 'b' for comparison.
   a = a [ 1 ] ;
   b = b [ 1 ] ;

   // Return 'b - a' for descending order.
   return b - a ;
} ) ;


var max = 0 ; // Initialize 'max' to store the highest 'sum' found.

// This loop iterates through a specific range, from 2 up to 100001.
// The value of 'i' in this loop acts as a threshold or limit.
for ( var i = 2 ; i <= 100001 ; i++ )
{
   var sum = 0 ; // Initialize 'sum' for the current iteration of 'i'.

   // Iterate over each sub-array 'v' in the 'arr' array.
   arr . forEach ( function ( v )
   {
      // Check two conditions:
      // 1. The first element of 'v' (v[0]) must be less than or equal to 'i'.
      // 2. The current 'sum' plus 1 must be less than or equal to the second element of 'v' (v[1]).
      if ( v [ 0 ] <= i && sum + 1 <= v [ 1 ] )
      {
         sum++ ; // If both conditions are met, increment 'sum'.
      }
   } ) ;

   // Update 'max' with the larger value between its current value and the 'sum' calculated in this iteration.
   max = Math . max ( max , sum ) ;
}

// Finally, print the result to the console, which is 'max' minus 1.
console . log ( max - 1 ) ;