/* This fragment initializes the standard input reading mechanism.
 * It uses Node.js 'fs' module to synchronously read the entire input stream
 * from stdin, then processes it into an array of lines.
 * Execution begins with a call to the 'main' function immediately after input setup.
 */
var fs = require( 'fs' )
  , length = fs.fstatSync( process.stdin.fd ).size
  , buffer = new Buffer( length )
  , bytesRead = fs.readSync( process.stdin.fd , buffer , 0 , length , 0 )
  , input = buffer.toString( 'utf8' , 0 , bytesRead ).split( '\n' )
  ;

main( ); // Invokes the primary function to start the problem-solving logic.


/*
 * The main function encapsulates the core algorithm for processing game fields.
 * It reads field dimensions, parses element positions, and then calculates
 * shortest paths using a dynamic programming approach.
 */
function main( ) {

  var readLines = 0 ; // Keeps track of the current line being read from the 'input' array.

  // The program processes multiple test cases, each defined by a field.
  // This loop continues until a specific termination condition is met (0 0 width/height).
  while ( true ) {

    var fieldInfo = input[ readLines ].split( ' ' ) ; // Parses the current line for field dimensions.
    var width = fieldInfo[ 0 ] - 0 ; // Converts the width string to an integer.
    var height = fieldInfo[ 1 ] - 0 ; // Converts the height string to an integer.


    // Termination condition: if both width and height are zero, exit the loop.
    if ( !width && !height ) {

      break ;
    }


    // Declarations for various variables used within the field processing scope.
    var start ; // Stores the encoded position of the 'S' (start) element.
    var goal ; // Stores the encoded position of the 'G' (goal) element.
    var elem = [ [ ] , [ ] , [ ] , [ ] , [ ] ] ; // An array of arrays to categorize elements by attribute (1-5).
    var c ; // Temporary variable to hold a character from the field.
    var rowData ; // Holds the string data for the current row.
    var elemCache ; // A temporary reference to an element attribute array.
    var y ; // Loop counter for rows (y-coordinate).
    var x ; // Loop counter for columns (x-coordinate).


    // Iterates through the field rows, starting from the last row and going upwards.
    for ( y = height ; y-- ; ) { // Reverse loop for y-coordinates.
      readLines++ ; // Advances the input line pointer for the actual field data.
      rowData = input[ readLines ] ; // Retrieves the current row's string data.

      // Iterates through the columns of the current row, from right to left.
      for ( x = width ; x-- ; ) { // Reverse loop for x-coordinates.
        c = rowData[ x ] ; // Gets the character at the current (x, y) position.


        // Conditional processing based on the character encountered.
        if ( c == '.' ) {
          // Empty space, no action needed.
        }
        else if ( c == '1' || c == '2' || c == '3' || c == '4' || c == '5' ) {
          // Numeric attribute elements.
          elemCache = elem[ c - 1 ] ; // Get the specific attribute array.
          elemCache[ elemCache.length ][ 0 ] = pos( x , y ) ; // Stores the encoded position.
        }
        else if ( c == 'S' ) {
          start = pos( x , y ) ; // Assigns the start position.
        }
        else {
          goal = pos( x , y ) ; // Assigns the goal position.
        }

      } // End of inner loop (x).
    } // End of outer loop (y).


    // Variable declarations for the pathfinding algorithm's state.
    var INF = 1 << 30 ; // A large integer representing infinity for distance calculations.
    var bestElement = -1 ; // Stores the index of the best starting element attribute (0-4).
    var currentDistance ; // Holds the calculated distance for a specific path.
    var nearestDistance = INF ; // Stores the minimum distance found across all paths.
    var dp ; // Dynamic Programming table: dp[attribute_index][element_in_attribute_index] = distance.
    var i ; // General-purpose loop index.
    var j ; // Another general-purpose loop index.
    var e ; // Loop index for the path segments (e.g., E1->E2).
    var len ; // Stores the length of arrays for loop optimizations.
    var dpCacheNow ; // Cache for dp[now] array.
    var dpCacheNowi ; // Cache for dp[now][i] value.
    var dpCacheNext ; // Cache for dp[next] array.
    var elemCacheNow ; // Cache for elem[now] array.
    var elemCacheNowi ; // Cache for elem[now][i] value.
    var elemCacheNext ; // Cache for elem[next] array.
    var now ; // Current attribute index in the DP progression.
    var nowLength ; // Number of elements in the current attribute.
    var next ; // Next attribute index in the DP progression.
    var nextLength ; // Number of elements in the next attribute.


    // This loop iterates through each of the 5 possible attributes
    // to determine which element type will be the first one visited after 'S'.
    for ( var selectElem = 0 ; selectElem < 5 ; selectElem++ ) {

      dp = [ [ ] , [ ] , [ ] , [ ] , [ ] ] ; // Re-initializes the DP table for each starting attribute.


      // Initializes all distances in the DP table to infinity.
      for ( i = 5 ; i-- ; ) { // Loops backwards from 4 down to 0.
        len = elem[ i ].length ;
        dpCache = dp[ i ] ;
        dpCache.length = len ; // Pre-allocates array size for performance.
        while ( len-- ) { // Fills the array with INF values.
          dpCache[ len ] = INF ;
        }
      }


      now = ( selectElem + 1 ) % 5 ; // Determines the actual first attribute index to process (circularly).
      nowLength = elem[ now ].length ; // Gets the count of elements for the current attribute.
      dpCacheNow = dp[ now ] ; // Caches the current attribute's DP array.
      elemCacheNow = elem[ now ] ; // Caches the current attribute's element positions array.


      // Calculates the initial distances from the 'S' (start) point to all elements
      // of the currently selected first attribute.
      for ( i = 0 ; i < nowLength ; i++ ) {
        dpCacheNow[ i ] = dist( start , elemCacheNow[ i ] ) ;
      }


      // This loop handles the intermediate transitions between element attributes:
      // E.g., from E1 to E2, then E2 to E3, then E3 to E4. There are 3 such transitions.
      for ( e = 0 ; e < 3 ; e++ ) {

        next = ( now + 1 ) % 5 ; // Determines the next attribute index in the sequence.
        dpCacheNext = dp[ next ] ; // Caches the next attribute's DP array.
        elemCacheNext = elem[ next ] ; // Caches the next attribute's element positions array.
        nextLength = elemCacheNext.length ; // Gets the count of elements for the next attribute.

        // Iterates through each element of the 'current' attribute.
        for ( i = 0 ; i < nowLength ; i++ ) {
          dpCacheNowi = dpCacheNow[ i ] ; // Caches the distance to the current element.
          elemCacheNowi = elemCacheNow[ i ] ; // Caches the position of the current element.


          // Optimization: if the current path segment's distance already exceeds
          // the best overall distance found so far, there's no need to extend this path.
          if ( dpCacheNowi >= nearestDistance ) {
            continue ; // Skip to the next element.
          }


          // Iterates through each element of the 'next' attribute.
          for ( j = 0 ; j < nextLength ; j++ ) {
            // Updates the distance to the 'next' element by considering the path
            // through the 'current' element, taking the minimum of existing and new paths.
            dpCacheNext[ j ] = min( dpCacheNext[ j ] , dpCacheNowi + dist( elemCacheNowi , elemCacheNext[ j ] ) ) ;
          }
        }


        // Prepares for the next iteration by updating 'now' to 'next' and caching new arrays.
        now = next ;
        dpCacheNow = dpCacheNext ;
        elemCacheNow = elemCacheNext ;
        nowLength = nextLength ;
      }


      // After processing all intermediate attribute transitions, calculate the final distances
      // from the last attribute's elements to the 'G' (goal) point.
      for ( i = 0 ; i < nextLength ; i++ ) {
        currentDistance = dpCacheNext[ i ] + dist( elemCacheNext[ i ] , goal ) ; // Total path distance.


        // If the current path is shorter than the previously recorded nearest distance, update it.
        if ( currentDistance < nearestDistance ) {
          nearestDistance = currentDistance ; // Update the shortest distance.
          bestElement = selectElem ; // Record which starting element attribute led to this shortest path.
        }

      } // End of final distance calculation loop.

    } // End of loop for 'selectElem'.


    // Outputs the result for the current test case.
    if ( nearestDistance == INF ) {
      console.log( "NA" ) ; // If no path was found, print "NA".
    } else {
      console.log( ( bestElement + 1 ) + " " + nearestDistance ) ; // Print the best element and shortest distance.
    }


    readLines++ ; // Increments the line counter to move past the processed field.

  } // End of 'while (true)' loop for test cases.

} // End of 'main' function.



/*
 * Calculates the Manhattan distance between two encoded point coordinates.
 * Coordinates are packed into a single integer for efficiency.
 */
function dist ( from , to ) {
  // Extracts x and y coordinates using bitwise shifts and masks.
  // x is in the higher bits (11-bit shift), y is in the lower 10 bits (AND with 2047).
  return abs( ( from >> 11 ) - ( to >> 11 ) ) + abs( ( from & 2047 ) - ( to & 2047 ) ) ;
}


/*
 * Returns the minimum of two numbers 'a' and 'b' using a bitwise trick.
 * This can be slightly faster than a traditional if/else or Math.min() in some environments.
 */
function min ( a , b ) {
  return b + ( ( a - b ) & ( ( a - b ) >> 31 ) ) ;
}


/*
 * Encodes two integer coordinates (x, y) into a single integer.
 * This is done to avoid creating object instances for coordinates, improving performance.
 * x is stored in the higher bits (shifted left by 11), y in the lower bits.
 */
function pos ( a , b ) {
  return ( a << 11 ) + b ;
}


/*
 * Calculates the absolute value of an integer 'a' using bitwise operations.
 * This is an optimized way to get |a| compared to `Math.abs()`.
 */
function abs ( a ) {
  return ( a ^ ( a >> 31 ) ) - ( a >> 31 ) ;
}