/* This module provides a custom input reader for JavaScript programs.
 * It's designed to simplify reading input from standard input or a string.
 *
 * Author: Clone Generator v1.0
 * Date: 2023-10-27
 */

function gets  ( str )
{
  // Initialize the internal string array by splitting the input string by newlines.
  this._s = str . split ( "\n" ) ;

  // Initialize the current line index to 0.
  this._y = 0 ;
}
; // End of gets constructor definition.



// Define methods for the gets prototype object.
gets.prototype = {

  /*
   * Method 'a': Reads a single token from the current line.
   * If 'f' is true, returns the token as a string; otherwise, converts it to a number.
   */
  a : function (f)
  {
    // Local variables for convenience.
    var s = this._s ,
        y = this._y ,
          r               ;

    // If the current line hasn't been processed yet, split it by spaces and reverse.
    if ( typeof s [ y ] === "string" )
      s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;

    // Pop the last element (which is the first token due to reverse).
    r = s [ y ] . pop ( ) ;

    // If the current line is now empty, advance to the next line.
    if ( ! s [ y ] . length )
      this._y ++ ;

    // Return the token, optionally parsed as a number.
    return f ? r : + r ;
  },


  /*
   * Method 'l': Reads an entire line and splits it into tokens.
   * If 'f' is true, returns an array of strings; otherwise, an array of numbers.
   */
  l : function ( f )
  {
    // Read the current line, split by spaces, and then increment the line index.
    var s = this._s [ this._y ++ ] . split ( " " ) ;

    // Return the array of tokens, optionally mapped to numbers.
    return f ? s : s . map ( a => + a ) ;
  },


  /*
   * Method 'm': Reads multiple lines, each split into tokens.
   * 'n' specifies the number of lines to read.
   * If 'f' is true, returns an array of string arrays; otherwise, an array of number arrays.
   */
  m : function ( n , f )
  {
    var s = this._s ,
        y = this._y ,
        r = [ ] ,
        i = 0 ; // Loop counter.

    // If 'f' is true, store tokens as strings.
    if ( f )
    {
      for ( ; i < n ; i ++ )
      {
        r [ i ] = s [ y + i ] . split ( " " ) ;
      }
    }
    // Otherwise, parse tokens as numbers.
    else
    {
      for ( ; i < n ; i ++ )
      {
        r [ i ] = s [ y + i ] . split ( " " ) . map ( a => + a ) ;
      }
    }

    // Advance the line index by the number of lines read.
    this._y += n ;

    // Return the 2D array of tokens.
    return r ;
  },

} ; // End of gets.prototype definition.



// Create a new instance of the 'gets' object, reading from standard input.
var o = new gets ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// Execute the main logic and print the result to the console.
console.log ( main ( ) ) ;


/*
 * Main function: Solves the primary problem.
 */
function main ( )
{
  // Read an integer 'n' using the 'a' method.
  var n = o . a ( ) ;

  // Read a line of numbers into array 'a' using the 'l' method.
  var a = o . l ( ) ;

  // Initialize an empty array 'b'.
  var b = [ ] ;

  // Special case: if 'n' is 1 or 2, the answer is simply the maximum of 'a'.
  if ( n <= 2 )
  {
    return Math . max ( ... a ) ;
  }

  // Populate array 'b' with the maximum of adjacent elements in 'a'.
  for ( var i = 0 ; i < n - 1 ; i ++ )
  {
    b [ i ] = Math . max ( a [ i ] , a [ i + 1 ] ) ;
  }

  // Concatenate 'b' to 'a'.
  a = a . concat ( b ) ;

  // Find and return the middle element after sorting.
  return middle ( a ) ;


  /*
   * Helper function 'middle': Finds the median-like element of a sorted array.
   */
  function middle ( a )
  {
    // Sort the array 'a' in ascending numerical order.
    a . sort ( ( a , b ) => a - b ) ;

    // Return the element at the middle index (using bitwise right shift for integer division).
    return a [ a . length >> 1 ] ;
  }
}