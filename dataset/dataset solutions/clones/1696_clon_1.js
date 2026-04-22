/*
 * This JavaScript file serves as a collection of solutions for various
 * competitive programming problems, specifically from AtCoder Beginner Contests.
 * It is organized into classes, with each class corresponding to a specific
 * contest series and methods within those classes representing individual problems.
 */
'use strict' ; /* Enforcing strict mode for the entire script to catch
                  common coding mistakes and "unsafe" actions. */


const   fs  =   require( 'fs' )   ; // Import the Node.js 'fs' (file system) module.
// Define a constant 'mod' for a large prime number, commonly used in
// modular arithmetic for competitive programming problems.
const   mod =   BigInt ( 1e9 + 7 ) ;


// This class encapsulates solutions for problems from AtCoder Beginner Contest 041.
class   ABC041  {

  // Solution for Problem A of ABC041: "Placing a character".
  static  A ( input )   {
    var s , i   ; // Declare two variables: 's' for the string, 'i' for the index.
    // Process the input: remove leading/trailing whitespace, then split by newline.
    input   =   input . trim ( ) . split ( '\n' ) ;
    // Use array destructuring to assign the first element to 's' and the second to 'i'.
    [ s , i ]   =   input ;
    // Convert the index 'i' from a string to an integer, using base 10.
    i = parseInt ( i , 10 ) ;
    // Output the character at the (i-1)-th position of string 's' (0-indexed).
    console . log ( s [ i - 1 ] ) ;
  }


  // Solution for Problem B of ABC041: "Multiplication 2".
  static  B ( input )   {
    var a , b , c ; // Declare three variables for the large integers.
    // Process input: trim, split by space, then map each part to a BigInt.
    input = input . trim ( ) . split ( ' ' ) . map ( BigInt ) ;
    // Destructure the array of BigInts into variables a, b, and c.
    [ a , b , c ] = input ;
    // Perform modular multiplication: (a * b % mod * c % mod).
    // All operations here are BigInt operations.
    var ans = a * b % mod * c % mod ;
    // Convert the BigInt result back to a standard JavaScript Number for output.
    ans = Number ( ans ) ;
    console . log ( ans ) ; // Print the final calculated answer.
  }


  // Solution for Problem C of ABC041: "Sorting a sequence by height".
  static  C ( input )   {
    // Destructure the first line as 'n' and the second line as 'height' string.
    var [ n , height ]  =   input . trim ( ) . split ( '\n' ) ;
    // Split the 'height' string by spaces and convert each part to an integer.
    height = height . split ( ' ' ) . map ( n => parseInt ( n , 10 ) ) ;
    // Convert 'n' (number of students) from string to integer.
    n = parseInt ( n , 10 ) ;
    // Create an array of pairs: [original_index + 1, height_value].
    // Object.keys(height) gives string indices, which are then parsed to int.
    var height = Object . keys ( height ) . map ( key => [ parseInt ( key , 10 ) + 1 , height [ key ] ] ) ;
    // Sort this array of pairs based on the height value (second element) in descending order.
    height . sort ( function ( first , second ) {
      return ( second [ 1 ] - first [ 1 ] ) ; // Custom comparison for descending sort.
    } ) ;
    // Iterate through the sorted array and print the original (1-indexed) student index.
    for ( var [ i , _ ] of height ) {
      console . log ( i ) ; // The '_' variable is a common convention for an unused variable.
    }
  }


  // Solution for Problem D of ABC041: "Topological Sort/Bitmask DP".
  static  D ( input )   {
    var lines = input . trim ( ) . split ( '\n' ) ; // Split the input into an array of lines.
    // Parse N (number of vertices) and M (number of edges) from the first line.
    var [ n , m ] = lines [ 0 ] . split ( ' ' ) . map ( x => + x ) ;
    // Initialize an array 'edges' to represent dependencies using bitmasks.
    // edges[i] will be a bitmask where the j-th bit is set if j depends on i.
    var edges = new Array ( n ) . fill ( 0 ) ;
    // Loop through the 'm' subsequent lines to populate the 'edges' array.
    for ( var i = 0 ; i < m ; i ++ ) {
      // Parse x and y for each edge: x -> y.
      var [ x , y ] = lines [ 1 + i ] . split ( ' ' ) . map ( x => + x ) ;
      // Set the (y-1)-th bit in edges[x-1] to indicate that y depends on x.
      edges [ x - 1 ] |= 1 << ( y - 1 ) ;
    }
    // Initialize a memoization table 'comb' for dynamic programming.
    // comb[bitmask] will store the number of valid permutations for the set of elements in 'bitmask'.
    var comb = new Array ( 1 << n ) . fill ( null ) ;
    comb [ 0 ] = 1 ; // Base case: an empty set of elements has one way to be ordered.

    // Recursive function 'count' to calculate the number of permutations.
    // 'edges' represents the current dependencies, 'bit' represents the current set of available elements.
    function count ( edges , bit ) {
      if ( comb [ bit ] != null ) {
        return comb [ bit ] ; // If result is memoized, return it directly.
      }
      comb [ bit ] = 0 ; // Initialize the count for the current bitmask.
      // Iterate through all possible elements 'i' (0 to n-1).
      for ( var i = 0 ; i < n ; i ++ ) {
        // Check two conditions:
        // 1. Is element 'i' present in the current bitmask 'bit'? (bit >> i & 1)
        // 2. Does element 'i' have any remaining incoming dependencies from other elements
        //    currently present in the 'bit' mask? (!edges[i])
        if ( ( bit >> i & 1 ) && ! edges [ i ] ) {
          // If both conditions are met, 'i' can be the next element in the permutation.
          var nxt_bit = bit & ~ ( 1 << i ) ; // Create a new bitmask by removing 'i'.
          var nxt_edges = edges . slice ( ) ; // Create a deep copy of the 'edges' array.
          // For all other elements 'j', remove 'i' as a dependency from them.
          for ( var j = 0 ; j < n ; j ++ ) {
            nxt_edges [ j ] &= ~ ( 1 << i ) ;
          }
          // Recursively call 'count' for the next state and add its result to the current total.
          comb [ bit ] += count ( nxt_edges , nxt_bit ) ;
        }
      }
      return comb [ bit ] ; // Return the computed count for the current bitmask.
    }
    // Call the 'count' function with the initial state: all elements present ((1<<n)-1).
    console . log ( count ( edges , ( 1 << n ) - 1 ) ) ;
  }
}


// This class contains solutions for problems from AtCoder Beginner Contest 173.
class   ABC173  {

  // Solution for Problem A of ABC173: "Payment".
  static  A ( input )   {
    var n = + input . trim ( ) ; // Convert the trimmed input string to a number.
    // Calculate the amount to pay to reach the next multiple of 1000, then subtract 'n'.
    console . log ( Math . floor ( ( n + 999 ) / 1000 ) * 1000 - n ) ;
  }

  // Solution for Problem B of ABC173: "Judge Status Summary".
  static  B ( input )   {
    var lines = input . trim ( ) . split ( '\n' ) ; // Split the input into an array of lines.
    var n = + lines [ 0 ] ; // The first line contains the number of submissions, 'n'.
    // Initialize an object to store counts for different judge verdicts.
    var cnt = {
      'AC' : 0 ,
      'WA' : 0 ,
      'TLE' : 0 ,
      'RE' : 0
    }
    // Loop through the submission results (from the second line onwards).
    for ( var i = 0 ; i < n ; i ++ ) {
      cnt [ lines [ 1 + i ] ] ++ ; // Increment the count for the respective verdict.
    }
    // Iterate over the entries (key-value pairs) in the 'cnt' object.
    for ( var [ verd , c ] of Object . entries ( cnt ) ) {
      // Print each verdict along with its count in the specified format.
      console . log ( ` ${ verd }   x   ${ c } ` ) ;
    }
  }

  // Solution for Problem C of ABC173: "H and W".
  static  C ( input )   {
    var lines = input . trim ( ) . split ( '\n' ) ; // Get all lines from the input.
    // Parse H (height), W (width), and K (target black cells) from the first line.
    var [ h , w , k ] = lines [ 0 ] . split ( ' ' ) . map ( x => + x ) ;
    var c = lines . slice ( 1 ) ; // 'c' will be an array of strings representing the grid rows.
    var tot = 0 ; // Initialize a counter for the total valid combinations.

    // Iterate through all possible combinations of rows to paint white.
    // There are 2^H combinations, represented by a bitmask 'i'.
    for ( var i = 0 ; i < ( 1 << h ) ; i ++ ) {
      // Iterate through all possible combinations of columns to paint white.
      // There are 2^W combinations, represented by a bitmask 'j'.
      for ( var j = 0 ; j < ( 1 << w ) ; j ++ ) {
        var cnt = 0 ; // Counter for black cells in the current (i, j) combination.
        // Iterate through each row 'y' of the grid.
        for ( var y = 0 ; y < h ; y ++ ) {
          // If the y-th bit is set in 'i', it means row 'y' is painted white, so skip it.
          if ( i >> y & 1 ) continue ;
          // Iterate through each column 'x' of the grid.
          for ( var x = 0 ; x < w ; x ++ ) {
            // Check two conditions for a cell to be counted as black:
            // 1. The original cell c[y][x] must be black ('#').
            // 2. The x-th bit must NOT be set in 'j' (i.e., column 'x' is NOT painted white).
            cnt += c [ y ] [ x ] == '#' && ! ( j >> x & 1 ) ;
          }
        }
        // If the count of remaining black cells equals 'k', increment the total valid combinations.
        tot += cnt == k ;
      }
    }
    console . log ( tot ) ; // Output the final total count.
  }

  // Placeholder for Problem D of ABC173.
  static  D ( input )   {
  }
  // Placeholder for Problem E of ABC173.
  static  E ( input )   {
  }
  // Placeholder for Problem F of ABC173.
  static  F ( input )   {
  }
}


// Read the entire input from standard input (typically '/dev/stdin' in a Linux environment).
// The input is read synchronously and decoded as UTF-8 text.
var input = fs . readFileSync ( '/dev/stdin' , 'utf8' ) ;
// Call the static method 'C' of the 'ABC173' class with the read input.
// This executes the solution for Problem C of AtCoder Beginner Contest 173.
ABC173 . C ( input ) ;