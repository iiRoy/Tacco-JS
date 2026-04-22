/*
 *  This JavaScript program is designed to read numerical data
 *  from standard input, perform calculations related to
 *  Minkowski distances (L1, L2, L3 norms) and Chebyshev distance,
 *  and then print the results to standard output.
 *
 *  Input format expected:
 *  Line 1: An integer 'n', representing the number of data points.
 *  Line 2: 'n' space-separated numbers, forming the array 'x'.
 *  Line 3: 'n' space-separated numbers, forming the array 'y'.
 *
 *  The program calculates:
 *  - Manhattan Distance (L1 norm)
 *  - Euclidean Distance (L2 norm)
 *  - Minkowski Distance with p=3 (L3 norm)
 *  - Chebyshev Distance (L-infinity norm)
 */


// Declare a variable to store all incoming data from stdin.
var input = '' ;


// Obtain a reference to the standard input stream object.
var readable = process . stdin ;


// Ensure the standard input stream is in 'flowing' mode,
// which means data will be emitted as soon as it's available.
readable . resume ( ) ;


// Set the character encoding for the incoming data to UTF-8.
readable . setEncoding ( 'utf-8' ) ;


// Register an event listener for the 'data' event.
// This function will be called whenever a chunk of data is received.
readable . on ( 'data', function ( chunk )
{
  // Append the received data chunk to the 'input' string.
  input += chunk ;
}
) ;


// Register an event listener for the 'end' event.
// This function executes once all input has been completely received.
readable . on ( 'end', function ( )
{
  // Split the accumulated input string by newline characters
  // to separate the three lines of data.
  var data = input . split ( '\n' ) ;

  // Parse the first line to get the integer 'n'.
  var n = parseInt ( data [ 0 ] ) ;

  // Process the second line: split by spaces and convert to an array of Numbers.
  var x = data [ 1 ] . split ( ' ' ) . map ( Number ) ;

  // Process the third line similarly for array 'y'.
  var y = data [ 2 ] . split ( ' ' ) . map ( Number ) ;


  // Initialize variables to store the components of the distance calculations.
  var Dxy = 0 ;    // For Manhattan distance (sum of absolute differences)
  var Dxy2 = 0 ;   // For squared Euclidean distance (sum of squared differences)
  var Dxy3 = 0 ;   // For sum of cubed differences (for L3 norm)
  var Dmax = 0 ;   // For Chebyshev distance (maximum absolute difference)

  // Declare a temporary variable to hold the absolute difference in each iteration.
  var t ;


  // Loop through the arrays 'x' and 'y' from index 0 up to (but not including) 'n'.
  for ( var i = 0 ; i < n ; i ++ )
  {
    // Calculate the absolute difference between the i-th elements of x and y.
    t = Math . abs ( x [ i ] - y [ i ] ) ;

    // Add 't' to Dxy for the Manhattan distance.
    Dxy += t ;

    // Add the square of 't' to Dxy2 for the Euclidean distance component.
    Dxy2 += Math . pow ( t, 2 ) ;

    // Add the cube of 't' to Dxy3 for the L3 norm component.
    Dxy3 += Math . pow ( t, 3 ) ;

    // Update Dmax if 't' is greater than the current maximum difference found.
    Dmax = Math . max ( Dmax, t ) ;
  }


  // Output the calculated distances to the console.

  // 1. Manhattan Distance (L1 norm)
  console . log ( Dxy ) ;

  // 2. Euclidean Distance (L2 norm)
  console . log ( Math . sqrt ( Dxy2 ) ) ;

  // 3. Minkowski Distance (p=3 norm)
  console . log ( Math . pow ( Dxy3, 1 / 3 ) ) ;

  // 4. Chebyshev Distance (L-infinity norm)
  console . log ( Dmax ) ;
}
) ;