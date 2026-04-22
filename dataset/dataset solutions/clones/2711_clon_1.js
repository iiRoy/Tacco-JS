/*
 * This file contains JavaScript code implementing a solution for a specific problem.
 * It includes a custom input reading utility and several helper functions.
 *
 * The primary goal is to process input data, perform calculations,
 * and output a sequence of coordinates.
 */

// Global input parser module.
// This is an Immediately Invoked Function Expression (IIFE)
// that returns a function 'f' which acts as a constructor for the parser.
var GET = (function() {

    /**
     * Factory function to create a new parser instance.
     * @param {string} s - The raw input string to be parsed.
     * @returns {g} A new instance of the parser object.
     */
    function f(s) {
        return new g(s);
    }

    /**
     * Constructor for the parser object.
     * Initializes the parser with the input string, preparing it for line-by-line reading.
     * @param {string} s - The input string.
     */
    function g(s) {
        // Store lines of input, trimmed and split by newline characters.
        this._s = s.trim().split("\n");
        // Initialize the current line index to 0.
        this._y = 0;
    }

    // Prototype methods for the 'g' parser object.
    // These methods provide different ways to extract data from the input.

    /**
     * Reads a single value from the current line.
     * Values are read from right to left (popped from a reversed array).
     * @param {boolean} f - If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number} The parsed value.
     */
    g.prototype.a = function(f) {
        var s = this._s, // Reference to the array of input lines.
            y = this._y, // Current line index.
            r; // Variable to hold the result.

        // If the current line hasn't been processed (i.e., it's still a single string),
        // split it by spaces and reverse the order for right-to-left popping.
        if (typeof s[y] === "string") {
            s[y] = s[y].split(" ").reverse();
        }

        // Pop the last element (which was originally the first) from the current line.
        r = s[y].pop();

        // If the current line is now empty, advance to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the result, converting to a number if 'f' is falsy.
        return f ? r : +r;
    };

    /**
     * Reads an entire line as an array of values.
     * @param {boolean} f - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>} The parsed line as an array.
     */
    g.prototype.l = function(f) {
        // Get the current line, split it by spaces, and then increment the line index.
        var s = this._s[this._y++].split(" ");

        // Return the array, mapping elements to numbers if 'f' is falsy.
        return f ? s : s.map(a => +a);
    };

    /**
     * Reads 'n' lines as a 2D array (matrix).
     * Each line is split by spaces.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns a matrix of strings; otherwise, a matrix of numbers.
     * @returns {Array<Array<string|number>>} The parsed matrix.
     */
    g.prototype.m = function(n, f) {
        // Slice 'n' lines from the input, split each line by spaces,
        // and then advance the line index by 'n'.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return the matrix, mapping inner elements to numbers if 'f' is falsy.
        return f ? r : r.map(a => a.map(a => +a));
    };

    /**
     * Reads 'n' lines as a 1D array.
     * Each line is treated as a single value.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>} The parsed array.
     */
    g.prototype.r = function(n, f) {
        // Slice 'n' lines from the input and then advance the line index by 'n'.
        var r = this._s.slice(this._y, this._y += n);

        // Return the array, mapping elements to numbers if 'f' is falsy.
        return f ? r : r.map(a => +a);
    };

    // The IIFE returns the factory function 'f'.
    return f;

})(); // End of the GET module definition.

// Initialize the input parser 'o' by reading data from standard input.
// This uses Node.js's 'fs' module to synchronously read the entire content
// of /dev/stdin (which typically pipes input) as UTF-8.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This function dynamically constructs and evaluates JavaScript code to achieve nested array creation.
 * It's a clever but potentially risky way to create arrays of arbitrary dimensions.
 * @param {*} v - The initial value for all elements in the array.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The created multi-dimensional array.
 */
function xArray(v) {
    var a = arguments, // Access all arguments passed to the function.
        l = a.length, // Get the total number of arguments.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Start building the string for the innermost array.

    // Loop backwards through the dimensions to build the nested array creation string.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create the actual multi-dimensional array.
    return eval(r);
}

// Declare global variables used throughout the main logic.
// 'k', 'x', 'y' are problem-specific input parameters.
// 'xx' and 'yy' represent the current coordinates, initialized to (0,0).
var k, x, y,
    xx = 0,
    yy = 0;

// Execute the main logic and print its return value to the console.
console.log(main());

/**
 * The main function orchestrates the solution to the problem.
 * It reads initial parameters, applies movement logic, and outputs the path.
 * @returns {string|number} A string of coordinates (each on a new line) or a special status code (0 or -1).
 */
function main() {
    // Read the three initial integer parameters using the input parser.
    k = o.a();
    x = o.a();
    y = o.a();

    // Check for a trivial base case: if the target is already (0,0).
    if (x === 0 && y === 0) {
        return 0; // No moves needed.
    }

    // Check for an impossible case: if 'k' is even and the sum of target coordinates is odd.
    // This implies reaching the target is impossible with 'k'-length moves.
    if (k % 2 === 0 && (x + y) % 2) {
        return -1; // Impossible to reach.
    }

    // Initialize an array to store the sequence of visited coordinates (moves).
    var ans = [];

    // Calculate the initial Manhattan distance from (0,0) to the target (x,y).
    var l = mh(0, 0);

    // If the initial Manhattan distance is not a multiple of 'k',
    // an initial adjustment step is required.
    if (l % k !== 0) {

        // If the remainder of (l / k) is odd, perform one 'solve' step.
        // This ensures the parity aligns for subsequent moves.
        if (l % k % 2 === 1) {
            ans.push(solve());
        }

        // Recalculate 'l' based on the current position's Manhattan distance to target,
        // modulo 'k', and then halved.
        l = mh(xx, yy) % k / 2;

        // Special adjustment: if 'k' is even and the current position is diagonally aligned
        // with the target, 'l' needs to be adjusted for the move.
        if (k % 2 === 0 && Math.abs(xx - x) === Math.abs(yy - y)) {
            l = k - l;
        }

        // This block determines how to make the next move of 'k' units.
        // It tries to align one coordinate as much as possible, then the other.
        if (Math.abs(xx - x) >= l) {
            // Prioritize moving along the x-axis.
            if (xx < x) {
                xx += l; // Move right.
            } else {
                xx -= l; // Move left.
            }

            // Then move along the y-axis with the remaining distance (k-l).
            if (yy < y) {
                yy += k - l; // Move up.
            } else {
                yy -= k - l; // Move down.
            }
        } else {
            // Prioritize moving along the y-axis.
            if (yy < y) {
                yy += l; // Move up.
            } else {
                yy -= l; // Move down.
            }

            // Then move along the x-axis with the remaining distance (k-l).
            if (xx < x) {
                xx -= k - l; // Move left.
            } else {
                xx += k - l; // Move right.
            }
        }

        // Record the coordinates after this initial adjustment move.
        ans.push(xx + " " + yy);
    }

    // Continue performing 'solve' steps until the current position (xx, yy)
    // reaches the target (x, y), i.e., their Manhattan distance becomes zero.
    while (mh(xx, yy)) {
        ans.push(solve());
    }

    // Print the total number of moves made to reach the target.
    console.log(ans.length);

    // Join all recorded coordinate strings with newline characters and return the final result.
    return ans.join("\n");
}

/**
 * Calculates the Manhattan distance between a given point (a,b) and the target (x,y).
 * @param {number} a - The x-coordinate of the current point.
 * @param {number} b - The y-coordinate of the current point.
 * @returns {number} The Manhattan distance.
 */
function mh(a, b) {
    return Math.abs(a - x) + Math.abs(b - y);
}

/**
 * Calculates a direction vector (1, -1, or 0) from 'to' to 'from'.
 * This function is defined but not explicitly used in the main logic of this script.
 * @param {number} from - The starting coordinate.
 * @param {number} to - The ending coordinate.
 * @returns {number} 1 if 'from' is greater than 'to', -1 if 'from' is less than 'to', 0 if they are equal.
 */
function vec(from, to) {
    var t = from - to; // Calculate the difference.
    // Return the sign of the difference.
    return t > 0 ? 1 : t < 0 ? -1 : 0;
}

/**
 * Performs a single 'solve' step: moving 'k' units towards the target (x,y)
 * from the current position (xx,yy). It prioritizes moving along the x-axis
 * until 'k' distance is used or x-target is reached, then uses remaining 'k'
 * distance along the y-axis. Updates global 'xx' and 'yy'.
 * @returns {string} The new current position as a string "xx yy".
 */
function solve() {
    var t = k; // 't' represents the total distance (k) available for this step.

    // Attempt to move along the x-axis first.
    if (x !== xx) { // If the current x-coordinate is not yet the target x.
        if (x < xx) { // If current x is greater than target x (need to move left).
            if (t >= xx - x) { // If there's enough 't' distance to reach target x.
                t -= xx - x; // Reduce 't' by the distance moved.
                xx = x; // Set current x to target x.
            } else { // Not enough 't' distance to reach target x.
                xx -= t; // Move left by 't' units.
                t = 0; // All 't' distance has been used.
            }
        } else { // If current x is less than target x (need to move right).
            if (t >= x - xx) { // If there's enough 't' distance to reach target x.
                t -= x - xx; // Reduce 't' by the distance moved.
                xx = x; // Set current x to target x.
            } else { // Not enough 't' distance to reach target x.
                xx += t; // Move right by 't' units.
                t = 0; // All 't' distance has been used.
            }
        }
    }

    // If there is any remaining distance 't' after moving along the x-axis,
    // use it to move along the y-axis.
    if (t) {
        if (y < yy) { // If current y is greater than target y (need to move down).
            yy -= t; // Move down by 't' units.
        } else { // If current y is less than or equal to target y (need to move up).
            yy += t; // Move up by 't' units.
        }
    }

    // Return the updated current position as a string.
    return xx + " " + yy;
}