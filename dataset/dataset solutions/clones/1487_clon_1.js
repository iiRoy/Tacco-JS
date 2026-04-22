// Enforce strict mode for better code quality and error handling.
"use strict"
;
// Import necessary modules and set up input processing.
var      input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;

// Initialize input buffer and pointer for parsing.
var cin = input . split ( / |\n/ ) ,
    cid = 0 ;

// Helper function to read the next numerical token from the input stream.
function next ( ) {

    return + cin [ cid ++ ] ; // Unary plus converts string to number.
}

// Helper function to read the next string token from the input stream.
function nextstr ( ) {

    return cin [ cid ++ ] ;
}

// Helper function to read the next BigInt token from the input stream.
function nextbig ( ) {

    return BigInt ( cin [ cid ++ ] ) ;
}

// Helper function to read 'n' tokens.
// If 'a' is truthy, returns strings; otherwise, converts to numbers.
function nexts ( n , a ) {
    return a
           ? cin . slice ( cid , cid += n )
           : cin . slice ( cid , cid += n ) . map ( a => + a ) ;
}

// Helper function to read 'n' numerical tokens and sort them.
// If 'a' is truthy, sorts in descending order; otherwise, sorts in ascending order.
function nextssort ( n , a ) {
    return a
           ? cin . slice ( cid , cid += n ) . map ( a => + a ) . sort ( ( a , b ) => b - a )
           : cin . slice ( cid , cid += n ) . map ( a => + a ) . sort ( ( a , b ) => a - b ) ;
}

// Helper function to read a 2D matrix of dimensions h x w.
// If 'a' is truthy, elements are strings; otherwise, they are numbers.
function nextm ( h , w , a ) {
    var r = [ ] , // Resulting 2D array.
        i = 0 ;   // Loop counter.
    if ( a ) {
        // Read as strings.
        for ( ; i < h ; i ++ ) {
            r . push ( cin . slice ( cid , cid += w ) ) ;
        }
    } else {
        // Read and convert to numbers.
        for ( ; i < h ; i ++ ) {
            r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
        }
    }
    return r ;
}

// Helper function to create multi-dimensional arrays dynamically.
// 'v' is the initial value for the innermost array elements.
function xArray ( v ) {
    var a = arguments , // Arguments passed to the function (dimensions).
        l = a . length ,  // Number of dimensions.
        r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ; // Innermost array creation string.
    while ( -- l ) {
        // Build up the nested array creation string.
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }
    return eval ( r ) ; // Execute the generated string to create the array. (Use with caution!)
}

// Array to store output strings that will be printed at the end.
var streams = [ ] ;

// Function to add a string to the output streams array.
function print ( s ) {
    streams . push ( s ) ;
}


// Binary Indexed Tree (Fenwick Tree) implementation.
// This BIT is 1-indexed, which is common for competitive programming.
class BIT {
  // Constructor initializes the BIT with a given size 'n'.
  constructor ( n ) {
    // The internal array 'a' needs to be n+1 in size for 1-indexing.
    this . a = Array ( n + 1 ) . fill ( 0 ) ;
  }

  // Adds 'val' to the element at 'id' and updates relevant prefix sums.
  add ( val , id ) {
    // Iterate through the tree, updating parent nodes.
    // 'i & -i' isolates the least significant bit.
    for ( var i = id , a = this . a ;
          i < a . length ;
          i += i & - i ) {
      a [ i ] += val ;
    }
  }

  // Retrieves the prefix sum up to 'id'.
  get ( id ) {
    var r = 0 ; // Accumulator for the sum.
    // Iterate down the tree, summing up relevant nodes.
    for ( var i = id ;
          i ;
          i -= i & - i ) {
      r += this . a [ i ] ;
    }
    return r ;
  }

  // Calculates the sum of elements within a given range [l, r].
  range ( l , r ) {
    // The sum in range [l, r] is equivalent to get(r) - get(l-1).
    return this . get ( r ) - this . get ( l - 1 ) ;
  }
}


// Execute the main function, which contains the problem's core logic.
var myOut = main ( ) ;

// If the main function returns a non-undefined value, print it to the console.
if ( myOut !== undefined ) {
    console . log ( String ( myOut ) ) ;
}

// If there are any accumulated output streams, join them with newlines and print.
if ( streams . length ) {
    console . log ( streams . join ( "\n" ) ) ;
}


// The main logic of the program.
function main ( ) {
  // Read two integers from the input: n and k.
  var [ n , k ] = nexts ( 2 ) ;

  // Read an array 'a' containing 'n' integers.
  var a = nexts ( n ) ;

  // Initialize a Binary Indexed Tree.
  // The maximum index needed is typically derived from problem constraints.
  // Here, 300001 suggests indices up to 300000 are possible.
  var bi = new BIT ( 300001 ) ;

  // Process each element in the input array 'a'.
  for ( var i = 0 ; i < n ; i ++ ) {
    // Calculate the left boundary 'l' for the current range.
    // It's clamped at 0 to prevent negative indices.
    var l = Math . max ( 0 , a [ i ] - k ) ;

    // Calculate the right boundary 'r' for the current range.
    // It's clamped at 300000 (the max index of the BIT).
    var r = Math . min ( 300000 , a [ i ] + k ) ;

    // Add 1 at 'l+1' in the BIT. This marks the start of an active range.
    bi . add ( 1 , l + 1 ) ;

    // Subtract 1 at 'r+1' in the BIT. This marks the end of an active range (exclusive).
    bi . add ( - 1 , r + 1 ) ;
  }

  // Initialize 'ans' to store the maximum count of overlapping ranges.
  var ans = 0 ;

  // Iterate through potential indices (from 1 to n, representing positions).
  for ( var i = 0 ; i < n ; i ++ ) {
    // Get the current count of active ranges at index 'i+1'.
    // Update 'ans' if this count is greater than the current maximum.
    ans = Math . max ( ans , bi . get ( i + 1 ) ) ;
  }

  // Return the final maximum count of overlapping ranges.
  return ans ;
}