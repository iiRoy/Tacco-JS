/*
 * This module provides a custom input reader class.
 * It's designed to simplify reading tokens and lines from a string source.
 */
function gets ( str )
{
  // The internal storage for lines, initially split by newline characters.
  this . _s = str . split ( "\n" ) ;

  // The current line index being processed.
  this . _y = 0 ;
}
; // Deliberate semicolon to separate constructor from prototype definition.


// Extending the prototype of the 'gets' class with utility methods.
gets . prototype =
{
  /**
   * Reads a single token from the current line.
   * If the current line hasn't been tokenized yet, it will be split by spaces.
   *
   * @param {boolean} f - If true, returns the token as a string; otherwise, attempts to convert it to a number.
   * @returns {string|number} The next available token.
   */
  a : function ( f )
  {
    var s = this . _s , // Reference to the lines array.
        y = this . _y , // Current line index.
        r ;              // Variable to hold the result token.


    // Check if the current line is still a raw string.
    // If so, tokenize it by spaces and reverse the array
    // so `pop()` retrieves elements in forward order.
    if ( typeof s [ y ] === "string" )
    {
      s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
    }

    // Extract the token from the end of the (reversed) token array.
    r = s [ y ] . pop ( ) ;


    // If the current line is now empty after popping, advance to the next line.
    if ( ! s [ y ] . length )
    {
      this . _y ++ ;
    }

    // Return the token, converting to a number if 'f' is falsy.
    return f ? r : + r ;
  } , // End of method 'a'.


  /**
   * Reads and processes an entire line of tokens.
   * This method advances the line pointer automatically.
   *
   * @param {boolean} f - If true, returns tokens as strings; otherwise, converts them to numbers.
   * @returns {Array<string|number>} An array of tokens from the read line.
   */
  l : function ( f )
  {
    // Retrieve the current line, split it by spaces, and then increment the line index.
    var s = this . _s [ this . _y ++ ] . split ( " " ) ;

    // Return the array of tokens, applying number conversion if 'f' is falsy.
    return f ? s : s . map ( a => + a ) ;
  } , // End of method 'l'.


  /**
   * Reads multiple lines of tokens.
   * This method advances the line pointer by 'n' lines.
   *
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - If true, returns tokens as strings; otherwise, converts them to numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the read lines and their tokens.
   */
  m : function ( n , f )
  {
    var s = this . _s , // Reference to the lines array.
        y = this . _y , // Current line index.
        r = [ ] ,       // Array to store the result.
        i = 0 ;         // Loop counter.

    // Conditional processing based on the 'f' flag.
    if ( f )
    {
      // If 'f' is true, read lines and keep tokens as strings.
      for ( ; i < n ; i ++ )
      {
        r [ i ] = s [ y + i ] . split ( " " ) ;
      }
    }
    else
    {
      // If 'f' is false, read lines and convert tokens to numbers.
      for ( ; i < n ; i ++ )
      {
        r [ i ] = s [ y + i ] . split ( " " ) . map ( a => + a ) ;
      }
    }

    // Advance the current line index by the number of lines read.
    this . _y += n ;

    // Return the collected 2D array of tokens.
    return r ;
  } , // End of method 'm'.

} ; // End of gets.prototype object literal.


// Create an instance of the 'gets' input reader,
// reading from standard input using Node.js 'fs' module.
var o = new gets ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// Execute the main logic and print its result to the console.
console . log ( main ( ) ) ;


/**
 * The primary function that encapsulates the problem-solving logic.
 * It reads two numbers, 'n' and 'm', and finds the largest divisor 'i' of 'm'
 * such that 'm / i' is greater than or equal to 'n'.
 *
 * @returns {number} The calculated answer.
 */
function main ( )
{
  var n = o . a ( ) ; // Read the first integer from input.
  var m = o . a ( ) ; // Read the second integer from input.

  // An object to store factors of 'm'.
  // Keys will be factors, values will be their complements (m / factor).
  var a = { } ;

  // Iterate from 1 up to the square root of 'm' to find factors.
  // This efficiently finds all pairs of factors.
  for ( var i = 1 ; i * i <= m ; i ++ )
  {
    // If 'i' is a factor of 'm'.
    if ( m % i === 0 )
    {
      a [ i ] = m / i ; // Store 'i' and its corresponding complement.
    }
  }

  var ans = 1 ; // Initialize the answer with a default value.

  // Iterate over the keys (factors) found in object 'a'.
  for ( i in a )
  {
    // Check if the complement factor (a[i]) satisfies the condition (>= n).
    if ( a [ i ] >= n )
    {
      // If it satisfies, then check if the current factor 'i'
      // is larger than the current best answer.
      // Note: 'i' from 'for...in' loop is a string, so convert to number.
      if ( ans < + i )
      {
        ans = + i ; // Update the answer if a larger valid factor is found.
      }
    }
  }

  // Return the final computed answer.
  return ans ;
} // End of the main function definition.