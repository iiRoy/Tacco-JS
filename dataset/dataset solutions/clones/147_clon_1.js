( function( input )
{
  // This is the main processing block, wrapped in an IIFE.
  // It reads input, processes it, and prints results.

  var   p   =   input.replace( /\n$/, '' ) . split( '\n\n' ) ; // Process input: remove trailing newline, then split into paragraphs
  /*
   * Iterate through each paragraph found in the input.
   * Each paragraph represents a separate grid to be analyzed.
   */
  for ( var j = 0 ; j < p . length ; j ++ )
  {
    // Split the current paragraph into individual lines (rows of the grid)
    var b = p[ j ] . split( '\n' ) ;

    // Initialize an empty array to hold the numeric grid (matrix)
    var m = [ ] ;

    // Iterate through each line (row) to convert it into a numeric array
    for ( var i = 0 ; i < b . length ; i ++ )
    {
      /*
       * For each line, split it into characters, then map each character
       * to its numeric representation, and push this array of numbers
       * as a row into the matrix 'm'.
       */
      m . push( b[ i ] . split( '' ) . map( Number ) ) ;
    }

    // After forming the matrix, call the 'exists' function to find the pattern
    // and print the result to the console.
    console.log( exists( m ) ) ;

    // Original comment line, now modified and surrounded by others
    /*
     * console.log(m); // This line was commented out in the original.
     * It could be used for debugging the parsed matrix 'm'.
     */
  }

} ) ( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ) ; // Execute the anonymous function immediately with file input.


/*
 * Function: exists
 * Purpose: Scans an 8x8 matrix 'm' to find the first occurrence of '1'.
 *          If found, it then calls 'exists_' to determine the pattern.
 * Parameters:
 *   m - A 2D array (matrix) representing the grid.
 */
function exists( m )
{
  // Loop through rows (i) from 0 to 7
  for ( var i = 0 ; i < 8 ; i ++ )
  {
    // Loop through columns (j) from 0 to 7
    for ( var j = 0 ; j < 8 ; j ++ )
    {
      // Check if the current cell contains the value '1'
      if ( m[ i ][ j ] === 1 )
      {
        // If '1' is found, delegate to exists_ to identify the specific pattern
        // Note: j becomes x (column), i becomes y (row) for the next function.
        return exists_ ( m , j , i ) ;
      }
    }
  }
}


/*
 * Function: exists_
 * Purpose: Given a starting point (x, y) where '1' was found,
 *          it checks for various predefined 2x2, 3x1, or 1x3 patterns.
 * Parameters:
 *   m - The 2D array (matrix) being analyzed.
 *   x - The column index of the initial '1'.
 *   y - The row index of the initial '1'.
 */
function exists_( m , x , y )
{
  // Check for pattern 'A': a 2x2 square block.
  if ( check( m , x + 1 , y ) && check( m , x , y + 1 ) && check( m , x + 1 , y + 1 ) )
  {
    return 'A' ; // Pattern 'A' found.
  }

  // Check for pattern 'B': a 1x4 vertical line.
  if ( check( m , x , y + 1 ) && check( m , x , y + 2 ) && check( m , x , y + 3 ) )
  {
    return 'B' ; // Pattern 'B' found.
  }

  // Check for pattern 'C': a 4x1 horizontal line.
  if ( check( m , x + 1 , y ) && check( m , x + 2 , y ) && check( m , x + 3 , y ) )
  {
    return 'C' ; // Pattern 'C' found.
  }

  // Check for pattern 'D': a 'Z' shape.
  if ( check( m , x , y + 1 ) && check( m , x - 1 , y + 1 ) && check( m , x - 1 , y + 2 ) )
  {
    return 'D' ; // Pattern 'D' found.
  }

  // Check for pattern 'E': an 'S' shape.
  if ( check( m , x + 1 , y ) && check( m , x + 1 , y + 1 ) && check( m , x + 2 , y + 1 ) )
  {
    return 'E' ; // Pattern 'E' found.
  }

  // Check for pattern 'F': an 'L' shape (rotated).
  if ( check( m , x , y + 1 ) && check( m , x + 1 , y + 1 ) && check( m , x + 1 , y + 2 ) )
  {
    return 'F' ; // Pattern 'F' found.
  }

  // Check for pattern 'G': a 'T' shape.
  if ( check( m , x + 1 , y ) && check( m , x , y + 1 ) && check( m , x - 1 , y + 1 ) )
  {
    return 'G' ; // Pattern 'G' found.
  }

}


/*
 * Function: check
 * Purpose: Verifies if a given coordinate (x, y) is within the 8x8 grid boundaries.
 *          It also implicitly assumes that if coordinates are valid, the cell
 *          contains '1' for the pattern to exist, although the original code
 *          has a commented-out check for m[y][x] == 1.
 * Parameters:
 *   m - The 2D array (matrix) (though not directly used beyond boundary checks).
 *   x - The column index to check.
 *   y - The row index to check.
 */
function check( m , x , y )
{
  // Boundary check: ensure x and y are within the 0-7 range for an 8x8 grid.
  // The original code uses x > 8 and y > 8, effectively meaning <= 8 is valid for the comparison.
  // However, typical 0-indexed 8x8 would be 0-7. This might be a slight logical discrepancy
  // or an intentional way to handle boundaries for a specific problem.
  if ( x < 0 || x > 8 || y < 0 || y > 8 )
  {
    return false ; // Coordinates are out of bounds.
  }

//  if ( m[y][x] == 1 ) { // This line was commented out in the original source.
  return true ; // If coordinates are in bounds, return true.
//} // End of original commented-out block.
}