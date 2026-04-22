"use strict"; /* This directive enables strict mode for the entire script. It helps catch common coding errors and "unsafe" actions. */


// --- Input Processing Utility Functions ---

// Require the 'fs' module for file system operations.
// Read the entire content of '/dev/stdin' synchronously as UTF-8.
var input = require("fs") . readFileSync ( "/dev/stdin" , "utf8" ) ;

// Split the input string by spaces or newlines into an array of strings.
// Initialize a cursor 'cid' to track the current position in the 'cin' array.
var cin = input . split ( / |\n/ ) , cid = 0 ;


/**
 * Retrieves the next number from the input array.
 * Converts the string to a number using the unary plus operator.
 *
 * @returns {number} The next numerical token from the input.
 */
function next ( ) {
  return + cin [ cid ++ ] ;
}

/**
 * Retrieves the next string token from the input array.
 *
 * @returns {string} The next string token from the input.
 */
function nextstr ( ) {
  return cin [ cid ++ ] ;
}

/**
 * Retrieves the next BigInt from the input array.
 *
 * @returns {BigInt} The next BigInt token from the input.
 */
function nextbig ( ) {
  return BigInt ( cin [ cid ++ ] ) ;
}

/**
 * Reads an array of 'n' elements from the input.
 *
 * @param {number} n - The number of elements to read.
 * @param {boolean} a - If true, returns strings; otherwise, converts to numbers.
 * @returns {Array<string|number>} An array of 'n' elements.
 */
function nexts ( n , a ) {
	/*
	 * This function handles reading multiple elements.
	 * If 'a' is true, it returns the raw string elements.
	 * Otherwise, it maps them to numbers.
	 */
  return a
    ? cin . slice ( cid , cid += n )
    : cin . slice ( cid , cid += n ) . map ( a => + a ) ;
}

/**
 * Reads a 2D matrix of 'h' rows and 'w' columns from the input.
 *
 * @param {number} h - The number of rows.
 * @param {number} w - The number of columns.
 * @param {boolean} a - If true, returns strings; otherwise, converts to numbers.
 * @returns {Array<Array<string|number>>} The 2D matrix.
 */
function nextm ( h , w , a ) {
  var r = [ ] , i = 0 ;
  if ( a ) {
    for ( ; i < h ; i ++ ) {
      r . push ( cin . slice ( cid , cid += w ) ) ;
    }
  } else {
    for ( ; i < h ; i ++ ) {
      r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
    }
  }
  return r ;
}

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This is a recursive function builder using eval.
 *
 * @param {*} v - The initial value for the innermost array elements.
 * @returns {Array} A multi-dimensional array.
 */
function xArray ( v ) {
  var a = arguments , l = a . length ,
      r = "Array(a[" + -- l + "]) . fill ( ) . map ( x => { return " + v + " ; } )" ;
  while ( -- l ) {
    r = "Array(a[" + l + "]) . fill ( ) . map ( x => " + r + " )" ;
  }
  return eval ( r ) ; // Evaluate the generated string to create the array.
}


// --- Main Program Execution ---

// Call the main logic function and store its result.
var myOut = main ( ) ;

// If the main function returned a value (not undefined), print it to console.
if ( myOut !== undefined ) {
  console . log ( String ( myOut ) ) ;
}


// --- Main Logic Function ---

function main ( ) {
  // Define a large number to represent infinity for distance calculations.
  var inf = 1e9 ; // 1,000,000,000

  // Read the number of input points.
  var n = next ( ) ;

  // Create a 4-element array, each element initialized as an empty array.
  // This will categorize points based on their direction.
  var a = xArray ( "[]" , 4 ) ;

  // Mapping for directions to array indices: U=0, R=1, D=2, L=3.
  var s = {
    U : 0 , // Up
    R : 1 , // Right
    D : 2 , // Down
    L : 3   // Left
  } ;

  // Loop through 'n' input points.
  for ( var i = 0 ; i < n ; i ++ ) {
    // Read x-coordinate, y-coordinate, and direction string.
    var x = next ( ) , y = next ( ) , U = nextstr ( ) ;

    // Add the point's data to the corresponding direction array.
    // Each point is stored as [x, y, x-y, x+y].
    // x-y and x+y are used for diagonal distance calculations.
    a [ s [ U ] ] . push ( [ x , y , x - y , x + y ] ) ;
  }

  // Initialize the minimum answer with infinity.
  var ans = inf ;

  /*
   * First type of collision detection: horizontal/vertical alignment.
   * Sort points based on their primary coordinate (x for horizontal, y for vertical)
   * and then secondary coordinate for tie-breaking.
   */
  for ( var i = 0 ; i < 4 ; i ++ ) {
    // 'j' determines the primary sorting axis: 0 for x-coord, 1 for y-coord.
    // i=0 (U), i=1 (R), i=2 (D), i=3 (L)
    // U (0) -> j=0 (x), R (1) -> j=1 (y), D (2) -> j=0 (x), L (3) -> j=1 (y)
    var j = i & 1 ;

    // Sort the current direction's points.
    // Primary sort key: a[j] (x or y)
    // Secondary sort key (for ties): a[1-j] (y or x)
    a [ i ] . sort ( ( a , b ) => a [ j ] > b [ j ] ? 1 : a [ j ] < b [ j ] ? - 1 : a [ 1 - j ] - b [ 1 - j ] ) ;
  }

  /*
   * Check for collisions between U/D and R/L pairs.
   * This handles direct vertical and horizontal movements.
   * k=0: U (index 0) vs D (index 2)
   * k=1: R (index 1) vs L (index 3)
   */
  for ( var k = 0 ; k < 2 ; k ++ ) {
    var id = 0 ; // Pointer for the 'target' array (D or L).

    // Only proceed if the target array (a[k+2]) has elements.
    if ( a [ k + 2 ] . length ) {
      // Iterate through the 'source' array (U or R).
      for ( var i = 0 ; i < a [ k ] . length ; i ++ ) {

        // Advance 'id' past points in a[k+2] that are 'behind' a[k][i] on the primary axis.
        while ( a [ k + 2 ] . length > id && a [ k + 2 ] [ id ] [ k ] < a [ k ] [ i ] [ k ] ) {
          id ++ ;
        }

        // If primary coordinates are equal, advance 'id' past points in a[k+2] that are 'behind' a[k][i] on the secondary axis.
        while ( a [ k + 2 ] . length > id && a [ k + 2 ] [ id ] [ k ] === a [ k ] [ i ] [ k ] && a [ k ] [ i ] [ 1 - k ] > a [ k + 2 ] [ id ] [ 1 - k ] ) {
          id ++ ;
        }

        // If 'id' reached the end of a[k+2], no more potential matches for current a[k][i] and subsequent.
        if ( id === a [ k + 2 ] . length ) {
          break ;
        }

        // If primary coordinates match, a collision might occur.
        if ( a [ k ] [ i ] [ k ] === a [ k + 2 ] [ id ] [ k ] ) {
          // Calculate the distance (difference in secondary coordinate) and update minimum.
          // This assumes points are moving towards each other on the same line.
          ans = Math . min ( ans , a [ k + 2 ] [ id ] [ 1 - k ] - a [ k ] [ i ] [ 1 - k ] ) ;
        }
      }
    }
  }

  /*
   * Second type of collision detection: diagonal alignment (x+y).
   * Sort points based on the x+y coordinate, then x or y for tie-breaking.
   */
  for ( var i = 0 ; i < 4 ; i ++ ) {
    // 'j' determines the secondary sorting axis (x or y).
    var j = 1 - ( i & 1 ) ;

    // Sort by x+y (index 3), then by j (x or y).
    a [ i ] . sort ( ( a , b ) => a [ 3 ] > b [ 3 ] ? 1 : a [ 3 ] < b [ 3 ] ? - 1 : a [ j ] - b [ j ] ) ;
  }

  /*
   * Check for collisions between U/R and D/L pairs (diagonal).
   * k=0: U (index 0) vs R (index 1)
   * k=2: D (index 2) vs L (index 3)
   */
  for ( var k = 0 ; k < 4 ; k += 2 ) {
    var id = 0 ; // Pointer for the 'target' array (R or L).

    // Only proceed if the target array (a[k+1]) has elements.
    if ( a [ k + 1 ] . length ) {
      // Iterate through the 'source' array (U or D).
      for ( var i = 0 ; i < a [ k ] . length ; i ++ ) {

        // Advance 'id' past points in a[k+1] that are 'behind' a[k][i] on the x+y axis.
        while ( a [ k + 1 ] . length > id && a [ k + 1 ] [ id ] [ 3 ] < a [ k ] [ i ] [ 3 ] ) {
          id ++ ;
        }

        // If x+y coordinates are equal, advance 'id' past points in a[k+1] that are 'behind' a[k][i] on the secondary axis.
        while ( a [ k + 1 ] . length > id && a [ k + 1 ] [ id ] [ 3 ] === a [ k ] [ i ] [ 3 ] && a [ k ] [ i ] [ 1 - k / 2 ] > a [ k + 1 ] [ id ] [ 1 - k / 2 ] ) {
          id ++ ;
        }

        // If 'id' reached the end of a[k+1], no more potential matches.
        if ( id === a [ k + 1 ] . length ) {
          break ;
        }

        // If x+y coordinates match, a collision might occur.
        if ( a [ k ] [ i ] [ 3 ] === a [ k + 1 ] [ id ] [ 3 ] ) {
          // Calculate distance (difference in secondary coordinate) and update minimum.
          // Multiply by 2 because diagonal collisions are effectively twice the 'grid unit' distance.
          ans = Math . min ( ans , ( a [ k + 1 ] [ id ] [ 1 - k / 2 ] - a [ k ] [ i ] [ 1 - k / 2 ] ) * 2 ) ;
        }
      }
    }
  }

  /*
   * Third type of collision detection: diagonal alignment (x-y).
   * Sort points based on the x-y coordinate, then x for tie-breaking.
   */
  for ( var i = 0 ; i < 4 ; i ++ ) {
    // Sort by x-y (index 2), then by x (index 0).
    a [ i ] . sort ( ( a , b ) => a [ 2 ] > b [ 2 ] ? 1 : a [ 2 ] < b [ 2 ] ? - 1 : a [ 0 ] - b [ 0 ] ) ;
  }

  /*
   * Check for collisions between U/L and D/R pairs (diagonal).
   * k=0: U (index 0) vs L (index 3)
   * k=1: R (index 1) vs D (index 2)
   */
  for ( var k = 0 ; k < 2 ; k ++ ) {
    var id = 0 ; // Pointer for the 'target' array (L or D).

    // The target array index is 3-k.
    // If k=0, target is a[3] (L). If k=1, target is a[2] (D).
    if ( a [ 3 - k ] . length ) {
      // Iterate through the 'source' array (U or R).
      for ( var i = 0 ; i < a [ k ] . length ; i ++ ) {

        // Advance 'id' past points in a[3-k] that are 'behind' a[k][i] on the x-y axis.
        while ( a [ 3 - k ] . length > id && a [ 3 - k ] [ id ] [ 2 ] < a [ k ] [ i ] [ 2 ] ) {
          id ++ ;
        }

        // If x-y coordinates are equal, advance 'id' past points in a[3-k] that are 'behind' a[k][i] on the x-axis.
        while ( a [ 3 - k ] . length > id && a [ 3 - k ] [ id ] [ 2 ] === a [ k ] [ i ] [ 2 ] && a [ k ] [ i ] [ 0 ] > a [ 3 - k ] [ id ] [ 0 ] ) {
          id ++ ;
        }

        // If 'id' reached the end of a[3-k], no more potential matches.
        if ( id === a [ 3 - k ] . length ) {
          break ;
        }

        // If x-y coordinates match, a collision might occur.
        if ( a [ k ] [ i ] [ 2 ] === a [ 3 - k ] [ id ] [ 2 ] ) {
          // Calculate distance (difference in x coordinate) and update minimum.
          // Multiply by 2 for diagonal collision distance.
          ans = Math . min ( ans , ( a [ 3 - k ] [ id ] [ 0 ] - a [ k ] [ i ] [ 0 ] ) * 2 ) ;
        }
      }
    }
  }

  // If 'ans' is still infinity, no collisions were found.
  // Otherwise, multiply the minimum distance by 5 (as per problem statement, likely time units).
  return ans === inf ? "SAFE" : ans * 5 ;
}