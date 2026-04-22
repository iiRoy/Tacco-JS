"use strict" ; /* Enable strict mode for cleaner code */


// --- Input/Output Utility Functions ---

// Reads the entire content of standard input synchronously
var input = require( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) ;

// Splits the input string by spaces or newlines, and initializes a pointer for consumption
var cin = input . split ( / |\n/ ) ,
    cid = 0 ; // Current index for cin array


/**
 * Retrieves the next number from the input array.
 * @returns {number} The next parsed number.
 */
function next ( ) {
  return + cin [ cid ++ ] ;
}

/**
 * Retrieves the next string token from the input array.
 * @returns {string} The next string token.
 */
function nextstr ( ) {
  return cin [ cid ++ ] ;
}

/**
 * Retrieves the next BigInt from the input array.
 * @returns {BigInt} The next parsed BigInt.
 */
function nextbig ( ) {
  return BigInt ( cin [ cid ++ ] ) ;
}

/**
 * Retrieves an array of 'n' numbers or strings.
 * @param {number} n - The number of elements to retrieve.
 * @param {boolean} a - If true, returns strings; otherwise, returns numbers.
 * @returns {Array<number|string>} An array of values.
 */
function nexts ( n , a ) {
  return a
    ? cin . slice ( cid , cid += n )
    : cin . slice ( cid , cid += n ) . map ( a => + a ) ;
}


/**
 * Retrieves an array of 'n' numbers and sorts them.
 * @param {number} n - The number of elements to retrieve.
 * @param {boolean} a - If true, sorts in descending order; otherwise, sorts in ascending order.
 * @returns {Array<number>} A sorted array of numbers.
 */
function nextssort ( n , a ) {
  return a
    ? cin . slice ( cid , cid += n ) . map ( a => + a ) . sort ( ( a , b ) => b - a )
    : cin . slice ( cid , cid += n ) . map ( a => + a ) . sort ( ( a , b ) => a - b ) ;
}

/**
 * Retrieves a 2D array (matrix) of dimensions h x w.
 * @param {number} h - Number of rows.
 * @param {number} w - Number of columns.
 * @param {boolean} a - If true, stores as strings; otherwise, stores as numbers.
 * @returns {Array<Array<number|string>>} The 2D array.
 */
function nextm ( h , w , a ) {
  var r = [ ] ,
      i = 0 ;
  if ( a ) {
    for ( ; i < h ; i ++ ) {
      r . push ( cin . slice ( cid , cid += w ) ) ;
    }
  } else {
    for ( ; i < h ; i ++ ) {
      r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
    }
  }
  return r ;
}

/**
 * Creates a multi-dimensional array with a specified initial value.
 * @param {*} v - The initial value for the innermost array elements.
 * @returns {Array} A multi-dimensional array.
 */
function xArray ( v ) {
  var a = arguments ,
      l = a . length ,
      r = "Array(a[" + -- l + "]) . fill ( ) . map ( x => { return " + v + " ; } )" ;
  while ( -- l ) {
    r = "Array(a[" + l + "]) . fill ( ) . map ( x => " + r + " )" ;
  }
  return eval ( r ) ;
}


// Array to store output streams, allowing multiple prints before final console.log
var streams = [ ] ;

/**
 * Pushes a string to the output streams array.
 * @param {string} s - The string to print.
 */
function print ( s ) {
  streams . push ( s ) ;
}


// --- Main Logic (Segment Tree Implementation) ---

// Default value for the segment tree nodes
var def = 0 ;

/**
 * Segment Tree constructor.
 * Initializes a segment tree with a given capacity.
 * The tree will have a size that is the smallest power of 2 greater than or equal to n.
 * @param {number} n - The number of elements the segment tree should cover.
 */
function segTree ( n ) {
  var x = 2 ;
  n -- ;

  // Calculate the smallest power of 2 greater than or equal to n
  while ( n ) {
    n >>= 1 ;
    x <<= 1 ;
  }

  // Initialize the segment tree array with the default value
  this . seg = Array ( x - 1 ) . fill ( def ) ;

  // 'l' represents the size of the leaf nodes array (number of original elements)
  this . l = x >> 1 ;
}

segTree . prototype = {

  /**
   * Retrieves the maximum value in the range [0, x] covered by the segment tree.
   * This implementation appears to be a point query for a maximum prefix sum,
   * or rather, it queries the maximum value in the path from the leaf 'x' up to the root.
   * @param {number} x - The index to query.
   * @returns {number} The maximum value found.
   */
  get : function ( x ) {
    var v = this . seg ;
    x += this . l - 1 ; // Adjust x to be the leaf node index

    var r = def ; // Initialize result with default value

    // Traverse up the tree from the leaf node
    while ( x >= 0 ) {
      if ( v [ x ] > r ) {
        r = v [ x ] ; // Update result if current node has a greater value
      }
      x = x - 1 >> 1 ; // Move to the parent node
    }
    return r ;
  } ,

  /**
   * Updates a range [l, r) in the segment tree with a new value 't'.
   * This specific update function propagates a maximum value 't' to all nodes
   * within the given range, but only if the current node's value is less than 't'.
   * It's a "lazy propagation" type of update where the update value only
   * propagates downwards if necessary.
   * @param {number} l - The start index of the range (inclusive).
   * @param {number} r - The end index of the range (exclusive).
   * @param {number} t - The value to update with.
   */
  update : function ( l , r , t ) { // [l,r)
    if ( l >= r ) {
      return ; // Invalid range, do nothing
    }

    var self = this ; // Keep a reference to 'this' for the nested function

    // Initiate the recursive update query
    q ( l , r , 0 , this . l , 0 ) ;

    /**
     * Recursive helper function for the update operation.
     * @param {number} l - Query range start (inclusive).
     * @param {number} r - Query range end (exclusive).
     * @param {number} x - Current segment node's range start (inclusive).
     * @param {number} y - Current segment node's range end (exclusive).
     * @param {number} i - Current node's index in the segment tree array.
     */
    function q ( l , r , x , y , i ) {
      // If the current segment completely covers the query range
      if ( l === x && r === y ) {
        // Update the current node's value if 't' is greater
        if ( self . seg [ i ] < t ) {
          self . seg [ i ] = t ;
        }
        return ;
      }

      // Calculate the midpoint of the current segment
      var m = x + y >> 1 ;

      // Determine which child nodes to traverse based on overlap
      if ( m < r ) { // Current segment's right half overlaps with query range
        if ( l < m ) { // Current segment's left half also overlaps
          q ( l , m , x , m , i + i + 1 ) ; // Recurse on left child
          q ( m , r , m , y , i + 1 << 1 ) ; // Recurse on right child
        } else { // Only current segment's right half overlaps
          q ( l , r , m , y , i + 1 << 1 ) ; // Recurse on right child
        }
      } else { // Only current segment's left half overlaps
        q ( l , r , x , m , i + i + 1 ) ; // Recurse on left child
      }
    }
  } , // End of update method

} // End of segTree prototype


// --- Execution Flow ---

// Call the main function and store its return value
var myOut = main ( ) ;

// If main returned a value (not undefined), print it to console
if ( myOut !== undefined ) {
  console . log ( String ( myOut ) ) ;
}

// If there are accumulated streams, print them all joined by newlines
if ( streams . length ) {
  console . log ( streams . join ( "\n" ) ) ;
}


/**
 * The main function containing the problem-specific logic.
 * This function solves a problem likely related to finding the maximum length
 * of a subsequence where elements are within a certain range 'k' of each other,
 * using a segment tree for efficient range maximum queries and updates.
 * @returns {number} The final answer to the problem.
 */
function main ( ) {
  // Read N and K from input
  var [ n , k ] = nexts ( 2 ) ;
  // Read the array 'a' of N elements
  var a = nexts ( n ) ;

  // Initialize a segment tree with a maximum possible value (300001 for indices up to 300000)
  var seg = new segTree ( 300001 ) ;

  // Iterate through each element in the input array 'a'
  for ( var i = 0 ; i < n ; i ++ ) {
    // Calculate the left boundary for the update range (max(0, a[i]-k))
    var l = Math . max ( 0 , a [ i ] - k ) ;
    // Calculate the right boundary for the update range (min(300000, a[i]+k))
    var r = Math . min ( 300000 , a [ i ] + k ) ;

    // Get the current maximum value at index a[i] from the segment tree
    var t = seg . get ( a [ i ] ) ;

    // Update the segment tree for the range [l, r+1) with value t+1
    // This implies that if a sequence ends at a[i] with length t,
    // then a sequence ending in the range [l, r] can be formed with length t+1.
    seg . update ( l , r + 1 , t + 1 ) ;
  }

  // Initialize the answer variable
  var ans = 0 ;

  // Iterate through all possible indices to find the global maximum value in the segment tree
  for ( var i = 0 ; i <= 300000 ; i ++ ) {
    ans = Math . max ( ans , seg . get ( i ) ) ;
  }

  // Return the final maximum answer found
  return ans ;
}