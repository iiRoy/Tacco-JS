var input  = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ); // Read input from standard input

// Trim whitespace and split input into an array of lines
var arr = input . trim ( ) . split ( "\n" ) ;


var cnt = 0 ; // Initialize a counter for array indexing

// Parse the first line to get dimensions m and n
var mn = arr [ cnt ] . split ( " " ) . map ( Number ) ;

cnt ++ ; // Increment counter after processing the first line

var m = mn [ 0 ] ; // Assign first dimension
var n = mn [ 1 ] ; // Assign second dimension

// Initialize an empty array for 'si'
var si = [ ] ;

/*
 * Populate the 'si' array from subsequent input lines.
 * It contains m-1 elements.
 */
for ( var i = 0 ; i < m - 1 ; i ++ ) {
  si [ i ] = arr [ cnt ] - 0 ; // Convert string to number
  cnt ++ ;                     // Move to the next input line
}

// Initialize an empty array for 'ai'
var ai = [ ] ;

// Populate the 'ai' array from the remaining input lines.
// It contains n elements.
for ( var i = 0 ; i < n ; i ++ ) {
  ai [ i ] = arr [ cnt ] - 0 ; // Convert string to number
  cnt ++ ;                     // Move to the next input line
}

// Initialize 'plus' array with zeros
var plus = [ ] ;

// Ensure 'plus' array has the correct size and is filled with zeros
for ( var i = 0 ; i < m - 1 ; i ++ )
  plus [ i ] = 0 ;


var i = 0 ; // Initialize index 'i' for the processing logic

// Iterate through each value in the 'ai' array
ai . forEach ( function ( v ) {
  // Determine the direction (k) based on the sign of 'v'
  var k = ( v > 0 ) ? 1 : -1 ;

  // Use the absolute value of 'v' as a loop counter
  var v = Math . abs ( v ) ;

  // Loop 'v' times
  while ( v -- ) {
    // If moving forward, increment the current position in 'plus'
    if ( k == 1 )
      plus [ i ] ++ ;

    i = i + k ; // Update the current index 'i'

    // If moving backward, increment the new current position in 'plus'
    if ( k == -1 )
      plus [ i ] ++ ;
  }
} ) ;


var sum = 0 ; // Initialize sum to zero

// Calculate the final sum based on 'si' and 'plus' arrays
plus . forEach ( function ( v , i ) {
  sum += si [ i ] * v ;    // Accumulate product
  sum = sum % 100000 ; // Apply modulo operation to keep sum within bounds
} ) ;

// Output the final calculated sum to the console
console . log ( sum ) ;