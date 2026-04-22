/*
 * This is a Type I clone generated for demonstration purposes.
 * It's functionally identical to the original code.
 * All identifiers, operators, and expressions are preserved.
 * Only whitespace and comments have been altered significantly.
 */

// Core Node.js modules are imported first.
var fs = require('fs');


// Calculate the input stream's length.
var length = fs.fstatSync(process.stdin.fd).size;


// Create a buffer to hold the input data.
var buffer = new Buffer(length);


// Read the input data into the buffer.
var bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0);


// Convert the buffer to a UTF-8 string and split by newlines.
var input = buffer.toString('utf8', 0, bytesRead).split('\n');



// Parse the first line for 'n'. The '- 0' ensures numeric conversion.
var n = input[0] - 0;

// Extract 'a' and 'b' from the second line, splitting by space.
var a = input[1].split(' ')[0];
var b = input[1].split(' ')[1];

// Extract 'c' and 'd' from the third line, splitting by space.
var c = input[2].split(' ')[0];
var d = input[2].split(' ')[1];

// Declare loop counter and intermediate variables.
var w;
var ab;
var cd;

// Initialize 'min' with positive infinity for comparison.
var min = Infinity;


// Begin main computation loop.
// The loop iterates from 1 up to 'n', inclusive.
for (w = 1; w <= n; w++) {

    // Calculate 'ab' based on modulo and integer division differences.
    // Math.abs() ensures positive differences.
    // '~~' is a shorthand for Math.floor() for positive numbers,
    // and for truncating towards zero for negative numbers.
    ab = Math.abs(a % w - b % w) + Math.abs(~~(a / w) - ~~(b / w));

    // Calculate 'cd' using the same logic as 'ab'.
    cd = Math.abs(c % w - d % w) + Math.abs(~~(c / w) - ~~(d / w));

    // Update 'min' if the current sum (ab + cd) is smaller.
    min = Math.min(min, ab + cd);

} // End of the for loop.


// Output the final minimum value to the console.
console.log(min);