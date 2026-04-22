/* --- Start of utility functions and setup --- */
var read = require( 'readline' )
  .createInterface( {
    input  : process.stdin ,
    output : process.stdout
  } ) ;

var obj ;                                    // Global object for input handling
var inLine = [ ] ;                           // Buffer for input lines

read .on( 'line' , function ( input ) {
  inLine .push( input ) ;
} ) ;

read .on( 'close' , function ( ) {
  obj = init( inLine ) ;
  console .error( '\n↑入力 ↓出力' ) ;        // Display separator for input/output
  Main( ) ;
} ) ;


function makeClone ( obj ) {
  /* This function creates a deep clone of an object. */
  return ( obj instanceof Set )
           ? new Set( Array .from( obj ) )
           : JSON .parse( JSON .stringify( obj ) ) ;
}


function nextInt ( ) {
  return myconv( next( ) , 1 ) ;
}

/* Retrieves the next integer from the input stream. */
function nextStrArray ( ) {
  return myconv( next( ) , 2 ) ;
}


function nextIntArray ( ) {
  return myconv( next( ) , 4 ) ;
}

/* Fetches an array of integers from the next input line. */
function nextCharArray ( ) {
  return myconv( next( ) , 6 ) ;
}


function next ( ) {
  return obj .next( ) ;
}

function hasNext ( ) {
  return obj .hasNext( ) ;
}


function init ( input ) {
  /* Initializes the input processing object. */
  return {
    list    : input ,
    index   : 0 ,
    max     : input .length ,
    hasNext : function ( ) {
      return ( this .index < this .max ) ;
    } ,
    next    : function ( ) {
      if ( this .hasNext( ) ) {
        return this .list[ this .index++ ] ;
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input' ;
      }
    }
  } ;
}


function myout ( s ) {
  /* Prints output to console. */
  console .log( s ) ;
}


function myerr ( s ) {
  /* Prints debug info to console error stream. */
  console .error( 'debug:' + require( 'util' ) .inspect( s , false , null ) ) ;
}


/*
 * Helper function for type conversions.
 * 'no' parameter specifies the conversion type:
 *   - 1: Parse as integer.
 *   - 2: Split by spaces into string array.
 *   - 4: Split by spaces and parse as integer array.
 *   - 6: Split by characters into character array.
 *   - 7: Split by characters and parse as integer array.
 *   - 8: Join array elements with spaces.
 *   - 9: Join array elements with newlines.
 *   - 0: Join array elements without separator.
 *   - Default/Other: Return input as is.
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1 :
        return parseInt( i ) ;
      case 2 :
        return i .split( ' ' ) ;
      case 4 :
        return i .split( ' ' ) .map( Number ) ;
      case 6 :
        return i .split( '' ) ;
      case 7 :
        return i .split( '' ) .map( Number ) ;
      case 8 :
        return i .join( ' ' ) ;
      case 9 :
        return i .join( '\n' ) ;
      case 0 :
        return i .join( '' ) ;
      default :
        return i ;
    }
  } catch ( e ) {
    // In case of conversion error, return the original input.
    return i ;
  }
}

/* --- End of utility functions and setup --- */

function Main ( ) {
  // Main program logic starts here.
  var N      = nextInt( ) ;
  var output = [ ] ; // This variable is declared but not used in the original code.

  for ( var i = 0 ; i < N - 1 ; i++ ) {
    for ( var j = i + 1 ; j < N ; j++ ) {
      for ( var k = 0 ; k < 10 ; k++ ) {
        /*
         * The condition checks for a specific bitwise relationship.
         * Note: the condition `(j >> k & k)` seems unusual. `k` can be 0, which makes `(j >> k & 0)` always 0.
         * If k is 1, `(j >> 1 & 1)` checks the 2nd bit of j.
         * If k is 2, `(j >> 2 & 2)` checks if the 3rd bit of j is 1 AND the 2nd bit of k is 1.
         * This might be a logic error in the original code or an intentional complex condition.
         * Given the Type I clone constraint, this expression must remain unchanged.
         */
        if ( ( i >> k & 1 ) != ( j >> k & k ) ) {
          myout( k + 1 ) ;
        }
      }
    }
  }
}