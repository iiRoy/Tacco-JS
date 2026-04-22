var GET = ( /* This is an Immediately Invoked Function Expression (IIFE) */
  function ( ) {

    /**
     * Factory function to create a new GET instance.
     * @param {string} s - The input string.
     * @returns {g} A new GET instance.
     */
    function f ( s ) {

      return new g ( s ) ;
    }



    /**
     * Constructor for the internal GET object.
     * It processes the input string into an array of lines.
     * @param {string} s - The raw input string.
     */
    function g ( s ) {
      /* Store the processed lines. Trim removes leading/trailing whitespace, split separates by newline. */
      this._s = s . trim ( ) . split ( "\n" ) ;
      /* Initialize the current line index to 0. */
      this._y = 0 ;
    }



    /**
     * Reads a single value from the current line.
     * If the line has not been split yet, it splits it by space and reverses it.
     * @param {boolean} f - If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number} The read value.
     */
    g . prototype . a = function ( f ) {
      // Get a reference to the lines array and the current line index.
      var s = this._s ,
        y = this._y ,
        r ;

      // If the current line is still a single string, split it by space and reverse.
      // Reversing allows efficient popping from the end.
      if ( typeof s [ y ] === "string" ) {
        s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
      }

      // Pop the last element from the current line's array.
      r = s [ y ] . pop ( ) ;

      // If the current line is now empty, increment the line index to move to the next line.
      if ( ! s [ y ] . length ) {
        this._y ++ ;
      }

      // Return the value, either as a string or parsed to a number based on 'f'.
      return f ? r : + r ;
    } ;



    /**
     * Reads an entire line of space-separated values.
     * @param {boolean} f - If true, returns values as strings; otherwise, as numbers.
     * @returns {string[]|number[]} An array of values from the line.
     */
    g . prototype . l = function ( f ) {
      // Get the current line, split it by space, and then increment the line index.
      var s = this._s [ this._y ++ ] . split ( " " ) ;

      // Return the array, either as strings or mapped to numbers.
      return f ? s : s . map ( a => + a ) ;
    } ;



    /**
     * Reads a matrix (n lines, each split by space).
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns values as strings; otherwise, as numbers.
     * @returns {string[][]|number[][]} A 2D array representing the matrix.
     */
    g . prototype . m = function ( n , f ) {
      // Slice 'n' lines from the current position, then map each line.
      var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;

      // Return the matrix, either as strings or with all elements mapped to numbers.
      return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;



    /**
     * Reads a block of 'n' lines without splitting individual lines.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns lines as strings; otherwise, attempts to parse each line as a number.
     * @returns {string[]|number[]} An array of lines.
     */
    g . prototype . r = function ( n , f ) {
      // Slice 'n' lines from the current position, then increment the line index.
      var r = this._s . slice ( this._y , this._y += n ) ;

      // Return the array, either as strings or mapped to numbers.
      return f ? r : r . map ( a => + a ) ;
    } ;

    // The IIFE returns the factory function 'f'.
    return f ;

  }
) ( ) ; /* End of GET IIFE */



// Initialize 'o' by reading input from stdin using the GET utility.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;



/**
 * Creates a multi-dimensional array initialized with a value.
 * This function uses 'eval' and is generally discouraged for security reasons
 * in untrusted environments, but is common in competitive programming.
 * @param {*} v - The initial value for the innermost array elements.
 * @returns {Array} The multi-dimensional array.
 */
function xArray ( v ) {
  var a = arguments ,
    l = a . length ,
    r = "Array(a[" + -- l + "]).fill(v)" ; // Start with the innermost array dimension.

  // Loop backwards through arguments to build nested Array.fill.map structures.
  while ( -- l ) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
  }

  // Evaluate the constructed string to create the array.
  return eval ( r ) ;
}



/**
 * Implements the QuickSelect algorithm to find the k-th smallest element (0-indexed).
 * After execution, the array 'a' is partially sorted such that the k-th element
 * is in its correct sorted position, and all elements before it are smaller,
 * and all elements after it are larger.
 * @param {Array<number>} a - The array to perform selection on.
 * @param {number} k - The 1-indexed position of the element to find.
 * @returns {number} The k-th smallest element.
 */
function QuickSelect ( a , k ) {
  // Adjust k to be 0-indexed.
  -- k ;

  // Initialize left and right pointers for the current partition.
  var l = 0 ,
    r = a . length - 1 ;

  // Loop until the left pointer crosses or meets the right pointer.
  while ( l < r ) {
    // Initialize pointers for partitioning and choose a pivot (median of three is a common strategy, here it's middle element).
    var i = l - 1 ,
      j = r ,
      m = l + r >> 1 ; // Equivalent to Math.floor((l+r)/2) for integers.

    // Select the pivot element.
    var p = a [ m ] ,
      t ;

    // Move pivot to the end to simplify partitioning logic.
    a [ m ] = a [ r ] ;
    a [ r ] = p ;

    // Hoare's partition scheme.
    while ( 1 ) {
      // Find element greater than pivot from left.
      while ( i < j ) {
        if ( p < a [ ++ i ] ) {
          break ;
        }
      }
      // Find element smaller than pivot from right.
      while ( i < j ) {
        if ( a [ -- j ] < p ) {
          break ;
        }
      }

      // If pointers cross, partition is complete.
      if ( j <= i ) {
        break ;
      }

      // Swap elements if they are on the wrong side of the pivot.
      t = a [ i ] ;
      a [ i ] = a [ j ] ;
      a [ j ] = t ;
    }

    // Place the pivot in its final sorted position.
    a [ r ] = a [ i ] ;
    a [ i ] = p ;

    // Decide which sub-array to continue searching in.
    if ( i < k ) { // If pivot index is less than k, search in the right sub-array.
      l = i + 1 ;
    } else if ( k < i ) { // If pivot index is greater than k, search in the left sub-array.
      r = i - 1 ;
    } else { // If pivot index is k, we found the element.
      break ;
    }
  }

  // Return the element at the k-th position.
  return a [ k ] ;
}



// Execute the main function and print its result to the console.
console . log ( main ( ) ) ;



/**
 * Main function to solve the problem.
 * It reads input, performs calculations, and returns a formatted string.
 * @returns {string} The final result, joined by newlines.
 */
function main ( ) {
  /* Read input values for x, y, z, and k. */
  var x = o . a ( ) ;
  var y = o . a ( ) ;
  var z = o . a ( ) ;
  var k = o . a ( ) ;

  /* Read three arrays and sort them in descending order. */
  var a = o . l ( ) . sort ( ( a , b ) => b - a ) ;
  var b = o . l ( ) . sort ( ( a , b ) => b - a ) ;
  var c = o . l ( ) . sort ( ( a , b ) => b - a ) ;

  /* Initialize an array 'u' to store sums of elements from 'a' and 'b'. */
  var u = [ ] ;

  /* Nested loops to generate all possible sums of a[i] + b[j]. */
  for ( var i = 0 ; i < x ; i ++ ) {
    for ( var j = 0 ; j < y ; j ++ ) {
      u . push ( a [ i ] + b [ j ] ) ;
    }
  }

  /* If the number of generated sums exceeds 'k', reduce 'u' to the top 'k' sums. */
  if ( k < u . length ) {
    u = solve ( u , k ) ;
  }

  /* Initialize an array 'ans' to store final sums. */
  var ans = [ ] ;

  /* Sort 'u' in descending order to prepare for combinations with 'c'. */
  u . sort ( ( a , b ) => b - a ) ;

  /* Loop through array 'c' to combine with elements from 'u'. */
  for ( var i = 0 ; i < z ; i ++ ) {
    /* Determine how many elements from 'u' to combine with c[i].
     * This ensures we don't exceed 'k' total combinations and respect u's length. */
    var t = Math . min ( u . length , k - i ) ;

    for ( var j = 0 ; j < t ; j ++ ) {
      ans . push ( c [ i ] + u [ j ] ) ;
    }
  }

  /* If the number of generated final answers exceeds 'k', reduce 'ans' to the top 'k' answers. */
  if ( k < ans . length ) {
    ans = solve ( ans , k ) ;
  }

  /* Sort the final answers in descending order and join them with newlines for output. */
  return ans . sort ( ( a , b ) => b - a ) . join ( "\n" ) ;
}



/**
 * Helper function to efficiently get the top 'k' largest elements from an array.
 * It uses QuickSelect to find the (length - k)-th smallest element,
 * then slices the array to get the largest 'k' elements.
 * @param {Array<number>} a - The array of numbers.
 * @param {number} k - The number of largest elements to retrieve.
 * @returns {Array<number>} An array containing the 'k' largest elements.
 */
function solve ( a , k ) {
  /* Use QuickSelect to partition the array such that the (a.length - k)-th smallest element
   * (which is effectively the k-th largest element) is in its correct position. */
  QuickSelect ( a , a . length - k ) ;

  /* Slice the array from that position to the end to get the k largest elements. */
  return a . slice ( a . length - k ) ;
}