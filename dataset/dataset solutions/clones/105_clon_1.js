function   main ( ) {
  // Declare a local reference to the global input variable.
  var localInput   = input ;

  // Initialize a 2D array 'f' to store data.
  // The array dimensions are designed to handle indices from -2 to 11 (inclusive).
  var f = [ ] ;

  // Outer loop for initializing rows of the 'f' array.
  for ( var y = -2 ; y < 12 ; y ++ ) {
    f [ y ] = [ ] ; // Initialize the current row as an empty array.

    // Inner loop for initializing columns within the current row.
    for ( var x = -2 ; x < 12 ; x ++ ) {
      f [ y ] [ x ] = 0 ; /* Every cell starts with a value of zero. */
    }
  }

  // Get the length of the input array, adjusting for 0-based indexing or a trailing newline.
  var len = localInput . length - 1 ;

  // Process each line of the input array in reverse order.
  while ( len -- ) {
    var l = localInput [ len ] ; // Get the current line from the input.

    // Parse integer coordinates from specific character positions in the line.
    var ix = parseInt ( l [ 0 ] ) ; // X-coordinate from the first character.
    var iy = parseInt ( l [ 2 ] ) ; // Y-coordinate from the third character.

    // Use a switch statement based on the fifth character of the line.
    switch ( l [ 4 ] ) {
      case '3' : // Type 3 modification: affects 4 cells at distance 2.
        f [ iy + 2 ] [ ix ] ++ ;
        f [ iy - 2 ] [ ix ] ++ ;
        f [ iy ] [ ix - 2 ] ++ ;
        f [ iy ] [ ix + 2 ] ++ ;
        // This case falls through to '2' as it lacks a 'break' statement.

      case '2' : // Type 2 modification: affects 4 diagonal cells at distance sqrt(2).
        f [ iy + 1 ] [ ix - 1 ] ++ ;
        f [ iy + 1 ] [ ix + 1 ] ++ ;
        f [ iy - 1 ] [ ix - 1 ] ++ ;
        f [ iy - 1 ] [ ix + 1 ] ++ ;
        // This case also falls through to '1'.

      case '1' : // Type 1 modification: affects a 3x3 cross shape around the center.
        f [ iy + 1 ] [ ix ] ++ ;
        f [ iy ] [ ix - 1 ] ++ ;
        f [ iy ] [ ix ] ++ ; // Increment the central cell.
        f [ iy ] [ ix + 1 ] ++ ;
        f [ iy - 1 ] [ ix ] ++ ;
        break ; // Exit the switch statement after processing type 1.
    }
  }

  // Variables to store results: 'not dropped' count and 'most dropped' value.
  var nd = 0 ; // Counter for cells that remain 0 (not dropped).
  var md = 0 ; // Stores the maximum value found in 'f' (most dropped).

  // Loop through a 10x10 subgrid of the 'f' array (from 0 to 9 for both x and y).
  var y = 10 ;
  while ( y -- ) { // Decrement y from 9 down to 0.
    var x = 10 ;
    while ( x -- ) { // Decrement x from 9 down to 0.
      nd += ! ( f [ y ] [ x ] ) ; // If f[y][x] is 0 (falsy), !0 is 1, so increment nd.
      md = mx ( f [ y ] [ x ] , md ) ; // Update md with the maximum value.
    }
  }

  // Output the calculated results.
  console . log ( nd ) ; // Print the count of cells that were not dropped.
  console . log ( md ) ; // Print the maximum number of times any cell was dropped.
}


// Helper function to find the maximum of two numbers without using Math.max().
function mx ( a , b ) {
  var t = ( a - b ) ; // Calculate the difference.
  // If a >= b, t >= 0. (t >> 31) will be 0. a - (t & 0) = a.
  // If a < b, t < 0. (t >> 31) will be -1 (for 32-bit signed int). a - (t & -1) = a - t = a - (a - b) = b.
  return a - ( t & ( t >> 31 ) ) ;
}

// Global variable to store input data.
var
input = '' ;

// Set up input stream handling.
process . stdin . resume ( ) ; // Keep the process alive while waiting for input.
process . stdin . setEncoding ( 'utf8' ) ; // Specify input encoding.

// Event listener for incoming data chunks.
process . stdin . on ( 'data' , function ( chunk ) {
  input += chunk ; // Append each chunk of data to the 'input' string.
} ) ;

// Event listener for the 'end' of the input stream.
process . stdin . on ( 'end' , function ( ) {
  input = input . split ( '\n' ) ; // Split the accumulated input by newlines into an array.
  main ( ) ; // Call the main function to process the input.
} ) ;