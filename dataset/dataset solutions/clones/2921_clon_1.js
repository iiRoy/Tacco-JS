/* This JavaScript code defines a custom input parsing utility and then uses it
 * to solve a specific algorithmic problem.
 * The 'GET' utility is designed to streamline reading various types of data
 * from standard input, typically for competitive programming challenges.
 */

// Declare a global variable 'GET' which will hold an input parsing factory function.
// This is an Immediately Invoked Function Expression (IIFE) to encapsulate
// the parsing logic and avoid polluting the global scope unnecessarily.
var GET = ( function ( ) {

  /**
   *  The primary factory function returned by the IIFE.
   *  It creates and returns a new instance of the input reader 'g'.
   *  @param { string } s - The raw string content read from the input source.
   *  @returns { g } A new input reader object.
   */
  function f ( s ) {
    return new g ( s ) ;
  }


  /**
   *  The constructor function for the input reader object.
   *  It initializes the internal state required for parsing.
   *  @param { string } s - The input string, expected to be multiple lines.
   */
  function g ( s ) {
    // Store the input string as an array of lines.
    // First, trim any leading/trailing whitespace from the whole input.
    // Then, split the string into an array using newline characters as delimiters.
    this . _s = s . trim ( ) . split ( "\n" ) ;

    // Initialize a line counter/index. This keeps track of the current line being read.
    this . _y = 0 ;
  }


  /**
   *  Prototype method 'a' for the input reader 'g'.
   *  This method reads a single "atom" (typically a number) from the current line.
   *  It treats the current line as a space-separated sequence of items.
   *  @param { boolean } f - A flag: if true, returns the item as a string;
   *                         otherwise, attempts to convert it to a number.
   *  @returns { string | number } The single parsed item.
   */
  g . prototype . a = function ( f ) {
    var s = this . _s , // Reference to the array of input lines.
        y = this . _y , // Current line index.
        r ;              // Variable to hold the result of the pop operation.

    // If the current line (s[y]) is still a single string, it means it hasn't been
    // processed yet. Split it by spaces and reverse the array.
    // Reversing allows us to use 'pop()' to effectively read items from the
    // "beginning" of the original line, treating it like a queue (but using pop).
    if ( typeof s [ y ] === "string" ) {
      s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
    }

    // Pop the last element from the (possibly reversed) array.
    // This gets the next item in sequence from the current line.
    r = s [ y ] . pop ( ) ;

    // If the current line array is now empty, it means all items on this line
    // have been read. Increment the line index to move to the next line for future reads.
    if ( ! s [ y ] . length ) {
      this . _y ++ ;
    }

    // Return the result. If 'f' is true, return as string; otherwise,
    // use unary plus operator to convert to a number.
    return f ? r : + r ;
  } ;


  /**
   *  Prototype method 'l' for the input reader 'g'.
   *  This method reads an entire line, splits it by spaces, and returns an array.
   *  It automatically advances to the next line after reading.
   *  @param { boolean } f - A flag: if true, returns elements as strings;
   *                         otherwise, converts them to numbers.
   *  @returns { Array < string | number > } An array of items from the read line.
   */
  g . prototype . l = function ( f ) {
    // Get the current line, split it by spaces, and then increment the line index.
    var s = this . _s [ this . _y ++ ] . split ( " " ) ;

    // Return the array. If 'f' is true, return as is; otherwise, map all elements to numbers.
    return f ? s : s . map ( a => + a ) ;
  } ;


  /**
   *  Prototype method 'm' for the input reader 'g'.
   *  This method reads 'n' lines, treating each line as a space-separated array of items.
   *  It is designed for reading matrices or 2D arrays.
   *  @param { number } n - The number of lines (rows) to read.
   *  @param { boolean } f - A flag: if true, returns elements as strings;
   *                         otherwise, converts them to numbers.
   *  @returns { Array < Array < string | number > > } A 2D array (matrix) of items.
   */
  g . prototype . m = function ( n , f ) {
    // Slice 'n' lines from the internal _s array, starting from _y.
    // Then, increment _y by 'n' to advance the line pointer.
    // For each sliced line, split it by spaces to get an array of strings.
    var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;

    // Return the 2D array. If 'f' is true, return as is; otherwise,
    // map all outer arrays, and then map all inner elements to numbers.
    return f ? r : r . map ( a => a . map ( a => + a ) ) ;
  } ;


  /**
   *  Prototype method 'r' for the input reader 'g'.
   *  This method reads 'n' lines as raw strings.
   *  @param { number } n - The number of lines to read.
   *  @param { boolean } f - A flag: if true, returns lines as strings;
   *                         otherwise, attempts to convert each line string to a number.
   *  @returns { Array < string | number > } An array of lines (strings or numbers).
   */
  g . prototype . r = function ( n , f ) {
    // Slice 'n' lines from the internal _s array, starting from _y.
    // Then, increment _y by 'n' to advance the line pointer.
    var r = this . _s . slice ( this . _y , this . _y += n ) ;

    // Return the array of lines. If 'f' is true, return as is; otherwise,
    // map all elements (lines) to numbers.
    return f ? r : r . map ( a => + a ) ;
  } ;

  // The IIFE returns the factory function 'f', which becomes the value of 'GET'.
  return f ;

} ) ( ) ; // The parentheses immediately invoke the function.


// Initialize the input reader 'o' by reading data from standard input.
// This line uses Node.js 'fs' module to read the entire content of '/dev/stdin'
// (which is typically the standard input stream) as a UTF-8 string.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/**
 *  A utility function to dynamically create multi-dimensional arrays.
 *  It constructs a string representation of array creation and then uses `eval()`
 *  to execute it. This allows for creating arrays of arbitrary dimensions
 *  based on the number and values of arguments passed.
 *  NOTE: Use of `eval()` can be a security risk if the input string is not controlled.
 *  @param { * } v - The initial value to fill the innermost array elements with.
 *  @returns { Array } A newly created multi-dimensional array.
 */
function xArray ( v ) {
  var a = arguments , // Access the 'arguments' object to get all passed dimensions.
      l = a . length , // Get the total number of arguments (dimensions + initial value).
      // Start building the string for the innermost array.
      // `a[--l]` gets the last argument, which is the size of the innermost dimension.
      r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ;

  // Loop backwards through the remaining arguments to wrap the array creation string
  // with higher-level array constructions.
  while ( -- l ) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
  }

  // Evaluate the dynamically constructed string to create and return the array.
  return eval ( r ) ;
}


// Call the main function and print its return value to the console.
// This is the entry point for the program's execution.
console . log ( main ( ) ) ;


/**
 *  The main function where the core logic of the problem resides.
 *  It reads input using the 'o' (GET) object, performs calculations,
 *  and returns the final result.
 */
function main ( ) {

  // Read the first number from input, which represents the size 'n'.
  var n = o . a ( ) ;

  // Read the next line of input as an array of numbers, storing it in 's'.
  var s = o . l ( ) ;

  // Initialize the variable 'ans' to store the maximum sum found, starting at 0.
  var ans = 0 ;

  // Calculate 'm' as 'n' divided by 2 using a bitwise right shift (integer division).
  var m = n >> 1 ;

  // Outer loop: iterates 'i' from 1 up to (but not including) 'm'.
  // 'i' represents a step or interval for selecting elements.
  for ( var i = 1 ; i < m ; i ++ ) {

    // For each 'i', create a new Set to keep track of indices already used
    // in the current inner loop iteration to avoid duplicates and self-pairs.
    var set = new Set ( ) ;

    // Initialize 'k' to 0 for accumulating the sum in the current inner loop.
    var k = 0 ;

    // Inner loop: 'j' iterates from 'i', incrementing by 'i' in each step.
    // The loop continues as long as 'j' is less than 'n - i'.
    // This pattern helps in selecting pairs of elements.
    for ( var j = i ; j < n - i ; j += i ) {

      // Calculate 't', the symmetric index to 'j' from the end of the array.
      // For an array of size 'n', index 'j' has a symmetric index 'n - j - 1'.
      var t = n - j - 1 ;

      // Check for conditions to break out of the inner loop:
      // 1. If index 'j' has already been added to the 'set' (visited).
      // 2. If index 't' has already been added to the 'set' (visited).
      // 3. If 'j' and 't' refer to the same index (e.g., the middle element for odd 'n').
      //    This prevents double-counting or processing an element with itself.
      if ( set . has ( j ) || set . has ( t ) || j === t ) {
        break ; // Exit the inner loop for the current 'i' if any condition is met.
      }

      // Add the values at indices 'j' and 't' from array 's' to the current sum 'k'.
      k += s [ j ] + s [ t ] ;

      // If the current sum 'k' is greater than the overall maximum 'ans', update 'ans'.
      if ( ans < k ) {
        ans = k ;
      }

      // Add both 'j' and 't' to the 'set' to mark them as visited for this 'i' iteration.
      set . add ( j ) ;
      set . add ( t ) ;

    } // End of the inner 'j' loop.

  } // End of the outer 'i' loop.

  // After all iterations, return the maximum sum found.
  return ans ;

} // End of the 'main' function.