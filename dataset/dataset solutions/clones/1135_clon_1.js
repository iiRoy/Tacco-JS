/*
 * This section initializes logging and handles input
 * based on the execution environment.
 * If running in a Node.js-like environment, it reads from stdin.
 */

var log = console.log;

// Check if 'process' global object is defined, indicating a Node.js environment
if ( typeof process != "undefined" )
{
  /*
   * This block contains commented-out code for an alternative
   * way to read input from stdin using streams.
   * It is currently disabled but kept for reference.
   *
   * var input = "";
   * process.stdin.resume();
   * process.stdin.setEncoding( 'utf8' );
   * process.stdin.on( 'data', function( chunk )
   * {
   *     input += chunk;
   * } );
   * process.stdin.on( 'end', function()
   * {
   *     var lines = input.split( "\n" );
   *     main( lines );
   * } );
   */

  // Read entire input from /dev/stdin synchronously
  var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );

  // Split the input into an array of lines
  var lines = input.split( "\n" );

  // Call the main processing function with the parsed lines
  main( lines );
}

/*
 * End of input handling and initialization.
 */

/*
 * The main function processes the input lines.
 * It parses numerical data and prepares it for the
 * core algorithm.
 */
function main( lines )
{
  // Map each line to numbers. If a line contains multiple space-separated
  // values, it's mapped to an array of numbers; otherwise, it's a single number.
  lines = lines.map( function ( e )
  {
    if ( e.split( " " ).length >= 2 )
    {
      return e.split( " " ).map( function ( f )
      {
        return Number( f );
      } );
    }
    else
    {
      return Number( e );
    }
  } );

  // Extract the first line, which contains problem parameters (N and W)
  var tpl = lines.shift( );

  // N: Number of items
  var N = tpl.shift( );

  // W: Maximum weight capacity of the knapsack
  var W = tpl.shift( );

  // The remaining lines represent the goods (value, weight pairs)
  var goods = lines;

  // An unused variable, potentially for future iteration
  var i = N;

  // An unused object, potentially for future mapping or storage
  var maps = {};

  // Call the knapsack algorithm function
  V( goods, W );
}

/*
 * The V function implements a dynamic programming approach
 * to solve the 0/1 Knapsack problem.
 *
 * goods: An array of [value, weight] pairs for each item.
 * W: The maximum weight capacity of the knapsack.
 */
function V( goods, W )
{
  // 'mem' stores the maximum value for each weight capacity found so far.
  // It represents the current state of the knapsack.
  var mem = {};

  // 'swap' is used to hold the previous state of 'mem' during iteration.
  var swap = {};

  // Iterate through each item (good) available
  for ( var i = 0; i < goods.length; i++ )
  {
    // Extract value (vi) and weight (wi) of the current item
    var vi = goods[i][0];
    var wi = goods[i][1];

    // Swap 'mem' to 'swap' to preserve the previous iteration's results
    swap = mem;

    // Reset 'mem' for the current iteration
    mem = {};

    // Iterate through all possible weights (w) in the previous state ('swap')
    for ( var w in swap )
    {
      // Ensure 'w' is treated as a number
      w = Number( w );

      // If the current maximum value for weight 'w' in 'mem' is less than
      // or equal to the value from the previous state, or if 'mem[w]' is
      // not yet defined, update 'mem[w]' with the value from 'swap[w]'.
      // This means we are considering *not* taking the current item.
      if ( mem[w] <= swap[w] || !mem[w] )
      {
        mem[w] = swap[w];
      }

      // Check if adding the current item's weight (wi) would exceed
      // the total knapsack capacity (W).
      if ( w + wi <= W )
      {
        // If the new weight (w + wi) is within capacity, evaluate taking the item.
        // Compare the value obtained by taking the current item (swap[w] + vi)
        // with existing values for the new weight (w + wi) in both 'swap' and 'mem'.
        // This complex condition ensures we update 'mem[w + wi]' only if
        // taking the current item yields a better or new result.
        if ( ( swap[w + wi] <= swap[w] + vi || !swap[w + wi] ) &&
             ( mem[w + wi] <= swap[w] + vi || !mem[w + wi] ) )
        {
          mem[w + wi] = swap[w] + vi;
        }
      }
      else
      {
        // If adding the current item's weight exceeds capacity,
        // there's no need to consider heavier combinations for this item
        // with the current 'w', so we break the inner loop.
        break;
      }
    }

    // After iterating through existing knapsack states, also consider
    // adding the current item (vi, wi) as the very first item.
    // This handles the case where the current item forms a new base for 'mem'.
    if ( ( swap[wi] <= vi || !swap[wi] ) && ( mem[wi] <= vi || !mem[wi] ) )
    {
      mem[wi] = vi;
    }
  }

  // After processing all items, find the maximum value in 'mem'
  // for any weight up to W.
  // Iterate downwards from W to find the largest weight with a stored value.
  for ( var _i = W; _i > 0; _i-- )
  {
    // If 'mem[_i]' has a valid (truthy) value, it means a combination
    // exists for this weight. Log this maximum value and exit.
    if ( !!mem[_i] )
    {
      log( mem[_i] );
      break;
    }
  }
}