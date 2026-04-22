/*
 * This script calculates the product of two numbers,
 * ensuring each number is at least 2.
 * If a number is 1 or less, it's treated as 0 for the product.
 */
"use strict" ; // Enable strict mode for cleaner code.


// Import the 'fs' (file system) module to read input.
const   fs   =   require (   'fs'   )   ;


// Read the entire standard input asynchronously.
// The input is expected to be a single line of text.
const    input    =    fs . readFileSync    (    "/dev/stdin"    ,    "utf8"    )    ;


// Convert the input buffer to a string and split it by spaces.
// This assumes the input consists of two space-separated numbers.
const     range     =     input . toString ( ) . split (     " "     )     ;


// Parse the first number from the 'range' array.
const      x      =      parseInt (      range [ 0 ]      )      ;

// Determine the value for 'mx'. If 'x' is greater than 1, use 'x'; otherwise, use 0.
// This ensures that numbers like 1 or less don't contribute to the product negatively or incorrectly.
const       mx       =       x       >       1       ?       x       :       0       ;


// Parse the second number from the 'range' array.
const       y       =       parseInt (       range [ 1 ]       )       ;

// Determine the value for 'my'. Similar logic to 'mx'.
const        my        =        y        >        1        ?        y        :        0        ;


// Finally, calculate and print the product of 'mx' and 'my' to the console.
console . log (        mx        *        my        )        ; // The result is printed to standard output.