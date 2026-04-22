/*
 * This file contains a JavaScript program that processes input
 * from stdin using a custom input parsing utility.
 *
 * The `GET` utility is designed to read lines and tokens efficiently.
 * The `main` function then performs a specific calculation based on
 * the parsed input data.
 */


// Define the GET input parsing utility using an Immediately Invoked Function Expression (IIFE).
var GET = (function () {

    /**
     * The primary entry point for the GET utility.
     * Creates a new instance of the internal parser `g`.
     * @param {string} s The raw input string to be parsed.
     * @returns {g} A new parser instance.
     */
    function f(s) {
        return new g(s);
    }


    /**
     * Internal constructor for the input parser.
     * Initializes the raw string data and the current line index.
     * @param {string} s The raw input string.
     */
    function g(s) {
        // Trim whitespace from the input string and split it into an array of lines.
        this._s = s.trim().split("\n");

        // Initialize the current line index to 0.
        this._y = 0;
    }


    /**
     * Prototype method 'a': Reads a single token from the current line.
     * If the current line hasn't been processed, it splits it and reverses it for easy popping.
     * Advances the line pointer if the current line becomes empty.
     * @param {boolean} f If true, returns the token as a string; otherwise, converts it to a number.
     * @returns {string|number} The parsed token.
     */
    g.prototype.a = function (f) {
        // Get a reference to the internal string array and current line index.
        var s = this._s,
            y = this._y,
            r; // Declare result variable.

        // Check if the current line is still a single string (unprocessed).
        if (typeof s[y] === "string") {
            // Split the line by spaces and reverse it so `pop()` gets tokens from left to right.
            s[y] = s[y].split(" ").reverse();
        }

        // Pop the last element (which is the next token) from the current line's array.
        r = s[y].pop();

        // If the current line is now empty, move to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the token, optionally converting it to a number.
        return f ? r : +r;
    };


    /**
     * Prototype method 'l': Reads an entire line of tokens.
     * Advances the line pointer after reading.
     * @param {boolean} f If true, returns tokens as strings; otherwise, converts them to numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    g.prototype.l = function (f) {
        // Get the current line, split it by spaces, and then advance the line pointer.
        var s = this._s[this._y++].split(" ");

        // Return the array of tokens, optionally converting each to a number.
        return f ? s : s.map(a => +a);
    };


    /**
     * Prototype method 'm': Reads a matrix (multiple lines) of tokens.
     * Advances the line pointer by 'n' lines.
     * @param {number} n The number of lines to read for the matrix.
     * @param {boolean} f If true, returns tokens as strings; otherwise, converts them to numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    g.prototype.m = function (n, f) {
        // Slice 'n' lines from the input, then map each line to an array of split tokens.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return the matrix, optionally converting all tokens to numbers.
        return f ? r : r.map(a => a.map(a => +a));
    };


    /**
     * Prototype method 'r': Reads 'n' lines as raw strings or numbers.
     * Advances the line pointer by 'n' lines.
     * @param {number} n The number of lines to read.
     * @param {boolean} f If true, returns lines as raw strings; otherwise, converts each line to a number.
     * @returns {Array<string|number>} An array of lines.
     */
    g.prototype.r = function (n, f) {
        // Slice 'n' lines from the input array.
        var r = this._s.slice(this._y, this._y += n);

        // Return the lines, optionally converting each to a number.
        return f ? r : r.map(a => +a);
    };


    // The IIFE returns the public function 'f' which is used to instantiate the parser.
    return f;

})(); // End of GET utility definition.


// Instantiate the GET parser with input read from /dev/stdin.
// The 'fs' module is used for file system operations.
// readFileSync reads the file synchronously.
// "utf8" specifies the encoding.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


// Call the main function and print its return value to the console.
console.log(main());


/**
 * The main function encapsulates the problem's logic.
 * It reads input using the 'o' parser and performs calculations.
 * @returns {string|number} The result of the calculation or -1 if an invalid state is reached.
 */
function main() {

    // Read the first integer input and subtract 1.
    var k = o.a() - 1;

    // Read the next line as an array of numbers.
    var a = o.l();

    // Check a specific condition for the element at index 'k' (before decrementing k).
    // If the condition is not met, return -1 immediately.
    if (a[k--] !== 2) {
        return -1;
    }

    // Initialize variables 'u' and 'd' with starting values.
    var u = 3,
        d = 2;

    // Loop downwards from the current value of 'k' (which was decremented above).
    for (; k >= 0; k--) {

        // Check if the current element 'a[k]' exceeds the upper bound 'u'.
        // If it does, an invalid state is reached, return -1.
        if (a[k] > u) {
            return -1;
        }

        // Update 'd' based on 'a[k]' and the ceiling division.
        d = a[k] * Math.ceil(d / a[k]);

        // Update 'u' using a more complex calculation involving 'a[k]', 'd', and ceiling division.
        u = Math.max((a[k] * Math.ceil(u / a[k])), d + a[k]) - 1;
    }

    // After the loop, concatenate 'd' and 'u' with a space in between and return the string.
    return d + " " + u;

}