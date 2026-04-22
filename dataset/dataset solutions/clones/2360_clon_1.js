/* This section contains utility functions for input/output handling
 * and other common operations. It's usually hidden from the main logic.
 */
// Start of I/O setup and helper functions -----------------------------------
var read =  require ( 'readline' ) .createInterface ( {
  input : process.stdin,
  output: process.stdout
} );
// Declare global variables for input processing
var obj;
var inLine = [ ] ;
read .on( 'line' , function ( input ) {
  inLine.push( input ) ;
} ) ;
read .on( 'close' , function ( ) {
  obj = init ( inLine ) ; // Initialize the input object
  console .error ( '\n↑入力 ↓出力' ) ; // Debug message indicating input/output direction
  Main ( ) ; // Call the main program logic
} ) ;

/**
 * Creates a deep clone of an object. Handles Set objects specifically.
 * @param {any} obj - The object to clone.
 * @returns {any} A deep clone of the input object.
 */
function makeClone ( obj ) {
  return ( obj instanceof Set ) ? new Set ( Array .from ( obj ) ) : JSON.parse ( JSON.stringify ( obj ) ) ;
}
// Helper functions for reading different types of input
function nextInt ( ) { return myconv ( next ( ) , 1 ) ; }
function nextStrArray ( ) { return myconv ( next ( ) , 2 ) ; }
function nextIntArray ( ) { return myconv ( next ( ) , 4 ) ; }
function nextCharArray ( ) { return myconv ( next ( ) , 6 ) ; }
// Core input reading functions
function next ( ) { return obj.next ( ) ; }
function hasNext ( ) { return obj.hasNext ( ) ; }

/**
 * Initializes the input object from an array of lines.
 * This object provides methods to check for more input and retrieve the next line.
 * @param {Array<string>} input - An array of input lines.
 * @returns {object} An object with list, index, max, hasNext, and next properties.
 */
function init ( input ) {
  return {
    list :  input ,
    index : 0 ,
    max :   input .length ,
    hasNext : function ( ) { return ( this.index < this.max ) ; } ,
    next : function ( ) {
      if ( this.hasNext ( ) ) {
        return this.list [ this.index++ ] ;
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input' ;
      }
    }
  } ;
}

/**
 * Outputs a string to the console, followed by a newline.
 * @param {string} s - The string to output.
 */
function myout ( s ) { console.log ( s ) ; }

/**
 * Outputs a debug message to the error stream.
 * @param {any} s - The value to inspect and output.
 */
function myerr ( s ) { console.error ( 'debug:' + require ( 'util' ) .inspect ( s , false , null ) ) ; }

/*
 * The 'no' parameter in myconv dictates the conversion type:
 *  - unknown or outlier : returns the input 'i' as is.
 *  - 1 : Parses 'i' as an integer (parseInt).
 *  - 2 : Splits 'i' by space into a string array.
 *  - 4 : Splits 'i' by space and converts elements to numbers (map(Number)).
 *  - 6 : Splits 'i' into an array of single characters.
 *  - 7 : Splits 'i' into characters and converts them to numbers.
 *  - 8 : Joins array 'i' with spaces.
 *  - 9 : Joins array 'i' with newlines.
 *  - 0 : Joins array 'i' with no separator.
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1 : return parseInt ( i ) ;
      case 2 : return i.split ( ' ' ) ;
      case 4 : return i.split ( ' ' ) .map ( Number ) ;
      case 6 : return i.split ( '' ) ;
      case 7 : return i.split ( '' ) .map ( Number ) ;
      case 8 : return i.join ( ' ' ) ;
      case 9 : return i.join ( '\n' ) ;
      case 0 : return i.join ( '' ) ;
      default : return i ;
    }
  } catch ( e ) {
    return i ; // In case of an error during conversion, return original input
  }
}

// End of utility functions and I/O setup -------------------------------------

/**
 * Main function containing the core logic of the program.
 * This function processes input, performs calculations, and produces output.
 */
function Main ( ) {
  // Read the first line of input, which contains H and W
  var one = nextIntArray ( ) ;
  var H = one [ 0 ] ; // Height of the grid
  var W = one [ 1 ] ; // Width of the grid

  // Initialize arrays for the grid and dynamic programming table
  var list = new Array ( H ) ;
  var dp =   new Array ( H ) ;

  // Maximum possible sum/difference value (arbitrary constant)
  var max =  1272 ;

  // Loop to initialize the DP table and read the first part of the grid
  for ( var i = 0 ; i < H ; i++ ) {
    dp [ i ] = new Array ( W ) ;
    for ( var j = 0 ; j < W ; j++ ) {
      dp [ i ] [ j ] = new Array ( max ) ; // Each cell can store boolean for sums up to 'max'
    }
    list [ i ] = nextIntArray ( ) ; // Read a row of integers for the 'list' grid
  }

  // Loop to read the second part of the grid and calculate absolute differences
  for ( var i = 0 ; i < H ; i++ ) {
    var tmp = nextIntArray ( ) ; // Read a temporary row
    for ( var j = 0 ; j < W ; j++ ) {
      list [ i ] [ j ] = Math.abs ( list [ i ] [ j ] - tmp [ j ] ) ; // Store absolute difference
    }
  }

  // Base case for DP: the starting cell (0,0) with its value
  dp [ 0 ] [ 0 ] [ list [ 0 ] [ 0 ] ] = true ;

  // DP calculation loops
  for ( var i = 0 ; i < H ; i++ ) {
    for ( var j = 0 ; j < W ; j++ ) {
      // Skip the base case cell as it's already handled
      if ( i == 0 && j == 0 ) {
        continue ;
      }

      // Handle the first row (movement only from left)
      if ( i == 0 ) {
        for ( var k = 0 ; k < max ; k++ ) {
          if ( dp [ i ] [ j - 1 ] [ k ] ) { // If a sum 'k' was reachable from the left
            // Propagate to current cell by adding or subtracting current cell's value
            dp [ i ] [ j ] [ Math.abs ( k + list [ i ] [ j ] ) ] = true ;
            dp [ i ] [ j ] [ Math.abs ( k - list [ i ] [ j ] ) ] = true ;
          }
        }
      }
      // Handle the first column (movement only from top)
      else if ( j == 0 ) {
        for ( var k = 0 ; k < max ; k++ ) {
          if ( dp [ i - 1 ] [ j ] [ k ] ) { // If a sum 'k' was reachable from the top
            // Propagate to current cell by adding or subtracting current cell's value
            dp [ i ] [ j ] [ Math.abs ( k + list [ i ] [ j ] ) ] = true ;
            dp [ i ] [ j ] [ Math.abs ( k - list [ i ] [ j ] ) ] = true ;
          }
        }
      }
      // Handle general case (movement from top or left)
      else {
        for ( var k = 0 ; k < max ; k++ ) {
          if ( dp [ i - 1 ] [ j ] [ k ] ) { // From top
            dp [ i ] [ j ] [ Math.abs ( k + list [ i ] [ j ] ) ] = true ;
            dp [ i ] [ j ] [ Math.abs ( k - list [ i ] [ j ] ) ] = true ;
          }
          if ( dp [ i ] [ j - 1 ] [ k ] ) { // From left
            dp [ i ] [ j ] [ Math.abs ( k + list [ i ] [ j ] ) ] = true ;
            dp [ i ] [ j ] [ Math.abs ( k - list [ i ] [ j ] ) ] = true ;
          }
        }
      }
    }
  }

  // Find the smallest non-negative sum reachable at the end cell (H-1, W-1)
  for ( var i = 0 ; i < max ; i++ ) {
    if ( dp [ H - 1 ] [ W - 1 ] [ i ] ) {
      myout ( i ) ; // Output the result
      return ; // Exit after finding the first (smallest) reachable sum
    }
  }
}