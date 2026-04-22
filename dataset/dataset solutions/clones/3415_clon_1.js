/*
 * This JavaScript file contains the main logic for processing input data.
 * The 'Main' function serves as the entry point for computations.
 */
function   Main ( input )
{
  // Declare a variable 'init' which will hold initial configuration data.
  var      init      ;

  // Split the raw input string by newline characters to get an array of lines.
  input   =   input.split ( '\n' ) ;

  // The first line of input typically contains initialization parameters.
  // Split this first line by space to get individual 'init' values.
  init    =   input [ 0 ] .split ( ' ' ) ;

  // Loop through all input lines to parse them as integers.
  // This ensures that all elements in the 'input' array are numerical.
  for ( var i = 0 ; i < input . length ; i ++ ) {
    input [ i ] = parseInt ( input [ i ] , 10 ) ; // Parse each string element into an integer (base 10).
  }

  // Now, process the 'init' array in a similar fashion.
  // Convert each string element in 'init' to an integer.
  for ( var i = 0 ; i < init . length ; i ++ ) {
    init [ i ] = parseInt ( init [ i ] , 10 ) ;
  }

  // Declare a temporary variable for use in sorting operations.
  var    tmp     ;

  // The following block implements a sorting algorithm.
  // It appears to be a variation of Bubble Sort, aiming for ascending order.
  // Note: The loops start from index 1 and go up to length - 1,
  // potentially leaving the very first and last elements untouched,
  // or it might be an off-by-one for specific problem constraints.

  // This comment indicates the intended sorting order: ascending.
  // 昇順にソート (Sort in ascending order)

  for ( var i = 1 ; i < input.length - 1 ; i ++ )
  {
    for ( var j = 1 ; j < input.length - 1 ; j ++ )
    {
      // If an element at index 'j' is greater than an element at index 'i', swap them.
      if ( input [ j ] > input [ i ] )
      {
        // Perform the swap using the temporary variable 'tmp'.
        tmp = input [ j ] ;
        input [ j ] = input [ i ] ;
        input [ i ] = tmp ;
      }
    }
  }


  // Declare a variable to store the minimum difference found between tree positions.
  var    minTree     ;

  // Initialize minTree with the absolute difference between input[1] and input[init[1]].
  // This sets an initial baseline for comparison.
  minTree   =   Math.abs ( input [ 1 ] - input [ init [ 1 ] ] ) ;

  // console.log ( minTree ) ; // Debugging line, currently commented out.

  // Loop through a specific range of the 'input' array to find the minimum difference.
  // The loop bounds are critical and depend on 'init[1]'.
  for ( var i = 1 ; i < input.length - 2 - init [ 1 ] ; i ++ )
  {
    // console.log ( input [ i + init [ 1 ] - 1 ] - input [ i ] ) ; // Another debugging line.

    // Check if the current difference is smaller than the previously recorded minimum.
    if ( minTree > input [ i + init [ 1 ] ] - input [ i ] )
    {
      // console.log ( 'a' ) ; // Debugging marker.
      // console.log ( Math.abs ( input [ 1 ] - input [ i + init [ 1 ] - 1 ] ) ) ; // More debugging.

      // If a smaller difference is found, update 'minTree'.
      minTree   =   input [ i + init [ 1 ] ] - input [ i ] ;
    }
  }


  // Finally, output the calculated minimum tree difference to the console.
  console.log ( minTree ) ;
}


// This line is responsible for reading input from standard input (/dev/stdin)
// and passing it to the 'Main' function.
// It uses Node.js's 'fs' module to read the file synchronously.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;