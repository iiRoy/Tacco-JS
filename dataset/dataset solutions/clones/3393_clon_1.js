/*
 * This module provides a utility for parsing input data.
 * It's designed to read lines and tokens from a string.
 */
var GET = (
  function() {

    // Inner function 'f' acts as the public interface for the GET module.
    function f(s) {
      // Creates a new instance of the internal parser 'g'.
      return new g(s);
    }

    // Constructor 'g' for the input parser.
    function g(s) {
      // Stores the input string, trimmed and split into lines.
      this._s = s . trim() . split( "\n" );
      // Current line index.
      this._y = 0;
    }

    // Method 'a' (assume 'advance' or 'atom') to read a single token.
    g . prototype . a = function ( f ) {
      // Get the internal string array and current line index.
      var s = this . _s , y = this . _y , r ;

      // If the current line hasn't been tokenized yet, do it.
      if ( typeof s[y] === "string" ) {
        s[y] = s[y] . split(" ") . reverse();
      }

      // Pop the last token from the current line (because we reversed it).
      r = s[y] . pop();

      // If the current line is now empty, advance to the next line.
      if ( ! s[y] . length ) {
        this._y++;
      }

      // Return the token, optionally parsed as a number.
      return f ? r : + r ;
    };

    // Method 'l' (assume 'line') to read an entire line of tokens.
    g . prototype . l = function ( f ) {
      // Get the current line, split it, and advance the line index.
      var s = this._s[ this._y ++ ] . split( " " ) ;

      // Return the tokens, optionally parsed as numbers.
      return f ? s : s . map ( a => + a ) ;
    };

    // Method 'm' (assume 'matrix') to read multiple lines as a 2D array.
    g . prototype . m = function ( n , f ) {
      // Slice 'n' lines, split each into tokens.
      var r = this . _s . slice ( this._y , this._y += n )
                       . map ( a => a . split ( " " ) ) ;

      // Return the matrix, optionally with inner elements parsed as numbers.
      return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    };

    // Method 'r' (assume 'rows' or 'raw') to read multiple lines as an array of strings/numbers.
    g . prototype . r = function ( n , f ) {
      // Slice 'n' lines.
      var r = this . _s . slice ( this._y , this._y += n ) ;

      // Return the array, optionally with elements parsed as numbers.
      return f ? r : r . map ( a => + a ) ;
    };

    // The IIFE returns the public function 'f'.
    return f ;

  }
)();


/*
 * Main script execution starts here.
 * Read input from stdin using the custom GET parser.
 */
var o = GET( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// Log the result of the main computation.
console . log ( main ( ) ) ;


/*
 * The primary logic of the program.
 * Solves a problem related to powers of two and array manipulation.
 */
function main ( ) {

  // Read the number of elements from input.
  var n = o . a ( ) ;

  // Read the array of elements from input.
  var a = o . l ( ) ;

  // Object to store counts of elements.
  var b = { } ;

  // Array to store powers of two. Initialized with 2.
  var pow2 = [ 2 ] ;

  // Sort array 'a' in descending order.
  a . sort ( ( a , b ) => b - a ) ;

  // Populate 'pow2' with powers of two until it exceeds the largest element in 'a'.
  for ( var i = 1 ; pow2[ i - 1 ] <= a[ 0 ] ; i ++ ) {
    pow2[ i ] = pow2[ i - 1 ] * 2 ;
  }

  // 'u' will be an index related to the highest power of two.
  var u = i - 1 ;

  // Count occurrences of each number in array 'a'.
  for ( i = 0 ; i < n ; i ++ ) {
    if ( b[ a[ i ] ] ) {
      b[ a[ i ] ] ++ ;
    } else {
      b[ a[ i ] ] = 1 ;
    }
  }

  // Initialize the answer counter.
  ans = 0 ;

  // Main loop to find pairs that sum to a power of two.
  for ( i = 0 ; i < n ; i ++ ) {
    // Decrement the count for the current number 'a[i]'.
    b[ a[ i ] ] -- ;

    // Adjust 'u' to find the smallest power of two greater than or equal to 'a[i]'.
    while ( u > 0 && pow2[ u - 1 ] >= a[ i ] ) {
      u -- ;
    }

    // Calculate the target complement 't' such that a[i] + t = pow2[u].
    var t = pow2[ u ] - a[ i ] ;

    // If the complement 't' exists and its count is greater than zero,
    // decrement its count and increment the total answer.
    if ( b[ t ] > 0 ) {
      b[ t ] -- ;
      ans ++ ;
    }
  }

  // Return the final count of pairs.
  return ans ;
}