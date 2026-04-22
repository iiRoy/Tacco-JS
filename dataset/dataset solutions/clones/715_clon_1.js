#!/usr/bin/node
// This script processes input to find connected components in a grid-like structure.

// The entire application is wrapped in an Immediately Invoked Function Expression (IIFE)
// to prevent polluting the global scope.
( function ( ) {

  // T: Represents the current grid or matrix being processed.
  var T = [ ] ;

  // S: Stores parsed input lines, effectively a queue of data segments.
  var S = [ ] ;

  // Get a reference to the standard input stream.
  var stdin = process . openStdin ( ) ;

  // Set the encoding for the input stream to UTF-8.
  stdin . setEncoding ( 'utf8' ) ;


  /**
   * Recursive function to explore and mark connected components.
   * It performs a flood-fill-like operation.
   * @param {number} x - The current x-coordinate (column index).
   * @param {number} y - The current y-coordinate (row index).
   */
  var rec = function ( x , y ) {
    // Check if the current coordinates are within bounds and if the cell is 'active' (value is not zero).
    if ( 0 <= x && x < T [ 0 ] . length &&
         0 <= y && y < T . length &&
         T [ y ] [ x ]
       )
    {
      // Mark the current cell as visited (set to 0).
      T [ y ] [ x ] = 0 ,
      // Recursively call for all 8 neighboring cells.
      rec ( x - 1 , y ) ,    // Left
      rec ( x + 1 , y ) ,    // Right
      rec ( x , y - 1 ) ,    // Up
      rec ( x , y + 1 ) ,    // Down
      rec ( x - 1 , y - 1 ) , // Top-Left
      rec ( x + 1 , y - 1 ) , // Top-Right
      rec ( x - 1 , y + 1 ) , // Bottom-Left
      rec ( x + 1 , y + 1 ) ; // Bottom-Right
    }
  } ; // End of recursive function 'rec'


  // Buffer for incomplete input lines.
  var input_fragment = "" ;

  // Event listener for incoming data on standard input.
  stdin . on ( 'data' , function ( input ) {
    // Concatenate the fragment with new input and split by newline.
    // This handles cases where a line might be split across multiple 'data' events.
    var ref = ( input_fragment + input ) . split ( "\n" ) ;

    // The last element might be an incomplete line, so store it back as fragment.
    input_fragment = ref . pop ( ) ;

    // Iterate through the complete lines received.
    for ( var i = 0 ; i < ref . length ; i ++ ) {
      // Skip empty lines.
      if ( ref [ i ] == '' )
        continue ;

      // Split the line by space to get individual numbers.
      var y = ref [ i ] . split ( " " ) ;

      // Convert each string number to an integer.
      for ( var j = 0 ; j < y . length ; j ++ )
        y [ j ] = parseInt ( y [ j ] ) ;

      // Push the processed row (array of integers) into the global S array.
      S . push ( y ) ;
    }
  } ) ; // End of 'data' event handler


  // Event listener for the end of the standard input stream.
  stdin . on ( 'end' , function ( z ) {
    // Declare loop counters and a result variable.
    var i , j , r ;

    // Main processing loop, continues until a specific break condition.
    for ( ; ; ) {
      // Initialize the component counter for the current grid.
      r = 0 ;

      // Extract the height 'h' of the next grid from the S array.
      // S.shift() removes the first element (which is expected to be a control line).
      // The height is assumed to be the second value in this control line.
      var h = ( S . shift ( ) ) [ 1 ] ;

      // If 'h' is falsy (e.g., undefined, 0, null), it means there's no more grid to process.
      if ( ! h )
        break ; // Exit the infinite loop.

      // Extract the grid 'T' from the beginning of the S array based on the height 'h'.
      T = S . slice ( 0 , h ) ;

      // Iterate through each cell of the current grid 'T'.
      // This is a nested loop structure to traverse the matrix columns then rows.
      for ( i = 0 ; i < T [ 0 ] . length ; i ++ )
        for ( j = 0 ; j < T . length ; j ++ )
          // If a cell contains a non-zero value, it's part of a new component.
          if ( T [ j ] [ i ] )
            // Increment the component count.
            r ++ ,
            // Start the recursive flood-fill from this cell.
            rec ( i , j ) ;

      // Output the total number of components found for the current grid.
      console . log ( r ) ;

      // Remove the processed grid rows from the S array.
      S = S . slice ( h ) ;
    }
  } ) ; // End of 'end' event handler

} ) . call ( this ) ; // Invoke the IIFE, passing 'this' as its context.