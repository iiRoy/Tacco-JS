/*
 * This JavaScript file processes a square grid of characters.
 * It reads the grid from standard input and determines
 * the count of "good" transformations.
 *
 * A transformation is defined by two offsets (a, b).
 * A transformation is "good" if the resulting grid
 * is symmetric with respect to its main diagonal.
 *
 * This means for every cell (i, j) in the original grid,
 * the transformed cell at ( (i+a)%n , (j+b)%n ) must be equal to
 * the transformed cell at ( (j+a)%n , (i+b)%n ).
 *
 * The program then prints the total count of such "good" transformations.
 */

// Core module for file system operations.
var lines = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . split ( "\n" ) ;

// The first line of input represents the size 'n' of the square grid.
// The `| 0` is a bitwise OR operation used here as a fast way to convert to integer.
var n = lines [ 0 ] | 0 ;

// The remaining lines of input form the grid itself.
// `slice(1)` extracts all elements from index 1 to the end.
var s = lines . slice ( 1 ) ;


/**
 * Checks if a given transformation (a, b) results in a "good" grid.
 * A transformation is "good" if the grid, when cells are remapped by (a, b),
 * becomes symmetric with respect to its main diagonal.
 *
 * @param {number} a - The row offset for the transformation.
 * @param {number} b - The column offset for the transformation.
 * @returns {number} - Returns 1 if the transformation is good, 0 otherwise.
 */
function good ( a , b )
{
  // Iterate through each cell (i, j) of the original grid.
  for ( var i = 0 ; i < n ; ++i )
  {
    for ( var j = 0 ; j < n ; ++j )
    {
      // Calculate the transformed coordinates for the cell (i, j)
      // and its symmetric counterpart (j, i) using modulo arithmetic
      // to handle wrap-around in the grid.
      //
      // Check if the character at the transformed (i, j) position
      // is NOT equal to the character at the transformed (j, i) position.
      // If they are not equal, the grid is not symmetric for this transformation.
      if ( s [ ( i + a ) % n ] [ ( j + b ) % n ] !== s [ ( j + a ) % n ] [ ( i + b ) % n ] )
      {
        // If an asymmetry is found, this transformation is not "good".
        return 0 ;
      }
    }
  }

  // If the loops complete without finding any asymmetry,
  // then the transformation (a, b) is "good".
  return 1 ;
}

// Initialize a counter for the number of "good" transformations found.
var ans = 0 ;

// Iterate through all possible row offsets 'a' from 0 to n-1.
for ( var a = 0 ; a < n ; ++a )
{

  // For each row offset 'a', iterate through all possible column offsets 'b' from 0 to n-1.
  for ( var b = 0 ; b < n ; ++b )
  {
    // Call the 'good' function for the current (a, b) pair.
    // The result (0 or 1) is added to the total count.
    ans += good ( a , b ) ; // Accumulate the count of good transformations.
  }
}

// Finally, print the total number of "good" transformations to the console.
console . log ( ans ) ;