var GET = ( function( ) {

  // Helper function to create a new instance of the G class
  function f( s ) {
    return new g( s );
  }

  // G class constructor: processes input string
  function g( s ) {
    // Trim whitespace, then split by newlines to get an array of lines
    this._s = s.trim( ).split( "\n" );
    // Initialize line pointer
    this._y = 0;
  }

  // G.prototype.a: Reads a single value from the current line
  // If 'f' is true, returns as string; otherwise, as number
  g.prototype.a = function( f ) {
    var s = this._s, // Reference to the lines array
        y = this._y, // Current line index
        r;           // Result variable

    // If the current line hasn't been processed yet (is a string)
    if ( typeof s[ y ] === "string" ) {
      // Split by spaces and reverse (to easily pop from the end)
      s[ y ] = s[ y ].split( " " ).reverse( );
    }

    // Pop the last element (which was the first element of the line)
    r = s[ y ].pop( );

    // If the current line is now empty, advance to the next line
    if ( !s[ y ].length ) {
      this._y++;
    }

    // Return the result: string if 'f' is true, number otherwise
    return f ? r : +r;
  };

  // G.prototype.l: Reads an entire line of values
  // If 'f' is true, returns array of strings; otherwise, array of numbers
  g.prototype.l = function( f ) {
    // Get current line, split by spaces, and advance line pointer
    var s = this._s[ this._y++ ].split( " " );

    // Return array of strings or array of numbers
    return f ? s : s.map( a => +a );
  };

  // G.prototype.m: Reads 'n' lines, each split into multiple values
  // If 'f' is true, returns 2D array of strings; otherwise, 2D array of numbers
  g.prototype.m = function( n, f ) {
    // Slice 'n' lines, advance line pointer, and split each line by spaces
    var r = this._s.slice( this._y, this._y += n ).map( a => a.split( " " ) );

    // Return 2D array of strings or 2D array of numbers
    return f ? r : r.map( a => a.map( a => +a ) );
  };

  // G.prototype.r: Reads 'n' lines, each treated as a single value
  // If 'f' is true, returns array of strings; otherwise, array of numbers
  g.prototype.r = function( n, f ) {
    // Slice 'n' lines and advance line pointer
    var r = this._s.slice( this._y, this._y += n );

    // Return array of strings or array of numbers
    return f ? r : r.map( a => +a );
  };

  // The IIFE returns the 'f' function, which is used to create a new GET instance
  return f;

} )( );


// Initialize the input reader 'o' by reading from standard input
var o = GET( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );


/**
 * Creates a multi-dimensional array initialized with a value 'v'.
 * The dimensions are provided as subsequent arguments.
 * Example: xArray(0, 2, 3) creates a 2x3 array filled with 0.
 * @param {*} v The initial value for all elements.
 * @param {...number} dimensions The sizes of each dimension.
 * @returns {Array} The multi-dimensional array.
 */
function xArray( v ) {
  var a = arguments,    // All arguments passed to the function
      l = a.length,     // Number of arguments
      r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Innermost array creation string

  // Loop from the second-to-last dimension down to the first
  while ( --l ) {
    // Wrap the current array creation string with another Array.map
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
  }

  // Evaluate the dynamically constructed string to create the array
  return eval( r );
}


/**
 * Performs a binary search (lower bound) on a sorted array 'd'.
 * Finds the index of the first element not less than 'e' within range [a, b).
 * @param {Array<number>} d The sorted array to search in.
 * @param {number} a The starting index of the search range (inclusive).
 * @param {number} b The ending index of the search range (exclusive).
 * @param {number} e The value to search for.
 * @returns {number} The index of the lower bound.
 */
function lower_bound( d, a, b, e ) {
  var c; // Midpoint index

  // Binary search loop: continues as long as there's more than one element in the range
  for ( ; 1 < b - a; ) {
    // Calculate midpoint index
    c = 0 | ( a + b ) / 2;

    // If element at midpoint is less than 'e', search in the right half
    if ( d[ c ] < e ) {
      a = c;
    }
    // Otherwise, search in the left half (including midpoint)
    else {
      b = c;
    }
  }

  // After loop, 'a' and 'b' are adjacent or equal.
  // Check 'd[a]' to determine the final lower bound.
  return d[ a ] < e ? b : a;
}


/**
 * Segment Tree implementation for range minimum queries.
 * Initializes a segment tree of a size determined by 'n'.
 * The tree stores minimum values, initialized to a large number (2e9).
 * @param {number} n The size of the data array that the segment tree will cover.
 */
function segTree( n ) {
  var u = n - 1, // Temporary variable for calculating tree size
      x = 2;     // Initial capacity (power of 2)

  // Calculate the smallest power of 2 greater than or equal to 'n'
  // 'x' will become 2 * next_power_of_2(n)
  while ( u ) {
    u >>= 1; // u = u / 2
    x <<= 1; // x = x * 2
  }

  // Initialize the segment tree array with a large value (effectively infinity)
  // The size is (2 * next_power_of_2(n)) - 1
  this.seg = Array( x - 1 ).fill( 2e9 );

  // 'l' stores the actual leaf node count (next_power_of_2(n))
  this.l = x >> 1;
}


// Define methods for the segTree prototype
segTree.prototype = {

  /**
   * Retrieves the minimum value for a specific index 'x' in the original array.
   * This effectively queries the segment tree for the minimum value in the path from leaf 'x' to root.
   * @param {number} x The index in the original array.
   * @returns {number} The minimum value found along the path, or -1 if no value was set.
   */
  get: function( x ) {
    // Convert original array index 'x' to segment tree leaf index
    x += this.l - 1;

    var r = 2e9; // Initialize result with a large value

    // Traverse up from the leaf node to the root
    while ( x >= 0 ) {
      // Update 'r' if a smaller value is found
      if ( this.seg[ x ] < r ) {
        r = this.seg[ x ];
      }
      // Move to the parent node (parent of node i is (i-1)/2)
      x = ( x - 1 ) >> 1;
    }

    // If 'r' is still the initial large value, it means no value was set for this path
    if ( r === 2e9 ) {
      r = -1; // Return -1 to indicate no value
    }

    return r;
  },

  /**
   * Updates a range [l, r) in the segment tree with a new value 't'.
   * This is a range update operation.
   * @param {number} l The starting index of the range (inclusive).
   * @param {number} r The ending index of the range (exclusive).
   * @param {number} t The value to update the range with.
   */
  update: function( l, r, t ) {
    var v = this.seg; // Reference to the segment tree array

    // Call the recursive helper function 'q' to perform the update
    // Initial call covers the entire segment tree range [0, this.l)
    q( l, r, 0, this.l, 0 );

    /**
     * Recursive helper function for range update.
     * @param {number} l The start of the update range (inclusive).
     * @param {number} r The end of the update range (exclusive).
     * @param {number} x The start of the current segment tree node's range (inclusive).
     * @param {number} y The end of the current segment tree node's range (exclusive).
     * @param {number} i The index of the current node in the segment tree array.
     */
    function q( l, r, x, y, i ) {
      // If the current node's range exactly matches the update range, update the node
      if ( l === x && r === y ) {
        v[ i ] = t;
        return;
      }

      // Calculate the midpoint of the current node's range
      var m = x + y >> 1;

      // Determine which child nodes to recurse into based on overlap with the update range
      if ( m < r ) { // Current node's right half overlaps with update range
        if ( l < m ) { // Current node's left half also overlaps
          q( l, m, x, m, i + i + 1 );   // Recurse left child (index 2*i + 1)
          q( m, r, m, y, i + 1 << 1 ); // Recurse right child (index 2*i + 2)
        } else { // Only current node's right half overlaps
          q( l, r, m, y, i + 1 << 1 ); // Recurse right child
        }
      } else { // Only current node's left half overlaps
        q( l, r, x, m, i + i + 1 );   // Recurse left child
      }
    }
  },
};


// Execute the main function and print its result to the console
console.log( main( ) );


/**
 * Main function to solve the problem.
 * Reads input, processes data using sorting, lower_bound, and a segment tree,
 * then generates the final output.
 * @returns {string} The final answer, newline-separated.
 */
function main( ) {
  // Read N and Q values from input
  var n = o.a( ); // Number of items
  var q = o.a( ); // Number of queries (range for segment tree)

  // Read N lines of data into 's' (2D array)
  var s = o.m( n );

  // Read Q lines of data into 'd' (1D array)
  var d = o.r( q );

  // Initialize a segment tree with 'q' as its effective size
  var st = new segTree( q );

  // Sort the 's' array in descending order based on the third element (index 2)
  s.sort( ( a, b ) => b[ 2 ] - a[ 2 ] );

  // Iterate through each item in the sorted 's' array
  for ( var i = 0; i < n; i++ ) {
    // Skip item if a certain condition is met (related to d[0])
    if ( s[ i ][ 1 ] - s[ i ][ 2 ] - 1 < d[ 0 ] ) {
      continue;
    }

    // Find lower bound for 'l' in 'd' array
    var l = lower_bound( d, 0, q, s[ i ][ 0 ] - s[ i ][ 2 ] );

    // Find lower bound for 'r' in 'd' array, starting search from 'l'
    var r = lower_bound( d, l, q, s[ i ][ 1 ] - s[ i ][ 2 ] );

    // Update the segment tree for the range [l, r) with the third element of s[i]
    st.update( l, r, s[ i ][ 2 ] );
  }

  // Initialize an array to store the answers for each query
  var ans = Array( q );

  // For each query index, retrieve the minimum value from the segment tree
  for ( var i = 0; i < q; i++ ) {
    ans[ i ] = st.get( i );
  }

  // Join the answers with newline characters and return as a single string
  return ans.join( "\n" );
}