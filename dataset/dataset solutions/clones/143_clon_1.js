/*
 * This script processes input data to determine a specific parity.
 * It reads data from standard input, parses it, and performs calculations.
 *
 * It is designed to handle coordinate data provided in a comma-separated format,
 * calculating slopes between sequential points and then checking the parity
 * of the count of non-negative slopes.
 */

// Core modules for file system operations.
var fs = require('fs');

// Determine the size of the standard input stream (file descriptor 0).
var length = fs.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the incoming input data.
var buffer = new Buffer(length);

// Read the entire content of standard input into the allocated buffer.
// Parameters: fd, buffer, offset in buffer, length to read, position in file.
var bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0);

// Convert the buffer content to a UTF-8 string and then split it into an array of lines.
var input = buffer.toString('utf8', 0, bytesRead).split('\n');

// Immediately invoke the main processing function to begin execution.
main();


/**
 * The primary function that orchestrates the data processing logic.
 *
 * It iterates through each line of input data, treating each line as a set of
 * coordinates for four points (a, b, c, d). It then calculates the slopes
 * between these points and determines a final output based on the parity
 * of certain slope characteristics.
 */
function main()
{
    // Loop through each line of the input array.
    // The loop condition `input.length - 1` suggests handling an empty last line.
    for ( var i = 0, len = input.length - 1; i < len; i++ )
    {
        // Split the current input line by comma to get individual coordinate components.
        // Each `c[index]` will be a string representation of a number.
        var c = input[i].split(',');

        // Initialize two counters: 'p' for positive/non-negative slopes, 'n' for negative slopes.
        var p = 0;
        var n = 0;

        /*
         * Calculate the slope between point 'a' and point 'b'.
         * Points are assumed to be (c[0], c[1]), (c[2], c[3]), (c[4], c[5]), (c[6], c[7]).
         * Slope formula: (y2 - y1) / (x2 - x1)
         */
        var ab = ( c[1] - c[3] ) / ( c[0] - c[2] ); // Slope from a to b


        // Calculate the slope between point 'b' and point 'c'.
        var bc = ( c[3] - c[5] ) / ( c[2] - c[4] ); // Slope from b to c


        // Calculate the slope between point 'c' and point 'd'.
        var cd = ( c[5] - c[7] ) / ( c[4] - c[6] ); // Slope from c to d


        // Calculate the slope between point 'd' and point 'a'.
        var da = ( c[7] - c[1] ) / ( c[6] - c[0] ); // Slope from d to a


        // Use a ternary operator to increment 'p' if the slope 'ab' is non-negative, otherwise increment 'n'.
        ab >= 0 ? p++ : n++;

        // Apply the same logic for slope 'bc'.
        bc >= 0 ? p++ : n++;

        // Apply the same logic for slope 'cd'.
        cd >= 0 ? p++ : n++;

        // Apply the same logic for slope 'da'.
        da >= 0 ? p++ : n++;

        // Output 'YES' if the final count of non-negative slopes ('p') is odd, otherwise output 'NO'.
        console.log( p % 2 ? 'YES' : 'NO' );
    }


}