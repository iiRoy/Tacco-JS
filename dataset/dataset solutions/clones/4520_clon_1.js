/*
 * This is an Immediately Invoked Function Expression (IIFE)
 * It defines a data reader utility, GET.
 */
var   GET = ( function ( ) {

  // Factory function 'f' to create new instances of 'g'.
  function f ( s ) {
    return new g( s ) ;
  }

  /*
   * Constructor function 'g' for the data reader.
   * Initializes the internal state from a string.
   */
  function g ( s ) {

    this._s = s.trim ( ) . split ( "\n" ) ; // Store lines as an array
    this._y = 0 ;                          // Initialize line pointer

  }

  // Method 'a' (atom/single item) for reading individual values.
  g.prototype.a = function ( f ) {
    var s = this._s ,
        y = this._y ,
        r ;

    /*
     * If the current line hasn't been processed into an array of words,
     * it processes it and reverses it for easier popping.
     */
    if ( typeof s [ y ] === "string" ) {
      s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
    }

    // Pop the last element (which is the first word due to reversal).
    r = s [ y ] . pop ( ) ;

    // If the current line is exhausted, move to the next line.
    if ( ! s [ y ] . length ) {
      this._y ++ ;
    }

    // Return raw string 'r' if 'f' is truthy, otherwise convert to number.
    return f ? r : + r ;
  } ; /* End of method 'a' */

  // Method 'l' (line) for reading an entire line.
  g.prototype.l = function ( f ) {
    // Get the current line, increment line pointer, and split by spaces.
    var s = this._s [ this._y ++ ] . split ( " " ) ;

    // Return raw string array 's' if 'f' is truthy, otherwise convert elements to numbers.
    return f ? s : s . map ( a => + a ) ;
  } ; // End of method 'l'

  // Method 'm' (matrix) for reading multiple lines as a 2D array.
  g.prototype.m = function ( n , f ) {
    /*
     * Slice 'n' lines from the internal string array,
     * increment the line pointer, and then map each line to an array of words.
     */
    var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;

    // Return raw string matrix 'r' if 'f' is truthy, otherwise convert all elements to numbers.
    return f ? r : r . map ( a => a . map ( a => + a ) ) ;
  } ; // End of method 'm'

  // Method 'r' (rows) for reading multiple lines as a 1D array of strings or numbers.
  g.prototype.r = function ( n , f ) {
    // Slice 'n' lines from the internal string array and increment the line pointer.
    var r = this._s . slice ( this._y , this._y += n ) ;

    // Return raw string array 'r' if 'f' is truthy, otherwise convert elements to numbers.
    return f ? r : r . map ( a => + a ) ;
  } ; // End of method 'r'

  // The IIFE returns the factory function 'f'.
  return f ;

} ) ( ) ; // The IIFE is immediately invoked here.


/*
 * Initialize the 'o' object using the GET utility.
 * It reads data from standard input.
 */
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 * This function creates a multi-dimensional array
 * initialized with a specified value 'v'.
 * The dimensions are passed as additional arguments.
 */
function xArray ( v ) {
  var a = arguments , // Get all arguments passed to the function
      l = a . length  , // Store the total number of arguments
      r = "Array(a[" + -- l + "]) . fill ( 0 ) . map ( x => { return " + v + " ; } )" ; // Innermost array creation

  // Build up the nested array creation string from inner to outer dimensions.
  while ( -- l ) {
    r = "Array ( a [ " + l + " ] ) . fill ( 0 ) . map ( x => " + r + " )" ;
  }

  // Evaluate the constructed string to create the multi-dimensional array.
  return eval ( r ) ;
}


// The main entry point of the program.
console.log ( main ( ) ) ;


/*
 * The primary logic function.
 * It calculates the minimum maximum consecutive occurrences of non-target characters.
 */
function main ( ) {

  // Read a single string value from the input.
  var s = o . a ( 1 ) ;

  // Get the length of the string.
  var l = s . length ;

  // Initialize the answer with the full length of the string.
  var ans = l ;

  // Loop through all possible lowercase letters (a-z).
  for ( var i = 0 ; i < 26 ; i ++ ) {

    // Initialize maximum consecutive count for the current character 'i'.
    var mx = 0 ;

    // Initialize current consecutive count.
    var n = 0 ;

    // Iterate through each character in the input string 's'.
    for ( var j = 0 ; j < l ; j ++ ) {

      // Check if the current character matches the target character 'i'.
      if ( s [ j ] . charCodeAt ( ) - 97 === i ) {

        // If a match is found, update the maximum consecutive count if current 'n' is greater.
        if ( n > mx ) {
          mx = n ;
        }

        // Reset current consecutive count.
        n = 0 ;

      } else {
        // If no match, increment the current consecutive count.
        n ++ ;
      }

    } // End of inner loop (j)

    // After the inner loop, check if the final 'n' is greater than 'mx'.
    if ( n > mx ) {
      mx = n ;
    }

    // Update the overall minimum answer if the current 'mx' is smaller.
    if ( mx < ans ) {
      ans = mx ;
    }

  } // End of outer loop (i)

  // Return the calculated minimum maximum consecutive count.
  return ans ;

} // End of main function