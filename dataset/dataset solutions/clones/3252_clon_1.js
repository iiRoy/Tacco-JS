/*
 * This JavaScript file demonstrates basic file I/O and arithmetic operations.
 * It reads two numbers from standard input, separated by a space,
 * and then calculates half of their product.
 *
 * This is a Type I clone, preserving all identifiers and expressions
 * while varying whitespace and comments significantly.
 */

// Declare the 'input' variable.
// It will store the content read from standard input.
var input = require("fs").readFileSync("/dev/stdin", "utf8");

// The 'input' variable now holds a string.
// We need to process this string:
// 1. Split it by spaces to get an array of string numbers.
// 2. Map each string number to its integer representation.
input = input.split(' ').map(x => parseInt(x));


// After processing, 'input' is an array of two integers.
// Now, perform the required calculation:
// Multiply the first element by the second element,
// then divide the result by 2.
// Finally, print the calculated value to the console.
console.log(input[0] * input[1] / 2);

/*
 * End of script.
 * The program has successfully read, processed, and outputted the result.
 */