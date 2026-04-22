"use strict"
; // This directive enables strict mode, which helps catch common coding errors.

/*
 *  The 'I' class is designed to process input strings line by line,
 *  and token by token. It acts as a custom input stream reader.
 *
 *  @param {string} t - The raw input string, expected to be multi-line.
 *  @param {function} i - An optional parsing function for individual tokens.
 *                         If not provided, Number constructor is used by default.
 */
function I ( t , i )
{
  // Internal array to store lines of the input string.
  // The input string 't' is split by newline characters.
  this._s = t .split ( "\n" ) ;

  // _c: Current column (token index) within the current line.
  // Initialized to 0, indicating the start of a line.
  this._c = 0 ;

  // _l: Current line index being processed from the _s array.
  // Initialized to 0, pointing to the first line.
  this._l = 0 ;

  // _f: The default function used to parse tokens.
  // If 'i' (the provided parser) is truthy, use it; otherwise, default to Number.
  this._f = i || Number ;
}

// Define the 'a' method on the prototype of the 'I' class.
// This method retrieves the next single token from the input stream.
I . prototype . a = function ( t )
{
  // Get the current line string based on the internal line index (_l).
  var /* current line reference */ i = this._s [ this._l ] ;

  // Check if the current line actually exists (i.e., not undefined or null).
  if ( i )
  {
    // Trim leading/trailing whitespace from the line and split it into tokens by spaces.
    var s = i . trim ( ) . split ( " " ) ,
        // Extract the token at the current column index (_c).
        h = s [ this._c ] ;

    // Increment the column index to point to the next token for subsequent calls.
    this._c ++ ;

    // If all tokens on the current line have been read (i.e., _c equals line length),
    // then reset the column index to 0 and advance to the next line.
    s . length === this._c && ( this._c = 0 , this._l ++ ) ;

    // Return the parsed token:
    // If a custom parser 't' is provided as an argument, use it to parse 'h'.
    // Otherwise, use the default parsing function '_f' (either 'i' or Number).
    return t ? t ( h ) : this._f ( h ) ;
  }
} ; // End of 'a' method definition.


/*
 *  The 'l' method is used to read all tokens from the current line
 *  as an array, applying a specified or default parser to each token.
 */
I . prototype . l = function ( t )
{
  // Get the current line string from the stored array.
  var i = this._s [ this._l ] ;

  // If the current line is valid (not null/undefined).
  if ( i )
  {
    // Reset the column index, as this method processes the entire line.
    this._c = 0 ;
    // Advance to the next line after the current line has been read.
    this._l ++ ;

    // Split the current line into tokens by spaces.
    // Then, map each token using the provided parser 't' or the default parser '_f'.
    // The resulting array of parsed tokens is returned.
    return i . split ( " " ) . map ( t || this._f ) ;
  }
} ; // Concludes the 'l' method definition.

// Export the 'I' class constructor so it can be imported and used by other modules.
module . exports = I ;


/*
 *  The main function where the primary logic of the program resides.
 *  It processes input based on a sequence of operations.
 *
 *  @param {string} input - The full input string provided to the program.
 */
function main ( input )
{
  // Create a new instance of our custom input parser 'I'.
  // This object 'o' will manage reading tokens and lines from the input.
  var o = new I ( input ) ;

  // Read the first token from the input. This often represents the number of queries or operations.
  var q = o . a ( ) ; // 'q' stores the total count of subsequent operations.

  // Initialize a counter variable. This variable 'c' accumulates values over operations.
  var c = 0 ; // Represents a cumulative sum or cost.

  // Initialize an empty array. This array 'sorted' will store elements that need to be kept in order.
  var sorted = [ ] ; // An array to hold values that are frequently sorted.


  // Begin a loop that iterates 'q' times, processing each operation.
  for ( var i = 0 ; i < q ; i ++ )
  {
    // Read the type of the current query/operation.
    var q1 = o . a ( ) ; // 'q1' determines whether to add elements or perform a calculation.

    // If 'q1' is 1, it signifies an "add" operation.
    if ( q1 === 1 )
    {
      // Read two more tokens for this specific operation.
      var a = o . a ( ) ; // The first value to be added to the 'sorted' list.
      var b = o . a ( ) ; // The second value, usually an increment to 'c'.

      // Add 'b' to the cumulative counter 'c'.
      c += b ; // Updates the running total.

      // Add 'a' to the 'sorted' array.
      sorted . push ( a ) ; // Appends 'a' to the array for later sorting.
    }
    // If 'q1' is not 1, it signifies a "query" or "calculate" operation.
    else
    {
      // Sort the 'sorted' array numerically in ascending order.
      // This is an in-place sort, and the result is reassigned back to 'sorted'.
      sorted = sorted . sort ( ( a , b ) => a - b ) ;

      // Calculate the median element of the sorted array.
      // For an array of length N, the median index is floor((N - 1) / 2).
      var mid = sorted [ Math . floor ( ( sorted . length - 1 ) / 2 ) ] ;

      // Calculate the final answer for this query.
      // It involves mapping each element to its absolute difference from the median,
      // reducing these differences to a sum, and then adding the cumulative counter 'c'.
      var ans = sorted . map ( x => Math . abs ( x - mid ) ) . reduce ( ( acc , cur ) => acc + cur ) + c ;

      // Output the calculated median and the final answer to the console.
      console . log ( mid , ans ) ;
    }
  } // The loop concludes here after all 'q' operations are processed.
} // The definition of the 'main' function ends.


// Execute the 'main' function.
// The input is read from standard input (typically a file redirected to /dev/stdin)
// using Node.js's 'fs' module, and decoded as UTF-8.
main (
  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
) ; // This line initiates the program by calling 'main' with the input data.