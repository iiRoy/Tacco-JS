/*
 * This JavaScript program reads numerical data from standard input,
 * processes it to find discrepancies between an original array and its sorted version,
 * and then simulates swaps based on queries to see if the original array
 * can be transformed into the sorted version.
 *
 * The goal is to find the minimum number of swaps (queries) required to achieve this state.
 */


// Require the 'fs' (file system) module to read input.
// Read the entire standard input as a UTF-8 string.
var input = require( 'fs' ) .readFileSync( '/dev/stdin' , 'utf8' );


// Trim any leading/trailing whitespace from the input and split it into an array of lines.
var arr = input .trim() .split( "\n" );


// The first line of the input array 'arr' represents 'n'.
// Use 'shift()' to remove and get the first element, then convert it to a number.
var n = arr .shift() - 0 ; // Subtracting 0 is a common trick for type conversion to number.


// The next line contains space-separated numbers which form array 'a'.
// Remove and get the next line, split by space, and map each part to a Number.
var a = arr .shift() .split( " " ) .map( Number );


// Create a new array 'b' by slicing 'a' (to make a shallow copy)
// and then sorting the copy in ascending order.
var b = a .slice() .sort( ( x , y ) => x - y );


// The next line represents 'q', the number of queries.
// Similar to 'n', shift and convert to number.
var q = arr .shift() - 0 ;


// The remaining lines in 'arr' are the queries.
// Map each line to an array of two numbers (x, y), then adjust them to be 0-indexed.
var xy = arr .map( v => v .split( " " ) .map( Number ) .map( v => v - 1 ) );


// Prepend a dummy query [0,0] to the 'xy' array.
// This is often done to handle 1-based indexing in loops or specific problem logic.
xy .unshift( [ 0 , 0 ] );


// Initialize two empty objects, 'A' and 'B'.
// These will store elements that are out of place in array 'a' compared to array 'b'.
var A = {}; // Stores values from 'a' at indices where a[i] != b[i]
var B = {}; // Stores values from 'b' at indices where a[i] != b[i]


// Iterate through the original array 'a' to find elements that are not in their sorted position.
for ( var i = 0 ; i < a .length ; i++ ) {
   // If the element at index 'i' in 'a' does not match the element in 'b' (sorted version)...
   if ( a[i] != b[i] ) {
      // ...store the value from 'a' in object 'A' using 'i' as the key.
      A[i] = a[i];
      // ...store the value from 'b' in object 'B' using 'i' as the key.
      B[i] = b[i];
   }
}


// Get all the values from object 'B' and join them into a comma-separated string.
// This string 'BB' will be used for comparison later.
var BB = Object .values( B ) .join( "," );


// Initialize a boolean flag to track if a solution is found.
var flag = false ;


// Iterate through the queries, including the dummy query at index 0 up to 'q'.
for ( var i = 0 ; i <= q ; i++ ) {

   // Perform a swap operation on the elements within object 'A'
   // based on the current query's indices (xy[i][0] and xy[i][1]).
   // This uses array destructuring for a concise swap.
   [ A[xy[i][0]] , A[xy[i][1]] ] = [ A[xy[i][1]] , A[xy[i][0]] ];


   // After the swap, get all values from the modified object 'A'
   // and join them into a comma-separated string.
   // Compare this string with the pre-computed 'BB' string.
   if ( Object .values( A ) .join( "," ) == BB ) {
      // If they match, it means the elements in 'A' (which represent the out-of-place elements)
      // now match the sorted positions defined by 'B'.
      flag = true ; // Set the flag to true.
      break ;       // Exit the loop as the solution has been found.
   }
}


// After checking all queries, evaluate the 'flag'.
if ( flag ) {
   // If 'flag' is true, a solution was found.
   // Output the index 'i' of the query that resulted in the match.
   console .log( i );
} else {
   // If 'flag' is false, no solution was found after all queries.
   // Output -1 to indicate no match.
   console .log( -1 );
}