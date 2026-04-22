/* This script calculates the factorial of N modulo (10^9 + 7).
   It reads an integer N from standard input and computes N! mod (10^9 + 7). */

// Enforce strict mode for cleaner code and fewer errors.
'use strict';


// --- Input Processing Section ---

// Require the 'fs' module for file system operations.
// Read the entire content of '/dev/stdin' (standard input).
// Decode the buffer as a UTF-8 string.
// Remove any leading or trailing whitespace characters.
// Split the string into an array of lines based on the newline character.
const input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' ) ;

// Parse the first element of the 'input' array (which is the first line)
// as an integer. This integer represents the value of N.
const N = parseInt ( input [ 0 ] ) ;


// --- Factorial Calculation Section ---

// Initialize a variable 'p' to store the ongoing product (factorial result).
// It starts at 1 because 0! is 1, and it's the multiplicative identity.
let p = 1 ;

// Start a for loop that iterates from 1 up to N, inclusive.
// 'i' represents the current number being multiplied into the factorial.
for ( let i = 1 ;   i <= N ;   i++ )
{
    // Multiply the current product 'p' by the loop variable 'i'.
    // Then, take the modulo of the result with (10^9 + 7).
    // This operation prevents integer overflow for large factorials
    // and ensures the result stays within the required modular arithmetic range.
    p = ( p * i ) % ( 1e9 + 7 ) ;
}


// --- Output Section ---

// Print the final calculated value of 'p' to the standard output.
// This is the factorial of N modulo (10^9 + 7).
console . log ( p ) ;