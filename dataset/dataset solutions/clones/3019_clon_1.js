// This file implements a solution to a specific algorithmic problem.
// It includes a custom utility class for input parsing and the main logic.

"use strict" ;        // Enforce strict mode for cleaner, more predictable JavaScript.


/**
 * I: A custom input parser class designed for competitive programming.
 *    It provides methods to read tokens and lines from a given string.
 *
 * @param {string} s - The raw input string, typically read from stdin.
 * @param {function} f - A parsing function to apply to each token (e.g., `Number`, `String`).
 *                         Defaults to `Number` if not provided.
 */
function I( s , f )
{
  this._s = s . split ( "\n" ) ;   // Store the input string as an array of lines.
  this._c = 0 ;                    // _c: Current token index within the current line.
  this._l = 0 ;                    // _l: Current line index.
  this._f = f || Number ;          // _f: The function used to parse individual tokens.
}


// Define methods on the prototype of the I class.

I . prototype . a = function ( )
{
  // a(): Reads and returns a single token from the input.

  var l = this._s [ this._l ] ;    // Retrieve the current line from the stored input.

  if ( ! l )
  {
    // If the current line is null or undefined, there's no more input to read.
    return ;
  }

  var t = l . trim ( ) . split ( " " ) ; // Trim whitespace from the line and split it into tokens.
  var a = t [ this._c ] ;                // Get the token at the current token index.

  this._c ++ ;                           // Advance the token index to point to the next token.

  if ( t . length === this._c )
  {
    // If all tokens on the current line have been consumed,
    this._c = 0 ;   // Reset the token index for the next line.
    this._l ++ ;    // Move to the next line.
  }

  // Parse the extracted token using the designated parsing function and return it.
  return this._f ( a ) ;
} ;


I . prototype . l = function ( )
{
  // l(): Reads and returns all tokens from the current line as an array.

  var l = this._s [ this._l ] ;    // Get the current line of input.

  if ( ! l )
  {
    // If the current line is empty or undefined, there's nothing to read.
    return ;
  }

  this._c = 0 ;                     // Reset the token index as a new line is being read.
  this._l ++ ;                      // Advance the line index to the next line.

  // Split the line into tokens, apply the parsing function to each token, and return the array.
  return l . split ( " " ) . map ( this._f ) ;
} ;


/**
 * main: The primary function that encapsulates the problem's logic.
 *
 * @param {string} input - The entire input content provided to the program.
 */
function main ( input )
{
  // Instantiate the input parser with the raw input string and `String` as the default token parser.
  var o = new I ( input , String ) ;


  // Read the first value, which is typically 'n' (a number).
  var n = Number ( o . a ( ) ) ;

  // Read the second value, which is the string 's' for processing.
  var s = o . a ( ) ;


  // Initialize counters for the number of white ('.') and black ('#') cells.
  var white = 0 ;
  var black = 0 ;


  // First iteration: Count the initial number of white cells in the string 's'.
  for ( var i = 0 ; i < s . length ; i ++ )
  {
    if ( s [ i ] === "." )
    {
      white += 1 ;    // Increment the white cell counter.
    }
  }


  // Initialize 'min' with the total count of white cells. This represents the cost
  // if we don't change any cells to white from left to right.
  let min = white ;


  // Second iteration: Traverse the string from left to right to determine the minimum operations.
  for ( var i = 0 ; i < s . length ; i ++ )
  {
    if ( s [ i ] === "#" )
    {
      // If the current cell is black ('#'), it means we need to change it to white.
      // This operation contributes to 'black' cells that must be flipped.
      black += 1 ;
    }
    else
    {
      // If the current cell is white ('.'), it means it's already white.
      // It no longer contributes to the 'white' cells that might need flipping
      // if we were considering the segment to its right.
      white -= 1 ;
    }

    // The current cost is the sum of black cells encountered so far (which need flipping)
    // and the remaining white cells to the right (which are already white).
    if ( black + white < min )
    {
      min = black + white ;   // Update 'min' if a smaller total cost is found.
    }
  }

  // Output the final minimum number of operations required.
  console . log ( min ) ;
}


// This line reads the entire content of standard input (stdin) as a UTF-8 string
// and passes it to the 'main' function for processing.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;