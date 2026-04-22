/*
 * This file contains utility functions for input processing.
 * It uses a "GET" module to parse input from stdin.
 */
"use strict" ; /* Enforce strict mode for cleaner code. */


var GET = ( /* IIFE for creating the GET module */
  function ()
    {

      /**
       * Factory function to create a new input reader instance.
       * @param {string} s - The raw input string.
       * @returns {g} A new instance of the input reader.
       */
      function f ( s )
        {
          return new g ( s ) ;
        }

      /**
       * Constructor for the input reader.
       * @param {string} s - The input string.
       */
      function g ( s )
        {
          // Internal state: _s stores lines, _y is the current line index.
          this._s = s . trim ( ) . split ( "\n" ) ;
          this._y = 0 ;
        }

      /**
       * Reads a single element from the current line,
       * treating the line as space-separated values in reverse order.
       * Advances to the next line if the current one is exhausted.
       * @param {boolean} f - If true, returns string; otherwise, returns number.
       * @returns {string|number} The read element.
       */
      g . prototype . a = function ( f )
        {
          var s = this . _s ,
              y = this . _y ,
              r ;

          // Check if the current line needs to be parsed into an array.
          if ( typeof s [ y ] === "string" )
            {
              s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
            }

          // Pop the last element (which is the first after reverse).
          r = s [ y ] . pop ( ) ;

          // If the current line is now empty, move to the next line.
          if ( ! s [ y ] . length )
            {
              this . _y ++ ;
            }

          // Return as string or number based on 'f'.
          return f ? r : + r ;
        } ; /* End of 'a' method */


      /**
       * Reads an entire line as space-separated values.
       * Advances to the next line.
       * @param {boolean} f - If true, returns strings; otherwise, returns numbers.
       * @returns {string[]|number[]} An array of values from the line.
       */
      g . prototype . l = function ( f )
        {
          var s = this . _s [ this . _y ++ ] . split ( " " ) ; // Split and advance line index.

          // Return as strings or numbers.
          return f ? s : s . map ( a => + a ) ;
        } ; // End of 'l' method


      /**
       * Reads 'n' lines, parsing each into space-separated values.
       * Advances the line index by 'n'.
       * @param {number} n - The number of lines to read.
       * @param {boolean} f - If true, returns strings; otherwise, returns numbers.
       * @returns {string[][]|number[][]} A 2D array of values.
       */
      g . prototype . m = function ( n , f )
        {
          // Slice 'n' lines, then map each to an array of split values.
          var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;

          // Return as strings or numbers.
          return f ? r : r . map ( a => a . map ( a => + a ) ) ;
        } ; // End of 'm' method


      /**
       * Reads 'n' lines without splitting them.
       * Advances the line index by 'n'.
       * @param {number} n - The number of lines to read.
       * @param {boolean} f - If true, returns strings; otherwise, returns numbers.
       * @returns {string[]|number[]} An array of raw line strings or numbers.
       */
      g . prototype . r = function ( n , f )
        {
          // Slice 'n' lines.
          var r = this . _s . slice ( this . _y , this . _y += n ) ;

          // Return as strings or numbers.
          return f ? r : r . map ( a => + a ) ;
        } ; // End of 'r' method

      return f ; // Expose the factory function.
    }
) ( ) ; // IIFE execution.


// Initialize the input reader 'o' by reading from standard input.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/**
 * Dynamically creates a multi-dimensional array initialization string.
 * This function uses 'eval' and should be used with caution.
 * @param {*} v - The initial value for the innermost array elements.
 * @returns {string} An array initialization string.
 */
function xArray ( v )
  {
    var a = arguments ,
        l = a . length ,
        r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ;

    // Build the array creation string for each dimension.
    while ( -- l )
      {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
      }

    return eval ( r ) ; // Execute the generated string to create the array.
  }


// Print the result of the main function to the console.
console . log ( main ( ) ) ;


/**
 * The main entry point of the program.
 * Reads input using the 'o' reader and performs a calculation.
 * @returns {number} The calculated result (0 or 1).
 */
function main ( )
  {
    var n = o . l ( ) ; // Read the first line.

    // Note: The original code reads 'n' again, effectively overwriting the first read.
    // This might be intentional or a copy-paste error in the original problem.
    var n = o . l ( ) ; // Read the second line into the same variable 'n'.

    /*
     * Check if the second element of the 'n' array (from the second line read)
     * is strictly equal to 1.
     */
    return n [ 1 ] === 1 ? 1 : 0 ; // Return 1 if true, 0 if false.
  }