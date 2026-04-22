/*
 * This file contains a JavaScript program designed to solve a specific
 * algorithmic problem. It includes an input parsing module, a dynamic
 * array creation utility, and the main logic.
 */

// Define a module for reading input data.
var GET = ( function( ) {
  // Inner function `f` acts as the public interface for the GET module.
  // It creates and returns a new instance of the `g` class.
  function f( s ) {
    return new g( s ) ;
  }

  // The `g` class is responsible for processing raw input string `s`.
  // It splits the input into lines and initializes a line pointer.
  function g( s ) {
    this._s = s . trim ( ) . split ( "\n" ) ; // Store lines of input.
    this._y = 0 ; // Initialize current line index.
  }

  // Prototype method `a`: Reads a single value from the current line.
  // If `f` is true, returns as string; otherwise, as number.
  g.prototype.a = function( f ) {
    var s = this._s , // Reference to the input lines array.
        y = this._y , // Current line index.
        r ;          // Variable to hold the result.

    // If the current line hasn't been processed into a reversed array of words yet, do so.
    if ( typeof s[y] === "string" ) {
      s[y] = s[y] . split ( " " ) . reverse ( ) ;
    }

    r = s[y] . pop ( ) ; // Pop the last element (which was the first in original order).

    // If the current line is exhausted, move to the next line.
    if ( ! s[y] . length ) {
      this._y ++ ;
    }

    // Return the value, converting to number if `f` is falsy.
    return f ? r : +r ;
  } ;

  // Prototype method `l`: Reads an entire line of space-separated values.
  // If `f` is true, returns as array of strings; otherwise, as array of numbers.
  g.prototype.l = function( f ) {
    // Split the current line and advance the line pointer.
    var s = this._s [ this._y ++ ] . split ( " " ) ;
    // Return based on the `f` flag.
    return f ? s : s . map ( a => +a ) ;
  } ;

  // Prototype method `m`: Reads a matrix (multiple lines, multiple columns).
  // `n` specifies the number of lines to read.
  g.prototype.m = function( n , f ) {
    // Slice `n` lines, split each by space, and advance the line pointer.
    var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;
    // Return based on the `f` flag, converting inner arrays to numbers if needed.
    return f ? r : r . map ( a => a . map ( a => +a ) ) ;
  } ;

  // Prototype method `r`: Reads `n` lines, each as a single value.
  g.prototype.r = function( n , f ) {
    // Slice `n` lines and advance the line pointer.
    var r = this._s . slice ( this._y , this._y += n ) ;
    // Return based on the `f` flag, converting to numbers if needed.
    return f ? r : r . map ( a => +a ) ;
  } ;

  // The GET module exposes the `f` function as its public interface.
  return f ;
} ) ( ) ; // Immediately-invoked function expression (IIFE).


// Initialize the input reader 'o' by reading from standard input.
var o = GET( require( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as subsequent arguments after the initial value.
 *
 * @param {*} v - The initial value for all elements.
 * @param {...number} dimensions - The dimensions of the array (e.g., xArray(-1, 3, 4) creates a 3x4 array of -1).
 * @returns {Array} The initialized multi-dimensional array.
 */
function xArray( v ) {
  var a = arguments , // Access all arguments passed to the function.
      l = a . length , // Total number of arguments.
      // Build the innermost array creation string.
      r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})" ;

  // Loop to build up the outer array creation strings.
  while ( --l ) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
  }

  // Evaluate the constructed string to create the array.
  return eval( r ) ;
}


// Call the main function and print its return value to the console.
console . log ( main ( ) ) ;


/**
 * The main entry point of the program.
 * Reads input values, processes them, and calls a helper `solve` function.
 *
 * @returns {number} The final computed result.
 */
function main( ) {
  // Read the initial integer 'n'.
  var n = o . a ( ) ;

  // Read two arrays 'a' and 'b' from input.
  var a = o . l ( ) ;
  var b = o . l ( ) ;

  // Initialize two empty arrays for storing filtered elements.
  var x = [ ] ;
  var y = [ ] ;

  // First filtering loop: collect elements where a[i] < b[i].
  for ( var i = 0 ; i < 3 ; i ++ ) {
    if ( a[i] < b[i] ) {
      x . push ( a[i] ) ;
      y . push ( b[i] ) ;
    }
  }

  // Call the solver with the initial 'n' and the first set of filtered arrays.
  var ans = solve ( n , x , y ) ;

  // Reset 'x' and 'y' for the second filtering step.
  x = [ ] ;
  y = [ ] ;

  // Second filtering loop: collect elements where b[i] < a[i].
  for ( var i = 0 ; i < 3 ; i ++ ) {
    if ( b[i] < a[i] ) {
      x . push ( b[i] ) ;
      y . push ( a[i] ) ;
    }
  }

  // Call the solver again, using the result from the first call as 'n',
  // and the second set of filtered arrays.
  return solve ( ans , x , y ) ;
}


/**
 * Solves a sub-problem based on the length of input arrays 'a' and 'b'.
 * This function implements different logic for different array lengths (0, 1, 3, or 2).
 *
 * @param {number} n - The initial value or current accumulated value.
 * @param {number[]} a - An array of values.
 * @param {number[]} b - Another array of values, corresponding to 'a'.
 * @returns {number} The computed result for the sub-problem.
 */
function solve( n , a , b ) {
  var l = a . length ; // Get the length of array 'a'.

  // Case 1: If arrays are empty, 'n' remains unchanged.
  if ( l === 0 ) {
    return n ;
  }

  // Case 2: If arrays have one element.
  if ( l === 1 ) {
    var x = n / a[0] | 0 ; // Calculate how many times a[0] fits into 'n' (integer division).
    n -= x * a[0] ;       // Subtract the used portion of 'n'.
    n += x * b[0] ;       // Add the corresponding 'b' value for each 'a' used.
    return n ;
  }

  // Case 3: If arrays have three elements (dynamic programming approach).
  if ( l === 3 ) {
    // Create a DP array initialized with -1, of size n+1.
    var dp = xArray ( -1 , n + 1 ) ;
    dp[0] = n ; // Base case: 0 cost, n value.

    // Iterate through each pair (a[i], b[i]).
    for ( var i = 0 ; i < 3 ; i ++ ) {
      var x = a[i] , // Current 'a' value (cost).
          y = b[i] ; // Current 'b' value (gain).

      // Iterate through possible 'j' values (costs).
      for ( var j = x ; j <= n ; j ++ ) {
        // If the previous state (j-x) is unreachable, skip.
        if ( dp[j - x] === -1 ) {
          continue ;
        }
        // Update dp[j] with the maximum value:
        // either its current value or the value from (j-x) plus current gain 'y'.
        dp[j] = Math . max ( dp[j] , dp[j - x] + y ) ;
      }
    }
    // Return the maximum value found in the DP array.
    return Math . max ( ...dp ) ;
  }

  // Case 4: If arrays have two elements (l === 2).
  // This is a special optimization for two elements.
  var x1 , y1 , x2 , y2 ; // Variables for sorted pairs.

  // Determine which pair has a better 'gain per cost' ratio.
  // (b[0]-a[0])/a[0] vs (b[1]-a[1])/a[1]
  if ( ( b[0] - a[0] ) / a[0] < ( b[1] - a[1] ) / a[1] ) {
    // If the first pair is less efficient, prioritize the second.
    x1 = a[1] ;
    y1 = b[1] ;
    x2 = a[0] ;
    y2 = b[0] ;
  } else {
    // Otherwise, prioritize the first pair.
    x1 = a[0] ;
    y1 = b[0] ;
    x2 = a[1] ;
    y2 = b[1] ;
  }

  // Calculate maximum uses of the primary item (x1).
  var x = n / x1 | 0 , // Integer division to find max count.
      r = 0 ;          // Initialize maximum result found.

  // Iterate through possible counts of the primary item, with a cap of 5000.
  // 'i' represents how many fewer times we use x1 than the maximum possible.
  for ( var i = 0 ; i <= 5000 && i <= x ; i ++ ) {
    var xi = x - i ; // Actual count of x1 to use.

    // Calculate remaining 'n' after using xi * x1.
    var y = n - xi * x1 ,
        xx = y / x2 | 0 ; // Calculate how many times x2 fits into remaining 'n'.

    y -= xx * x2 ; // Subtract used portion of 'n' by x2.
    y += xi * y1 ; // Add gain from x1.
    y += xx * y2 ; // Add gain from x2.

    // Update the maximum result if current 'y' is greater.
    if ( r < y ) {
      r = y ;
    }
  }
  return r ; // Return the maximum result.
}