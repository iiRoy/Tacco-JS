/*
 * This file contains a JavaScript program designed to solve a specific problem.
 * It includes a custom utility for input parsing and a main function
 * that implements the core logic using dynamic programming.
 */

"use strict"; /* Enforces stricter parsing and error handling in the code. */


/*
 * The GET module is an Immediately Invoked Function Expression (IIFE)
 * that provides a convenient way to parse input data, typically from
 * standard input, into various formats.
 *
 * It supports reading individual numbers, lines of numbers, and matrices.
 */
var GET = (function() {

    /**
     * The main entry point for the GET module.
     * Creates and returns a new instance of the input parser.
     * @param {string} s - The raw input string to be parsed.
     * @returns {g} An instance of the input parser.
     */
    function f(s) {
        return new g(s);
    }

    /**
     * Constructor for the input parser.
     * Initializes the internal state for parsing.
     * @param {string} s - The raw input string.
     */
    function g(s) {
        // Trim whitespace and split the input string into an array of lines.
        this._s = s.trim().split("\n");
        // Initialize the line pointer to the first line.
        this._y = 0;
    }


    /**
     * Reads and returns a single number (or string if 'f' is true) from the current line.
     * If the current line is exhausted, it moves to the next line.
     * @param {boolean} [f=false] - If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number} The parsed value.
     */
    g.prototype.a = function(f) {

        var s = this._s,
            y = this._y,
            r;

        // If the current line hasn't been split into words yet, do so.
        // It's reversed to allow efficient `pop()` from the end.
        if (typeof s[y] === "string") {
            s[y] = s[y].split(" ").reverse();
        }

        // Pop the last element (which is actually the next in sequence due to reversal).
        r = s[y].pop();

        // If the current line is now empty, advance to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the result, either as a string or parsed to a number.
        return f ? r : +r;
    };


    /**
     * Reads an entire line and returns its contents.
     * @param {boolean} [f=false] - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {string[]|number[]} An array representing the parsed line.
     */
    g.prototype.l = function(f) {

        // Get the current line, split it by spaces, and then advance the line pointer.
        var s = this._s[this._y++].split(" ");

        // Return the array, either as strings or mapped to numbers.
        return f ? s : s.map(a => +a);
    };


    /**
     * Reads a matrix (multiple lines) of numbers.
     * @param {number} n - The number of lines to read for the matrix.
     * @param {boolean} [f=false] - If true, returns a matrix of strings; otherwise, a matrix of numbers.
     * @returns {string[][]|number[][]} The parsed matrix.
     */
    g.prototype.m = function(n, f) {

        // Slice 'n' lines, advance the pointer, and map each line.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return the matrix, either as strings or with all elements mapped to numbers.
        return f ? r : r.map(a => a.map(a => +a));
    };


    /**
     * Reads 'n' lines and returns them as an array.
     * @param {number} n - The number of lines to read.
     * @param {boolean} [f=false] - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {string[]|number[]} An array of parsed lines.
     */
    g.prototype.r = function(n, f) {

        // Slice 'n' lines and advance the pointer.
        var r = this._s.slice(this._y, this._y += n);

        // Return the array, either as strings or mapped to numbers.
        return f ? r : r.map(a => +a);
    };

    // The IIFE returns the 'f' function, which is the public constructor for GET.
    return f;

})();


/*
 * Initialize the input parser 'o' by reading the entire content
 * of standard input as a UTF-8 string.
 */
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


/**
 * Dynamically creates a multi-dimensional array filled with a specified value.
 * The dimensions are provided as subsequent arguments.
 *
 * Example: xArray(0, 2, 3) creates a 2x3 array filled with 0s.
 *
 * @param {*} v - The value to fill the array with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The created multi-dimensional array.
 */
function xArray(v) {

    var a = arguments,
        l = a.length,
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Innermost dimension

    // Build the array creation string from inner to outer dimensions.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the dynamically constructed string to create the array.
    return eval(r);
}


// Call the main function and print its return value to the console.
console.log(main());


/**
 * The main function where the problem's logic resides.
 * It reads input using the 'o' parser, performs calculations,
 * and returns the final result.
 */
function main() {

    // Read the first number, which is 'n'.
    var n = o.a();

    // Read the second number, which is 't'.
    var t = o.a();

    // Read 'n' lines as a matrix 'a'.
    // Each row in 'a' represents an item with [weight, value].
    var a = o.m(n);

    /*
     * Initialize a dynamic programming array 'dp'.
     * The size is 't + 3001' to handle potential offsets and ensure sufficient space.
     * All elements are initialized to 0.
     */
    var dp = xArray(0, t + 3001);


    // Iterate through each item (row) in the 'a' matrix.
    for (var i = 0; i < n; i++) {

        // Iterate backwards through the 'dp' array from 't' down to 0.
        // This reverse iteration is crucial for the 0/1 knapsack-like problem
        // to ensure each item is considered only once per 'weight' capacity.
        for (var j = t; j--;) {

            // Check if including the current item 'a[i]' yields a better value
            // for the current capacity 'j + a[i][0]'.
            // a[i][0] is the weight of the current item.
            // a[i][1] is the value of the current item.
            if (dp[j + a[i][0]] < dp[j] + a[i][1]) {

                // If a better value is found, update the 'dp' array.
                dp[j + a[i][0]] = dp[j] + a[i][1];
            }
        }
    }

    // After processing all items, find the maximum value in the 'dp' array.
    // This maximum value represents the optimal solution.
    return Math.max(...dp);
}