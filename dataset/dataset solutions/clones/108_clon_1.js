/*
 * This file contains a JavaScript program for processing some input.
 * It reads data from standard input, initializes a 2D array,
 * processes the input based on certain rules, and then calculates
 * and prints two values to the console.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Core Node.js module for file system operations.
var fs = require('fs');

// Determine the size of the standard input stream.
var length = fs.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data.
var buffer = new Buffer(length);

// Read data from standard input into the buffer.
var bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0);

// Convert the buffer to a UTF-8 string, then split it into lines.
var input = buffer.toString('utf8', 0, bytesRead).split('\n');


// Call the main processing function to begin execution.
main();


/**
 * The primary function where the program logic resides.
 * It initializes data structures, processes input, and computes results.
 */
function main() {
    // Create a local copy of the input array for processing.
    var localInput = input;

    // Initialize a 14x14 2D array 'f' with all zeros.
    // This array is used to store counts based on input processing.
    var f = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 0
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 1
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 2
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 3
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 4
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 5
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 6
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 7
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 8
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 9
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 10
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 11
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 12
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // Row 13
        ];


    // Calculate the length of the input array, subtracting 1
    // potentially to ignore a trailing empty line.
    var len = localInput.length - 1;

    // Loop through the input lines in reverse order.
    for (; len--;) {
        // Get the current line.
        var l = localInput[len];

        // Parse the first character as an integer for X coordinate, adding 2.
        var ix = parseInt(l[0]) + 2;

        // Parse the third character as an integer for Y coordinate, adding 2.
        var iy = parseInt(l[2]) + 2;

        // Use a switch statement based on the fifth character of the line.
        switch (l[4]) {
            case '3': // This case intentionally falls through to '2' and '1'.
                // Increment counts for specific positions relative to (ix, iy).
                f[iy + 2][ix]++;
                f[iy - 2][ix]++;
                f[iy][ix - 2]++;
                f[iy][ix + 2]++;
            case '2': // This case intentionally falls through to '1'.
                // Increment counts for positions forming a diagonal cross.
                f[iy + 1][ix - 1]++;
                f[iy + 1][ix + 1]++;
                f[iy - 1][ix - 1]++;
                f[iy - 1][ix + 1]++;
            case '1':
                // Increment counts for positions forming a plus shape and center.
                f[iy + 1][ix]++;
                f[iy][ix - 1]++;
                f[iy][ix]++; // Center point
                f[iy][ix + 1]++;
                f[iy - 1][ix]++;
                break; // Exit the switch statement after case '1' is handled.
        }
    }


    // Initialize variables for final calculations.
    var nd = 0; // 'nd' stands for 'not dropped' (count of empty spots).
    var md = 0; // 'md' stands for 'most dropped' (maximum value in 'f').

    // Outer loop for Y coordinates (from 9 down to 0).
    var y = 10;
    for (; y--;) {
        // Inner loop for X coordinates (from 9 down to 0).
        var x = 10;
        for (; x--;) {
            // Check if the current cell in 'f' (offset by +2 for both x and y) is zero.
            // If it is, increment 'nd'. The '!' converts the value to a boolean and then negates it.
            nd += !(f[y + 2][x + 2]);

            // Update 'md' with the maximum value found so far in 'f'.
            md = mx(f[y + 2][x + 2], md);
        }
    }


    // Output the calculated 'nd' value to the console.
    console.log(nd);

    // Output the calculated 'md' value to the console.
    console.log(md);
}


/**
 * Custom maximum function that uses bitwise operations.
 * This function returns the maximum of two numbers 'a' and 'b'.
 *
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The greater of 'a' and 'b'.
 */
function mx(a, b) {
    // This is an optimized way to calculate max(a, b) using bitwise operations.
    // It leverages the sign bit of (a-b) to select either (a-b) or 0.
    // If (a-b) is positive, ((a-b) >> 31) is 0, so (a-b) & 0 is 0. Result: a - 0 = a.
    // If (a-b) is negative, ((a-b) >> 31) is -1 (all ones), so (a-b) & (-1) is (a-b). Result: a - (a-b) = b.
    return a - ((a - b) & ((a - b) >> 31));
}