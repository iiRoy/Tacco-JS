( function ( rawData ) {
  // This section processes the initial input string.
  // It removes any trailing newline and then splits the input into individual lines.
  let lineSegments = rawData . replace ( / \n $ / , '' ) . split ( ' \n ' ) ;

  // A two-dimensional array (matrix) is initialized to store the parsed numerical data.
  const gridMatrix = [ ] ;

  // Iterate through each line segment obtained from the input.
  for ( let idx = 0 ; idx < lineSegments . length ; idx ++ )
  {
    // Each line is further split into individual characters, which are then converted to numbers.
    // These numerical arrays representing rows are pushed into the grid matrix.
    gridMatrix . push ( lineSegments [ idx ] . split ( '' ) . map ( Number ) ) ;
  }

  // The main traversal function is called to find a path, starting at (0,0) with an initial 'Right' direction.
  // The resulting path string is then printed to the console, prefixed with 'Right'.
  console . log ( 'Right' + traversePath ( gridMatrix , 0 , 0 , 'Right' ) ) ;
} ) ( require ( ' fs ' ) . readFileSync ( ' /dev/stdin ' , ' utf8 ' ) ) ; // Reads content from standard input synchronously.

// This recursive function attempts to find a valid path through the grid.
function traversePath ( currentGrid , currentX , currentY , currentDirection )
{
  // Logs the current state (grid, coordinates, and direction) for debugging purposes.
  console . log ( currentGrid , currentX , currentY , currentDirection ) ;

  // Base case for stopping the recursion: If the traversal returns to the origin (0,0)
  // and attempts to move 'Left', it indicates a loop or an invalid starting condition.
  if ( currentX === 0 && currentY === 0 && currentDirection === 'Left' )
  {
    return '' ; // Returns an empty string to terminate the path.
  }

  // Logic for moving when the current direction is 'Right'.
  if ( currentDirection === 'Right' )
  {
    // First, attempt a diagonal 'Up' and 'Right' move.
    if ( checkBoundary ( currentGrid , currentX + 1 , currentY - 1 ) )
    {
      return 'Up' + traversePath ( currentGrid , currentX + 1 , currentY - 1 , 'Up' ) ;
    }
    // If not possible, attempt a straight 'Right' move.
    if ( checkBoundary ( currentGrid , currentX + 1 , currentY ) )
    {
      return 'Right' + traversePath ( currentGrid , currentX + 1 , currentY , 'Right' ) ;
    }
    // If not possible, attempt a diagonal 'Down' and 'Right' move.
    if ( checkBoundary ( currentGrid , currentX + 1 , currentY + 1 ) )
    {
      return 'Down' + traversePath ( currentGrid , currentX + 1 , currentY + 1 , 'Down' ) ;
    }
    // If none of the above are valid, make a 'Left' turn without moving position.
    return 'Left' + traversePath ( currentGrid , currentX , currentY , 'Left' ) ;
  }

  // Logic for moving when the current direction is 'Left'.
  if ( currentDirection === 'Left' )
  {
    // First, attempt a diagonal 'Down' and 'Left' move.
    if ( checkBoundary ( currentGrid , currentX , currentY + 1 ) )
    {
      return 'Down' + traversePath ( currentGrid , currentX , currentY + 1 , 'Down' ) ;
    }
    // If not possible, attempt a straight 'Left' move.
    if ( checkBoundary ( currentGrid , currentX - 1 , currentY ) )
    {
      return 'Left' + traversePath ( currentGrid , currentX - 1 , currentY , 'Left' ) ;
    }
    // If not possible, attempt a diagonal 'Up' and 'Left' move.
    if ( checkBoundary ( currentGrid , currentX , currentY - 1 ) )
    {
      return 'Up' + traversePath ( currentGrid , currentX , currentY - 1 , 'Up' ) ;
    }
    // If none of the above are valid, make a 'Right' turn without moving position.
    return 'Right' + traversePath ( currentGrid , currentX , currentY , 'Right' ) ;
  }

  // Logic for moving when the current direction is 'Down'.
  if ( currentDirection === 'Down' )
  {
    // First, attempt a 'Right' turn and then 'Down' move.
    if ( checkBoundary ( currentGrid , currentX , currentY + 1 ) )
    {
      return 'Right' + traversePath ( currentGrid , currentX , currentY + 1 , 'Right' ) ;
    }
    // If not possible, attempt a double 'Down' move.
    if ( checkBoundary ( currentGrid , currentX , currentY + 2 ) )
    {
      return 'Down' + traversePath ( currentGrid , currentX , currentY + 2 , 'Down' ) ;
    }
    // If not possible, attempt a 'Left' turn and then 'Down' move.
    if ( checkBoundary ( currentGrid , currentX - 1 , currentY + 1 ) )
    {
      return 'Left' + traversePath ( currentGrid , currentX - 1 , currentY + 1 , 'Left' ) ;
    }
    // If none of the above are valid, make an 'Up' turn without moving position.
    return 'Up' + traversePath ( currentGrid , currentX , currentY , 'Up' ) ;
  }

  // Logic for moving when the current direction is 'Up'.
  if ( currentDirection === 'Up' )
  {
    // First, attempt a 'Left' turn and then 'Up' move.
    if ( checkBoundary ( currentGrid , currentX - 1 , currentY - 1 ) )
    {
      return 'Left' + traversePath ( currentGrid , currentX - 1 , currentY - 1 , 'Left' ) ;
    }
    // If not possible, attempt a double 'Up' move.
    if ( checkBoundary ( currentGrid , currentX , currentY - 2 ) )
    {
      return 'Up' + traversePath ( currentGrid , currentX , currentY - 2 , 'Up' ) ;
    }
    // If not possible, attempt a 'Right' turn and then 'Up' move.
    if ( checkBoundary ( currentGrid , currentX , currentY - 1 ) )
    {
      return 'Right' + traversePath ( currentGrid , currentX , currentY - 1 , 'Right' ) ;
    }
    // If none of the above are valid, make a 'Down' turn without moving position.
    return 'Down' + traversePath ( currentGrid , currentX , currentY , 'Down' ) ;
  }
}

// This helper function verifies if a given coordinate (colCoord, rowCoord) is within the bounds
// of the provided matrixData and if the cell at that coordinate contains the value 1.
function checkBoundary ( matrixData , colCoord , rowCoord )
{
  // Check if the row coordinate is outside the vertical limits of the grid.
  if ( rowCoord < 0 || rowCoord >= matrixData . length )
  {
    return false ; // Coordinate is out of bounds vertically.
  }

  // Check if the column coordinate is outside the horizontal limits for the specific row.
  if ( colCoord < 0 || colCoord >= matrixData [ rowCoord ] . length )
  {
    return false ; // Coordinate is out of bounds horizontally.
  }

  // If within bounds, check if the cell value is 1, indicating a traversable path segment.
  return matrixData [ rowCoord ] [ colCoord ] === 1 ;
}