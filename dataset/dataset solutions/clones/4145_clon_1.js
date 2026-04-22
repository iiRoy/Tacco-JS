/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same.
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * altered extensively to create a visually different but functionally identical file.
 */

// Enforces strict parsing and error handling in the script.
'use strict' ;


// Read input from standard input, process it, and store it.
// The input is expected to be a space-separated string of numbers.
// It reads the file, converts it to UTF-8, removes leading/trailing whitespace,
// splits by space, and then maps each string element to a number.
const   input   =   require ( 'fs' )
  . readFileSync ( '/dev/stdin' ,   'utf8' )
  . trim ( )
  . split ( ' ' )
  . map ( x   =>   x * 1 ) ;


// Initialize the answer variable to zero.
let   ans   =   0   ;

// Extract the second number from the input array as the maximum value.
let   max   =   input [ 1 ] ;

// Extract the first number from the input array as the divisor/starting number.
let   div   =   input [ 0 ] ;


// Initialize a temporary number with the value of 'div'.
let   tmpNum   =   div   ;


// This loop repeatedly doubles 'tmpNum' until it is no longer less than 'max'.
// It counts how many times 'tmpNum' had to be doubled.
while   (   tmpNum   <   max   )
{
    // Double the temporary number.
    tmpNum   *=   2   ;

    // Increment the answer counter.
    ans   ++   ;
}

// Output the final calculated answer to the console.
console . log ( ans ) ;