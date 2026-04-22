/*
 * This JavaScript file processes numerical input.
 * It calculates how many times a divisor needs to be doubled
 * to reach or exceed a maximum value.
 *
 * This implementation adheres to strict mode guidelines for
 * better code quality and fewer common errors.
 */

'use strict'; // Activates strict mode for the entire script.


// --- Input Processing Section ---
// Reads data from standard input, parses it, and converts it into an array of numbers.
const input = require('fs')                                // Import the built-in 'fs' (file system) module.
                    .readFileSync( '/dev/stdin', 'utf8' )  // Read the entire content of '/dev/stdin' as a UTF-8 string.
                    .trim()                                // Remove any leading or trailing whitespace from the string.
                    .split(' ')                            // Split the string into an array of substrings using space as a delimiter.
                    .map( x => x * 1 );                    // Convert each string element in the array to a number (multiplying by 1 is a common coercion trick).


// --- Variable Initialization ---
let ans      =   0;       // Initialize 'ans' (answer) to zero. This variable will count the doubling operations.
let max      =   input[1];  // Assign the second element from the 'input' array to 'max'.
let div      =   input[0];  // Assign the first element from the 'input' array to 'div' (the initial divisor).

// A temporary variable to hold the current value being doubled.
let tmpNum   =   div;     // Initialize 'tmpNum' with the value of 'div'.


// --- Core Logic: Doubling Loop ---
// This loop continues as long as 'tmpNum' is less than 'max + 1'.
// The goal is to find how many times 'tmpNum' must be doubled to reach or exceed 'max'.
while ( tmpNum < max + 1 )
{
    // Double the value of 'tmpNum' in each iteration.
    tmpNum *= 2;  // Equivalent to: tmpNum = tmpNum * 2;

    // Increment the 'ans' counter for each doubling operation.
    ans++;        // Equivalent to: ans = ans + 1;
} // End of the 'while' loop.


// --- Output Section ---
// Print the final calculated answer to the console.
console.log( ans ); // Displays the total count of doubling operations.

// --- End of Script ---