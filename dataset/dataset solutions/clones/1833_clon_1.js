"use strict" ;

// This script processes input from standard input to solve a specific algorithmic problem.
// It utilizes Node.js 'fs' module for file system operations.
// The primary goal is to compute a result based on dynamic programming.

// --- Input Handling Utilities ---

// Reads the entire content of /dev/stdin (standard input) as a UTF-8 string.
var input = require("fs") . readFileSync( "/dev/stdin" , "utf8" ) ;

// Splits the input string by spaces or newlines into an array of tokens.
// 'cid' is a pointer to the current token being read.
var cin = input . split( / |\n/ ) , cid = 0 ;

// Function to get the next token from the input array and convert it to a number.
function next( ) {
  // The unary plus operator is used for type conversion from string to number.
  return +cin[cid++] ;
}

// Function to get the next token from the input array as a string.
function nextstr( ) {
  return cin [ cid ++ ] ;
}

// Function to get the next token from the input array and convert it to a BigInt.
function nextbig( ) {
  return BigInt( cin [ cid ++ ] ) ;
}

/*
 * Reads 'n' elements from the input array.
 * If the 'a' parameter is truthy, elements are returned as strings.
 * Otherwise, elements are mapped to numbers.
 */
function nexts( n , a ) {
  return a ? cin . slice( cid , cid += n ) : cin . slice( cid , cid += n ) . map( a => +a ) ;
}

/*
 * Reads a 2D matrix of 'h' rows and 'w' columns from the input.
 * If 'a' is truthy, elements remain strings.
 * Otherwise, elements are converted to numbers.
 */
function nextm( h , w , a ) {
  var r = [ ] , i = 0 ;
  // Conditional branching for string or number conversion.
  if ( a ) {
    for ( ; i < h ; i ++ ) {
      r . push( cin . slice( cid , cid += w ) ) ;
    }
  } else {
    for ( ; i < h ; i ++ ) {
      r . push( cin . slice( cid , cid += w ) . map( a => +a ) ) ;
    }
  }
  return r ;
}

/*
 * A utility function to create multi-dimensional arrays dynamically.
 * 'v' is the initial value for the innermost array elements.
 * Subsequent arguments define the dimensions.
 */
function xArray( v ) {
  var a = arguments , l = a . length , r = "Array(a[" + --l + "]) . fill ( ) . map ( x => { return " + v + " ; } )" ;
  while ( --l ) {
    r = "Array ( a [ " + l + " ] ) . fill ( ) . map ( x => " + r + " )" ;
  }
  return eval( r ) ; // Uses eval, typically avoided in production for security.
}


// --- Main Program Execution ---

// Execute the main logic function and capture its return value.
var myOut = main ( ) ;

// If the main function produced a defined output, print it to the console.
if ( myOut !== undefined ) {
  console . log ( myOut ) ;
}


// --- Problem-Specific Logic ---

/**
 * The main function encapsulates the solution to the problem.
 * It calculates the total number of nodes in a specific tree structure.
 * @returns {string} The total number of nodes as a string, or "-1" if impossible.
 */
function main ( ) {

  // Read the integer 'n', representing the depth of the tree or a similar parameter.
  var n = next ( ) ;

  // Read an array 'a' of n+1 elements, likely representing nodes at each level.
  var a = nexts ( n + 1 ) ;

  // Handle a special edge case where 'n' is zero.
  if ( n === 0 ) {
   // If there's 1 node at level 0, it's valid.
   if ( a [ 0 ] === 1 ) {
     return 1 ;
   }
   // Otherwise, if n=0 and a[0] is not 1, it's impossible.
   return -1 ;
  }

  // Another edge case: if n > 0 but the root (level 0) has nodes, it's invalid.
  if ( a [ 0 ] ) {
    return -1 ;
  }

  // Define a very large number to represent infinity or a practical upper bound.
  var INF = 1e8 * n ;

  // dp1 array: Stores the maximum possible number of nodes at each level, considering parent constraints.
  var dp1 = Array ( n + 1 ) ;
  dp1 [ 0 ] = 1 ; // Base case: the root (level 0) can have at most 1 node.

  // Forward pass: Calculate dp1 values from level 1 up to 'n'.
  for ( var i = 1 ; i <= n ; i ++ ) {
    // The maximum nodes at current level 'i' is constrained by:
    // 1. Twice the maximum nodes of the previous level (each node can have up to 2 children).
    // 2. The global INF limit.
    dp1 [ i ] = Math . min ( dp1 [ i - 1 ] * 2 , INF ) ;

    // Subtract the actual number of nodes present at this level.
    dp1 [ i ] -= a [ i ] ;

    // If the remaining possible nodes become negative, it means the structure is impossible.
    if ( dp1 [ i ] < 0 ) {
      return -1 ;
    }
  }

  // dp2 array: Stores the minimum number of nodes required at each level to support child nodes.
  var dp2 = Array ( n + 1 ) ;
  dp2 [ n ] = 0 ; // Base case: at the deepest level 'n', no further children are required.

  // Backward pass: Calculate dp2 values from level 'n-1' down to 0.
  for ( var i = n - 1 ; i >= 0 ; i -- ) {
    // The minimum nodes required at level 'i' is the sum of:
    // 1. Minimum nodes required at the next level (i+1) to support its children.
    // 2. The actual number of nodes present at the next level (a[i+1]).
    dp2 [ i ] = dp2 [ i + 1 ] + a [ i + 1 ] ;
  }

  // Initialize the total answer as a BigInt to handle potentially large sums.
  var ans = 0n ;

  // Final calculation: Sum up the nodes for each level.
  for ( var i = 0 ; i <= n ; i ++ ) {
    // For each level 'i', the number of nodes contributing to the total sum is:
    // The minimum of (max possible nodes from dp1[i]) and (min required nodes from dp2[i]),
    // plus the actual nodes (a[i]) at that level.
    ans += BigInt ( Math . min ( dp1 [ i ] , dp2 [ i ] ) + a [ i ] ) ;
  }

  // Convert the BigInt answer to a string before returning.
  return ans . toString ( ) ;
}