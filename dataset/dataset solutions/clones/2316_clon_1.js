/*
 * This file contains a utility for reading input and the main program logic.
 * It's structured to solve a specific competitive programming problem.
 */
"use strict";

/**
 * GET is an IIFE (Immediately Invoked Function Expression) that provides
 * a specialized utility for parsing input data. It's designed to read
 * various types of data from a pre-processed string, typically from
 * standard input in competitive programming contexts.
 */
var GET = (function() {

    /**
     * The main entry point for the GET utility.
     * This function initializes a new input parser instance.
     *
     * @param {string} s - The raw input string, usually the entire content
     *                     of a file or standard input.
     * @returns {g} An instance of the input parser, ready to extract data.
     */
    function f(s) {
        return new g(s);
    }

    /**
     * Constructor for the input parser.
     * It pre-processes the input string for efficient reading.
     *
     * @param {string} s - The raw input string provided to 'f'.
     */
    function g(s) {
        // Store the input string, first trimmed of leading/trailing whitespace,
        // then split into an array of lines.
        this._s = s.trim().split("\n");
        // Initialize the current line index to 0, indicating the start of the input.
        this._y = 0;
    }

    /**
     * Reads a single item (either a number or a string) from the current line.
     * Items on a line are consumed from right-to-left (due to the `reverse()` call).
     *
     * @param {boolean} f - A flag: if true, returns the item as a string;
     *                        otherwise, attempts to convert it to a number.
     * @returns {string|number} The parsed item.
     */
    g.prototype.a = function(f) {
        var s = this._s,
            y = this._y,
            r;

        // If the current line (s[y]) hasn't been processed (i.e., it's still a single string),
        // split it by spaces and reverse the order. This allows `pop()` to get items
        // in their original left-to-right order.
        if (typeof s[y] === "string") {
            s[y] = s[y].split(" ").reverse();
        }

        // Extract the last item from the (reversed) current line array.
        r = s[y].pop();

        // If the current line is now empty after popping an item,
        // increment the line index to move to the next line for subsequent reads.
        if (!s[y].length) {
            this._y++;
        }

        // Return the item. If 'f' is true, return as a string; otherwise,
        // use the unary plus operator to convert it to a number.
        return f ? r : +r;
    };

    /**
     * Reads an entire line of space-separated items.
     *
     * @param {boolean} f - A flag: if true, returns items as strings;
     *                        otherwise, converts them all to numbers.
     * @returns {string[]|number[]} An array of parsed items from the line.
     */
    g.prototype.l = function(f) {
        // Get the current line, split it by spaces, and then immediately
        // increment the line index to prepare for the next read.
        var s = this._s[this._y++].split(" ");

        // Return the array of items. If 'f' is true, return as strings;
        // otherwise, map each item to its numerical equivalent.
        return f ? s : s.map(a => +a);
    };

    /**
     * Reads 'n' consecutive lines, treating each line as an array of
     * space-separated items.
     *
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - A flag: if true, returns items as strings;
     *                        otherwise, converts them all to numbers.
     * @returns {string[][]|number[][]} A 2D array where each inner array
     *                                   represents a line of parsed items.
     */
    g.prototype.m = function(n, f) {
        // Extract 'n' lines from '_s' starting at '_y', then update '_y'.
        // For each extracted line, split it by spaces.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return the 2D array. If 'f' is true, return as strings;
        // otherwise, map each inner array's items to numbers.
        return f ? r : r.map(a => a.map(a => +a));
    };

    /**
     * Reads 'n' consecutive lines, treating each entire line as a single item.
     *
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - A flag: if true, returns lines as strings;
     *                        otherwise, converts them all to numbers.
     * @returns {string[]|number[]} An array of parsed lines.
     */
    g.prototype.r = function(n, f) {
        // Extract 'n' lines from '_s' starting at '_y', then update '_y'.
        var r = this._s.slice(this._y, this._y += n);

        // Return the array of lines. If 'f' is true, return as strings;
        // otherwise, map each line (string) to its numerical equivalent.
        return f ? r : r.map(a => +a);
    };

    // The IIFE returns the 'f' function, which is the public interface
    // for creating a new GET parser instance.
    return f;
})();

/**
 * Initialize the input parser 'o' by reading the entire content
 * of standard input (`/dev/stdin`).
 * The `require("fs").readFileSync` function is used for this purpose,
 * specifying "utf8" encoding.
 */
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * This function uses `eval()` and should be used with extreme caution
 * as it can pose security risks if the `v` parameter is untrusted.
 *
 * @param {*} v - The initial value for all elements of the array.
 * @param {...number} dimensions - One or more numbers representing the
 *                                 sizes of the array's dimensions (e.g.,
 *                                 `xArray(0, 3, 4)` creates a 3x4 array of zeros).
 * @returns {Array} A multi-dimensional array constructed dynamically.
 */
function xArray(v) {
    var a = arguments,
        l = a.length,
        // Start building the string for the innermost array dimension.
        // `a[--l]` gets the last argument, which is the innermost dimension size.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

    // Loop backwards through the dimensions, building the string for
    // progressively outer array dimensions.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create and return the multi-dimensional array.
    return eval(r);
}

// Execute the main program function and print its return value to the console.
console.log(main());

/**
 * The main program logic for solving a specific problem.
 * This function typically involves reading input, performing calculations,
 * and returning a result. The structure suggests a binary search approach.
 *
 * @returns {number} The final calculated result of the problem.
 */
function main() {
    // Read four integer parameters from the input using the `o.a()` utility.
    var n = o.a(),
        m = o.a(),
        v = o.a(),
        p = o.a();

    // Read an array of numbers from the input using the `o.l()` utility.
    var a = o.l();

    // Sort the array 'a' in ascending numerical order.
    a.sort((a, b) => a - b);

    // Initialize variables for a binary search.
    // 'ok' represents a "good" (possible) index, initialized to `n-p`.
    // 'ng' represents a "bad" (not possible) index, initialized to `-1`.
    var ok = n - p,
        ng = -1;

    // Perform binary search while there's a gap larger than 1 between 'ok' and 'ng'.
    while (ok - ng > 1) {
        // Calculate the middle index 'c' using bitwise right shift (equivalent to Math.floor((ok + ng + 1) / 2)).
        var c = ok + ng + 1 >> 1;

        // Calculate a critical value 'd' based on the element at index 'c' and 'm'.
        var d = a[c] + m;

        // Decision logic to narrow down the binary search range.
        if (d < a[n - p]) {
            // If 'd' is less than the element at index `n-p`, it means
            // 'c' is too small; update 'ng' to 'c'.
            ng = c;
        } else if (v <= c + p) {
            // If 'v' is less than or equal to 'c+p', it means 'c' is a
            // possible answer; update 'ok' to 'c'.
            ok = c;
        } else {
            // This block handles a more complex condition.
            // 'amari' (remaining) represents a quantity that needs to be distributed.
            var amari = (v - c - p) * m;

            // Iterate through a specific range of elements.
            // This loop checks if 'amari' can be "covered" by differences
            // between 'd' and elements in the array.
            for (var i = c + 1; amari > 0 && i < n - p + 1; i++) {
                amari -= d - a[i];
            }

            // Based on the final value of 'amari', update 'ok' or 'ng'.
            if (amari <= 0) {
                // If 'amari' is non-positive, 'c' is a valid candidate.
                ok = c;
            } else {
                // Otherwise, 'c' is too small.
                ng = c;
            }
        }
    }

    // The final result is 'n' minus the optimal 'ok' index found by the binary search.
    return n - ok;
}