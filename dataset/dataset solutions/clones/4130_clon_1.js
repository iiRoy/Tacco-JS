// This file demonstrates a simple program to compare two sums.
// It reads four numbers from standard input, calculates two sums,
// and then determines if the left sum is greater, less, or equal to the right sum.

'use strict'; // Enforces stricter parsing and error handling in the code.

/**
 * The primary function that processes the input and prints the result.
 *
 * @param {string} s - The raw input string, typically from standard input.
 *                     Expected format: "num1 num2 num3 num4\n..."
 */
function main(s) {

    // First, process the input string 's'.
    // It's assumed that the numbers are on the first line and space-separated.
    s = s.split('\n')[0].split(' ');

    // Extract the individual numbers from the parsed array.
    // Convert each string element to a numerical type.
    const a = Number(s[0]); // The first number
    const b = Number(s[1]); // The second number
    const c = Number(s[2]); // The third number
    const d = Number(s[3]); // The fourth number


    // Calculate the sum of the first two numbers (left side)
    const left  = a + b;
    // Calculate the sum of the last two numbers (right side)
    const right = c + d;


    // Initialize a variable to store the final answer string.
    let ans = '';

    // Perform comparisons to determine the relationship between 'left' and 'right'.
    // Each condition is checked independently.
    if (left > right)   ans = 'Left';     // If the sum on the left is greater.
    if (left < right)   ans = 'Right';    // If the sum on the left is smaller.
    if (left === right) ans = 'Balanced'; // If both sums are identical.


    // Output the determined answer to the console.
    console.log(ans);
}

// This is the entry point for the script execution.
// It reads the entire content of standard input synchronously,
// converts it to a UTF-8 string, and passes it to the main function.
main(require("fs").readFileSync("/dev/stdin", "utf8"));