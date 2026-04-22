/*
 * This JavaScript program reads data from standard input,
 * processes it according to a specific algorithm, and
 * then prints a "Yes" or "No" result to the console.
 *
 * This file represents a Type I clone, preserving all
 * identifiers, operators, and expressions exactly as
 * in the original, with only changes to whitespace
 * and comments for visual differentiation.
 */

// Import the Node.js 'fs' (file system) module for file operations.
var p = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;

// Process the input string:
// 1. Split it into an array of strings by newline characters.
// 2. Map each string element to its numeric equivalent using the unary plus operator.
p = p . split ( "\n" ) . map ( a => + a ) ;


// Execute the main logic of the program and output its return value.
console . log ( main ( ) ) ;


/**
 * The core function that implements the algorithm.
 * It checks a series of conditions on the input array 'p'.
 *
 * @returns {string} "Yes" if all conditions are met, otherwise "No".
 */
function main ( )
{
  // Define the 'No' string for early exits.
  var N = "No" ;

  // The first element of the array 'p' is assigned to 'n',
  // which often represents the total count of items to process.
  var n = p [ 0 ] ;

  // Initialize an empty object 'a' which will be used as a set
  // or hash map to keep track of seen values.
  var a = { } ;

  // Begin the primary loop, iterating from 1 up to 'n' (inclusive).
  for ( var i = 1 ; i <= n ; i ++ )
  {
    // First condition check:
    // (p[i] XOR i) & 1 checks if the least significant bit of (p[i] XOR i) is 1.
    // This is equivalent to checking if (p[i] XOR i) is odd.
    if ( ( p [ i ] ^ i ) & 1 )
    {
      return N ; // If the condition is true, immediately return "No".
    }

    // Initialize two temporary variables, 'u' and 'v'.
    // 'u' takes the value from the array at current index 'i'.
    // 'v' takes the current loop index 'i'.
    var u = p [ i ] ,
        v = i ;

    // Mark the value of 'u' as present in our set 'a'.
    a [ u ] = 1 ;

    // Enter a nested loop that continues as long as 'i' is less than 'u'.
    while ( i < u )
    {
      // Increment 'i' for the next element in the sequence.
      i ++ ;

      // Second condition check:
      // Verifies if the element at the new 'i' is strictly equal to 'i'.
      if ( p [ i ] !== i )
      {
        return N ; // If not equal, return "No".
      }

      // Increment 'i' again, moving to the next element.
      i ++ ;

      // Third condition check (similar to the first one):
      // Checks if (p[i] XOR i) is odd.
      if ( ( p [ i ] ^ i ) & 1 )
      {
        return N ; // If true, return "No".
      }

      // Conditional branching based on the relationship between 'u' and p[i].
      if ( u < p [ i ] )
      {
        // If 'u' is less than p[i], update 'u' to p[i]
        // and mark the new 'u' as seen in set 'a'.
        u = p [ i ] ;
        a [ u ] = 1 ;
      }
      else if ( v === p [ i ] )
      {
        // If 'v' is strictly equal to p[i], execute a do-while loop.
        do
        {
          // Increment 'v' by 2.
          v += 2 ;
        }
        while ( a [ v ] ) ; // Continue as long as 'v' is found in set 'a'.
      }
      else
      {
        // If neither of the above conditions (u < p[i] or v === p[i]) is met,
        // then the sequence is invalid, and we return "No".
        return N ;
      }
    }
  }

  // If the program successfully completes all loops and checks without
  // returning "No", it means all conditions are satisfied.
  return "Yes" ;
}