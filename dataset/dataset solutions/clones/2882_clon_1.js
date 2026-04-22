/*
 * This entire module is an example of a Type I code clone.
 * It strictly adheres to the definition:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * All identifiers, operators, and expressions remain unchanged.
 * Only spacing, indentation, and comments have been altered
 * to create a visually distinct, yet functionally identical, version.
 */


    var GET = ( function  (  )  {

      /*
       * Inner helper function 'f'.
       * This serves as the primary factory function for the GET module.
       * It ensures that a new instance of the 'g' parser is always returned.
       */
  function f  (  s  )  { return new g ( s ) ; }

  // The core parsing class 'g'.
  // Manages the state of the input stream.
  function g  (  s  )  {
    /*
     * Initialize the internal string buffer '_s'.
     * The input string 's' is first trimmed to remove
     * leading/trailing whitespace, then split into an
     * array of lines based on the newline character.
     */
    this . _s  = s . trim ( ) . split ( "\n" ) ;

    // Initialize the line pointer '_y' to the first line (index 0).
    this . _y  = 0 ;
  }


  /*
   * Prototype method 'a' (for "atom" or "access").
   * This method is designed to extract a single value from the current line.
   *
   * @param {boolean} f - A flag: if true, returns the value as a string;
   *                        otherwise, attempts to convert it to a number.
   * @returns {string|number} The extracted value.
   */
  g . prototype . a = function  (  f  )  {

    var s = this . _s  , /* Reference to the internal string array */
        y = this . _y  , /* Current line index */
        r ; /* Variable to hold the result */

    // Check if the current line at index 'y' is still a raw string.
    // If it is, it means it hasn't been processed yet for splitting.
    if  (  typeof s [ y ]  ===  "string"  )  {

      /*
       * Split the current line by spaces and then reverse the array.
       * Reversing allows efficient 'pop()' operations to get values
       * from the "front" of the line conceptually.
       */
      s [ y ]  = s [ y ] . split ( " " ) . reverse ( ) ;
    }

    // Extract the last element from the (reversed) current line array.
    r = s [ y ] . pop ( ) ;

    // If the current line array becomes empty after popping,
    // increment the line pointer to move to the next line for subsequent reads.
    if  (  ! s [ y ] . length  )  {
      this . _y ++ ;
    }

    /*
     * Return the extracted value.
     * If 'f' is true, return 'r' as is (string).
     * Otherwise, use the unary plus operator (+r) to convert 'r' to a number.
     */
    return f  ?  r  :  + r ;
  } ;


  /*
   * Prototype method 'l' (for "line").
   * Reads an entire line of values.
   *
   * @param {boolean} f - Flag to return values as strings or numbers.
   * @returns {Array<string|number>} An array of values from the line.
   */
  g . prototype . l = function  (  f  )  {

    /*
     * Get the current line, increment the line pointer,
     * and then split the line by spaces.
     */
    var s = this . _s [ this . _y ++ ] . split ( " " ) ;

    // Return the array of strings or map them to numbers.
    return f  ?  s  :  s . map ( a  =>  + a ) ;
  } ;


  /*
   * Prototype method 'm' (for "matrix").
   * Reads 'n' consecutive lines and processes them as a 2D array (matrix).
   *
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - Flag to return values as strings or numbers.
   * @returns {Array<Array<string|number>>} A matrix of values.
   */
  g . prototype . m = function  (  n ,  f  )  {

    /*
     * Slice 'n' lines from the internal buffer starting at '_y'.
     * Increment '_y' by 'n'.
     * Map each sliced line by splitting it into an array of strings.
     */
    var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a  =>  a . split ( " " ) ) ;

    // If 'f' is true, return the string matrix.
    // Otherwise, map each inner array's elements to numbers.
    return f  ?  r  :  r . map ( a  =>  a . map ( a  =>  + a ) ) ;
  } ;


  /*
   * Prototype method 'r' (for "range" or "rows").
   * Reads 'n' consecutive lines as a 1D array of values.
   *
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - Flag to return values as strings or numbers.
   * @returns {Array<string|number>} An array of values from the lines.
   */
  g . prototype . r = function  (  n ,  f  )  {

    /*
     * Slice 'n' lines from the internal buffer, similar to 'm'.
     * The lines are kept as strings initially.
     */
    var r = this . _s . slice ( this . _y , this . _y += n ) ;

    // Return the array of strings or map each element to a number.
    return f  ?  r  :  r . map ( a  =>  + a ) ;
  } ;


  // The IIFE returns the factory function 'f', which becomes the 'GET' variable.
  return f ;

} ) ( ) ; /* End of GET module definition */


// Global 'o' object is instantiated using the GET parser.
// It reads the entire content of standard input as a UTF-8 string.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 * Helper function 'xArray' for creating multi-dimensional arrays.
 * This function dynamically constructs and evaluates a string
 * to create arrays of arbitrary dimensions, filled with a specified value.
 *
 * @param {any} v - The value to fill the array(s) with.
 * @param {...number} dimensions - The sizes of each dimension, from outermost to innermost.
 * @returns {Array} A multi-dimensional array.
 */
function xArray  (  v  )  {

  var a = arguments  , /* The arguments object (includes 'v' and dimensions) */
      l = a . length  , /* Total number of arguments */
      r = "Array(a["  +  -- l  +  "]).fill(0).map(x=>{return "  +  v  +  ";})" ; /* Innermost array creation string */

  // Loop backwards through dimensions to build the nested array creation string.
  while  (  -- l  )  {

    r = "Array(a["  +  l  +  "]).fill(0).map(x=>"  +  r  +  ")" ;
  }

  // Evaluate the constructed string to create and return the array.
  return eval ( r ) ;
}


// Main program execution starts here.
// The result of the 'main' function is printed to the console.
console . log ( main ( ) ) ;


/*
 * The 'main' function contains the primary business logic
 * of this application. It processes input data, performs
 * calculations, and determines a final result.
 */
function main  (  )  {

  // Read initial input values using the 'o' parser.
  var n = o . a ( ) ; // Represents the number of entries or rows.
  var x = o . a ( ) ; // Represents a critical threshold or constant.
  var b = o . m ( n ) ; // Reads 'n' lines as a matrix 'b'.

  var s = 0 ; // Initialize a sum variable 's'.

  /*
   * First processing loop:
   * Iterates through each row of the matrix 'b'.
   * Calculates a temporary value 't' and accumulates it into 's'.
   * Adds a new calculated element to the end of each row in 'b'.
   */
  for  (  var i = 0 ;  i < n ;  i ++  )  {

    // Calculate 't' using the first two elements of the current row.
    var t = b [ i ] [ 0 ]  *  b [ i ] [ 1 ] ;

    s += t ; // Add 't' to the running sum 's'.

    // Push a new calculated value onto the end of the current row.
    // This new value is derived from 'x' and elements b[i][0] and b[i][2].
    b [ i ] . push ( ( x - b [ i ] [ 0 ] )  *  b [ i ] [ 2 ] ) ;
  }

  // Sort the 'b' matrix in descending order based on the fourth element
  // (index 3), which was just added in the previous loop.
  // This sorting is crucial for the subsequent greedy or binary search logic.
  b . sort ( ( a , b )  =>  b [ 3 ]  -  a [ 3 ] ) ;

  /*
   * Initialize variables for a binary search algorithm.
   * 'ok' represents a "good" or feasible solution boundary.
   * 'ng' represents a "bad" or non-feasible solution boundary.
   * The search space is between 'ng' and 'ok'.
   */
  var ok = n * x  ,
      ng = - 1 ;

  // Binary search loop: continues as long as there's a gap greater than 1
  // between the 'ok' and 'ng' bounds.
  while  (  ok - ng  >  1  )  {

    // Calculate the midpoint 'm' (candidate solution) for the current search range.
    var m = Math . floor ( ( ok + ng )  /  2 ) ;

    // Initialize 'u' (remaining resource/capacity) with the total sum 's'.
    // Initialize 'k' (current 'm' value to be distributed/used).
    var u = s  ,
        k = m ;

    /*
     * Second processing loop (main logic for checking 'm'):
     * Iterates through the sorted 'b' matrix.
     * The loop continues as long as 'i' is within bounds, 'k' is positive,
     * AND 'u' is positive.
     */
    for  (  var i = 0 ;  i < n  &&  k > 0  &&  u > 0 ;  i ++  )  {

      // Condition: if the threshold 'x' is less than or equal to 'k'.
      if  (  x <= k  )  {

        // Decrease 'u' by a combined value from b[i][0]*b[i][1] and b[i][3].
        u -= b [ i ] [ 0 ]  *  b [ i ] [ 1 ]  +  b [ i ] [ 3 ] ;
        // Decrease 'k' by 'x'.
        k -= x ;

      } else  { /* Else condition: 'x' is greater than 'k'. */

        /*
         * Nested loop: This inner loop also increments 'i', which means
         * the outer loop's 'i' will be advanced multiple times if this branch is taken.
         * This structure might be intended for consuming multiple items or parts
         * of items from 'b' within a single outer iteration.
         */
        for  (  var v = u ;  i < n  &&  v > 0 ;  i ++  )  {

          v = u ; /* Reset 'v' to 'u' at the beginning of each inner iteration.
                   * This effectively makes 'v' a temporary variable for the current item's calculation,
                   * rather than an accumulator across inner loop items.
                   * Note: This behavior (resetting v=u and i++ in inner loop)
                   * is directly copied from the original code for Type I cloning.
                   */

          // Inner condition: if 'k' is less than b[i][0].
          if  (  k < b [ i ] [ 0 ]  )  {

            // Decrease 'v' by a partial amount based on b[i][1] and 'k'.
            v -= b [ i ] [ 1 ]  *  k ;

          } else  {

            // Decrease 'v' by a more complex calculated amount.
            v -= b [ i ] [ 0 ]  *  b [ i ] [ 1 ]  +  ( k - b [ i ] [ 0 ] )  *  b [ i ] [ 2 ] ;
          }
        }
        u = v ; // Update 'u' with the final 'v' value after the inner loop.
      }
    }

    // After the loops, adjust the binary search bounds.
    // If 'u' is still positive, it means 'm' was too small (not enough resources/capacity used).
    if  (  u > 0  )  {
      ng = m ; // 'm' is not feasible, move the 'ng' (bad) boundary up.
    } else  {
      ok = m ; // 'm' is feasible, move the 'ok' (good) boundary down.
    }
  }

  // The 'ok' variable now holds the smallest feasible 'm' value.
  return ok ;
}