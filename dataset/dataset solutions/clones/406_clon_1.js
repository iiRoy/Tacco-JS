#!/usr/bin/node
// This is a Type I clone of the original JavaScript code.
// Only whitespace and comments have been altered.

( function ( ) {

  // Initialize an empty array for storing input values.
  var T = [ ] ;

  // Set up standard input stream.
  var stdin = process.openStdin ( ) ;
  stdin . setEncoding ( 'utf8' ) ;

  // Pre-calculate a sequence of numbers based on a recurrence relation.
  // The first three terms are 1, 1, 2.
  var a = [ 1 , 1 , 2 ] ;

  // Calculate subsequent terms up to the 30th index.
  for ( var i = 3 ; i < 31 ; i ++ ) {
    a . push ( a [ i - 1 ] + a [ i - 2 ] + a [ i - 3 ] ) ;
  }


  // Event listener for incoming data on the standard input stream.
  stdin . on ( 'data' , function ( input ) {
    // Declare local variables for processing the input.
    var i = 0 , len , ref , x = [ ] ;

    // Split the input string by newlines.
    ref = input . split ( "\n" ) ;

    // Iterate through the split parts.
    for ( len = ref . length ; i < len ; i ++ ) {
      // Skip empty lines.
    	if ( ref [ i ] == '' ) {
          continue ;
        }
      // Convert non-empty lines to numbers and push to array x.
    	x . push ( ref [ i ] ^ 0 ) ;
    }

    // This block handles input logic, distinguishing between single-line inputs
    // and multi-line inputs, or specific numeric patterns.
    // It determines whether to replace T with x or append to T.
    if ( x . length > 2 || ! isNaN ( x [ 1 ] ) ) {
      T = x ; // Replace T entirely if x has more than 2 elements or the second element is a number.
    }
    else {
      T . push ( x [ 0 ] ) ; // Otherwise, just push the first element of x to T.
    }
  } ) ;


  // Event listener for the end of the standard input stream.
  stdin . on ( 'end' , function ( z ) {
    // Iterate through the collected values in array T.
    for ( var i = 0 ; T [ i ] ; i ++ ) {
      // Perform a calculation using 'a' and 'T[i]', then print the result.
      // The calculation involves indexing 'a', adding a constant, dividing, and then bitwise OR with 0 for floor.
      console . log ( ( a [ T [ i ] ] + 3649 ) / 3650 ^ 0 ) ;
	}
  } ) ;

} ) ( ) ; // Immediately Invoked Function Expression (IIFE) ends here.