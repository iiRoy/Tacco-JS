/* This entire block defines a utility for parsing input,
 * likely from standard input or a file.
 * It's structured as an Immediately Invoked Function Expression (IIFE)
 * to create a factory function 'GET'.
 */
var GET = ( function ( ) {

  /**
   * Factory function 'f' that creates a new parser instance 'g'.
   * @param {string} s - The raw input string.
   * @returns {g} A new instance of the parser.
   */
  function f ( s ) {
    return new g ( s ) ;
  }

  /**
   * Constructor for the parser object 'g'.
   * It processes the raw input string.
   * @param {string} s - The raw input string.
   */
  function g ( s ) {
    // Trim whitespace from the input string and split it into lines.
    this._s = s . trim ( ) . split ( "\n" ) ;
    // Initialize a line pointer or row index.
    this._y = 0 ;
  }

  /*
   * Prototype method 'a' for the parser 'g'.
   * Reads a single element from the current line, handling potential reversals.
   * @param {boolean} f - If true, return as string; otherwise, convert to number.
   * @returns {string|number} The parsed element.
   */
  g . prototype . a = function ( f ) {
    // Get the internal string array and current line index.
    var s = this._s ,
      y = this._y ,
      r ; // Variable to hold the result.

    // If the current line is still a string, process it.
    if ( typeof s [ y ] === "string" ) {
      // Split the line by spaces and reverse the order of elements.
      s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
    }

    // Pop the last element (which is the first after reversal).
    r = s [ y ] . pop ( ) ;

    // If the current line is now empty, advance to the next line.
    if ( ! s [ y ] . length ) {
      this._y ++ ;
    }

    // Return the result, optionally converting it to a number.
    return f ? r : + r ;
  } ;

  /**
   * Prototype method 'l' for the parser 'g'.
   * Reads an entire line of space-separated values.
   * @param {boolean} f - If true, return as array of strings; otherwise, array of numbers.
   * @returns {Array<string|number>} The parsed line.
   */
  g . prototype . l = function ( f ) {
    // Get the current line, split it by spaces, and then advance the line pointer.
    var s = this._s [ this._y ++ ] . split ( " " ) ;

    // Return the array, optionally mapping elements to numbers.
    return f ? s : s . map ( a => + a ) ;
  } ;

  /*
   * Prototype method 'm' for the parser 'g'.
   * Reads multiple lines, treating each as a row of space-separated values.
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - If true, return as 2D array of strings; otherwise, 2D array of numbers.
   * @returns {Array<Array<string|number>>} The parsed matrix.
   */
  g . prototype . m = function ( n , f ) {
    // Slice 'n' lines from the input, update the line pointer,
    // and then map each line to an array of its space-separated values.
    var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;

    // Return the 2D array, optionally mapping all elements to numbers.
    return f ? r : r . map ( a => a . map ( a => + a ) ) ;
  } ;

  /**
   * Prototype method 'r' for the parser 'g'.
   * Reads multiple raw lines without splitting them by spaces.
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - If true, return as array of strings; otherwise, array of numbers.
   * @returns {Array<string|number>} The parsed lines.
   */
  g . prototype . r = function ( n , f ) {
    // Slice 'n' lines from the input and update the line pointer.
    var r = this._s . slice ( this._y , this._y += n ) ;

    // Return the array, optionally mapping elements to numbers.
    return f ? r : r . map ( a => + a ) ;
  } ;

  // The IIFE returns the factory function 'f'.
  return f ;

} ) ( ) ; // End of GET utility definition


// Initialize the input parser 'o' by reading data from standard input.
// The 'fs' module is used to read the file synchronously.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 * Function 'xArray' dynamically creates multi-dimensional arrays.
 * It uses 'eval' for construction, which can be a security concern
 * but is sometimes used in competitive programming contexts for brevity.
 * @param {*} v - The initial value for the innermost array elements.
 * @param {...number} dimensions - The dimensions of the array (e.g., xArray(0, 2, 3) for 2x3 array).
 * @returns {Array} A multi-dimensional array initialized with 'v'.
 */
function xArray ( v ) {
  var a = arguments , // All arguments passed to the function.
    l = a . length , // Total number of arguments.
    // Start building the 'eval' string for the innermost array.
    r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ;

  // Loop to construct outer array dimensions.
  while ( -- l ) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
  }

  // Execute the dynamically constructed string to create the array.
  return eval ( r ) ;
}


// Execute the main logic of the program and print its return value to the console.
console . log ( main ( ) ) ;


/**
 * The primary function containing the core logic of the program.
 * It processes input data 'a' and 'b' according to specific rules.
 * @returns {number} The sum of elements in array 'a' after modifications.
 */
function main ( ) {

  /* Read the first integer from input.
   * This typically represents the size 'N' of an array.
   */
  var n = o . a ( ) ;


  /* Read the second integer from input.
   * This usually represents the number 'M' of operations or data sets.
   */
  var m = o . a ( ) ;


  /* Read a line of space-separated integers into array 'a'.
   * Then, sort array 'a' in ascending order.
   * This is a common pattern for problems involving sorted data.
   */
  var a = o . l ( ) . sort ( ( a , b ) => a - b ) ;


  /* Read 'm' lines of space-separated integers into a 2D array 'b'.
   * Each inner array in 'b' likely contains parameters for an operation.
   */
  var b = o . m ( m ) ;


  /* Sort array 'b' based on the second element of its inner arrays (b[i][1]).
   * The sort order is descending (b[1] - a[1]), which implies
   * operations with larger second values are prioritized.
   */
  b . sort ( ( a , b ) => b [ 1 ] - a [ 1 ] ) ;


  // Initialize a pointer 'x' for array 'a', starting at the first element.
  var x = 0 ;


  /* Outer loop iterates 'm' times, corresponding to each row in array 'b'.
   * Each row in 'b' represents a distinct operation or set of parameters.
   */
  for ( var i = 0 ; i < m ; i ++ ) {

    /* Inner loop iterates a number of times specified by b[i][0].
     * It also has a condition `x < n` to ensure it doesn't go out of bounds
     * for array 'a' and `j < b[i][0]` for the current operation count.
     * Both 'x' and 'j' are incremented in each iteration.
     */
    for ( var j = 0 ; j < b [ i ] [ 0 ] && x < n ; x ++ , j ++ ) {

      /* Conditional check: if the current element in 'a' is less than
       * the second element of the current 'b' operation.
       */
      if ( a [ x ] < b [ i ] [ 1 ] ) {
        // If true, update a[x] to the value from b[i][1].
        a [ x ] = b [ i ] [ 1 ] ;
      } else {
        /* If a[x] is not less than b[i][1], it means 'a' is already
         * sufficiently large at this position, or further operations
         * with this b[i][1] won't improve 'a'.
         * In this specific logic, the program terminates early
         * and returns the sum of 'a' elements up to this point.
         */
        return a . reduce ( ( a , b ) => a + b ) ;
      }
    }
  }

  /* If the loops complete without an early return, it means all
   * applicable updates have been made to array 'a'.
   * Calculate the sum of all elements in the modified array 'a'
   * and return it as the final result.
   */
  return a . reduce ( ( a , b ) => a + b ) ;
}