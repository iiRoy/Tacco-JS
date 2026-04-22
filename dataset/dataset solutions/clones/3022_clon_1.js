var GET = ( function( ) { // This is an Immediately Invoked Function Expression (IIFE)
  // It encapsulates the GET utility for input parsing.

  function f ( s ) {
    // Factory function to create a new GET instance.
    return new g ( s ) ;
  }


  function g ( s ) {
    // Constructor for the GET object.
    // Initializes the internal state with trimmed and split input lines.
    this._s = s.trim( ).split ( "\n" ) ;
    this._y = 0 ; // Current line index.
  }

  // Define prototype methods for the GET object.

  g.prototype.a = function ( f ) { // Reads a single item from the current line.
    var s = this._s , // Reference to the array of input lines.
        y = this._y , // Current line index.
        r ;          // Variable to hold the result.

    // If the current line is a string, split it into words and reverse for 'pop' behavior.
    if ( typeof s [ y ] === "string" )
      s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;

    // Pop the last item (which is the first after reversing).
    r = s [ y ] . pop ( ) ;

    // If the line is now empty, advance to the next line.
    if ( ! s [ y ] . length )
      this._y ++ ;

    // Return the item, optionally parsed as an integer.
    return f ? r : + r ;
  } ;


  g.prototype.l = function ( f ) { // Reads an entire line as an array of items.
    // Get the current line, split by space, and then advance to the next line.
    var s = this._s [ this._y ++ ] . split ( " " ) ;

    // Return the items, optionally parsed as integers.
    return f ? s : s . map ( a => + a ) ;
  } ;


  g.prototype.m = function ( n , f ) { // Reads 'n' lines as a matrix (array of arrays).
    // Slice 'n' lines, advance the index, and map each line to an array of words.
    var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;

    // Return the matrix, optionally with all elements parsed as integers.
    return f ? r : r . map ( a => a . map ( a => + a ) ) ;
  } ;


  g.prototype.r = function ( n , f ) { // Reads 'n' lines as a simple array.
    // Slice 'n' lines and advance the index.
    var r = this._s . slice ( this._y , this._y += n ) ;

    // Return the array, optionally with all elements parsed as integers.
    return f ? r : r . map ( a => + a ) ;
  } ;


  return f ; // The factory function is returned as the GET module.
} ) ( ) ;


// Initialize the input reader with content from standard input.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


function xArray ( v ) {
  // Dynamically creates multi-dimensional arrays.
  // v: initial value for the innermost elements.
  var a = arguments , // All arguments passed to the function.
      l = a . length , // Number of dimensions + 1 (for initial value).
      r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})" ; // Innermost array creation.

  // Build the array creation string from inside out.
  while ( --l )
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;

  // Evaluate the constructed string to create the array.
  return eval ( r ) ;
}


var mod = 998244353 ; // A common prime modulus used in competitive programming.


function abmod ( ) {
  // Performs modular multiplication for an arbitrary number of arguments.
  // Uses a trick to handle large numbers by splitting into 16-bit chunks.
  for ( var a = arguments , r = a [ 0 ] , i = 1 ; i < a . length ; )
    r = ( ( r >> 16 ) * a [ i ] % mod * 65536 + ( r & 65535 ) * a [ i ++ ] ) % mod ;

  return r ; // Returns the result of chained modular multiplications.
}


function powmod ( a , n ) {
  // Computes (a^n) % mod using binary exponentiation (exponentiation by squaring).
  for ( var r = 1 ; n ; a = abmod ( a , a ) , n >>= 1 )
    if ( n & 1 ) // If the current bit of n is 1.
      r = abmod ( a , r ) ;

  return r ; // Returns a^n modulo mod.
}


console . log ( main ( ) ) ; // Execute the main function and print its result.


function main ( ) {
  // Main logic of the problem.

  var n = o . a ( ) ; // Read the first integer 'n'.
  var a = o . r ( n ) . sort ( ( a , b ) => a - b ) ; // Read 'n' integers into array 'a' and sort them.

  var x = a . reduce ( ( a , b ) => a + b ) ; // Calculate the sum of elements in 'a'.

  var dp = [ 1 ] ; // Initialize DP array with base case for sum 0.

  // First DP loop: calculate combinations of sums.
  for ( var i = 0 ; i < n ; i ++ ) {
    var dp2 = xArray ( 0 , dp . length + a [ i ] ) ; // Create a new DP array with extended size.

    for ( var j = 0 ; j < dp . length ; j ++ ) {
      dp2 [ j ] += dp [ j ] * 2 ; // Option 1: Don't take a[i], but count current sum twice (due to 3 color choices).
      dp2 [ j + a [ i ] ] += dp [ j ] ; // Option 2: Take a[i], add to current sum.
      dp2 [ j ] %= mod ; // Apply modulo.
    }
    dp = dp2 ; // Update DP array for the next iteration.
  }

  var ans = powmod ( 3 , n ) ; // Initial answer: 3^n total ways to color if no restrictions.

  // If the total sum 'x' is even, add the result from 'solve' function.
  if ( x % 2 === 0 )
    ans += solve ( a , n , x / 2 ) ;

  // Adjust 'x' for the second part of the calculation.
  x = x + 1 >> 1 ; // Equivalent to Math.ceil(x/2)

  // Subtract contributions from sums greater than or equal to 'x'.
  for ( var j = x ; j < dp . length ; j ++ ) {
    ans -= dp [ j ] * 3 ;
  }

  ans %= mod ; // Apply final modulo.

  // Ensure the result is positive.
  return ( ans + mod ) % mod ;
}


function solve ( a , n , x ) {
  // A helper function to calculate the number of ways to achieve sum 'x' from array 'a'.
  // This is a standard subset sum DP.
  var dp = [ 1 ] ; // Base case: one way to make sum 0.

  for ( var i = 0 ; i < n ; i ++ ) {
    var dp2 = xArray ( 0 , dp . length + a [ i ] ) ; // Create a new DP array.

    for ( var j = 0 ; j < dp . length ; j ++ ) {
      dp2 [ j ] += dp [ j ] ; // Option 1: Don't include a[i].
      dp2 [ j + a [ i ] ] += dp [ j ] ; // Option 2: Include a[i].
      dp2 [ j ] %= mod ; // Apply modulo.
    }
    dp = dp2 ; // Update DP array.
  }

  // Return the count for sum 'x', multiplied by 3 (for certain coloring choices).
  return dp [ x ] * 3 ;
}