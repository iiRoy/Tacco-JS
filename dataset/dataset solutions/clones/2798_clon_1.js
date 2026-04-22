/* This is a self-executing anonymous function that initializes the GET utility. */
var GET = (function () {

    /*
     * Inner function 'f' acts as the public interface for creating
     * a new instance of the 'g' object.
     * @param {string} s - The input string to be processed.
     * @returns {g} A new instance of the 'g' object.
     */
    function f(s) {
        return new g(s);
    }

    /*
     * Constructor function 'g' for processing multiline string input.
     * It stores the trimmed, split lines and maintains a line pointer.
     * @param {string} s - The raw input string.
     */
    function g(s) {
        // Trim whitespace from the start/end of the input string,
        // then split it into an array of lines based on newline characters.
        this._s = s.trim().split("\n");

        // Initialize the current line index to 0.
        this._y = 0;
    }

    /*
     * Parses and retrieves a single item from the current line.
     * If the line is exhausted, it moves to the next.
     * @param {boolean} f - If true, returns the item as a string; otherwise, as a number.
     * @returns {string|number} The parsed item.
     */
    g.prototype.a = function (f) {
        // Reference to the internal array of lines.
        var s = this._s,
            // Current line index.
            y = this._y,
            // Variable to hold the result.
            r;

        // Check if the current line needs to be processed (split and reversed).
        if (typeof s[y] === "string") {
            s[y] = s[y].split(" ").reverse(); // Split by space and reverse for easy popping.
        }

        // Pop the last item from the (reversed) current line.
        r = s[y].pop();

        // If the current line is now empty, advance to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the item, either as a string or converted to a number.
        return f ? r : +r;
    };

    /*
     * Reads an entire line and processes its space-separated items.
     * Advances the line pointer after reading.
     * @param {boolean} f - If true, returns items as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of parsed items from the line.
     */
    g.prototype.l = function (f) {
        // Get the current line, split by spaces, and then advance the line pointer.
        var s = this._s[this._y++].split(" ");

        // Return items as strings or converted to numbers.
        return f ? s : s.map(a => +a);
    };

    /*
     * Reads 'n' lines and processes them as a 2D array (matrix).
     * Advances the line pointer by 'n'.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns items as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array of parsed items.
     */
    g.prototype.m = function (n, f) {
        // Slice 'n' lines from the internal array,
        // then advance the line pointer by 'n'.
        var r = this._s.slice(this._y, this._y += n)
            // Map each line to an array of space-separated strings.
            .map(a => a.split(" "));

        // Return the 2D array, either with string items or number items.
        return f ? r : r.map(a => a.map(a => +a));
    };

    /*
     * Reads 'n' lines as a 1D array, where each line is a single item.
     * Advances the line pointer by 'n'.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns items as strings; otherwise, as numbers.
     * @returns {Array<string|number>} A 1D array of parsed items.
     */
    g.prototype.r = function (n, f) {
        // Slice 'n' lines from the internal array,
        // then advance the line pointer by 'n'.
        var r = this._s.slice(this._y, this._y += n);

        // Return the 1D array, either with string items or number items.
        return f ? r : r.map(a => +a);
    };

    // The public interface of the GET utility is the 'f' function.
    return f;

})(); // End of the self-executing function for GET.


// Initialize the 'o' object by reading input from /dev/stdin.
// The `require("fs").readFileSync` reads the file content,
// and "utf8" specifies the encoding.
var o = GET(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
);


/*
 * Creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as additional arguments.
 * @param {*} v - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} A multi-dimensional array.
 */
function xArray(v) {
    // 'arguments' is an array-like object of all arguments passed to the function.
    var a = arguments,
        // 'l' stores the total number of arguments (including 'v').
        l = a.length,
        // 'r' will be the string representation of the array creation logic.
        // It starts with the innermost array.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

    // Loop backwards through the dimensions to build the nested Array.map structure.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create the actual multi-dimensional array.
    return eval(r);
}


// Call the main function and print its return value to the console.
console.log(main());


/**
 * The primary function that contains the core logic of the program.
 * It reads a sequence of numbers and determines if any three
 * consecutive numbers are identical.
 * @returns {string} "Bad" if three consecutive numbers are identical, otherwise "Good".
 */
function main() {
    // Read the first line of input as a sequence of numbers (assuming '1' means numeric conversion).
    var s = o.a(1);

    // Check for three consecutive identical numbers using logical OR.
    // s[0] === s[1] || s[1] === s[2] || s[2] === s[3]
    return s[0] === s[1] ||
           s[1] === s[2] ||
           s[2] === s[3]
        ? "Bad"
        : "Good";
}