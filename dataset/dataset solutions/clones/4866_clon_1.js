var input = require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) . trim() . split( "\n" ) ;

/*
 * This 'obj' acts as a custom iterator for the input array.
 * It provides methods to get the next element and check for existence.
 */
var obj = {
  "list" : input ,
  "index" : 0 ,
  "max" : input.length ,

  "next" : function ( ) {
    // Check if there are more elements available before proceeding
    if ( ! this.hasNext( ) ) {
      throw "NoSuchElementException:次に要素は無いよ" ;
    }
    var returnObj = this.list[ this.index ] ; // Retrieve the current element
    this.index ++ ; // Advance the index for the next call
    return returnObj ; // Return the fetched object
  } ,

  "hasNext" : function ( ) {
    // Determine if there are more elements to iterate over
    return ( this.index < this.max ) ;
  }
} ;

// Execute the main program logic
Main( ) ;

/**
 * Helper function to retrieve the next item from the input stream.
 * @returns {string} The next item from the input.
 */
function next ( ) {
  return obj.next( ) ;
}

/**
 * Helper function to check if there are more items in the input stream.
 * @returns {boolean} True if more items exist, false otherwise.
 */
function hasNext ( ) {
  return obj.hasNext( ) ;
}

/**
 * Custom output function for standard console logging.
 * @param {*} t - The content to log.
 */
function myout ( t ) {
  console.log( t ) ; // standard output via console
}

/**
 * Custom output function for standard error logging.
 * @param {*} t - The error content to log.
 */
function myerr ( t ) {
  console.error( t ) ; // standard error output
}

/*
 * This function handles various conversions for input elements.
 * [no] specifies the type of conversion.
 * If 'no' is unrecognized or an error occurs, the input 'i' is returned as is.
 *
 * Conversion types:
 * 1: Convert to integer (parseInt).
 * 2: Split by half-width space (" ").
 * 4: Split by half-width space and convert each part to Number (map).
 * 6: Split into individual characters ("").
 * 7: Split into individual characters and convert each to Number (map).
 * 8: Join array elements with half-width space (" ").
 * 9: Join array elements with newline ("\n").
 * 0: Join array elements without any separator ("").
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1 :
        return parseInt( i ) ;
      case 2 :
        return i.split( " " ) ;
      case 4 :
        return i.split( " " ).map( ( a ) => Number( a ) ) ;
      case 6 :
        return i.split( "" ) ;
      case 7 :
        return i.split( "" ).map( ( a ) => Number( a ) ) ;
      case 8 :
        return i.join( " " ) ;
      case 9 :
        return i.join( "\n" ) ;
      case 0 :
        return i.join( "" ) ;
      default :
        return i ;
    }
  } catch ( e ) {
    return i ; // Return original input on error
  }
}

/**
 * Main function where the program logic resides.
 * It processes a grid to find a path.
 */
function Main ( ) {
  var one = myconv( next( ) , 4 ) ; // Read first line, split by space, convert to numbers

  var H = one[ 0 ] ; // Height of the grid
  var W = one[ 1 ] ; // Width of the grid

  var list = new Array( H ) ; // Initialize grid (2D array)

  // Populate the grid row by row
  for ( var i = 0 ; i < H ; i ++ ) {
    list[ i ] = myconv( next( ) , 6 ) ; // Read each row, split into characters
  }

  // Pathfinding logic: Try to trace a path from goal to start
  // Mark visited cells with 'k'
  var y = H - 1 ; // Current Y coordinate (start at bottom-right)
  var x = W - 1 ; // Current X coordinate

  while ( y >= 0 && x >= 0 ) {
    myerr( x + " " + y ) ; // Log current coordinates to error stream
    list[ y ][ x ] = "k" ; // Mark current cell as visited

    // Special case: At the starting point (0,0)
    if ( x == 0 && y == 0 ) {
      // If both right and down neighbors are not '#' (obstacles), path is possible
      if ( list[ y ][ x + 1 ] != "#" && list[ y + 1 ][ x ] != "#" ) {
        break ; // Path found, exit loop
      } else {
        myout( "Impossible" ) ; // Path blocked
        return ; // Terminate execution
      }
    }

    // Special case: At the left edge (x=0) but not (0,0)
    if ( x == 0 ) {
      // If up neighbor is '#', and right/down neighbors are not '#', move up
      if ( list[ y - 1 ][ x ] == "#" && list[ y ][ x + 1 ] != "#" && list[ y + 1 ][ x ] != "#" ) {
        y -- ; // Move up
        continue ; // Continue to next iteration
      } else {
        myout( "Impossible" ) ; // Path blocked
        return ;
      }
    }

    // Special case: At the top edge (y=0) but not (0,0)
    if ( y == 0 ) {
      // If left neighbor is '#', and right/down neighbors are not '#', move left
      if ( list[ y ][ x - 1 ] == "#" && list[ y + 1 ][ x ] != "#" && list[ y ][ x + 1 ] != "#" ) {
        x -- ; // Move left
        continue ; // Continue to next iteration
      } else {
        myout( "Impossible" ) ; // Path blocked
        return ;
      }
    }

    // Special case: At the bottom-right corner (H-1, W-1) - the actual start of backtracking
    if ( y == H - 1 && x == W - 1 ) {
      if ( list[ y - 1 ][ x ] == "#" ) {
        y -- ; // If cell above is '#', move up
      } else {
        x -- ; // Otherwise, move left
      }
      continue ; // Continue to next iteration
    }

    // Special case: At the bottom edge (y=H-1) or right edge (x=W-1), but not corner
    if ( y == H - 1 || x == W - 1 ) {
      // Check for specific path conditions involving '#' and '.' cells
      if ( ( list[ y - 1 ][ x ] == "#" && list[ y ][ x - 1 ] == "." ||
             list[ y ][ x - 1 ] == "#" && list[ y - 1 ][ x ] == "." ) ) {
        if ( list[ y - 1 ][ x ] == "#" ) {
          y -- ; // Move up
        } else {
          x -- ; // Move left
        }
        continue ;
      } else {
        myout( "Impossible" ) ;
        return ;
      }
    }

    // General case: Not on any boundary or special corner
    // Check if the cell below (y+1, x) was part of the 'k' path
    if ( list[ y + 1 ][ x ] == "k" ) {
      // More complex path logic involving neighbors
      if ( ( list[ y - 1 ][ x ] == "#" && list[ y ][ x - 1 ] == "." ||
             list[ y ][ x - 1 ] == "#" && list[ y - 1 ][ x ] == "." ) && list[ y ][ x + 1 ] != "#" ) {
        if ( list[ y - 1 ][ x ] == "#" ) {
          y -- ;
        } else {
          x -- ;
        }
      } else {
        myout( "Impossible" ) ;
        return ;
      }
    } else {
      // If the cell below was not 'k'
      if ( ( list[ y - 1 ][ x ] == "#" && list[ y ][ x - 1 ] == "." ||
             list[ y ][ x - 1 ] == "#" && list[ y - 1 ][ x ] == "." ) && list[ y + 1 ][ x ] != "#" ) {
        if ( list[ y - 1 ][ x ] == "#" ) {
          y -- ;
        } else {
          x -- ;
        }
        continue ;
      } else {
        myout( "Impossible" ) ;
        return ;
      }
    }
  }

  myout( "Possible" ) ; // If the loop completes, a path was found
}