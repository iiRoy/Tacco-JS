/*
 * This JavaScript code processes numerical data from standard input.
 * It involves reading multiple lines, parsing numbers, sorting,
 * and performing comparisons with precomputed sums.
 * This file is a Type I clone, preserving all functional aspects
 * while varying whitespace and comments extensively.
 */

// Establish connection to the file system module and read all input synchronously.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Split the entire input string into an array of lines, after trimming any leading/trailing whitespace.
var arr = input . trim ( ) . split ( "\n" ) ;

// Discard the first element of the array, which might be a header or count not needed for processing.
arr . shift ( ) ;

// Extract the next line, split it by space, and convert all parts to numbers, storing them in array 'a'.
var a = arr . shift ( ) . split ( " " ) . map ( Number ) ;

// Sort array 'a' numerically in ascending order. This step is critical for the subsequent accumulation logic.
a . sort ( function ( a , b ) { return a - b ; } ) ;

// Discard another line, likely another metadata element for the next array.
arr . shift ( ) ;

// Extract and parse the numbers for array 'b' in a similar fashion to array 'a'.
var b = arr . shift ( ) . split ( " " ) . map ( Number ) ;

// Extract the string representations of numbers into array 'c'. These will be parsed later.
var c = arr . shift ( ) . split ( " " ) ;

// Initialize a large array named 'ary' to store precomputed sums.
var ary = [ ] ;

// Fill 'ary' with a sentinel value (-1) to indicate uncomputed or invalid entries.
for ( var i = 0 ; i < 1000000 ; i ++ ) {
  ary[ i ] = -1 ;
}

// Set the base case for the accumulation: ary[0] represents a sum of zero.
ary[ 0 ] = [ 0 , 0 ] ;

// Initialize a 'sum' array to store accumulated values, split into two parts for handling large numbers.
var sum = [ 0 , 0 ] ;

// Iterate over each value 'v' in array 'a' to populate the 'ary' array with cumulative sums.
a . forEach ( function ( v ) {
   sum[ 1 ] += v ; // Add the current value to the lower part of the sum.

   // Check if the lower part of the sum has exceeded 1,000,000,000.
   if ( sum[ 1 ] >= 1000000000 ) {
      sum[ 0 ] ++ ;                  // Increment the higher part of the sum.
      sum[ 1 ] -= 1000000000 ;       // Adjust the lower part to stay within its range.
   }
   ary[ v ] = sum . slice ( ) ;      // Store a copy of the current sum at index 'v' in 'ary'.
} ) ;

// Process each value from array 'b' and compare it with corresponding values from 'c'.
b . forEach ( function ( v , i ) {
   // Iterate backwards from 'v' until a valid (non-sentinel) entry is found in 'ary'.
   while ( true ) {
      if ( ary[ v ] !== -1 ) {
         break ; // A valid precomputed sum has been found.
      }
      v -- ;     // Decrement 'v' to check the previous index.
   }

   var str = c[ i ] ; // Retrieve the string representation of the large number from array 'c'.

   // Parse the string 'str' into a two-part number array, similar to how 'sum' is structured.
   var big = [ str . slice ( 0 , str . length - 9 ) - 0 , str . slice ( -9 ) - 0 ] ;

   var ans = "" ; // Initialize a string to hold the comparison result.

   // Perform the comparison between the parsed 'big' number and the precomputed sum 'ary[v]'.
   if ( big[ 0 ] < ary[ v ][ 0 ] ) {
      ans = "Yes" ; // The higher part of 'big' is smaller.
   }
   else if ( big[ 0 ] === ary[ v ][ 0 ] && big[ 1 ] <= ary[ v ][ 1 ] ) {
      ans = "Yes" ; // Higher parts are equal, and the lower part of 'big' is less than or equal.
   }
   else {
      ans = "No" ; // Otherwise, 'big' is considered larger.
   }
   console . log ( ans ) ; // Output the comparison result.
} ) ;