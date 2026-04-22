// This file contains a JavaScript program designed to process input and perform calculations.
// It includes utilities for reading various data types and a custom Binary Indexed Tree (BIT) implementation.

"use strict" ; // Enforce strict mode for cleaner code and fewer errors.


// Global input stream and cursor management.
var input = require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ; // Read the entire standard input as a string.
var cin   = input . split( / |\n/ ) , // Split input by spaces or newlines into an array of strings.
    cid   = 0                   ; // Cursor ID to track the current position in the `cin` array.

/**
 * Reads the next token from the input stream and converts it to a number.
 * @returns {number} The next number from the input.
 */
function next ( ) {
  return + cin [ cid ++ ] ; // Convert the string token to a number using unary plus and advance cursor.
}

/**
 * Reads the next token from the input stream as a string.
 * @returns {string} The next string token from the input.
 */
function nextstr ( ) {
  return cin [ cid ++ ] ; // Return the string token and advance cursor.
}


/**
 * Reads the next token from the input stream and converts it to a BigInt.
 * @returns {BigInt} The next BigInt from the input.
 */
function nextbig ( ) {
  return BigInt( cin [ cid ++ ] ) ; // Convert the string token to a BigInt and advance cursor.
}


/**
 * Reads 'n' tokens from the input stream.
 * If 'a' is true, returns them as strings. Otherwise, converts them to numbers.
 * @param {number} n - The number of tokens to read.
 * @param {boolean} a - If true, return strings; otherwise, return numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function nexts ( n , a ) {
  return a ? cin . slice( cid , cid += n ) : cin . slice( cid , cid += n ) . map( a => + a ) ;
}


/**
 * Reads a 2D matrix of 'h' rows and 'w' columns from the input stream.
 * If 'a' is true, elements are strings. Otherwise, they are numbers.
 * @param {number} h - Number of rows.
 * @param {number} w - Number of columns.
 * @param {boolean} a - If true, return strings; otherwise, return numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function nextm ( h , w , a ) {
  var r = [ ] , // Initialize an empty array to store rows.
      i = 0   ; // Loop counter.

  if ( a ) { // If 'a' is true, elements are strings.
    for ( ; i < h ; i ++ ) {
      r . push( cin . slice( cid , cid += w ) ) ;
    }
  } else { // Otherwise, elements are numbers.
    for ( ; i < h ; i ++ ) {
      r . push( cin . slice( cid , cid += w ) . map( a => + a ) ) ;
    }
  }
  return r ; // Return the constructed matrix.
}


/**
 * Dynamically creates a multi-dimensional array with a specified fill value.
 * This function uses 'eval' for its dynamic array creation, which can be risky.
 * @param {*} v - The value to fill the innermost array elements with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The multi-dimensional array.
 */
function xArray ( v ) {
  var a = arguments , // Get all arguments passed to the function.
      l = a . length  , // Get the total number of arguments.
      r = "Array(a[" + -- l + "]) . fill( ) . map( x => { return " + v + " ; } )" ; // Innermost array creation string.

  while ( -- l ) { // Loop for remaining dimensions.
    r = "Array(a[" + l + "]) . fill( ) . map( x => " + r + " )" ; // Wrap with outer array creation string.
  }

  return eval( r ) ; // Evaluate the dynamically constructed string to create the array.
}


// Define a class for a Binary Indexed Tree (BIT), also known as a Fenwick Tree.
class BIT {
  /**
   * Constructs a new BIT instance.
   * @param {number} n - The maximum size of the array that the BIT will manage (1-indexed).
   */
  constructor ( n ) {
    this . a = Array( n + 1 ) . fill( 0 ) ; // Initialize the internal array with zeros, 1-indexed.
  }

  /**
   * Adds a value to the element at a specific ID in the BIT.
   * This updates all relevant prefix sums.
   * @param {number} val - The value to add.
   * @param {number} id - The 1-indexed position to update.
   */
  add ( val , id ) {
    // Loop through all relevant indices and add 'val'.
    // 'i += i & -i' moves to the next parent node in the BIT structure.
    for ( var x = val , i = id ; i < this . a . length ; i += i & - i ) {
      this . a [ i ] += x ; // Add the value to the current node.
    }
  }

  /**
   * Gets the prefix sum up to a specific ID in the BIT.
   * @param {number} id - The 1-indexed position up to which the sum is required.
   * @returns {number} The sum of elements from index 1 to 'id'.
   */
  get ( id ) {
    // Loop through all relevant indices to sum up.
    // 'i -= i & -i' moves to the next parent node's rightmost child in the BIT structure.
    for ( var r = 0 , i = id ; i ; i -= i & - i ) {
      r += this . a [ i ] ; // Add the value of the current node to the result.
    }
    return r ; // Return the calculated prefix sum.
  }
}


// Execute the main logic of the program.
var myOut = main( ) ; // Call the main function and store its return value.

// If the main function returned a value (i.e., not undefined), print it to console.
if ( myOut !== undefined ) {
  console . log( String( myOut ) ) ; // Convert the output to a string and print it.
}


/**
 * The main function containing the primary logic of the program.
 * It processes queries related to array elements and their counts using a BIT.
 * @returns {string} The final answer string, typically newline-separated.
 */
function main ( ) {
  var n = next( ) ; // Read the number of elements.
  var q = next( ) ; // Read the number of queries.

  var c = nexts( n ) ; // Read 'n' elements into array 'c'. These are 0-indexed colors/types.

  // Initialize a 2D array 'cc' using xArray utility.
  // cc[color_index] will store a list of 1-indexed positions where that color appears.
  // The first element cc[color_index][0] will act as a pointer/counter.
  var cc = xArray( "[1]" , n ) ;

  // Create a new Binary Indexed Tree (BIT) instance with size n+1.
  var bit = new BIT( n + 1 ) ;

  // Create a Set to keep track of colors that have been added to the BIT for their first occurrence.
  var map = new Set( ) ;

  // First pass: Process initial colors and populate BIT.
  for ( var i = 0 ; i < n ; i ++ ) {
    var t = -- c [ i ] ; // Decrement c[i] to make it 0-indexed color. Store in 't'.
    // Add the 1-indexed position (i+1) to the list for color 't'.
    cc [ t ] . push( i + 1 ) ;

    // If this is the first time we encounter color 't' (i.e., it's the leftmost occurrence),
    // add it to the map and update the BIT.
    if ( ! map . has( t ) ) {
      map . add( t ) ; // Mark color 't' as processed for its first occurrence.
      bit . add( 1 , i + 1 ) ; // Add 1 to the BIT at position (i+1).
    }
  }

  // Second pass: Add a sentinel value (n+1) to the end of each color's position list.
  // This helps in query processing to avoid out-of-bounds errors when looking for next occurrences.
  for ( var i = 0 ; i < n ; i ++ ) {
    cc [ i ] . push( n + 1 ) ;
  }


  // Read queries. Each query consists of a left (L) and right (R) boundary.
  var lr = Array( q ) ; // Array to store queries: [L, R, original_index].
  for ( var i = 0 ; i < q ; i ++ ) {
    lr [ i ] = [ next( ) , next( ) , i ] ; // Store L, R, and original query index.
  }

  // Sort queries by their left boundary (L) in ascending order.
  // This allows processing queries efficiently by maintaining a sliding window.
  lr . sort( ( a , b ) => a [ 0 ] - b [ 0 ] ) ;


  var ans = Array( q ) , // Array to store answers for each query, indexed by original_index.
      id  = 1         ; // Current left boundary pointer for the sliding window. Starts at 1.

  // Process sorted queries.
  for ( var i = 0 ; i < q ; i ++ ) {
    var [ l , r , ix ] = lr [ i ] ; // Destructure current query: L, R, original_index.

    // Adjust the sliding window's left boundary ('id') to match the current query's 'l'.
    // As 'id' moves right, we update the BIT to reflect changes in "first occurrences".
    while ( id < l ) {
      var cr = c [ id - 1 ] ; // Get the color at the position 'id - 1' (0-indexed).
      var idx = ++ cc [ cr ] [ 0 ] ; // Increment the pointer for 'cr' color and get the new index.

      bit . add( - 1 , id ) ; // Remove the previous first occurrence at 'id' from BIT.
      bit . add( 1 , cc [ cr ] [ idx ] ) ; // Add the *new* first occurrence (next position of 'cr') to BIT.

      id ++ ; // Move the left boundary pointer to the right.
    }

    // After adjusting the window, query the BIT for the sum up to 'r'.
    // This sum represents the count of distinct colors in the range [l, r].
    ans [ ix ] = bit . get( r ) ;
  }

  // Join the answers with newlines and return the final string.
  return ans . join( "\n" ) ;
}