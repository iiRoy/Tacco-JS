/*
 * This file enforces strict mode for better code quality.
 */
"use strict"
; // End of strict mode declaration.


// Define a global utility object 'GET' using an Immediately Invoked Function Expression (IIFE).
// This IIFE creates a factory function for parsing input data.
var GET = (

  function ( )
  {
    // The main factory function 'f' that creates an instance of the data parser.
    function f( s )
    {
      // Returns a new parser object initialized with the input string 's'.
      return new g( s )
      ;
    }


    // Constructor function 'g' for the data parser.
    // It processes the raw input string into an array of lines.
    function g( s )
    {
      // _s stores the lines of the input, trimmed and split by newline.
      this._s = s.trim( ).split( "\n" )
      ;
      // _y is the current line index, initialized to 0.
      this._y = 0
      ;
    }


    // Prototype method 'a' for reading a single token from the current line.
    // It reads tokens in reverse order from the line.
    g.prototype.a = function ( f )
    {
      // Cache the current state variables for efficiency.
      var s = this._s
      ,
        y = this._y
      ,
        r
      ;

      // If the current line hasn't been processed into tokens yet,
      // split it by space and reverse the order.
      // This allows 'pop' to get tokens from the left side of the original line.
      if ( typeof s[ y ] === "string" )
      {
        s[ y ] = s[ y ].split( " " ).reverse( )
        ;
      }

      // Pop the next token from the (reversed) current line.
      r = s[ y ].pop( )
      ;

      // If the current line is now empty, advance to the next line.
      if ( ! s[ y ].length )
      {
        this._y++
        ;
      }

      // Return the token. If 'f' (flag for string) is true, return as string;
      // otherwise, convert to number using unary plus operator.
      return f ? r : + r
      ;
    }
    ;


    // Prototype method 'l' for reading an entire line as an array of tokens.
    // Advances the line pointer after reading.
    g.prototype.l = function ( f )
    {
      // Get the current line, split it into tokens by space, and then increment the line pointer.
      var s = this._s[ this._y++ ].split( " " )
      ;

      // If 'f' (flag for string) is true, return the array of tokens as strings;
      // otherwise, map each token to a number.
      return f ? s : s.map( a => +a )
      ;
    }
    ;


    // Prototype method 'm' for reading 'n' lines as a 2D array (matrix) of tokens.
    // Advances the line pointer by 'n' lines.
    g.prototype.m = function ( n, f )
    {
      // Slice 'n' lines from the input, starting from the current line pointer.
      // Then, map each line to an array of tokens by splitting by space.
      // The line pointer is advanced by 'n' after slicing.
      var r = this._s.slice( this._y, this._y += n ).map( a => a.split( " " ) )
      ;

      // If 'f' (flag for string) is true, return the 2D array of tokens as strings;
      // otherwise, map each inner array to an array of numbers.
      return f ? r : r.map( a => a.map( a => +a ) )
      ;
    }
    ;


    // Prototype method 'r' for reading 'n' lines as a 1D array of tokens.
    // Advances the line pointer by 'n' lines.
    g.prototype.r = function ( n, f )
    {
      // Slice 'n' lines from the input, starting from the current line pointer.
      // The line pointer is advanced by 'n' after slicing.
      var r = this._s.slice( this._y, this._y += n )
      ;

      // If 'f' (flag for string) is true, return the array of lines as strings;
      // otherwise, map each line to a number.
      return f ? r : r.map( a => +a )
      ;
    }
    ;


    // The IIFE returns the factory function 'f', making it accessible via 'GET'.
    return f
    ;
  }

)( )
; // End of IIFE for GET.


// Initialize 'o' with parsed input from standard input.
// It reads the entire content of /dev/stdin as UTF-8.
var o = GET( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) )
;


// Helper function to create multi-dimensional arrays initialized with a value.
// Uses eval for dynamic array creation based on variable arguments.
function xArray( v )
{
  var a = arguments
  ,
    l = a.length
  ,
    r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"
  ;

  // Build the nested array creation string from right to left.
  while ( --l )
  {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")"
    ;
  }

  // Evaluate the dynamically generated string to create the array.
  return eval( r )
  ;
}


// Call the main function and print its return value to the console.
console.log( main( ) )
;


// The primary logic function of the program.
function main( )
{
  // Read the first integer value from input using the 'a' method.
  var x = o.a( )
  ;

  // Read the second integer value from input using the 'a' method.
  var y = o.a( )
  ;

  // Initialize the answer variable.
  var ans = 0
  ;

  // Check conditions for 'x' and add points to 'ans'.
  if ( x === 1 )
  {
    ans += 300000
    ;
  }
  if ( x === 2 )
  {
    ans += 200000
    ;
  }
  if ( x === 3 )
  {
    ans += 100000
    ;
  }

  // Check conditions for 'y' and add points to 'ans'.
  if ( y === 1 )
  {
    ans += 300000
    ;
  }
  if ( y === 2 )
  {
    ans += 200000
    ;
  }
  if ( y === 3 )
  {
    ans += 100000
    ;
  }

  // Check for a specific bonus condition and add points.
  if ( x === 1 && y === 1 )
  {
    ans += 400000
    ;
  }

  // Return the final calculated answer.
  return ans
  ;
}