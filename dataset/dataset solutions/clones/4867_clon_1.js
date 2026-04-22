/*
 * This script processes input from standard input to solve a pathfinding problem.
 * It reads a grid and attempts to find a path from the end to the start.
 */


var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n")
; // Read input from stdin, decode as UTF-8, trim whitespace, and split by newline.

var obj = {
  "list"  :    input, // The raw input lines
  "index" :          0, // Current index for reading input
  "max"   : input.length, // Total number of input lines
  "next"  : function ( ) {
    // Check if there are more elements to read.
    if  ( ! this.hasNext( ) )
    {
      throw "NoSuchElementException:次に要素は無いよ" ;
    }

    var returnObj = this.list[this.index] ; // Get the current element.
    this.index ++ ; // Increment the index for the next read.

    return returnObj ;
  },
  "hasNext" : function ( ) { return ( this.index < this.max ) ; } // Check if there are more elements.
} ;


// Main program execution starts here.
Main ( ) ;

// Helper function to get the next item from the input object.
function next ( ) { return obj.next ( ) ; }

// Helper function to check if there are more items in the input.
function hasNext ( ) { return obj.hasNext ( ) ; }

function myout ( t ) { console.log ( t ) ; } // Standard output function.
function myerr ( t ) { console.error ( t ) ; } // Standard error output function.


/*
 * myconv function: Handles various conversions for input elements.
 * [no] parameter defines the conversion type:
 *   1: Convert to integer.
 *   2: Split by space.
 *   4: Split by space and convert to number array.
 *   6: Split into single characters.
 *   7: Split into single characters and convert to number array.
 *   8: Join array with space.
 *   9: Join array with newline.
 *   0: Join array with no separator.
 *   Default: Return input as is.
 *   Error: Returns input as is.
 */
function myconv ( i, no ) {
  try {
    switch ( no ) {
      case 1:
        return parseInt ( i ) ;
      case 2:
        return i.split ( " " ) ;
      case 4:
        return i.split ( " " ).map ( ( a ) => Number ( a ) ) ;
      case 6:
        return i.split ( "" ) ;
      case 7:
        return i.split ( "" ).map ( ( a ) => Number ( a ) ) ;
      case 8:
        return i.join ( " " ) ;
      case 9:
        return i.join ( "\n" ) ;
      case 0:
        return i.join ( "" ) ;
      default:
        return i ;
    }
  } catch ( e ) {
    return i ; // In case of conversion error, return the original input.
  }
}


function Main ( ) {
  // Read the first line, expecting two numbers (H and W) separated by space.
  var one = myconv ( next ( ), 4 ) ;

  var H = one[0] ; // Height of the grid.
  var W = one[1] ; // Width of the grid.

  var list = new Array ( H ) ; // Initialize the grid (2D array).

  // Populate the grid with input lines, splitting each into characters.
  for ( var i = 0 ; i < H ; i ++ ) {
    list[i] = myconv ( next ( ), 6 ) ;
  }

  // Attempt to find a path from the goal (bottom-right) back to the start (top-left).
  var y = H - 1 ; // Current Y-coordinate, starting at bottom-most row.
  var x = W - 1 ; // Current X-coordinate, starting at right-most column.

  // Loop until the start position (0,0) is reached.
  while ( ! ( y == 0 && x == 0 ) ) {
    myerr ( x + " " + y ) ; // Log current position to error output for debugging.

    // Case: Currently at the left-most column (x == 0).
    if ( x == 0 ) {
      // Can only move up. Check the cell above.
      if ( list[y - 1][x] == "#" ) {
        y -- ; // Move up.
        continue ; // Continue to the next iteration of the loop.
      } else {
        // Cannot move up, and no other moves possible. Path is impossible.
        myout ( "Impossible" ) ;
        return ; // Exit the function.
      }
    }

    // Case: Currently at the top-most row (y == 0).
    if ( y == 0 ) {
      // Can only move left. Check the cell to the left.
      if ( list[y][x - 1] == "#" ) {
        x -- ; // Move left.
        continue ; // Continue to the next iteration of the loop.
      } else {
        // Cannot move left, and no other moves possible. Path is impossible.
        myout ( "Impossible" ) ;
        return ; // Exit the function.
      }
    }

    // General case: Not at an edge (x > 0 and y > 0).
    // Check if moving up OR moving left is valid AND exactly one of them is '#'.
    // This condition implies that one path is blocked ('.') and the other is open ('#').
    if ( ( list[y - 1][x] == "#" && list[y][x - 1] == "." ) ||
         ( list[y][x - 1] == "#" && list[y - 1][x] == "." ) )
    {
      if ( list[y - 1][x] == "#" ) {
        y -- ; // Prioritize moving up if it's a '#' cell.
      } else {
        x -- ; // Otherwise, move left if it's a '#' cell.
      }
      continue ; // Continue to the next iteration.
    }
    else
    {
      // If both paths are '#' (or both are '.') or some other invalid combination,
      // it's impossible to continue.
      myout ( "Impossible" ) ;
      return ; // Exit the function.
    }
  }

  // If the loop completes, it means (0,0) was reached successfully.
  myout ( "Possible" ) ;
}