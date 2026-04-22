/*
 * This JavaScript code processes numerical data to find pairs of points
 * that have an integer Euclidean distance between them.
 * It reads input from standard input, calculates distances,
 * and prints the total count of integer distances found.
 */
"use strict" ; // Enforces stricter parsing and error handling in the code.


function   main (  arg  )
{ // Start of the primary function.

  // Process the raw input string.
  var data = arg.trim() .split("\n") ; // Trim whitespace from input and split into an array of lines.

  // Extract the first line to get N (number of points) and D (dimensions).
  var tmp  =  data.shift() .split(' ') .map(Number) ;
  var N = tmp[ 0 ] ; // N is the total number of data points.
  var D = tmp[ 1 ] ; // D is the dimensionality of each data point.

  // Convert the remaining data lines into arrays of numbers.
  data = data.map(  e  =>  e.split(' ').map(Number)  ) ;


  var ans = 0 ; // Initialize counter for integer distances.

  // Outer loop: Iterate through each data point, indexed by 'i'.
  for ( var i = 0 ; i < N ; i++ )
  {
    // Inner loop: Iterate through data points, indexed by 'j', starting from 'i'.
    for ( var j = i ; j < N ; j++ )
    {
      // If 'i' and 'j' are the same index, skip the comparison as it's the same point.
      if ( i === j )
      {
        continue ;
      }
      // console.log(`${i}:${j}`) // Debugging: shows which pair of points is being compared.

      // Get the two data rows (vectors) for current comparison.
      var row1 = data[ i ] ;
      var row2 = data[ j ] ;

      var yz = 0 ; // Accumulator for the sum of squared differences.

      // Loop through each dimension 'd' from 0 to D-1.
      for ( var d = 0 ; d < D ; d++ )
      {
        // console.log(`${i}:${j}`) // More debugging, if needed.
        // Calculate the absolute difference between coordinates in the current dimension.
        var t = Math.abs(  row1[d]  -  row2[d]  ) ;
        // Add the square of this difference to 'yz'.
        yz += t * t ;
      }

      // Calculate the Euclidean distance.
      var tAns = Math.sqrt(yz) ;

      // Check if the calculated distance is an integer.
      // This is done by converting to string, splitting by the decimal point,
      // and checking if there is no decimal part (length <= 1).
      if ( ! ( String(tAns) .split('.') .length > 1 ) )
      {
        // console.log(tAns) // Debugging: print integer distances found.
        ans++ ; // Increment the counter if the distance is an integer.
      }
    }
  }

  // Output the final count of pairs with integer Euclidean distances.
  console.log(ans) ;
}

// Call the main function, providing input read from stdin.
main ( require('fs') .readFileSync('/dev/stdin', 'utf8') ) ;