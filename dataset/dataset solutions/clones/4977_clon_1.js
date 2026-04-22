function Main( input )
{
  input = input . split ( "\n" ) ; // Split the entire input string into an array of lines

  // Extract grid dimensions H (Height) and W (Width) from the first line
　const H = input [ 0 ] . split ( " " ) [ 0 ] - 0 ; /* Convert first part to number */
  const W = input [ 0 ] . split ( " " ) [ 1 ] - 0 ; // Convert second part to number

  var answer = new Array ( 10 ) ; // Initialize an array to store counts of cells with 0 to 9 marked neighbors

  answer . fill ( 0 ) ; // Set all initial counts to zero

  // Calculate the initial count for cells with zero marked neighbors.
  // This is the total number of "inner" cells (not on the outer border) minus any marked cells.
  // We assume initially no cells are marked, so all inner cells have 0 marked neighbors.
  answer [ 0 ] = ( H - 2 ) * ( W - 2 ) ;

  if ( input . length === 1 )
  {
    // If the input contains only the H and W line, it means no cells are marked.
    // In this case, the answer array is already correctly initialized.
    console . log ( answer . join ( "\n" ) ) ; // Output the counts separated by newlines
    return ; // Exit the function
  }

  // Create a 2D array (grid) to represent the HxW area.
  // 'true' will indicate a cell is marked, 'false' otherwise.
  var array = new Array ( H ) ;
  for ( var i = 0 ; i < H ; i ++ )
  {
    array [ i ] = new Array ( W ) ; // Initialize each row with a new array
    array [ i ] . fill ( false ) ; // Set all cells to 'false' (unmarked) by default
  }

  var temp ;    // Temporary variable to hold parsed coordinates
  var counter ; // Counter for marked neighbors

  // Iterate through the input lines starting from the second line (index 1),
  // as these lines contain the coordinates of the marked cells.
  for ( var i = 1 ; i < input . length ; i ++ )
  {
    temp = input [ i ] . split ( " " ) ; // Split the current line (e.g., "X Y") into an array ["X", "Y"]

    // Adjust coordinates from 1-indexed (as typically given in problems) to 0-indexed
    [ 0 , 1 ] . forEach ( e => {
      temp [ e ] -= 1 ; // Decrement both X and Y coordinates by 1
    } ) ;

    array [ temp [ 0 ] ] [ temp [ 1 ] ] = true ; // Mark the specified cell in the grid as 'true'

    // Now, we need to update the neighbor counts for all 3x3 squares
    // that are affected by this newly marked cell.
    // A newly marked cell (temp[0], temp[1]) can affect 3x3 squares
    // whose top-left corner is within the 3x3 region centered at (temp[0], temp[1]).
    [ -1 , 0 , 1 ] . forEach ( a => { // Relative row offset for the top-left corner of the 3x3 square
      [ -1 , 0 , 1 ] . forEach ( b => { // Relative column offset for the top-left corner of the 3x3 square

        // Check if the current 3x3 square's top-left corner (temp[0]+a, temp[1]+b)
        // is within the valid "inner" part of the grid (excluding the outermost 1-unit border).
        // This ensures we only count 3x3 squares that are entirely within the grid
        // and whose center can have 8 neighbors.
        if ( 1 <= a + temp [ 0 ] && a + temp [ 0 ] < H - 1 && 1 <= b + temp [ 1 ] && b + temp [ 1 ] < W - 1 )
        {
          counter = 0 ; // Reset the neighbor counter for the current 3x3 square

          // Iterate through the 3x3 neighborhood around (temp[0]+a, temp[1]+b)
          [ -1 , 0 , 1 ] . forEach ( c => { // Relative row offset for a neighbor within the 3x3 square
            [ -1 , 0 , 1 ] . forEach ( d => { // Relative column offset for a neighbor within the 3x3 square
              // If the neighbor cell is marked, increment the counter
              counter += array [ temp [ 0 ] + a + c ] [ temp [ 1 ] + b + d ] ? 1 : 0 ;
            } ) ;
          } ) ;

          // Adjust the answer array based on the new count of marked neighbors for this 3x3 square.
          // Since one cell in this 3x3 square was just marked, its previous count of neighbors (counter-1)
          // decreases by one, and its new count of neighbors (counter) increases by one.
          answer [ counter - 1 ] -- ; // Decrement the count for the old number of marked neighbors
          answer [ counter ] ++ ;     // Increment the count for the new number of marked neighbors
        }
      } ) ;
    } ) ;
  }

  console . log ( answer . join ( "\n" ) ) ; // Output the final results, each count on a new line
}

/* This section is for standard input/output handling. Please do not modify this part. */
Main( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;