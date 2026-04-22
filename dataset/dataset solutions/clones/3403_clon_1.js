/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition: "Code fragments are exactly equal,
 * except for possible variations in whitespace and comments."
 *
 * No identifiers, variable names, function names, operators, or expressions
 * have been altered. Only whitespace (indentation, spacing, blank lines)
 * and comments (additions, modifications) have been used to create a
 * visually distinct but logically identical version.
 */


/*
 * The GET module is an Immediately Invoked Function Expression (IIFE)
 * designed to parse input data, typically from standard input.
 * It provides methods for reading different data types.
 */
var GET = (

  function ( ) {

    /**
     * Factory function 'f' creates a new instance of the 'g' parser.
     * @param {string} s - The raw input string.
     * @returns {g} A new parser instance.
     */
    function f ( s ) {
      return new g ( s ) ;
    }


    /**
     * Constructor function 'g' initializes the parser state.
     * @param {string} s - The input string to be parsed.
     */
    function g ( s ) {
      /*
       * Store the input string as an array of lines,
       * after trimming leading/trailing whitespace from the whole input.
       */
      this._s = s . trim ( ) . split ( "\n" ) ;
      // Initialize the current line index.
      this._y = 0 ;
    }


    /**
     * Prototype method 'a' (atomic) reads a single item from the current line.
     * If the line is not yet processed, it reverses it for easy popping.
     * @param {boolean} f - If true, return as string; otherwise, return as number.
     * @returns {string|number} The parsed item.
     */
    g . prototype . a = function ( f ) {
      var s = this._s ,
          y = this._y ,
          r ; // Declare 'r' for the result.

      /*
       * Check if the current line is a string (unprocessed)
       * and needs to be split and reversed.
       */
      if ( typeof s [ y ] === "string" ) {
        s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
      }

      r = s [ y ] . pop ( ) ; // Pop the last element (which was the first after reverse).

      /*
       * If the current line is empty after popping,
       * advance to the next line.
       */
      if ( ! s [ y ] . length ) {
        this._y ++ ;
      }

      /*
       * Return the result,
       * converting to number if 'f' is falsy.
       */
      return f ? r : + r ;
    } ;


    /**
     * Prototype method 'l' (line) reads an entire line of space-separated items.
     * @param {boolean} f - If true, return as strings; otherwise, return as numbers.
     * @returns {Array<string|number>} An array of parsed items from the line.
     */
    g . prototype . l = function ( f ) {
      // Split the current line by spaces and then advance the line index.
      var s = this._s [ this._y ++ ] . split ( " " ) ;

      /*
       * Return the array,
       * mapping elements to numbers if 'f' is falsy.
       */
      return f ? s : s . map ( a => + a ) ;
    } ;


    /**
     * Prototype method 'm' (matrix) reads 'n' lines, each split into space-separated items.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, return as strings; otherwise, return as numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of parsed items.
     */
    g . prototype . m = function ( n , f ) {
      /*
       * Slice 'n' lines, advance the line index,
       * and then map each line to an array of space-separated strings.
       */
      var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;

      /*
       * Return the matrix,
       * optionally mapping all elements to numbers.
       */
      return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;


    /**
     * Prototype method 'r' (raw) reads 'n' lines as raw strings.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, return as strings; otherwise, return as numbers.
     * @returns {Array<string|number>} An array of raw lines.
     */
    g . prototype . r = function ( n , f ) {
      // Slice 'n' lines and advance the line index.
      var r = this._s . slice ( this._y , this._y += n ) ;

      /*
       * Return the array of lines,
       * optionally mapping elements to numbers.
       */
      return f ? r : r . map ( a => + a ) ;
    } ;


    // The IIFE returns the factory function 'f'.
    return f ;

  } ) ( ) ; // Immediately invoke the function.



/*
 * Read input from /dev/stdin using Node.js 'fs' module.
 * The input is read synchronously as UTF-8 and then passed
 * to the GET parser.
 */
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// Log the result of the main function to the console.
console . log ( main ( ) ) ;


/**
 * The main function encapsulates the problem-solving logic.
 * It reads dimensions and obstacle data, then calculates an answer.
 * @returns {number} The calculated answer.
 */
function main ( ) {

  // Read height, width, and number of obstacles from input.
  var h = o . a ( ) ;
  var w = o . a ( ) ;
  var n = o . a ( ) ;

  /*
   * Initialize a 2D structure 'b' to represent a grid or map.
   * It's an array of objects, where each object can store column-wise data.
   * Array size is h+1 to accommodate 1-based indexing for rows.
   */
  var b = Array ( h + 1 ) . fill ( 0 ) . map ( a => {
    return { } ;
  } ) ;


  /*
   * First loop: Process 'n' obstacles.
   * Each obstacle 't' has two coordinates [t[0], t[1]].
   * If t[0] (column) is less than t[1] (row), it's ignored.
   * Otherwise, mark the cell b[row][column] as 1 (obstacle).
   */
  for ( var i = 0 ; i < n ; i ++ ) {
    var t = o . l ( ) ; // Read an obstacle's coordinates.

    if ( t [ 0 ] < t [ 1 ] ) {
      // If column is less than row, skip this obstacle.
      continue ;
    }

    // Mark the cell as occupied by an obstacle.
    b [ t [ 1 ] ] [ t [ 0 ] ] = 1 ;
  }


  /*
   * Second loop: Add a "wall" at column w+1 for all rows.
   * This simplifies boundary checks later.
   */
  for ( i = 1 ; i <= h ; i ++ ) {
    b [ i ] [ w + 1 ] = 1 ;
  }


  // Initialize 'ans' with the first available column in row 1, minus 1.
  var ans = Object . keys ( b [ 1 ] ) [ 0 ] - 1 ;
  // Initialize 'x' as the current column to check, starting from 2.
  var x = 2 ;


  /*
   * Main loop: Iterate through rows from 2 to 'h' to find the minimum 'ans'.
   * This loop simulates finding the path.
   */
  for ( i = 2 ; i <= h ; i ++ ) {

    // Advance 'x' until an empty cell is found in the current row 'i'.
    while ( b [ i ] [ x ] ) {
      x ++ ;
    }

    // If 'x' exceeds 'ans', it means no better path can be found, so break.
    if ( x > ans ) {
      break ;
    }

    /*
     * Inner loop: Iterate through obstacles in the current row 'b[i]'.
     * 'j' represents the column index of an obstacle.
     */
    for ( var j in b [ i ] ) {
      // Convert 'j' from string (from Object.keys) to number.
      j = + j ;

      // If the current path position 'x' is already past or at the obstacle 'j', skip.
      if ( x >= j ) {
        continue ;
      }

      /*
       * If (j - 1) provides a shorter path than the current 'ans',
       * update 'ans'.
       */
      if ( j - 1 < ans ) {
        ans = j - 1 ;
      }

      // After finding the first relevant obstacle, break from the inner loop.
      break ;
    }

    // Increment 'x' to move to the next column for the next row's check.
    x ++ ;
  }


  // Return the final calculated minimum 'ans'.
  return ans ;
}