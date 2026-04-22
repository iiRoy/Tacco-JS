/*
 * This script is intended to be executed in a strict JavaScript environment.
 * It uses a custom input parser and solves a specific problem.
 */
"use strict";

/*
 * The GET module is an Immediately Invoked Function Expression (IIFE)
 * designed to facilitate parsing input data from standard input.
 * It provides methods for reading single values, lines, and matrices.
 */
var GET = (function () {

    /*
     * The main factory function for the GET parser.
     * @param {string} s - The raw input string.
     * @returns {g} A new instance of the parser object.
     */
    function f (s) {
        return new g(s);
    }

    /*
     * Constructor for the parser object.
     * Initializes the internal state based on the input string.
     * @param {string} s - The raw input string, typically from stdin.
     */
    function g (s) {
        // Store the input string, trimmed and split by newlines.
        this._s = s.trim().split("\n");
        // Initialize the current line index to 0.
        this._y = 0;
    }

    /*
     * Reads a single value from the current line.
     * If the line is being read for the first time, it's processed.
     * @param {boolean} f - If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number} The parsed value.
     */
    g.prototype.a = function (f) {
        // Get references to internal state variables for brevity.
        var s = this._s,
            y = this._y,
            r; // Variable to hold the result.

        // Check if the current line needs to be processed (e.g., split and reversed).
        if (typeof s[y] === "string") {
            s[y] = s[y].split(" ").reverse();
        }

        // Pop the last element from the current line's array (since it was reversed).
        r = s[y].pop();

        // If the current line is now empty, advance to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the result, either as a string or a number based on the 'f' flag.
        return f ? r : +r;
    };


    /*
     * Reads an entire line as an array of values.
     * @param {boolean} f - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of parsed values from the line.
     */
    g.prototype.l = function (f) {
        // Get the current line, split it by spaces, and then increment the line index.
        var s = this._s[this._y++].split(" ");

        // Return the array, mapping elements to numbers if 'f' is false.
        return f ? s : s.map(a => +a);
    };


    /*
     * Reads a matrix (multiple lines) of values.
     * @param {number} n - The number of lines to read for the matrix.
     * @param {boolean} f - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    g.prototype.m = function (n, f) {
        // Slice 'n' lines from the input, starting from the current line index.
        // Update the current line index by 'n'.
        // Map each line to an array of strings by splitting by spaces.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return the matrix, mapping inner elements to numbers if 'f' is false.
        return f ? r : r.map(a => a.map(a => +a));
    };


    /*
     * Reads a vector (multiple lines, single value per line).
     * @param {number} n - The number of lines to read for the vector.
     * @param {boolean} f - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array representing the vector.
     */
    g.prototype.r = function (n, f) {
        // Slice 'n' lines from the input, starting from the current line index.
        // Update the current line index by 'n'.
        var r = this._s.slice(this._y, this._y += n);

        // Return the vector, mapping elements to numbers if 'f' is false.
        return f ? r : r.map(a => +a);
    };

    // Return the factory function 'f' as the public interface of the GET module.
    return f;
})();


/*
 * Initialize the input parser 'o' by reading all data from /dev/stdin.
 * The 'GET' function processes the raw input string.
 */
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


/*
 * Dynamically creates a multi-dimensional array initialization string.
 * This function uses 'eval' and should be used with caution.
 *
 * @param {*} v - The initial value for the deepest array elements.
 * @returns {Array} A multi-dimensional array initialized with 'v'.
 */
function xArray (v) {
    var a = arguments, // Get all arguments passed to the function.
        l = a.length,  // Store the number of arguments.
        // Start building the string for array creation.
        // It creates the innermost array with the value 'v'.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

    // Loop backwards through the arguments to nest array creations.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the dynamically constructed string to create the array.
    return eval(r);
}


/*
 * The main execution point of the program.
 * Calls the 'main' function and logs its return value to the console.
 */
console.log(main());


/*
 * This is the core logic function where the problem is solved.
 * It reads input using the 'o' parser and computes the result.
 */
function main () {
    // Read the first integer input, typically 'n'.
    var n = o.a();
    // Read the second integer input, typically 'm'.
    var m = o.a();
    // Read a string input, typically 's', which is a sequence of characters.
    var s = o.a(1);

    // Initialize an array 'a' to store indices where 's[i]' is "0".
    var a = [];

    // Iterate backwards from 'n-1' down to 0.
    for (var i = n; i--;) {
        // If the character at index 'i' in 's' is "0", add its index to array 'a'.
        if (s[i] === "0") {
            a.push(i);
        }
    }

    // Initialize an array 'ans' to store the calculated segments.
    var ans = [];
    // 'x' represents the current position, initialized to 'n' (end of the path).
    var x = n;

    // Iterate through the collected '0' indices in array 'a'.
    for (var i = 0; i < a.length; i++) {
        // If the distance from the current position 'x' to the '0' at 'a[i]'
        // exceeds 'm', it's impossible to reach, so return -1.
        if (x - a[i] > m) {
            return -1;
        }

        // Find the furthest reachable '0' from 'x' within distance 'm'.
        // Continue advancing 'i' as long as there's a next '0' and it's within 'm'.
        while (i < a.length - 1 && x - a[i + 1] <= m) {
            i++;
        }

        // Add the segment length (distance from 'x' to the chosen '0') to 'ans'.
        ans.push(x - a[i]);
        // Update 'x' to the position of the chosen '0'.
        x = a[i];
    }

    // Reverse the 'ans' array to get segments in forward order,
    // then join them into a space-separated string.
    return ans.reverse().join(" ");
}