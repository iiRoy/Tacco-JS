/*
 * This JavaScript code processes input data to determine a specific value.
 * It reads from standard input, parses numerical data, and performs
 * calculations based on predefined rules.
 */

// Import the 'fs' module to handle file system operations, specifically reading from /dev/stdin.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' );

// Trim whitespace from the input and split it into an array of lines.
var arr = input . trim() . split ( "\n" );


// Extract the first line, split it by space, and convert elements to numbers.
var nrl = arr . shift() . split ( " " ) . map ( Number );

// Assign the first element of nrl to 'n'.
var n = nrl[0];

// Assign the third element of nrl to 'L'.
var L = nrl[2];

// Initialize an empty array 't' which will store processed data.
var t = [ ] ;

// Initialize 'max' array with default values, representing [index, value].
var max = [ 0 , 0 ] ;

// Initialize 'time' variable to track elapsed time or a timestamp.
var time = 0 ;

// Populate the 't' array with initial values for 'n' elements.
// Each element in 't' is an array [0, 0, i], where 'i' is its original index.
for ( var i = 0 ; i < n ; i ++ ) {
   t [ i ] = [ 0 , 0 , i ] ;
} // End of initialization loop


// Add a specific default event to the 'arr' array.
// This event is represented as a string "1 L 0".
arr . push ( [ 1 , L , 0 ] . join ( " " ) ) ;


// Iterate over each element in the 'arr' array.
// Each element represents an event or data point.
arr . forEach ( function ( v ) {

   // Parse the current event string: split by space and convert to numbers.
   v = v . split ( " " ) . map ( Number ) ;

   // Extract 'd' (destination/index), 'T' (timestamp), and 'x' (value change) from the parsed array.
   var d = v[0] - 1 ; // Adjust index to be 0-based.
   var T = v[1] ;
   var x = v[2] ;

   // Update the second component of the 'max[0]' element in 't' based on time difference.
   t [ max[0] ] [ 1 ] += T - time ;

   // Update the global 'time' to the current event's timestamp.
   time = T ;

   // Update the first component of the 'd' element in 't' by adding 'x'.
   t [ d ] [ 0 ] += x ;

   // Conditional logic based on the value of 'x'.
   if ( x > 0 ) {
      // If 'x' is positive, potentially update 'max'.
      if ( t [ d ] [ 0 ] > max [ 1 ] ) {
         max = [ d , t [ d ] [ 0 ] ] ; // Update max if current value is greater.
      }
      else if ( t [ d ] [ 0 ] == max [ 1 ] && d <= max [ 0 ] ) {
         max = [ d , t [ d ] [ 0 ] ] ; // Update max if values are equal and current index is smaller or equal.
      }
   }
   else if ( x < 0 && max [ 0 ] == d ) {
      // If 'x' is negative AND the current 'd' is the 'max[0]' index.
      // Recalculate 'max' from scratch.
      var MAX = 0 ; // Temporary variable to store maximum value found.
      var m = 0 ; // Temporary variable to store index of maximum value.

      // Iterate through 't' to find the new maximum element.
      t . forEach ( function ( V , index ) {
         if ( MAX < V [ 0 ] ) {
            m = index ; // Update index if a new maximum is found.
            MAX = V [ 0 ] ; // Update maximum value.
         }
      } ) ; // End of inner forEach loop

      max = [ m , t [ m ] [ 0 ] ] ; // Set the global 'max' to the newly found maximum.
   }
} ) ; // End of outer forEach loop


// Sort the 't' array based on custom comparison logic.
// Primary sort key: b[1] - a[1] (descending order of the second component).
// Secondary sort key: a[2] - b[2] (ascending order of the third component) if primary keys are equal.
t . sort ( function ( a , b ) {
   if ( a [ 1 ] == b [ 1 ] ) {
      return a [ 2 ] - b [ 2 ] ;
   }
   else {
      return b [ 1 ] - a [ 1 ] ;
   }
} ) ; // End of sort function


// Log the third component of the first element of the sorted 't' array, incremented by 1, to the console.
console . log ( t [ 0 ] [ 2 ] + 1 ) ;

// End of script.