/* Helper functions for common parsing and array operations */

// Parses a string into an integer.
function pint( s )
{
  return parseInt( s );
}

// Parses a string into a floating-point number.
function pfloat( s )
{
  return parseFloat( s );
}

// Checks if a number is even.
function even( s )
{
  return ( s % 2 ) === 0;
}

// Checks if a number is odd.
function odd( s )
{
  return ( s % 2 ) === 1;
}


// Extends Array.prototype with custom sorting and utility methods.

// Sorts numbers in ascending order.
Array.prototype.sortNumAsc = function ( )
{
  return this.sort( ( a, b ) => ( a - b ) );
}

// Sorts numbers in descending order.
Array.prototype.sortNumDesc = function ( )
{
  return this.sort( ( a, b ) => ( b - a ) );
}

// Sorts strings in ascending (lexicographical) order.
Array.prototype.sortStrAsc = function ( )
{
  return this.sort( );
}

// Sorts strings in descending (reverse lexicographical) order.
Array.prototype.sortStrDesc = function ( )
{
  return this.sort( ).reverse( );
}

// Returns a new array with all occurrences of 'x' removed.
Array.prototype.without = function ( x )
{
  return this.filter( e => e !== x );
}



/**
 * Main function to solve the problem.
 * @param {string[]} lines - An array of input lines.
 */
function main( lines )
{
  // Parse the first line for H, W, and K.
  var arr = lines[ 0 ].split( ' ' ).map( pint );

  var H = arr[ 0 ]; // Height of the stage
  var W = arr[ 1 ]; // Width of the stage
  var K = arr[ 2 ]; // Max steps allowed

  var S = [ ]; // Starting coordinates [h, w]

  /*
   * Process the stage layout from the input lines.
   * Each line after the first represents a row of the stage.
   */
  var stage = lines.slice( 1 ).map( l => l.split( '' ) );

  // Locate the starting point 'S' on the stage.
  outer: for ( var h = 0; h < H; h++ )
  {
    for ( var w = 0; w < W; w++ )
    {
      if ( stage[ h ][ w ] === 'S' )
      {
        S = [ h, w ]; // Store starting coordinates
        break outer;  // Exit both loops once 'S' is found
      }
    }
  }


  /**
   * Performs a depth-first search (DFS) to explore reachable cells.
   * Updates the stage grid with the minimum steps to reach each cell.
   * @param {number} h - Current row.
   * @param {number} w - Current column.
   * @param {number} i - Current number of steps taken.
   */
  function search( h, w, i )
  {
      // If steps exceed K, stop exploring this path.
    if ( i > K )
    {
      return;
    }

      // If out of bounds, stop exploring this path.
    if ( h < 0 || H <= h || w < 0 || W <= w )
    {
      return;
    }

    var p = stage[ h ][ w ]; // Current cell's value


    // Explore only if the cell is traversable or allows an update with fewer steps.
    if (
      p === '.' ||                 // Empty cell
      p === 'S' ||                 // Starting cell
      ( ( typeof p === 'number' ) && p > i ) // Already visited but current path is shorter
    )
    {
      stage[ h ][ w ] = i; // Mark cell with current steps

      // Recursively search in all four cardinal directions.
      search( h - 1, w, i + 1 ); // Up
      search( h + 1, w, i + 1 ); // Down
      search( h, w - 1, i + 1 ); // Left
      search( h, w + 1, i + 1 ); // Right
    }
  }

  // Start the search from the 'S' location with 0 steps.
  search( S[ 0 ], S[ 1 ], 0 );


  /**
   * Calculates the minimum steps required to reach any border from a given cell (h, w).
   * @param {number} h - Row coordinate.
   * @param {number} w - Column coordinate.
   * @returns {number} The minimum distance to any edge.
   */
  function min_step_to_out( h, w )
  {
    var a = ( H - 1 ) - h; // Distance to bottom edge
    var b = h;             // Distance to top edge
    var c = ( W - 1 ) - w; // Distance to right edge
    var d = w;             // Distance to left edge

    return Math.min( a, b, c, d );
  }


  var minimum = Infinity; // Initialize minimum steps to exit with a very large value.

  // Iterate through the entire stage to find the minimum steps to exit.
  outer: for ( var h = 0; h < H; h++ )
  {
    for ( var w = 0; w < W; w++ )
    {
      var p = stage[ h ][ w ]; // Current cell's value

      // Only consider cells that were reached during the search (marked with a number).
      if ( typeof p === 'number' )
      {
        var step = min_step_to_out( h, w ); // Calculate distance to nearest border from current cell.

        // If a cell is on the border and reachable, only 1 step is needed to exit.
        if ( step === 0 )
        {
          minimum = 1;
          break outer; // Found the absolute minimum, no need to search further.
        }

        /*
         * Update the overall minimum steps to exit.
         * The formula calculates the number of "K-step jumps" needed to reach the border
         * from the current cell, plus one for the initial jump to reach this cell.
         */
        minimum = Math.min( minimum, Math.ceil( step / K ) + 1 );
      }
    }
  }

  // Output the calculated minimum steps.
  console.log( minimum );
}


// Entry point: Read input from stdin, process it, and call the main function.
main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).split( '\n' ).map( l => l.trim( ) ) );