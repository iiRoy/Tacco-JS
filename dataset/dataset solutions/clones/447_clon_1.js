function main ( ) { /* This is the primary execution entry point */
  var i = 0 , j , y , x ; // Loop counters and coordinates
  var xy ; // Stores dimensions for the current grid
  var cells ; // Stores the grid data for the current test case
  var answers = { } ; // Dynamic programming memoization table for path counts
  var dummy = [ 2 , 2 , 2 , 2 , 2 , 2 , 2 , 2 , 2 , 2 , 2 , 2 , 2 , 2 , 2 ] ; /* A special row used for boundary conditions at the bottom of the grid */

  for ( ; ; ) { /* Infinite loop for processing multiple test cases until a specific termination condition is met */

    // Read the dimensions (width and height) for the current grid
    xy = input [ i ++ ] . split ( ' ' ) . map ( parseFloat ) ;

    cells = [ ] ; // Initialize an empty array to store the grid rows

    if ( xy [ 0 ] === 0 && xy [ 1 ] === 0 ) { // Termination condition: if both dimensions are zero
      break ; // Exit the infinite loop, as there are no more test cases
    }

    /* Loop to read each row of the grid from the input */
    for ( j = 0 ; j < xy [ 1 ] ; j ++ ) {
      cells . push ( input [ i ++ ] . split ( ' ' ) . map ( parseFloat ) ) ; // Parse and add a row to the cells array
    }

    cells . push ( dummy ) ; // Append the predefined dummy row to handle bottom boundary conditions gracefully

    var answer = 0 ; // Reset the total path count for the current test case
    answers = { } ; // Clear the memoization table for the new test case

    /* Initialize the first row of the 'answers' table */
    for ( x = 0 ; x < xy [ 0 ] ; x ++ ) {
      answers [ [ x , 0 ] ] = cells [ 0 ] [ x ] === 0 ? 1 : 0 ; // If the starting cell is 0, there's one path; otherwise, zero paths
    }


    /* Iterate through the grid rows to calculate path counts using dynamic programming */
    for ( y = 0 ; y < xy [ 1 ] ; y ++ ) {
      for ( x = 0 ; x < xy [ 0 ] ; x ++ ) {

        answers [ [ x , y ] ] = answers [ [ x , y ] ] || 0 ; // Ensure the current cell's path count is at least 0

        /* Use a switch statement to handle different cell types and their movement rules */
        switch ( cells [ y ] [ x ] ) {
        case 0 : // Cell type 0: Paths can move diagonally left, straight down, or diagonally right
          if ( cells [ y + 1 ] [ x - 1 ] !== 2 ) { // Check if the cell to the down-left is not an obstacle (type 2)
            answers [ [ x - 1 , y + 1 ] ] = ( answers [ [ x - 1 , y + 1 ] ] || 0 ) + answers [ [ x , y ] ] ; // Add current paths to the down-left cell
          }
          answers [ [ x , y + 1 ] ] = ( answers [ [ x , y + 1 ] ] || 0 ) + answers [ [ x , y ] ] ; // Add current paths to the straight down cell
          if ( cells [ y + 1 ] [ x + 1 ] !== 2 ) { // Check if the cell to the down-right is not an obstacle (type 2)
            answers [ [ x + 1 , y + 1 ] ] = ( answers [ [ x + 1 , y + 1 ] ] || 0 ) + answers [ [ x , y ] ] ; // Add current paths to the down-right cell
          }
          break ;

        case 1 : // Cell type 1: No movement from this cell, paths terminate here
          break ;

        case 2 : // Cell type 2: Paths jump two steps straight down
          answers [ [ x , y + 2 ] ] = ( answers [ [ x , y + 2 ] ] || 0 ) + answers [ [ x , y ] ] ; // Add current paths to the cell two steps straight down
          break ;
        }
      }
    }

    /* The 'show' function was likely used for debugging purposes. It's currently commented out. */
//    show(xy, answers);

    /* Sum up the total paths in the last two rows of the grid (including the dummy row) */
    for ( y = xy [ 1 ] ; y <= xy [ 1 ] + 1 ; y ++ ) {
      for ( x = 0 ; x < xy [ 0 ] ; x ++ ) {
        answer += answers [ [ x , y ] ] || 0 ; // Accumulate paths, treating undefined entries as zero
      }
    }

    console . log ( answer ) ; // Output the final calculated total path count for the current test case
  }
}


function show ( xy , answers ) { /* Helper function for debugging, displays the answers grid */
  var x , y , line ; // Declare local variables for loop counters and line construction
  for ( y = 0 ; y <= xy [ 1 ] ; y ++ ) { /* Iterate through rows of the answers grid to display */
    line = [ ] ; // Initialize an empty array to build the current row's output string
    for ( x = 0 ; x < xy [ 0 ] ; x ++ ) { /* Iterate through columns within the current row */
      line . push ( answers [ [ x , y ] ] || 0 ) ; // Add the path count for the cell, or 0 if it's undefined
    }
    console . log ( line . join ( ' ' ) ) ; // Print the row's values, joined by spaces
  }
}


var input = '' ; // Global variable to store all input data read from stdin

process . stdin . resume ( ) ; // Ensure the standard input stream is open and ready to receive data
process . stdin . setEncoding ( 'utf8' ) ; // Set the encoding for the input stream to UTF-8

process . stdin . on ( 'data' , function ( chunk ) { /* Event listener for incoming data chunks from stdin */
  input += chunk ; // Append the received data chunk to the 'input' string
} ) ;

process . stdin . on ( 'end' , function ( ) { /* Event listener for the 'end' event, fired when no more data is expected on stdin */
  input = input . split ( '\n' ) ; // Split the accumulated input string into an array of lines
  main ( ) ; // Call the main function to begin processing the parsed input
} ) ;