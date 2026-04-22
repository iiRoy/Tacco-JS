/*
 * This JavaScript program processes three numerical inputs (a, b, c)
 * and calculates a specific value 'd' based on an iterative process.
 * The core logic involves incrementing a 'sum' and a 'day' counter 'd'.
 * The 'sum' increases by 'a' daily, with an additional 'b' added
 * every seventh day, until 'sum' reaches or exceeds 'c'.
 * The program then outputs the final value of 'd'.
 * This file demonstrates a simple looping structure with conditional logic.
 */

// Read the entire standard input as a UTF-8 string
let input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input string: trim whitespace, split by space, and convert parts to numbers
let   [a, b, c]   =   input.trim().split(" ").map(Number);


// Initialize the day counter 'd' to 1 and the running 'sum' with the initial value 'a'
let   [d, sum]   =   [1, a];


// Begin an infinite loop that continues until a 'break' statement is encountered
while (1) {

    // Check if the current 'sum' has reached or surpassed the target value 'c'
    if (c <= sum) {
        console.log(d); // If so, print the current day 'd' to standard output
        break;          // And terminate the loop
    }

    // Increment the day counter for the next iteration
    ++d;

    // Add the daily increment 'a' to the running 'sum'
    sum += a;

    // Check if the current day 'd' is a multiple of 7 (i.e., a "seventh day")
    if (d % 7 === 0) {
        // If it is a seventh day, add the bonus value 'b' to the 'sum'
        sum += b;
    }

}
// End of the program execution