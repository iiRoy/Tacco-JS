/*
 * This is a Type I clone generated for demonstration purposes.
 * It's identical in functionality to the original source code,
 * with only changes in whitespace and comments.
 * No logical or structural modifications have been made.
 */

var log = console.log ;


// This block handles input processing specifically for Node.js environments.
if( typeof process != "undefined" )
{
  var input = "" ; // Initialize a string to accumulate input data.

  process.stdin.resume( ) ; // Keep the process alive while waiting for input.
  process.stdin.setEncoding( 'utf8' ) ; // Set input encoding to UTF-8.

  // Event listener for incoming data chunks.
  process.stdin.on( 'data' , function( chunk )
  {
    input += chunk ; // Append each chunk to the input string.
  } ) ;

  // Event listener for the end of input stream.
  process.stdin.on( 'end' , function( )
  {
    var lines = input.split( "\n" ) ; // Split the accumulated input into lines.
    main( lines ) ; // Call the main function with the processed lines.
  } ) ;
}


/**
 * The primary function that processes the input lines and initiates the algorithm.
 * @param {Array<string>} lines - An array of strings, each representing a line of input.
 */
function main( lines )
{
  // Transforms each input line. If a line contains multiple space-separated
  // values, they are converted to numbers. Otherwise, the entire line is
  // converted to a single number.
  lines = lines.map( function( e )
  {
    if( e.split( " " ).length >= 2 )
    {
      return e.split( " " ).map( function( f )
      {
        return Number( f ) ;
      } ) ;
    }
    else
    {
      return Number( e ) ;
    }
  } ) ;

  var tpl = lines.shift( ) ; // Extracts the first line, assumed to be a template or header.
  var N = tpl.shift( ) ; // The first element of 'tpl', representing 'N'.
  var W = tpl.shift( ) ; // The second element of 'tpl', representing 'W'.

  var goods = lines ; // The remaining lines are considered 'goods' (items).

  var i = N ; // This variable is declared but not subsequently used in this function.

  var maps = { } ; // This object is declared but not subsequently used in this function.

  // Invokes the core knapsack-like algorithm with the parsed goods and capacity W.
  V( goods , W ) ;
}


/**
 * Implements a dynamic programming approach, similar to the 0/1 knapsack problem,
 * to find the maximum value that can be achieved within a given weight capacity.
 *
 * @param {Array<Array<number>>} goods - An array where each inner array `[value, weight]` represents an item.
 * @param {number} W - The maximum allowable weight capacity.
 */
function V( goods , W )
{
  var mem = { } ; // 'mem' stores the maximum value for each weight using current items.
  var swap = { } ; // 'swap' temporarily holds the state of 'mem' from the previous iteration.

  // Iterates through each item in the 'goods' array.
  for( var i=0; i<goods.length; i++ )
  {
    var vi = goods[ i ][ 0 ] ; // Value of the current item.
    var wi = goods[ i ][ 1 ] ; // Weight of the current item.

    swap = mem ; // Copy the 'mem' state from the previous item processing.
    mem = { } ; // Reset 'mem' to build the new state for the current item.

    // Iterates through all possible weights 'w' encountered in the 'swap' (previous state).
    for( var w in swap )
    {
      w = Number( w ) ; // Ensure 'w' is treated as a number.

      // If the current 'mem[w]' is not set or less than 'swap[w]', update it.
      if( mem[ w ] <= swap[ w ] || !mem[ w ] )
      {
        mem[ w ] = swap[ w ] ;
      }

      // Check if adding the current item's weight 'wi' to 'w' exceeds the total capacity 'W'.
      if( w + wi <= W )
      {
        // If including the current item (value vi, weight wi) with a previous state 'w'
        // results in a higher total value for the new weight 'w + wi', update 'mem'.
        // It checks against both 'swap' and current 'mem' states.
        if( ( swap[ w + wi ] <= swap[ w ] + vi || !swap[ w + wi ] ) && ( mem[ w + wi ] <= swap[ w ] + vi || !mem[ w + wi ] ) )
        {
          mem[ w + wi ] = swap[ w ] + vi ;
        }
      }
      else
      {
        // If 'w + wi' already exceeds 'W', and assuming 'w' is iterated in an increasing order,
        // further 'w' values would also exceed 'W', so we can break.
        break ;
      }
    }

    // Separately consider placing the current item 'vi' with its weight 'wi' directly,
    // if it provides a better value than what's currently stored for 'wi'.
    if( ( swap[ wi ] <= vi || !swap[ wi ] ) && ( mem[ wi ] <= vi || !mem[ wi ] ) )
    {
      mem[ wi ] = vi ;
    }
  }

  // After processing all items, find the maximum value stored in 'mem'
  // that corresponds to a weight less than or equal to 'W'.
  for( var _i=W; _i>0; _i-- )
  {
    if( !!mem[ _i ] ) // Check if a value exists for the current weight '_i'.
    {
      log( mem[ _i ] ) ; // Log the maximum value found for this weight.
      break ; // Exit after finding the first valid value (starting from W down to 1).
    }
  }
}