/*
 * This script reads input from /dev/stdin,
 * processes it, and then prints a calculated result.
 * It's a simple example demonstrating file I/O and
 * mathematical operations in JavaScript.
 */

// Declare a variable 'inp' to store the input data.
inp = require('fs') // First, get the 'fs' module for file system operations.
    .readFileSync('/dev/stdin', 'utf8') // Read the content of /dev/stdin as a UTF-8 string.
    .split('\n'); // Split the content by newline characters into an array of strings.


// Declare a variable 'K' and initialize it.
// We take the first element from 'inp', convert it to a number (by multiplying by 1).
K = inp.shift() * 1; // Extract the first line and convert to a number.


// Calculate and print the result based on whether K is odd or even.
/*
 * If K is odd:
 *   The calculation is (K/2 rounded down) * (K/2 rounded up).
 *   Example: K=3 -> floor(1.5)*ceil(1.5) = 1*2 = 2
 * If K is even:
 *   The calculation is (K/2) squared.
 *   Example: K=4 -> pow(2, 2) = 4
 */
console
    .log(
        K % 2 // Check if K is odd (remainder when divided by 2 is 1).
            ? Math.floor(K / 2) * Math.ceil(K / 2) // If K is odd, calculate product of floor and ceil.
            : Math.pow(K / 2, 2) // If K is even, calculate square of K/2.
    ) // Output the final computed value to the console.
; // Optional semicolon for consistency.