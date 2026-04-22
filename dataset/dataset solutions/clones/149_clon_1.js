/*
 * This JavaScript code implements a pathfinding or maze-solving algorithm.
 * It reads input from stdin, processes it into a 2D array (matrix),
 * and then attempts to find a path using a recursive 'move' function.
 * The 'move' function explores different directions (R, L, D, U) based on
 * the current direction and checks validity using the 'mm' helper function.
 * The goal appears to be to return a string representing the path taken.
 */

// Immediately Invoked Function Expression (IIFE) to encapsulate the main logic.
( function ( input ) {
  // Remove trailing newline character from input and split it into lines.
  var p = input.replace( /\n$/, '' ) .split( '\n' ) ;

  // Declare a variable 'm' to store the processed matrix.
  var m = [ ] ;

  /*
   * Loop through each line of the input 'p'.
   * Convert each character in the line to a number and push it as a row
   * into the 'm' matrix.
   */
  for ( var i = 0 ; i < p.length ; i ++ ) {
    m.push( p[ i ].split( '' ).map( Number ) )
  }

  // Log the initial direction 'R' concatenated with the result of the 'move' function.
  // The 'move' function is called with the matrix 'm', starting coordinates (0,0),
  // and an initial direction 'R'.
  console.log( 'R' + move( m, 0, 0, 'R' ) ) ;
} ) ( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ) ; /* Read input from stdin */


/*
 * Recursive function to navigate through the matrix.
 * m: The 2D matrix representing the maze.
 * x: Current x-coordinate (column).
 * y: Current y-coordinate (row).
 * d: Current direction ('R', 'L', 'D', 'U').
 */
function move( m, x, y, d ) {
  // Log current state for debugging purposes.
  console.log( m, x, y, d ) ;

  // Base case: If we are back at the start (0,0) and the direction is 'L',
  // it implies a full cycle or completion, so return an empty string.
  if ( x === 0 && y === 0 && d === 'L' ) {
    return '' ;
  }

  // --- Logic for moving when current direction is 'R' (Right) ---
  if ( d === 'R' ) {
    // Try moving Up-Right (x+1, y-1)
    if ( mm( m, x + 1, y - 1 ) ) {
      return 'U' + move( m, x + 1, y - 1, 'U' ) ;
    }
    // Try moving Right (x+1, y)
    if ( mm( m, x + 1, y ) ) {
      return 'R' + move( m, x + 1, y, 'R' ) ;
    }
    // Try moving Down-Right (x+1, y+1)
    if ( mm( m, x + 1, y + 1 ) ) {
      return 'D' + move( m, x + 1, y + 1, 'D' ) ;
    }
    // If no forward/diagonal moves are possible, turn Left (stay at current position).
    return 'L' + move( m, x, y, 'L' ) ;
  }

  // --- Logic for moving when current direction is 'L' (Left) ---
  if ( d === 'L' ) {
    // Try moving Down-Left (x, y+1) - Note: This might be a conceptual error in original,
    // as moving 'L' would typically involve x-1. However, adhering to Type I clone.
    if ( mm( m, x, y + 1 ) ) {
      return 'D' + move( m, x, y + 1, 'D' ) ;
    }
    // Try moving Left (x-1, y)
    if ( mm( m, x - 1, y ) ) {
      return 'L' + move( m, x - 1, y, 'L' ) ;
    }
    // Try moving Up-Left (x, y-1)
    if ( mm( m, x, y - 1 ) ) {
      return 'U' + move( m, x, y - 1, 'U' ) ;
    }
    // If no forward/diagonal moves are possible, turn Right (stay at current position).
    return 'R' + move( m, x, y, 'R' ) ;
  }

  // --- Logic for moving when current direction is 'D' (Down) ---
  if ( d === 'D' ) {
    // Try moving Right-Down (x, y+1)
    if ( mm( m, x, y + 1 ) ) {
      return 'R' + move( m, x, y + 1, 'R' ) ;
    }
    // Try moving Down (x, y+2) - Note: y+2 implies a jump, likely specific to the maze structure.
    if ( mm( m, x, y + 2 ) ) {
      return 'D' + move( m, x, y + 2, 'D' ) ;
    }
    // Try moving Left-Down (x-1, y+1)
    if ( mm( m, x - 1, y + 1 ) ) {
      return 'L' + move( m, x - 1, y + 1, 'L' ) ;
    }
    // If no forward/diagonal moves are possible, turn Up (stay at current position).
    return 'U' + move( m, x, y, 'U' ) ;
  }

  // --- Logic for moving when current direction is 'U' (Up) ---
  if ( d === 'U' ) {
    // Try moving Left-Up (x-1, y-1)
    if ( mm( m, x - 1, y - 1 ) ) {
      return 'L' + move( m, x - 1, y - 1, 'L' ) ;
    }
    // Try moving Up (x, y-2) - Note: y-2 implies a jump, similar to 'D' direction.
    if ( mm( m, x, y - 2 ) ) {
      return 'U' + move( m, x, y - 2, 'U' ) ;
    }
    // Try moving Right-Up (x, y-1)
    if ( mm( m, x, y - 1 ) ) {
      return 'R' + move( m, x, y - 1, 'R' ) ;
    }
    // If no forward/diagonal moves are possible, turn Down (stay at current position).
    return 'D' + move( m, x, y, 'D' ) ;
  }
}


/*
 * Helper function 'mm' (matrix check) to validate coordinates and cell value.
 * m: The 2D matrix.
 * x: x-coordinate (column) to check.
 * y: y-coordinate (row) to check.
 * Returns 1 if the coordinates are valid and the cell value is 1, otherwise 0.
 */
function mm( m, x, y ) {
  // Check if y-coordinate is out of bounds (less than 0 or greater than/equal to matrix height).
  if ( y < 0 || y >= m.length ) {
    return 0 ; // Invalid y-coordinate.
  }
  // Check if x-coordinate is out of bounds (less than 0 or greater than/equal to row width).
  if ( x < 0 || x >= m[ y ].length ) {
    return 0 ; // Invalid x-coordinate.
  }
  // Return true if the cell at (y, x) contains the value 1, false otherwise.
  return m[ y ][ x ] === 1 ;
}