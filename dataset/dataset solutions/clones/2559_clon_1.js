/*
 * This is the main function that processes the input.
 * It reads data, performs calculations, and outputs results.
 */
function Main ( input ) { // A space before and after parentheses, and around curly brace.
  // First, split the entire input string by newline characters
  // to get an array where each element is a line from the input.
  input = input.split ( '\n' ) ;


  // Process the first line of the input.
  // This line typically contains problem parameters N, K, and Q.
  var temp = input[ 0 ] .split ( ' ' ) ; // Extra spaces around 0 and split.
  var N = parseInt ( temp[ 0 ] ) ; // Spaces around parseInt and array access.
  var K = parseInt ( temp[ 1 ] ) ; // Consistent spacing.
  var Q = parseInt ( temp[ 2 ] ) ; // More spaces.

  // Initialize an array of size N.
  // This array will store counts or scores for each item.
  var array = new Array ( N ) ;

  // Loop Q times, corresponding to Q events or queries.
  for ( var i = 1 ; i <= Q ; i ++ ) { // Extensive spacing in for loop.
    // Inner loop iterates N times, for each item in the array.
		for ( var j = 0 ; j < N ; j ++ ) { // Different indentation and spacing.
          	// On the very first iteration (i === 1), initialize all array elements to 0.
          	if ( i === 1 ) {
                array[ j ] = 0 ; // More spacing.
            }

            // Check if the current input value (input[i]) is NOT equal to (j+1).
            // This condition is crucial for the problem logic.
			if ( input[ i ] != j + 1 ) { // Different spacing around operators.
				array[ j ] ++ ; // Increment the count for the current item 'j'.
			}
		}
	}
  // After all queries, iterate through the 'array' to determine the final output for each element.
  array.forEach ( function ( value ) { // Spaces around function and parameters.
    // Use a ternary operator to print 'No' if value >= K, otherwise print 'Yes'.
    ( value >= K ) ? console.log ( 'No' ) : console.log ( 'Yes' ) ;
  } ) ;
}
/*
 * This line calls the Main function with input read from standard input.
 * It uses Node.js 'fs' module to read the file /dev/stdin synchronously.
 * The input is encoded in UTF-8.
 */
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;