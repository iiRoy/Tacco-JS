#!/usr/bin/node

/*
 * This script processes input data to find connected components.
 * It uses a recursive function for depth-first search.
 */
( function ( ) {

  // Array 'T' will store the current grid/matrix for processing.
  // Initialized as an empty array.
  var T = [ ] ;

  // Array 'S' will store all parsed input data lines.
  // Initialized as an empty array.
  var S = [ ] ;

  // Obtain a reference to standard input stream.
  var stdin = process . openStdin ( ) ;

  // Set the encoding for the standard input stream to UTF-8.
  stdin . setEncoding ( 'utf8' ) ;


  /*
   * Recursive function 'rec' to perform a depth-first search
   * or a flood-fill operation on the grid 'T'.
   * @param {number} x - The x-coordinate (column index).
   * @param {number} y - The y-coordinate (row index).
   */
  var rec = function ( x , y ) {
    // Check boundaries and if the current cell (T[y][x]) is 'active' (non-zero/truthy).
    if ( 0 <= x && x < T [ 0 ] . length && 0 <= y && y < T . length && T [ y ] [ x ] ) {
      // Mark the current cell as visited by setting it to 0.
      T [ y ] [ x ] = 0 ,
      // Recursively call 'rec' for all 8 neighboring cells (including diagonals).
      rec ( x - 1 , y ) ,
      rec ( x + 1 , y ) ,
      rec ( x , y - 1 ) ,
      rec ( x , y + 1 ) ,
      rec ( x - 1 , y - 1 ) ,
      rec ( x + 1 , y - 1 ) ,
      rec ( x - 1 , y + 1 ) ,
      rec ( x + 1 , y + 1 )
      ; /* End of recursive calls for neighbors */
    }
  } ; // End of 'rec' function definition


  // A temporary string to store incomplete input lines that span across 'data' events.
  var input_fragment = "" ;

  // Event listener for incoming data on stdin.
  stdin . on ( 'data' , function ( input ) {
    // Concatenate the fragment with new input and split by newline characters.
    // This handles cases where a newline might be split across two 'data' chunks.
    var ref = ( input_fragment + input ) . split ( "\n" ) ;

    // The last element might be an incomplete line; store it back as fragment.
    input_fragment = ref . pop ( ) ;

    // Iterate through the complete lines received.
    for ( var i = 0 ; i < ref . length ; i ++ ) {
      // Skip empty lines.
      if ( ref [ i ] == '' ) continue ;

      // Split the line by spaces to get individual numbers.
      var y = ref [ i ] . split ( " " ) ;

      // Convert each string element in 'y' to an integer.
      for ( var j = 0 ; j < y . length ; j ++ ) {
        y [ j ] = parseInt ( y [ j ] ) ;
      }

      // Add the processed line (array of integers) to the main data store 'S'.
      S . push ( y ) ;
    }
  } ) ; // End of 'data' event handler


  /*
   * Event listener for the 'end' of the standard input stream.
   * This is where the main processing logic for the grid takes place.
   */
  stdin . on ( 'end' , function ( z ) {
    // Declare loop counters and a result variable.
    var i , j , r ;

    // Infinite loop, which will be broken explicitly.
    for ( ; ; ) {
      // Initialize the component counter for the current grid.
      r = 0 ;

      // Shift the first element from 'S', which contains grid dimensions.
      // 'h' represents the height of the next grid to process.
      var h = ( S . shift ( ) ) [ 1 ] ;

      // If 'h' is falsy (e.g., undefined or 0), it means no more grids to process.
      if ( ! h ) break ; // Exit the infinite loop.

      // Extract the next 'h' rows from 'S' to form the current grid 'T'.
      T = S . slice ( 0 , h ) ;

      // Iterate through each cell of the grid T to find connected components.
      for ( i = 0 ; i < T [ 0 ] . length ; i ++ ) { // Loop through columns (x-coordinates)
        for ( j = 0 ; j < T . length ; j ++ ) { // Loop through rows (y-coordinates)
          // If the cell T[j][i] is active (non-zero).
          if ( T [ j ] [ i ] ) {
            // Increment the component counter.
            r ++ ,
            // Start a recursive flood-fill from this cell to mark its component.
            rec ( i , j ) ;
          }
        } // End of inner loop (rows)
      } // End of outer loop (columns)

      // Print the total number of connected components found for the current grid.
      console . log ( r ) ;

      // Remove the processed 'h' rows from 'S', preparing for the next grid.
      S = S . slice ( h ) ;
    } // End of processing loop
  } ) ; // End of 'end' event handler

} ) . call ( this ) ; // Immediately-invoked function expression (IIFE)