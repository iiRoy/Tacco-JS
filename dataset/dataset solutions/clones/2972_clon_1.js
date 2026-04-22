"use strict" ; // Enforce strict mode for better error handling and cleaner code.


/**
 * @class I
 * @description A custom parser class for processing input strings.
 *              It splits the input by newlines and provides methods to read elements.
 * @param {string} t - The input string to be parsed.
 * @param {function} [i=Number] - An optional parsing function for elements.
 *                                 Defaults to Number constructor.
 */
function I ( t , i )
{
  // Store the input string split into an array of lines.
  this._s = t . split ( "\n" ) ;

  // Initialize the current column index within a line.
  this._c = 0 ;

  // Initialize the current line index.
  this._l = 0 ;

  // Store the parsing function, defaulting to Number.
  this._f = i || Number ;
}


/**
 * @method a
 * @description Reads the next element from the input stream.
 *              Moves to the next line if the current line is exhausted.
 * @param {function} [t] - An optional parsing function specific to this call.
 *                         If not provided, uses the instance's default parser.
 * @returns {*} The parsed element, or undefined if no more input.
 */
I . prototype . a = function ( t )
{
  // Get the current line.
  var i = this . _s [ this . _l ] ;

  // Check if the line exists (i.e., not end of input).
  if ( i )
  {
    // Trim whitespace and split the line into elements.
    var s = i . trim ( ) . split ( " " ) ,

        // Get the element at the current column.
        h = s [ this . _c ] ;

    // Increment the column index for the next read.
    this . _c ++ ;

    // If the current line is exhausted, reset column and move to the next line.
    s . length === this . _c && ( this . _c = 0 , this . _l ++ ) ;

    // Parse and return the element using the provided parser or the default.
    return t ? t ( h ) : this . _f ( h ) ;
  }
} ;


/**
 * @method l
 * @description Reads all elements from the current line, then moves to the next line.
 * @param {function} [t] - An optional parsing function specific to this call.
 *                         If not provided, uses the instance's default parser.
 * @returns {Array} An array of parsed elements from the current line,
 *                  or undefined if no more input lines.
 */
I . prototype . l = function ( t )
{
  // Get the current line.
  var i = this . _s [ this . _l ] ;

  // Check if the line exists.
  if ( i )
  {
    // Reset column index and advance to the next line.
    this . _c = 0 , this . _l ++ ;

    // Split the line, map elements with the parser, and return the array.
    return i . split ( " " ) . map ( t || this . _f ) ;
  }
} ;


// Export the I class for use in other modules.
module . exports = I ;


/**
 * @function main
 * @description The main entry point of the program.
 *              Parses input, performs a calculation based on specific conditions,
 *              and outputs a sequence of numbers or an error indicator.
 * @param {string} input - The raw input string read from stdin.
 */
function main ( input )
{
  // Create a new instance of the custom parser with the input.
  var o = new I ( input ) ;


  // Read the first number from the input.
  var m = o . a ( ) ;

  // Read the second number from the input.
  var k = o . a ( ) ;


  // Check if the second number (k) is zero.
  if ( k === 0 )
  {
    // Initialize an empty array to store results.
    var arr = [ ] ;

    // Calculate the upper limit for the first loop (2^m).
    var limit = Math . pow ( 2 , m ) ;

    // Populate the array with numbers from 0 up to (2^m - 1).
    for ( var i = 0 ; i < limit ; i ++ )
    {
      arr . push ( i ) ;
    }

    // Populate the array with numbers from (2^m - 1) down to 0.
    for ( var i = limit - 1 ; i >= 0 ; i -- )
    {
      arr . push ( i ) ;
    }

    // Output the array elements joined by spaces.
    console . log ( arr . join ( " " ) ) ;
  }
  else
  {
    // If k is not zero, output "-1" indicating an error or specific condition.
    console . log ( "-1" ) ;
  }
}


// Read input from /dev/stdin synchronously and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;