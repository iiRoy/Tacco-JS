// This file contains a JavaScript program designed for competitive programming scenarios.
// It includes several utility functions for efficient input parsing from standard input,
// followed by the main problem-solving logic.

"use strict"; // Enforces stricter parsing and error handling in the code, promoting better practices.

// --- Input Processing Utility Functions ---

// Reads the entire content of the standard input file synchronously.
// In typical competitive programming environments, '/dev/stdin' refers to the standard input stream.
// The input is read as a UTF-8 encoded string.
var input = require("fs").readFileSync("/dev/stdin", "utf8");

// Splits the entire input string into an array of tokens.
// Tokens are delimited by either spaces or newline characters.
// 'cin' (current input array) holds these tokens.
// 'cid' (current input index) keeps track of the next token to be consumed.
var cin = input.split(/ |\n/),
    cid = 0; // Initialize the token index to the beginning of the array.

/**
 * Retrieves the next token from the 'cin' array and converts it to a number.
 * The unary plus operator (+) is used as a concise way to perform type coercion to a number.
 *
 * @returns {number} The next numerical value from the input stream.
 */
function next() {
    return +cin[cid++]; // Post-increment 'cid' after accessing the token.
}

/**
 * Retrieves the next token from the 'cin' array as a string.
 * No type conversion is performed, returning the raw string token.
 *
 * @returns {string} The next string value from the input stream.
 */
function nextstr() {
    return cin[cid++]; // Post-increment 'cid' after accessing the token.
}

/**
 * Retrieves the next token from the 'cin' array and converts it into a BigInt.
 * This is essential for handling integer values that might exceed the maximum safe integer
 * capacity of standard JavaScript numbers (2^53 - 1).
 *
 * @returns {BigInt} The next BigInt value from the input stream.
 */
function nextbig() {
    return BigInt(cin[cid++]); // Explicitly construct a BigInt from the token.
}

/**
 * Reads a specified number of tokens ('n') from the input array.
 * The 'a' parameter acts as a flag:
 * - If 'a' is truthy, the tokens are returned as an array of strings.
 * - If 'a' is falsy, the tokens are converted to numbers before being returned in an array.
 *
 * @param {number} n - The count of tokens to read.
 * @param {boolean} a - A flag to determine if tokens should be strings (true) or numbers (false).
 * @returns {Array<string|number>} An array containing the read tokens, either as strings or numbers.
 */
function nexts(n, a) {
    // Utilizes a ternary operator for conditional processing based on the 'a' flag.
    return a
        ? cin.slice(cid, cid += n) // If 'a' is true, return a slice of string tokens.
        : cin.slice(cid, cid += n).map(a => +a); // If 'a' is false, slice and map to numbers.
}

/**
 * Reads a 2D matrix of dimensions 'h' (height/rows) by 'w' (width/columns) from the input.
 * Similar to 'nexts', the 'a' parameter dictates the type of elements in the matrix:
 * - If 'a' is truthy, matrix elements are strings.
 * - If 'a' is falsy, matrix elements are converted to numbers.
 *
 * @param {number} h - The number of rows for the matrix.
 * @param {number} w - The number of columns for each row in the matrix.
 * @param {boolean} a - A flag to determine if matrix elements should be strings (true) or numbers (false).
 * @returns {Array<Array<string|number>>} The constructed 2D matrix.
 */
function nextm(h, w, a) {
    var r = [], // Initialize an empty array to store the rows of the matrix.
        i = 0; // Initialize a loop counter for iterating through rows.

    // Conditional logic to handle string or number conversion based on the 'a' flag.
    if (a) {
        // If 'a' is true, populate the matrix with string values.
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w)); // Add a row of string tokens.
        }
    } else {
        // If 'a' is false, populate the matrix with numerical values.
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w).map(a => +a)); // Add a row of number tokens, converted.
        }
    }

    return r; // Return the fully assembled matrix.
}

/**
 * Dynamically constructs a multi-dimensional array with specified dimensions.
 * All elements in the array are initialized with a given value 'v'.
 * This function uses `eval`, which allows for powerful dynamic code execution but should be
 * used with caution, especially when 'v' might come from untrusted sources, due to potential security risks.
 *
 * @param {*} v - The initial value to fill all elements of the multi-dimensional array.
 * @param {...number} dimensions - A variable number of arguments, each representing a dimension size.
 * @returns {Array} A multi-dimensional array initialized with 'v'.
 */
function xArray(v) {
    var a = arguments, // Access all arguments passed to this function (including 'v' and dimensions).
        l = a.length, // Get the total count of arguments.
        // Start building the `eval` string from the innermost array definition.
        // `--l` decrements 'l' to point to the last dimension argument.
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})";

    // Loop backwards through the remaining dimensions to construct nested array calls.
    while (--l) {
        // Prepend the next outer `Array.fill().map()` structure to the `r` string.
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
    }

    // Execute the dynamically constructed string as JavaScript code to create the array.
    return eval(r); // Returns the fully formed multi-dimensional array.
}


// --- Main Program Execution Flow ---

// Call the primary logic function, 'main', to start the program's core operations.
// The result returned by 'main' is stored in the 'myOut' variable.
var myOut = main();

// After 'main' has finished, check if it returned a defined value.
// If a value was returned (i.e., not `undefined`), convert it to a string and print it to the console.
if (myOut !== undefined) {
    console.log(String(myOut)); // Ensures that the output is always a string, suitable for console logging.
}


/**
 * The main function encapsulates the problem's specific algorithm.
 * It processes input data related to 'w' and 'h' dimensions, sorts combined items,
 * and performs a calculation that resembles a sweep-line algorithm or a cumulative sum.
 *
 * @returns {BigInt} The final calculated result, intended to handle potentially large numerical outcomes.
 */
function main() {
    // Read two integer values, 'w' and 'h', from the input using the 'next' utility.
    // These typically represent dimensions, counts, or other significant parameters for the problem.
    var w = next(),
        h = next();

    // Initialize an empty array 'a'. This array will store pairs of data: [value, type_tag].
    var a = [];

    // First loop: Reads 'w' individual values and tags them with a type identifier '0'.
    // Each value is pushed into 'a' as a two-element array: [value, 0].
    for (var i = 0; i < w; i++) {
        a.push([next(), 0]); // Read a value and tag it as type 0.
    }

    // Second loop: Reads 'h' individual values and tags them with a type identifier '1'.
    // Each value is pushed into 'a' as a two-element array: [value, 1].
    for (var i = 0; i < h; i++) {
        a.push([next(), 1]); // Read a value and tag it as type 1.
    }

    // Sort the combined array 'a'. The sorting is based on the first element of each inner array (the value).
    // This step is critical for processing the items in a specific order, often for sweep-line algorithms.
    a.sort((a, b) => a[0] - b[0]); // Standard numerical sort for the first element.

    // Initialize 'ans' (answer) as a BigInt. This is used to accumulate potentially very large sums
    // without encountering precision issues inherent in standard JavaScript numbers.
    var ans = 0n;

    // Initialize two counters, 'x' and 'y'.
    // These counters likely track the number of type '0' and type '1' items encountered so far during iteration.
    var x = 0,
        y = 0;

    // Iterate through the entire sorted array 'a'.
    // The loop runs for a total of 'h + w' times, processing every item that was initially read.
    for (var i = 0; i < h + w; i++) {
        // Check the type tag (second element) of the current item in the array.
        if (a[i][1] === 0) {
            // If the current item is of type '0':
            // Add a calculated value to 'ans'. The calculation involves 'h', 'y', and the item's value.
            ans += BigInt(h - y + 1) * BigInt(a[i][0]);
            x++; // Increment the 'x' counter, indicating another type '0' item has been processed.
        } else {
            // If the current item is of type '1':
            // Add a calculated value to 'ans'. This calculation involves 'w', 'x', and the item's value.
            ans += BigInt(w - x + 1) * BigInt(a[i][0]);
            y++; // Increment the 'y' counter, indicating another type '1' item has been processed.
        }
    }

    // Return the final accumulated BigInt value, which is the solution to the problem.
    return ans;
}