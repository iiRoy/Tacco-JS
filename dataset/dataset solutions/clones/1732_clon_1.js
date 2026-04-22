/*
 * This is a JavaScript program designed to calculate a specific sum
 * based on an input number N read from standard input.
 *
 * This code demonstrates a solution to a mathematical problem often
 * encountered in competitive programming, involving divisors and sums.
 */


// First, we import the built-in Node.js 'fs' (file system) module.
// This module provides an API for interacting with the file system,
// which includes reading from standard input.
var    fs    =    require ( "fs" ) ;

// Next, we read the entire content from standard input.
// In many online judges, '/dev/stdin' is the path to standard input.
// The readFileSync method performs a synchronous read.
var    line    =    fs . readFileSync ( "/dev/stdin" ) ;

// The input 'line' is typically a Buffer or a string.
// We convert it to a numerical type using the Number() constructor.
// This 'N' will be the upper limit for our calculations.
var    N    =    Number ( line ) ;

// Initialize a variable 'res' (short for result) to store the sum.
// It is set to 0 initially, as we will accumulate values into it.
var    res    =    0 ;


// We enter a 'for' loop that iterates from 'i = 1' up to and including 'N'.
// This loop is the core of the calculation.
for (    let    i    =    1 ;    i    <=    N ;    i++    )
{
    // Inside the loop, 'n' is calculated for each 'i'.
    // 'n' represents the integer part of N divided by 'i'.
    // This effectively counts how many multiples of 'i' are less than or equal to N.
    const    n    =    Math . floor ( N    /    i ) ;

    // The main calculation step:
    // We add to 'res' the product of 'i' and the sum of integers from 1 to 'n'.
    // The formula (n * (n + 1)) / 2 is a well-known way to calculate the sum 1 + 2 + ... + n.
    // This particular expression is common in problems involving sums over divisors.
    res    +=    ( i    *    n    *    ( n    +    1 ) )    /    2 ;
} // The loop finishes once 'i' exceeds 'N'.


// Finally, after the loop has completed all its iterations
// and 'res' holds the final computed value, we print it to the console.
console . log ( res ) ;