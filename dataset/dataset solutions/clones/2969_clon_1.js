// This file contains a solution for a programming problem.
// It includes a custom input reader 'GET' and helper functions.

var GET = ( function( ) {
  /**
   * Main function of the GET utility.
   * Initializes a new reader instance.
   * @param {string} s - The input string.
   * @returns {g} A new reader object.
   */
  function f( s ) {
    return new g( s );
  }

  /**
   * Constructor for the internal reader object.
   * Processes the input string into lines.
   * @param {string} s - The raw input string.
   */
  function g( s ) {
    // Trim whitespace and split the string into an array of lines.
    this._s = s . trim( ) . split( "\n" );
    // Initialize line pointer to the first line.
    this._y = 0;
  }

  /**
   * Reads an integer or string from the current line.
   * If the line is not yet processed, it splits and reverses it.
   * @param {boolean} f - If true, returns as string; otherwise, as number.
   * @returns {string|number} The read value.
   */
  g. prototype . a = function( f ) {
    // Shorthand for internal state variables.
    var s = this . _s,
        y = this . _y,
        r;

    // If the current line hasn't been split and reversed yet, do it.
    if ( typeof s[ y ] === "string" ) {
      s[ y ] = s[ y ] . split( " " ) . reverse( );
    }

    // Pop the last element (which is the next element in original order).
    r = s[ y ] . pop( );

    // If the current line is now empty, advance to the next line.
    if ( ! s[ y ] . length ) {
      this . _y ++;
    }

    // Return as string or number based on the flag 'f'.
    return f ? r : + r;
  };

  /**
   * Reads an entire line as an array of strings or numbers.
   * Advances the line pointer.
   * @param {boolean} f - If true, returns as strings; otherwise, as numbers.
   * @returns {Array<string>|Array<number>} The array of values from the line.
   */
  g . prototype . l = function( f ) {
    // Get the current line, split it by spaces, and then advance the line pointer.
    var s = this . _s[ this . _y ++ ] . split( " " );
    // Return as strings or map to numbers.
    return f ? s : s . map( a => + a );
  };

  /**
   * Reads a block of 'n' lines as a 2D array (matrix).
   * Advances the line pointer by 'n'.
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - If true, returns as strings; otherwise, as numbers.
   * @returns {Array<Array<string>>|Array<Array<number>>} The 2D array of values.
   */
  g . prototype . m = function( n, f ) {
    // Slice 'n' lines, split each by space.
    var r = this . _s . slice( this . _y, this . _y += n ) . map( a => a . split( " " ) );
    // Return as strings or map all elements to numbers.
    return f ? r : r . map( a => a . map( a => + a ) );
  };

  /**
   * Reads a block of 'n' lines as a 1D array.
   * Advances the line pointer by 'n'.
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - If true, returns as strings; otherwise, as numbers.
   * @returns {Array<string>|Array<number>} The 1D array of values.
   */
  g . prototype . r = function( n, f ) {
    // Slice 'n' lines directly.
    var r = this . _s . slice( this . _y, this . _y += n );
    // Return as strings or map to numbers.
    return f ? r : r . map( a => + a );
  };

  // The public interface of the IIFE is the 'f' function.
  return f;

} ) ( ); // Immediately Invoked Function Expression ends here.


// Initialize the input reader 'o' by reading from standard input.
var o = GET( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) );


/**
 * Creates a multi-dimensional array initialized with a value.
 * This function uses 'eval', which should be used with caution.
 * @param {*} v - The initial value for all elements.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} A multi-dimensional array.
 */
function xArray( v ) {
  // arguments object holds all parameters.
  var a = arguments,
      l = a . length,
      // Build the innermost array creation string.
      r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})";

  // Loop backwards to build outer array creation strings.
  while ( -- l ) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
  }

  // Evaluate the constructed string to create the array.
  return eval( r );
}


// Call the main function and print its result to the console.
console . log( main( ) );


/**
 * Main logic function for the problem.
 * Reads 'm' and 'k' from input and generates a sequence.
 * @returns {string} The space-separated sequence or -1.
 */
function main( ) {
  // Read two integer values from the input using the 'GET' utility.
  var m = o . a( );
  var k = o . a( );

  // Check for edge cases based on problem constraints.
  // If 'k' is too large for the given 'm', return -1.
  if ( k >= ( 1 << m ) ) {
    return -1;
  }

  // Another edge case: if k is positive but m is 1.
  if ( k && m === 1 ) {
    return -1;
  }

  // Special handling if 'k' is zero.
  if ( k === 0 ) {
    return f0( m );
  }

  // Initialize an array to store the result sequence.
  var ans = [];
  // Calculate the total number of elements in the sequence.
  var t = 1 << m;

  // First loop: populate the sequence up to k-1, then skip k, then continue.
  for ( var i = 0, x = 0; i < t - 1; i ++, x ++ ) {
    // If current value 'x' equals 'k', increment 'x' to skip 'k'.
    if ( x === k ) {
      x ++;
    }
    // Add the current 'x' to the answer array.
    ans . push( x );
  }

  // After the first loop, add 'k' to the sequence.
  ans . push( k );

  // Second loop: decrementing sequence.
  for ( var i = 0; i < t - 1; i ++ ) {
    // Decrement 'x'.
    x --;
    // If current value 'x' equals 'k', decrement 'x' again to skip 'k'.
    if ( x === k ) {
      x --;
    }
    // Add the current 'x' to the answer array.
    ans . push( x );
  }

  // Finally, add 'k' one last time to complete the sequence.
  ans . push( k );

  // Join the array elements with spaces and return the string.
  return ans . join( " " );
}


/**
 * Helper function for the special case when k is 0.
 * Generates a specific sequence based on 'm'.
 * @param {number} m - An input parameter.
 * @returns {string} The space-separated sequence.
 */
function f0( m ) {
  // Calculate the total number of elements for this case.
  var t = 1 << ( m + 1 );
  // Initialize an array for the answer.
  var ans = [];

  // Populate the array with i >> 1.
  for ( var i = 0; i < t; i ++ ) {
    ans[ i ] = i >> 1;
  }

  // Join the array elements with spaces and return the string.
  return ans . join( " " );
}