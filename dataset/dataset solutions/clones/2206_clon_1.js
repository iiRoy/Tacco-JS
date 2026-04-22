"use strict"
// This is a Type I clone of the original JavaScript code.
// All identifiers, variable names, function names, operators, and expressions
// are identical to the original.
// Only whitespace and comments have been altered significantly to
// create a visually distinct but functionally equivalent version.

/*
 * The GET module is a utility for parsing input data.
 * It provides methods to read various data types from a string.
 */
var GET = (function() {

    /**
     * Factory function to create a new G instance.
     * @param {string} s - The input string to parse.
     * @returns {g} A new G instance.
     */
    function f(s) {
        return new g(s);
    }

    /**
     * Constructor for the G class.
     * Initializes the internal state for parsing.
     * @param {string} s - The input string.
     */
    function g(s) {
        // Split the input string into lines after trimming whitespace.
        this._s = s.trim().split("\n");
        // Initialize the current line index.
        this._y = 0;
    }

    /**
     * Reads a single value (number or string) from the current line.
     * If the line is not yet processed, it splits it by spaces and reverses it
     * to allow popping values from the end.
     * @param {boolean} [f=false] - If true, returns the value as a string. Otherwise, as a number.
     * @returns {string|number} The parsed value.
     */
    g.prototype.a = function(f) {
        var s = this._s, // Reference to the lines array.
            y = this._y, // Current line index.
            r; // Variable to hold the result.

        // If the current line hasn't been split into words yet, do so and reverse it.
        if (typeof s[y] === "string") {
            s[y] = s[y].split(" ").reverse();
        }

        // Pop the last element (which is the next in original order) from the current line.
        r = s[y].pop();

        // If the current line is now empty, advance to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the result, either as string or converted to number.
        return f ? r : +r;
    };

    /**
     * Reads an entire line of values.
     * @param {boolean} [f=false] - If true, returns values as strings. Otherwise, as numbers.
     * @returns {Array<string|number>} An array of parsed values from the line.
     */
    g.prototype.l = function(f) {
        // Split the current line by spaces and then advance to the next line.
        var s = this._s[this._y++].split(" ");

        // Return the array, optionally mapping values to numbers.
        return f ? s : s.map(a => +a);
    };

    /**
     * Reads a matrix (n lines, each split into values).
     * @param {number} n - The number of lines to read.
     * @param {boolean} [f=false] - If true, returns values as strings. Otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    g.prototype.m = function(n, f) {
        // Slice 'n' lines, split each into words, and advance the line pointer.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return the matrix, optionally mapping inner values to numbers.
        return f ? r : r.map(a => a.map(a => +a));
    };

    /**
     * Reads 'n' lines as raw strings or numbers.
     * @param {number} n - The number of lines to read.
     * @param {boolean} [f=false] - If true, returns lines as strings. Otherwise, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array of lines.
     */
    g.prototype.r = function(n, f) {
        // Slice 'n' lines and advance the line pointer.
        var r = this._s.slice(this._y, this._y += n);

        // Return the lines, optionally mapping them to numbers.
        return f ? r : r.map(a => +a);
    };

    // The IIFE returns the factory function 'f'.
    return f;

})(); // End of GET module definition.


// Initialize the input reader 'o' by reading from standard input.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value or expression.
 * This function uses 'eval' and should be used with caution, ensuring 'v' is safe.
 * @param {*} v - The initial value or expression for the innermost array elements.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} A multi-dimensional array.
 */
function xArray(v) {
    var a = arguments, // All arguments passed to the function.
        l = a.length, // Number of arguments.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Innermost array definition.

    // Loop to build up the outer array definitions.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create the array.
    return eval(r);
}


// Call the main function and store its result.
var myOut = main();

// If main returns a non-undefined value, log it to the console.
if (myOut !== undefined) {
    console.log(myOut);
}

/**
 * Main function containing the problem's logic.
 * This appears to be a solution to a problem involving intervals/events.
 */
function main() {
    // Read three single numbers from input.
    var n = o.a(); // Number of items/events.
    var d = o.a(); // A distance or duration parameter.
    var a = o.a(); // A cost or multiplier parameter.

    // Read 'n' pairs of numbers (a matrix) and sort them by the first element.
    // Each pair is typically [position, value] or [start_time, quantity].
    var x = o.m(n).sort((a, b) => a[0] - b[0]);

    var ans = 0; // Initialize the answer variable.
    var ary = [], // Array to store active "bombs" or effects.
        l = 0, // Pointer for the 'ary' array (left/start index).
        now = 0; // Current accumulated effect.

    // Iterate through each item/event.
    for (var i = 0; i < n; i++) {
        // Remove expired effects from 'ary'.
        // The condition `ary.length > l` ensures we don't go out of bounds.
        while (ary.length > l) {
            // If the effect's end point is before the current item's effective range, remove it.
            if (ary[l][0] < x[i][0] - d) {
                now -= ary[l][1] * a; // Subtract its contribution.
                l++; // Move the pointer forward.
            } else {
                break; // Effects are sorted by end time, so if this one is not expired, subsequent ones won't be either.
            }
        }

        // Calculate the remaining "damage" or "need" for the current item.
        var y = x[i][1] - now * a;

        // If the item is already fully "covered" or "destroyed", skip it.
        if (y <= 0) {
            continue;
        }

        // Calculate how many new "bombs" or "effects" are needed.
        // Math.ceil ensures we cover any fractional need.
        y = Math.ceil(y / a);

        // Add the new "bomb" or "effect" to 'ary'.
        // The end point is current item's position + 2*d (range covers d in both directions from center).
        // The value is 'y' (number of bombs).
        ary.push([x[i][0] + 2 * d, y]);

        // Add the number of new bombs to the total answer.
        ans += y;

        // Update the current accumulated effect.
        now += y * a;
    }

    // Return the final answer.
    return ans;
}