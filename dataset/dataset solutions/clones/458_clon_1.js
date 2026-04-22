/*
 * This is the primary function that orchestrates the entire process.
 * It reads input, initializes the game board, processes blocks,
 * and determines if a path exists to the goal.
 */
function main ( )
{ // Start of main function body

  // Declare variables used within this scope.
  var
    i = 0 , /* loop counter / input index */
    j ,     /* inner loop counter */
    wh ,    /* width and height of the board */
    startXY , /* starting coordinates */
    goalXY ,  /* goal coordinates */
    n ,       /* number of blocks to place */
    board ;   /* the game board itself */

  // Infinite loop for processing multiple test cases.
  // The loop breaks when width and height are both zero.
  for ( ; ; ) {

    // Read board dimensions (width and height) from input.
    wh = input [ i++ ] . split ( ' ' ) . map ( Number ) ;

    // Check for termination condition: if both dimensions are zero, exit.
    if ( ! wh [ 0 ]  &&  ! wh [ 1 ] )
    {
      break ; // Exit the main processing loop.
    }

    // Initialize the game board with the given dimensions.
    board = initBoard ( wh [ 0 ] , wh [ 1 ] ) ;


    // Read starting coordinates for the pathfinding.
    startXY = input [ i++ ] . split ( ' ' ) . map ( Number ) ;
    // Read goal coordinates for the pathfinding.
    goalXY  = input [ i++ ] . split ( ' ' ) . map ( Number ) ;
    // Read the number of blocks to be placed on the board.
    n = Number ( input [ i++ ] ) ;

    // Loop to place each block as specified in the input.
    for ( j = 0 ; j < n ; j++ )
    {
      // Use bind and apply to call putBlock with board as the first argument,
      // and the remaining arguments from the parsed input line.
      putBlock . bind ( null , board ) . apply ( null , input [ i++ ] . split ( ' ' ) . map ( Number ) ) ;
    } // End of block placement loop.


    // Determine if a path exists from start to goal and print the result.
    console . log ( canGoToGoal ( board , startXY , goalXY )  ?  'OK'  :  'NG' ) ;

  } // End of main test case loop.
} // End of main function.

// Function to create and initialize a new game board.
// All cells are initially set to 0.
function initBoard ( w ,  h )
{
  var
    i , // Loop counter for width
    j , // Loop counter for height
    board = [ ] ; // The 2D array representing the board


  // Iterate through each column (width).
  for ( i = 0 ; i < w ; i++ )
  {
    board . push ( [ ] ) ; // Add a new row.

    // Iterate through each row (height) for the current column.
    for ( j = 0 ; j < h ; j++ )
    {
      board [ i ] [ j ] = 0 ; // Initialize cell value to zero.
    }
  }

  // Return the newly created and initialized board.
  return board ;
}

/**
 * Places a block onto the game board.
 * The block's shape and size depend on the 'd' parameter.
 *
 * @param {Array<Array<Number>>} board - The game board.
 * @param {Number} c - The value to assign to the cells covered by the block.
 * @param {Number} d - The block type/orientation (0 or 1).
 * @param {Number} x - The 1-based x-coordinate of the block's top-left corner.
 * @param {Number} y - The 1-based y-coordinate of the block's top-left corner.
 */
function putBlock ( board , c , d , x , y )
{
  var
    i , // Loop index for block width
    j , // Loop index for block height
    b = [ [ 4 , 2 ] , [ 2 , 4 ] ] [ d ] ; // Determines block dimensions based on 'd'

  // Loop through the width of the block.
  for ( i = 0 ; i < b [ 0 ] ; i++ )
  {
    // Loop through the height of the block.
    for ( j = 0 ; j < b [ 1 ] ; j++ )
    {
      // Assign the block value 'c' to the corresponding cell on the board.
      // Adjust x and y for 0-based indexing.
      board [ x - 1 + i ] [ y - 1 + j ] = c ;
    }
  }
}

/*
 * This function implements a Breadth-First Search (BFS)
 * to determine if a path exists from the start coordinates
 * to the goal coordinates on the given board.
 * It considers 8-directional movement.
 */
function canGoToGoal ( board ,  startXY ,  goalXY )
{
  var
    queue = [ ] , // Queue for BFS traversal
    to = [          // Array of 8 possible directions (dx, dy)
           [ -1 , -1 ] , [  0 , -1 ] , [  1 , -1 ] ,
           [ -1 ,  0 ] ,                  [  1 ,  0 ] ,
           [ -1 ,  1 ] , [  0 ,  1 ] , [  1 ,  1 ]
         ] ,
    sx = startXY [ 0 ] - 1 , // Start X coordinate (0-indexed)
    sy = startXY [ 1 ] - 1 , // Start Y coordinate (0-indexed)
    gx = goalXY   [ 0 ] - 1 , // Goal X coordinate (0-indexed)
    gy = goalXY   [ 1 ] - 1 , // Goal Y coordinate (0-indexed)
    xy , x , y ,             // Current coordinates during traversal
    m = { } ,                // Map to keep track of visited cells
    c = board [ sx ] [ sy ] ; // Value of the starting cell (must be non-zero)

  // If the starting cell is 0, it means it's an empty or blocked path,
  // so no path can originate from it.
  if ( c === 0 )
  {
    return false ;
  }

  // Add the starting position to the queue.
  // The third element is an empty object, but it's not used in this specific BFS implementation.
  queue . push ( [ sx , sy , { } ] ) ;

  // Begin BFS traversal. Loop continues as long as there are elements in the queue.
  for ( ; queue . length >= 1 ; )
  {
    xy = queue . shift ( ) ; // Dequeue the next position.
    x = xy [ 0 ] ;           // Extract x-coordinate.
    y = xy [ 1 ] ;           // Extract y-coordinate.

    // Mark the current cell as visited.
    // Using a string representation of the [x, y] array as a map key.
    m [ [ x , y ] ] = true ;

    // Check boundary conditions and if the cell's value matches the starting cell's value.
    // If out of bounds or value mismatch, this path is invalid, so continue to the next queued item.
    if ( x < 0  ||  board . length <= x  ||  c !== board [ x ] [ y ] )
    {
      continue ;
    }

    // If the current cell is the goal cell, a path has been found.
    if ( x === gx  &&  y === gy )
    {
      return true ; // Path found!
    }

    // Explore all 8 neighboring cells.
    for ( i = 0 ; i < 8 ; i++ )
    {
      // Calculate coordinates of the neighbor.
      var neighborX = x + to [ i ] [ 0 ] ;
      var neighborY = y + to [ i ] [ 1 ] ;

      // If the neighbor has not been visited yet, add it to the queue.
      if ( ! m [ [ neighborX , neighborY ] ] )
      {
        queue . push ( [ neighborX , neighborY ] ) ;
      }
    }
  }

  // If the loop finishes and the goal was not reached, no path exists.
  return false ;
}


// Global variable to accumulate all input data.
var
  input = '' ; // Initialize as an empty string.


// Set up standard input processing.
process . stdin . resume ( ) ;             // Keep the process alive for input.
process . stdin . setEncoding ( 'utf8' ) ; // Specify character encoding.

// Event listener for incoming data chunks.
process . stdin . on ( 'data' , function ( chunk ) {
  input += chunk ; // Append each chunk of data to the 'input' string.
} ) ;

// Event listener for the 'end' of input stream.
process . stdin . on ( 'end' , function ( ) {
  // Once all input is received, split it by newlines into an array.
  input = input . split ( '\n' ) ;
  // Call the main function to start processing the input.
  main ( ) ;
} ) ;