/*
 * This is an extensively modified Type I clone of the original JavaScript code.
 * All identifiers, operators, and logical structures are preserved.
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered.
 *
 * This file demonstrates a pattern for parsing input and solving a specific
 * algorithmic problem, likely involving sequences or dynamic programming.
 *
 * Original Author: Unknown
 * Cloned By: Code Clone Generator Expert
 * Date: 2023-10-27
 */


var GET = (

    function ( /* The outer function of this IIFE does not take any explicit arguments. */ ) {


        // This function serves as the primary entry point for creating a new input parser instance.
        // It acts as a factory, returning a new `g` object which handles the actual parsing.
        function f(s) {
            return new g(s);
        }


        // The constructor function `g` initializes a new parser object.
        // It preprocesses the raw input string into a manageable format.
        function g(s) {

            // The input string `s` is first trimmed of leading/trailing whitespace,
            // then split into an array of lines based on the newline character.
            // This array is stored in `_s`, representing all lines of input data.
            this._s = s.trim().split("\n");

            // `_y` is an internal pointer that keeps track of the current line being processed.
            // It starts at 0, indicating the first line of the input.
            this._y = 0;
        }


        // The `g.prototype` object is used to define methods that all instances of `g` will inherit.
        // These methods facilitate reading different types of data from the preprocessed input.


        /**
         * Method `a`: Reads a single item (token) from the current line.
         * This method is designed for sequential token consumption from a line.
         *
         * @param {boolean} f - A flag: if truthy, the item is returned as a string;
         *                      otherwise, it's parsed into a number (using unary plus).
         * @returns {string|number} The single item read from the input.
         */
        g.prototype.a = function (f) {
            var s = this._s, // Local reference to the array of input lines.
                y = this._y, // Local reference to the current line index.
                r; // Variable to store the item that is popped.

            // If the current line `s[y]` is still a string (meaning it hasn't been split yet),
            // it's split by spaces and then reversed. Reversing allows `pop()` to efficiently
            // retrieve tokens from the "front" of the original line.
            if (typeof s[y] === "string") {
                s[y] = s[y].split(" ").reverse();
            }

            // Pop the last element from the (potentially reversed) array for the current line.
            r = s[y].pop();

            // If the current line becomes empty after popping an element,
            // increment the line pointer `_y` to move to the next line.
            if (!s[y].length) {
                this._y++;
            }

            // Return the read item. If `f` is true, return as is (string);
            // otherwise, convert it to a number using the unary plus operator.
            return f ? r : +r;
        };


        /**
         * Method `l`: Reads an entire line and returns its contents as an array of items.
         * This method automatically advances the line pointer `_y`.
         *
         * @param {boolean} f - A flag: if truthy, items are returned as strings;
         *                      otherwise, they are mapped to numbers.
         * @returns {string[]|number[]} An array containing all items from the read line.
         */
        g.prototype.l = function (f) {
            // Access the current line, split it by spaces, and then immediately
            // increment the line pointer `_y` for the next read operation.
            var s = this._s[this._y++].split(" ");

            // Depending on the `f` flag, return the array of strings or an array
            // where each string element has been converted to a number.
            return f ? s : s.map(a => +a);
        };


        /**
         * Method `m`: Reads a block of `n` lines, treating them as a matrix.
         * Each line is split into an array of items, forming rows of the matrix.
         *
         * @param {number} n - The number of lines to read for the matrix.
         * @param {boolean} f - A flag: if truthy, the matrix contains string arrays;
         *                      otherwise, all elements are mapped to numbers.
         * @returns {string[][]|number[][]} A two-dimensional array (matrix) of the read data.
         */
        g.prototype.m = function (n, f) {
            // Slice `n` lines from the `_s` array, starting from `_y`.
            // The `_y += n` expression updates the line pointer after slicing.
            // Each sliced line string is then mapped to an array of strings by splitting it.
            var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

            // If `f` is true, return the matrix of strings.
            // Otherwise, perform a nested map operation to convert all elements to numbers.
            return f ? r : r.map(a => a.map(a => +a));
        };


        /**
         * Method `r`: Reads a block of `n` lines without further splitting each line.
         * Each line is treated as a single item in the resulting array.
         *
         * @param {number} n - The number of lines to read.
         * @param {boolean} f - A flag: if truthy, lines are returned as strings;
         *                      otherwise, each line string is parsed as a number.
         * @returns {string[]|number[]} An array where each element is a line (string or number).
         */
        g.prototype.r = function (n, f) {
            // Slice `n` lines directly from the `_s` array, updating `_y` accordingly.
            var r = this._s.slice(this._y, this._y += n);

            // Return the array of lines. If `f` is true, strings are returned;
            // otherwise, each string line is converted to a number.
            return f ? r : r.map(a => +a);
        };


        // The immediately invoked function expression (IIFE) returns the `f` function,
        // which is the factory for creating `g` parser instances.
        return f;

    }

)(); // The IIFE is invoked immediately.


// Global variable `o` is initialized as an instance of the input parser `GET`.
// It reads all data from standard input (`/dev/stdin`) using Node.js's `fs` module,
// interpreting it as UTF-8 encoded text.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


/**
 * Function: xArray
 * This utility function creates a multi-dimensional array dynamically based on provided dimensions.
 * It initializes all elements of the innermost array with a specified value.
 *
 * CAUTION: This function uses `eval()`, which can be a security risk if the input
 *          `v` or `arguments` are not controlled. It's included here as per the
 *          Type I cloning requirements, mirroring the original structure.
 *
 * @param {*} v - The initial value to populate the innermost elements of the array.
 * @param {...number} dimensions - A variable number of arguments representing the
 *                                 sizes of each dimension (e.g., `xArray(0, 2, 3)` for a 2x3 array).
 * @returns {Array} The newly created multi-dimensional array.
 */
function xArray(v) {
    var a = arguments, // `arguments` object contains all parameters passed to `xArray`.
        l = a.length, // Total number of arguments including `v` and dimensions.
        // `r` string starts building the innermost array creation expression.
        // `--l` decrements `l` to point to the last dimension argument.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

    // Loop backward through the remaining dimension arguments.
    // Each iteration wraps the current `r` expression with another `Array().map()` call,
    // effectively building the outer dimensions of the array.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // `eval()` executes the dynamically constructed string `r` as JavaScript code,
    // creating the multi-dimensional array.
    return eval(r);
}


/**
 * Function: upper_bound
 * Implements a binary search algorithm to find the "upper bound" of a value `e`
 * within a sorted array `d`. The upper bound is defined as the index of the
 * first element that is strictly greater than `e`. If all elements are less
 * than or equal to `e`, it returns `b` (which would typically be `d.length`).
 *
 * This is a common utility in competitive programming for tasks like
 * finding positions in sorted sequences or implementing algorithms like LIS.
 *
 * @param {number[]} d - The sorted array (or a portion of it) to search within.
 * @param {number} a - The starting index of the search range (inclusive).
 * @param {number} b - The ending index of the search range (exclusive).
 * @param {number} e - The target value for which to find the upper bound.
 * @returns {number} The index of the upper bound.
 */
function upper_bound(d, a, b, e) {
    // Loop continues as long as the search range `b - a` has at least two elements.
    // This ensures `c` always falls within a valid sub-range.
    for (var c; 1 < b - a;) {
        // Calculate the middle index `c`. The `0 |` bitwise OR operation is a
        // fast way to perform a floor division (truncating the decimal part).
        c = 0 | ((a + b) / 2);

        // If the element at the middle index `d[c]` is less than or equal to `e`,
        // it means `e` could potentially be found at `c` or in the right half.
        // So, we update the lower bound `a` to `c`.
        if (d[c] <= e) {
            a = c;
        } else {
            // If `d[c]` is greater than `e`, then `e` must be in the left half
            // (before `c`). So, we update the upper bound `b` to `c`.
            b = c;
        }
    }

    // After the loop, `a` and `b` will be adjacent indices.
    // One final check determines the precise upper bound:
    // If `d[a]` is still less than or equal to `e`, then `b` is the upper bound.
    // Otherwise, `a` is the upper bound.
    return d[a] <= e ? b : a;
}


// The main entry point of the script.
// It calls the `main` function and prints its return value to the console.
console.log(main());


/**
 * Function: main
 * This is the core logic function of the program.
 * It reads input using the `o` parser, performs a specific algorithm,
 * and returns a final result. The algorithm appears to solve a variation
 * of the Longest Increasing Subsequence (LIS) problem, specifically
 * finding the length of the longest non-decreasing subsequence using
 * a transformation (negating elements) and binary search.
 *
 * @returns {number} The final computed result, typically the length of a subsequence.
 */
function main() {
    // Read a single number `n` from the input stream using the `a` method of the parser `o`.
    // `n` likely represents the count of elements that follow.
    var n = o.a();

    // Read an array `a` of `n` numbers from the input stream using the `r` method.
    // This `a` array is the primary data set for the algorithm.
    var a = o.r(n);

    // Initialize `ans` array with a single element `1`.
    // This array will store the "tails" of various non-decreasing subsequences,
    // but with elements negated.
    var ans = [1];

    // Iterate through each element of the input array `a` from index 0 to `n-1`.
    for (var i = 0; i < n; i++) {
        // Negate the current element `a[i]` and store it in `t`.
        // This negation is crucial for transforming the problem into a form
        // suitable for the `upper_bound` function with the desired outcome.
        var t = -a[i];

        // Find the `upper_bound` for `t` within the `ans` array.
        // `l` will be the index of the first element in `ans` that is greater than `t`.
        // If all elements in `ans` are less than or equal to `t`, `l` will be `ans.length`.
        var l = upper_bound(ans, 0, ans.length, t);

        // Replace the element at index `l` in `ans` with `t`.
        // This step is the core of the algorithm: if `t` extends an existing
        // subsequence, it replaces the smallest element greater than itself.
        // If `t` is greater than all elements in `ans`, it effectively extends `ans`
        // by being placed at `ans.length` (which `upper_bound` would return in that case).
        ans[l] = t;
    }

    // The final length of the `ans` array represents the computed result,
    // which in this transformed problem, corresponds to the length of the
    // longest non-decreasing subsequence (or a similar metric).
    return ans.length;
}