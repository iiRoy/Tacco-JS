/*
 * This is a custom input reader class.
 * It helps in parsing input lines and tokens.
 */
function gets( str ) { // Constructor for the gets class
  // Store the input string, split by newlines, into an internal array.
  this._s = str . split ( "\n" ) ;

  // Initialize the line pointer to the first line (index 0).
  this._y = 0 ;
} ; // End of gets constructor

/*
 * Define methods for the gets class prototype.
 * These methods will be available to all instances of gets.
 */
gets . prototype = {

  // Method 'a': Reads a single token from the current line.
  a : function ( f ) {
    // Get the internal string array and current line index.
    var s = this . _s ,
        y = this . _y ,
        r ; // Declare a variable 'r' for the result.

    /*
     * If the current line (s[y]) is a string,
     * it means it hasn't been split into tokens yet.
     * Split it by spaces and reverse it to easily pop tokens from the end.
     */
    if ( typeof s [ y ] === "string" ) s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;

    // Pop the last token from the reversed array (which was the first token).
    r = s [ y ] . pop ( ) ;

    // If the current line is now empty, advance to the next line.
    if ( ! s [ y ] . length ) this . _y ++ ;

    /*
     * Return the token:
     * If 'f' (flag) is true, return as a string.
     * Otherwise, convert to a number and return.
     */
    return f ? r : + r ;
  } , // End of method 'a'

  // Method 'l': Reads an entire line as an array of tokens.
  l : function ( f ) {
    // Get the current line, split it by spaces, and then advance to the next line.
    var s = this . _s [ this . _y ++ ] . split ( " " ) ;

    /*
     * Return the line tokens:
     * If 'f' (flag) is true, return as an array of strings.
     * Otherwise, map each token to a number and return the array of numbers.
     */
    return f ? s : s . map ( a => + a ) ;
  } , // End of method 'l'

  // Method 'm': Reads 'n' lines, each as an array of tokens.
  m : function ( n , f ) {
    // Get internal string array, current line index, initialize result array and loop counter.
    var s = this . _s ,
        y = this . _y ,
        r = [ ] ,
        i = 0 ;

    // If 'f' (flag) is true, read lines as arrays of strings.
    if ( f )
      for ( ; i < n ; i ++ ) r [ i ] = s [ y + i ] . split ( " " ) ;
    // Otherwise, read lines as arrays of numbers.
    else
      for ( ; i < n ; i ++ ) r [ i ] = s [ y + i ] . split ( " " ) . map ( a => + a ) ;

    // Advance the line pointer by 'n' lines.
    this . _y += n ;

    // Return the array of arrays (matrix).
    return r ;
  } , // End of method 'm'

} ; // End of gets.prototype definition

/*
 * Global array 'a' used for Disjoint Set Union (DSU) operations.
 * It stores the parent of each element.
 */
var a = [ ] ;

// Finds the representative (root) of the set containing element 'x'.
function root ( x ) {
  // If 'x' is its own parent, it's the root.
  // Otherwise, recursively find the root and perform path compression.
  return a [ x ] === x ? x : a [ x ] = root ( a [ x ] ) ;
}

// Checks if elements 'x' and 'y' belong to the same set.
function same ( x , y ) {
  // They are in the same set if their roots are identical.
  return root ( x ) === root ( y ) ;
}

// Unites the sets containing elements 'x' and 'y'.
function unite ( x , y ) {
  // Find the roots of 'x' and 'y'.
  x = root ( x ) ;
  y = root ( y ) ;

  // If they are already in the same set, do nothing.
  if ( x === y ) return ;

  // Make the root of 'x' point to the root of 'y', effectively merging the sets.
  a [ x ] = y ;
}

/*
 * Create a new 'gets' object, reading input from /dev/stdin.
 * The input is read synchronously as a UTF-8 string.
 */
var o = new gets ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// Call the main function and print its return value to the console.
console . log ( main ( ) ) ;

/*
 * The main logic of the program.
 */
function main ( ) {
  // Read two integers, 'n' and 'm', using the 'a' method of the 'gets' object.
  var n = o . a ( ) ,
      m = o . a ( ) ;

  // Read a line of integers into array 'p'.
  var p = o . l ( ) ;

  // Initialize the DSU array 'a': each element is initially its own parent.
  for ( var i = 0 ; i <= n ; i ++ ) a [ i ] = i ;

  // Process 'm' union operations.
  for ( i = 0 ; i < m ; i ++ ) {
    // Read two integers representing elements to unite.
    var t = o . l ( ) ;

    // Perform the union operation.
    unite ( t [ 0 ] , t [ 1 ] ) ;
  }

  // Initialize a counter for the answer.
  var ans = 0 ;

  // Iterate from 1 to 'n' (inclusive).
  for ( i = 1 ; i <= n ; i ++ ) {
    /*
     * Check if the i-th element (1-indexed) is in the same set
     * as the element specified by p[i-1] (0-indexed).
     * If they are in the same set, increment the answer.
     */
    if ( same ( p [ i - 1 ] , i ) ) ans ++ ;
  }

  // Return the final calculated answer.
  return ans ;
}