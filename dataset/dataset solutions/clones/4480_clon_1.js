/*
 * This JavaScript code processes numerical input data.
 * It aims to find the minimum absolute difference between
 * two sums, where the array is partitioned at various points.
 *
 * The `input` parameter will contain all the raw input data.
 */
function Main ( input ) {

  // Split the entire input string by newline characters
  // to get an array of individual lines.
  input = input.split( "\n" ) ;

  // Process the first line of input to extract initial parameters.
  var line1 = input[ 0 ].split( " " ) ;
  var num = Number( line1[ 0 ] ) ; // The total count of elements.

  // Process the second line of input to get the data elements.
  var data = input[ 1 ].split( " " ) ;

  // Convert all string data elements into actual numbers.
  for ( var i = 0 ; i < num ; i ++ ) {
    data[ i ] = Number( data[ i ] ) ;
  }

  // Initialize variables for partitioning and sum calculations.
  var index = Math.floor( num / 2 ) ; // Middle index (not directly used in current logic)
  var left = 0 ;                     // Left boundary (not directly used in current logic)
  var right = num ;                  // Right boundary (not directly used in current logic)

  // Variables to hold sums and the minimum difference found.
  var leftSum = 0 ;
  var rightSum = 0 ;
  var diff = 10e20 ;  // Initialize diff with a very large number.
  var lastIndex = 0 ; // Not used in this specific implementation.
  var sum = 0 ;       // Total sum of all elements.

  // Calculate the total sum of all numbers in the 'data' array.
  for ( var i = 0 ; i < num ; i ++ ) {
    sum += data[ i ] ;
  }

  // Iterate through possible partition points (from 1 to num-1).
  // 'ite' represents the number of elements in the left partition.
  for ( var ite = 1 ; ite < num ; ite ++ ) {

    // Calculate the sum of elements for the left partition.
    for ( var i = 0 ; i < ite ; i ++ ) {
      leftSum += data[ i ] ;
    }

    // Calculate the sum of elements for the right partition.
    rightSum = sum - leftSum ;

    // Compare the current absolute difference with the minimum difference found so far.
    // Update 'diff' if a smaller absolute difference is encountered.
    if ( diff > Math.abs( leftSum - rightSum ) ) {
      diff = Math.abs( leftSum - rightSum ) ;
    }

    // Reset partition sums for the next iteration.
    rightSum = 0 ;
    leftSum = 0 ;

  }

  // Output the final minimum absolute difference to the console.
  console.log( diff ) ;

}

// Invoke the Main function with input read from standard input.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;