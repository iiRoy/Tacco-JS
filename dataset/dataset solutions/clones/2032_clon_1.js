"use strict"; // Enforce strict mode for better error handling and cleaner code.

 var input = require("fs") .readFileSync("/dev/stdin" , "utf8" ) ; // Read input from standard input

 var cin = input .split( / |\n/ ) , cid = 0 ; // Split input into tokens, initialize token index

 // Function to retrieve the next token from the input array.
 function next ( a ) {
  return a
    ? cin[ cid ++ ] // If 'a' is truthy, return the token as a string.
    : + cin[ cid ++ ] ; // Otherwise, convert the token to a number and return it.
}

 // Function to retrieve a specified number of tokens from the input array.
 function nexts ( n , a ) {
  return a
    ? cin .slice( cid , cid += n ) // If 'a' is truthy, return an array of string tokens.
    : cin .slice( cid , cid += n ) .map( a => + a ) ; // Otherwise, return an array of number tokens.
}

 // Function to retrieve a 2D matrix of tokens from the input array.
 function nextm ( h , w , a ) {
  var r = [ ] ,
      i = 0 ;

  if ( a ) {
    for ( ; i < h ; i ++ ) {
      r .push( cin .slice( cid , cid += w ) ) ; // Store rows as arrays of string tokens.
    }
  } else {
    for ( ; i < h ; i ++ ) {
      r .push( cin .slice( cid , cid += w ) .map( a => + a ) ) ; // Store rows as arrays of number tokens.
    }
  }
  return r ;
}

 // Function to create multi-dimensional arrays, initializing with a given value.
 function xArray ( v ) {
  var a = arguments ,
      l = a .length ,
      r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ; // Base array creation string.

  while ( -- l ) {
    r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ; // Nest array creation for higher dimensions.
  }
  return eval( r ) ; // Evaluate the constructed string to create the array.
}

 // This function performs modular multiplication.
 // Note: The 'mod' variable is not defined within the provided code scope.
 function mul ( ) {
  for ( var a = arguments ,
            r = a[ 0 ] ,
            i = a .length ;
        -- i ; ) {
    r = ( ( r >> 16 ) * a[ i ] % mod * 65536 + ( r & 65535 ) * a[ i ] ) % mod ;
  }
  return r ;
}

 var myOut = main ( ) ; // Execute the main program logic.

 if ( myOut !== undefined ) { // Check if the main function returned a value.
  console .log( myOut ) ; // If so, print the result to the console.
}

 /*
 * Main function: This block implements a shortest path calculation
 * for a specific graph structure, possibly using a variation of
 * Floyd-Warshall or similar dynamic programming approach.
 */
function main ( ) {

  var n = next ( ) ; // Read the first input integer 'n'.
  var x = next ( ) ; // Read the second input integer 'x'.
  var y = next ( ) ; // Read the third input integer 'y'.

  var ans = xArray ( 0 , n - 1 ) ; // Initialize 'ans' array with (n-1) elements, all set to 0.
  var map = xArray ( 1e9 , n + 2 , n + 2 ) ; // Initialize a (n+2)x(n+2) 2D array 'map' with a large value (1e9).

  // Initialize direct connections in the 'map'.
  for ( var i = 1 ; i <= n ; i ++ ) {
    map[ i ][ i ] = 0 ;       // Distance from a node to itself is 0.
    map[ i ][ i + 1 ] = 1 ;   // Distance to the next node is 1.
    map[ i ][ i - 1 ] = 1 ;   // Distance to the previous node is 1.

    if ( i === x ) { // If the current node 'i' is 'x', establish a special connection to 'y'.
      map[ i ][ y ] = 1 ;
      map[ y ][ i ] = 1 ; // Connection is bidirectional.
    }
  }

  // First pass: Calculate shortest paths.
  for ( var i = 1 ; i <= n ; i ++ ) {
    for ( var j = i + 1 ; j <= n ; j ++ ) {
      // Update map[i][j] by considering paths through neighbors.
      // Note: `map[i][j]-1` within Math.min is peculiar, as `map[i][j]-1+1` simplifies to `map[i][j]`.
      // This might imply a specific graph property or a subtle intended effect.
      map[ i ][ j ] = Math .min(
        map[ i ][ j - 1 ] ,
        map[ i ][ j + 1 ] ,
        map[ i - 1 ][ j ] ,
        map[ i + 1 ][ j ] ,
        map[ i ][ j ] - 1
      ) + 1 ;
    }
  }

  // Second pass: Further refine shortest paths and populate the 'ans' array.
  // This loop iterates in reverse order for 'i' and 'j'.
  for ( var i = n - 1 ; i > 0 ; i -- ) {
    for ( var j = n ; j > i ; j -- ) {
      // Re-calculate map[i][j] using the same logic as the first pass.
      map[ i ][ j ] = Math .min(
        map[ i ][ j - 1 ] ,
        map[ i ][ j + 1 ] ,
        map[ i - 1 ][ j ] ,
        map[ i + 1 ][ j ] ,
        map[ i ][ j ] - 1
      ) + 1 ;

      ans[ map[ i ][ j ] - 1 ] ++ ; // Increment the count for the calculated distance.
                                   // The distance is `map[i][j]`, so `map[i][j]-1` is used as an index.
    }
  }

  return ans .join( "\n" ) ; // Join the elements of the 'ans' array with newlines and return the string.
}