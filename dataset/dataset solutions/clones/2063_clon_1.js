/*
 * This file contains JavaScript code demonstrating a specific algorithm.
 * It uses strict mode for better code quality and error prevention.
 */
"use strict";

// --- Input/Output Handling Section ---

// Require the 'fs' (file system) module to read files.
// Read the entire input from the standard input file (/dev/stdin) as a UTF-8 string.
var input = require("fs").readFileSync(
  "/dev/stdin", // Specifies the path to the standard input stream.
  "utf8"       // Declares the encoding of the input file.
);

// Process the raw input string:
// Split it by spaces or newlines into an array of strings (tokens).
// 'cin' (current input) stores these tokens.
// 'cid' (current index) is a pointer to the next token to be consumed from 'cin'.
var cin = input.split(/ |\n/),
    cid = 0; // Initialize the current index to the beginning of the array.


/**
 * Retrieves the next token from the global input array 'cin'.
 *
 * @param {boolean} a - A flag. If true, the token is returned as a string.
 *                      If false or undefined, the token is converted to a number.
 * @returns {string|number} The next token, either as a string or a number.
 */
function next(a) {
    // The 'cid++' expression increments 'cid' *after* its current value is used.
    return a
           ? cin[cid++]   // If 'a' is truthy, return the string token.
           : +cin[cid++]; // If 'a' is falsy, convert the token to a number and return it.
}

/**
 * Retrieves a specified number of tokens from 'cin', advancing the 'cid'.
 *
 * @param {number} n - The count of tokens to retrieve.
 * @param {boolean} a - A flag. If true, tokens are returned as strings.
 *                      If false or undefined, tokens are converted to numbers.
 * @returns {Array<string|number>} An array containing 'n' tokens.
 */
function nexts(n, a) {
    // The `cid += n` expression updates 'cid' by adding 'n' to it,
    // and the new value is used as the end index for `slice`.
    return a
           ? cin.slice(cid, cid += n) // If 'a' is truthy, return a slice of string tokens.
           : cin.slice(cid, cid += n).map(  // If 'a' is falsy, return a slice of number tokens.
                 a => +a // Use the `map` function to convert each string token to a number.
             );
}

/**
 * Reads a 2D matrix (table) of dimensions h x w from the input 'cin'.
 *
 * @param {number} h - The number of rows for the matrix.
 * @param {number} w - The number of columns for each row.
 * @param {boolean} a - A flag. If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function nextm(h, w, a) {
    var r = [], // Initialize an empty array to store the rows of the matrix.
        i = 0;  // Initialize a loop counter for rows.

    // Conditional block for reading string elements.
    if (a) {
        for (
            ; // The initialization part is empty as 'i' is already declared and initialized.
            i < h; // Loop continues as long as 'i' is less than the number of rows.
            i++    // Increment the row counter after each iteration.
        ) {
            r.push(
                cin.slice(cid, cid += w) // Extract 'w' string tokens and push them as a row.
            );
        }
    }
    // Conditional block for reading number elements.
    else {
        for (
            ; // Empty initialization.
            i < h; // Loop condition.
            i++    // Increment.
        ) {
            r.push(
                cin.slice(cid, cid += w).map(
                    a => +a // Convert each token in the row to a number.
                )
            );
        }
    }
    return r; // Return the fully constructed matrix.
}

/**
 * Creates a multi-dimensional array of arbitrary depth, initialized with a given value.
 * The dimensions are provided as subsequent arguments after 'v'.
 * Uses `eval` for dynamic array creation, which should be handled with care.
 *
 * @param {*} v - The initial value to populate the innermost elements of the array.
 * @param {...number} dimensions - One or more numbers representing the size of each dimension.
 * @returns {Array} A multi-dimensional array.
 */
function xArray(v) {
    var a = arguments, // 'arguments' is an array-like object of all arguments passed.
        l = a.length,  // Get the total number of arguments.
        // Construct the string for the innermost array's creation.
        // `a[--l]` accesses the last dimension argument.
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})";

    // Loop backwards through the dimensions to build the nested array creation string.
    while (--l) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
    }

    // Evaluate the dynamically constructed string as JavaScript code to create the array.
    return eval(r);
}


// --- Main Program Execution Flow ---

// Call the primary 'main' function and store its result.
var myOut = main();

// If 'main' returns a value (i.e., not 'undefined'), print it to the console.
// This check ensures that 'undefined' results are not explicitly logged.
if (myOut !== undefined) {
    console.log(myOut);
}


/**
 * The core logic of the program. It performs a specific transformation on an array
 * until only a single element remains, then returns that element.
 *
 * The algorithm involves repeatedly calculating differences between symmetric
 * elements of an array and reducing the array's size by half.
 *
 * @returns {number} The single final element resulting from the transformations.
 */
function main() {
    // Read the first token as an integer 'n'. This typically represents a count or size.
    var n = next();

    // Read the next token. The '1' argument ensures it's read as a string.
    // NOTE: If 'n' was intended to be the length of 'a' as an array of numbers,
    // this line `var a = next(1);` is a logical discrepancy.
    // It reads a single token as a string. For example, if input is "5\n12345",
    // `n` becomes 5, and `a` becomes the string "12345".
    // Subsequent operations like `a[i]-a[i+1]` would then operate on character codes.
    var a = next(1);

    // Initialize array 'b' with a length of 'n-1'.
    // This array will store the initial absolute differences.
    var b = Array(n - 1);

    // Populate array 'b' by calculating the absolute difference between
    // adjacent elements (characters if 'a' is a string) from the input 'a'.
    for (
        var i = 0;       // Initialize loop counter 'i'.
        i < n - 1;       // Loop while 'i' is less than 'n-1'.
        i++              // Increment 'i' after each iteration.
    ) {
        // Calculate the absolute difference. For strings, this uses character codes.
        var y = Math.abs(a[i] - a[i + 1]);
        b[i] = y; // Assign the calculated difference to the corresponding index in 'b'.
    }

    // The main transformation loop. It continues as long as array 'b' has more than one element.
    while (b.length > 1) {
        var bl = b.length,    // Get the current length of array 'b'.
            bl2 = bl >> 1,    // Calculate half the length of 'b' using a bitwise right shift (integer division).
            c = Array(bl2);   // Create a new array 'c' of half the size to store the next iteration's results.

        // Iterate through the first half of the 'b' array.
        // Each iteration compares an element from the start with one from the end.
        for (
            var i = 0; // Initialize loop counter 'i'.
            i < bl2;   // Loop condition: iterate up to 'bl2' (half length).
            i++        // Increment 'i'.
        ) {
            // Check for equality of symmetric elements.
            if (b[i] === b[bl - 1 - i]) {
                c[i] = 0; // If they are equal, the result is 0.
            }
            // Check if the absolute difference of symmetric elements is 1.
            else if (Math.abs(b[i] - b[bl - 1 - i]) === 1) {
                c[i] = 1; // If the absolute difference is 1, the result is 1.
            }
            // For all other cases.
            else {
                c[i] = 2; // If the absolute difference is anything else, the result is 2.
            }
        }
        b = c; // Replace the old array 'b' with the newly computed array 'c'.
    }

    // After the loop terminates, 'b' will contain exactly one element.
    // This element is the final result of all transformations.
    return b[0];
}