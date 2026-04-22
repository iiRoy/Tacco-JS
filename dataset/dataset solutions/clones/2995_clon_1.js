'use strict'; // This directive enforces strict mode for the entire script.

// This is the main function that processes the input and determines the outcome.
function Main ( input )
{
  // First, we parse the input string. It's expected to be a series of
  // space-separated values. The split(/\s+/) method handles one or more
  // whitespace characters as delimiters.
  input = input.split( /\s+/ );

  // Next, we extract various parameters from the input array using 'shift()'.
  // The '-0' idiom is a concise way to convert a string to a number in JavaScript.
  // It's equivalent to Number(input.shift()) or parseInt(input.shift(), 10).
  var H = input.shift() - 0; // Represents the height of the grid.
  var W = input.shift() - 0; // Represents the width of the grid.

  var N = input.shift() - 0; // Represents the total number of moves.

  var sr = input.shift() - 0; // Represents the starting row of the player.
  var sc = input.shift() - 0; // Represents the starting column of the player.

  var S = input.shift(); // This string contains the player's sequence of moves.
  var T = input.shift(); // This string contains the enemy's sequence of moves.

  /*
   * The 'dp' array (dynamic programming) will store the boundaries of the
   * reachable area for the player at each step.
   * dp[i] will be an array of four values:
   * [ minimum_column_reachable, maximum_column_reachable, minimum_row_reachable, maximum_row_reachable ]
   * All coordinates are 1-indexed.
   */
  var dp = [
    [ sc, sc, sr, sr ] // Initial state: the player is at (sc, sr), so the reachable area is just that single cell.
  ];

  // We iterate through each move, from the first move (index 0) up to N-1.
  for ( let i = 0; i < N; i++ )
  {
    // Initialize the boundaries for the next state (i+1).
    dp[ i + 1 ] = [];

    // Calculate the potential new boundaries based on the player's move S[i].
    // If S[i] is 'L' (Left), the minimum reachable column decreases by 1.
    dp[ i + 1 ][ 0 ] = dp[ i ][ 0 ] - ( S[ i ] === 'L' ? 1 : 0 );
    // If S[i] is 'R' (Right), the maximum reachable column increases by 1.
    dp[ i + 1 ][ 1 ] = dp[ i ][ 1 ] + ( S[ i ] === 'R' ? 1 : 0 );
    // If S[i] is 'U' (Up), the minimum reachable row decreases by 1.
    dp[ i + 1 ][ 2 ] = dp[ i ][ 2 ] - ( S[ i ] === 'U' ? 1 : 0 );
    // If S[i] is 'D' (Down), the maximum reachable row increases by 1.
    dp[ i + 1 ][ 3 ] = dp[ i ][ 3 ] + ( S[ i ] === 'D' ? 1 : 0 );

    // Check if the player's potential move takes them out of the grid boundaries.
    // The grid is 1-indexed, so valid columns are [1, W] and valid rows are [1, H].
    // A minimum column of 0 means moving past the left edge.
    // A maximum column of W+1 means moving past the right edge.
    // A minimum row of 0 means moving past the top edge.
    // A maximum row of H+1 means moving past the bottom edge.
    if ( dp[ i + 1 ][ 0 ] === 0        || // Player's min_col is less than 1
         dp[ i + 1 ][ 1 ] === W + 1    || // Player's max_col is greater than W
         dp[ i + 1 ][ 2 ] === 0        || // Player's min_row is less than 1
         dp[ i + 1 ][ 3 ] === H + 1 )    // Player's max_row is greater than H
    {
      // If the player is forced out of bounds, they cannot survive.
      console.log( 'NO' );
      return; // Terminate the function early.
    }

    // Now, consider the enemy's move T[i]. The enemy's move *restricts* the player's
    // reachable area. It effectively "pushes" the boundaries of the player's safe zone.

    // If T[i] is 'R' (enemy moves right), it means the player's safe zone
    // cannot extend too far left. The minimum column might be pushed right by 1.
    // Also, the minimum column cannot exceed the grid's maximum width W.
    dp[ i + 1 ][ 0 ] = Math.min( dp[ i + 1 ][ 0 ] + ( T[ i ] === 'R' ? 1 : 0 ), W );
    // If T[i] is 'L' (enemy moves left), the player's safe zone cannot extend
    // too far right. The maximum column might be pushed left by 1.
    // Also, the maximum column cannot go below the grid's minimum column 1.
    dp[ i + 1 ][ 1 ] = Math.max( dp[ i + 1 ][ 1 ] - ( T[ i ] === 'L' ? 1 : 0 ), 1 );
    // If T[i] is 'D' (enemy moves down), the player's safe zone cannot extend
    // too far up. The minimum row might be pushed down by 1.
    // Also, the minimum row cannot exceed the grid's maximum height H.
    dp[ i + 1 ][ 2 ] = Math.min( dp[ i + 1 ][ 2 ] + ( T[ i ] === 'D' ? 1 : 0 ), H );
    // If T[i] is 'U' (enemy moves up), the player's safe zone cannot extend
    // too far down. The maximum row might be pushed up by 1.
    // Also, the maximum row cannot go below the grid's minimum row 1.
    dp[ i + 1 ][ 3 ] = Math.max( dp[ i + 1 ][ 3 ] - ( T[ i ] === 'U' ? 1 : 0 ), 1 );
  }

  // If the loop completes without returning 'NO', it means the player
  // always has at least one valid cell to move to, and thus can survive.
  console.log( 'YES' );
}

// This line is standard for competitive programming in Node.js.
// It reads the entire standard input as a UTF-8 string and passes it
// to the Main function for processing.
Main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );