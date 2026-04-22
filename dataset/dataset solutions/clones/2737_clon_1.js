/*
 * This JavaScript file processes an array of numbers.
 * It reads input from standard input, performs specific bitwise operations
 * based on divisibility rules, and then outputs results.
 *
 * This code adheres to strict mode for better performance and error handling.
 */
"use strict"

// Read the entire standard input as a UTF-8 string.
const arg_str = require('fs') . readFileSync( '/dev/stdin' , 'UTF-8' )


// Split the input string into an array of lines.
const args = arg_str . split( '\n' )

// Parse the first line as an integer N.
const N = parseInt( args[0] )

// Parse the second line: split by spaces, then convert each part to an integer.
const a_array = args[1] . split( ' ' ) . map( x => parseInt(x) )


/*
 * Main processing logic:
 * This section contains nested loops that iterate from N down to 1.
 * It performs a conditional bitwise XOR operation on elements of a_array.
 */
for ( let i = N ; i >= 1 ; i-- ) // Outer loop: 'i' iterates downwards from N.
{

  for ( let j = N ; j >= 1 ; j-- ) // Inner loop: 'j' also iterates downwards from N.
  {

    // If 'i' is greater than or equal to 'j', skip this iteration and continue to the next 'j'.
    if ( i >= j )
      continue

    // Check if 'j' is perfectly divisible by 'i'.
    if ( j % i == 0 )
    {
      // Perform a bitwise XOR assignment operation.
      // Array indices are 0-based, so 'i-1' and 'j-1' are used.
      a_array[ i - 1 ] ^= a_array[ j - 1 ]
    } // End of the divisibility check block.

  } // End of inner loop for 'j'.

} // End of outer loop for 'i'.


// Filter the processed array to find all elements that have a value of 1.
const result = a_array . filter( x => x == 1 )


// Output the count of elements that are equal to 1.
console.log( result . length )

// If there are any elements that are 1, print them space-separated.
if ( result . length > 0 )
{
  console.log( result . join( ' ' ) ) // Join the elements with a single space.
}

// End of the script.