/*
 * This JavaScript module provides utility functions for parsing input data.
 * It's designed to read various data types efficiently from a string buffer.
 */
var GET = (

    function() {

        /**
         * The main entry point for the GET parser.
         *
         * @param {string} s - The raw input string to be parsed.
         * @returns {g} An instance of the internal parser class.
         */
        function f(s) {
            // Create a new parser instance with the provided string.
            return new g(s);
        }

        /**
         * Internal parser class. Handles the actual parsing logic.
         *
         * @class
         * @param {string} s - The input string.
         */
        function g(s) {
            /*
             * Initialize the internal state:
             * _s: An array of strings, where each element is a line from the input.
             *     Whitespace is trimmed from the original input string, then split by newlines.
             * _y: The current line index being processed.
             */
            this._s = s.trim().split("\n");

            this._y = 0;
        }

        /**
         * Prototype methods for the parser class 'g'.
         * These methods provide various ways to extract data from the input.
         */
        g.prototype.a = function(f) {
            // Get the current state variables.
            var s = this._s,
                y = this._y,
                r; // 'r' will hold the result.

            // If the current line hasn't been processed yet (is still a single string).
            if (typeof s[y] === "string") {
                /*
                 * Split the line by spaces and reverse it.
                 * This allows popping elements from the end, which is more efficient.
                 */
                s[y] = s[y].split(" ").reverse();
            }

            // Pop the last element from the current line.
            r = s[y].pop();

            // If the current line is now empty, advance to the next line.
            if (!s[y].length) {
                this._y++;
            }

            // Return the result, either as a string or a number based on the 'f' flag.
            return f ? r : +r;
        };

        g.prototype.l = function(f) {
            /*
             * Get the current line, increment the line index, and split it by spaces.
             * This reads an entire line as a list of space-separated values.
             */
            var s = this._s[this._y++].split(" ");

            // Return the result, either as strings or numbers based on the 'f' flag.
            return f ? s : s.map(a => +a);
        };

        g.prototype.m = function(n, f) {
            /*
             * Read 'n' lines, slice them from the input array,
             * increment the line index, and then map each line to an array of strings.
             * This is for reading a matrix of string values.
             */
            var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

            // Return the result, either as strings or numbers (matrix of numbers) based on 'f'.
            return f ? r : r.map(a => a.map(a => +a));
        };

        g.prototype.r = function(n, f) {
            /*
             * Read 'n' raw lines from the input, slice them, and increment the line index.
             * This is for reading 'n' single values, each on its own line.
             */
            var r = this._s.slice(this._y, this._y += n);

            // Return the result, either as strings or numbers based on the 'f' flag.
            return f ? r : r.map(a => +a);
        };

        // Return the main entry function 'f' for external use.
        return f;

    })(); // IIFE (Immediately Invoked Function Expression) ends here.


/*
 * Initialize the parser 'o' by reading the entire content
 * of /dev/stdin as UTF-8.
 */
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


/**
 * Creates a multi-dimensional array initialized with a specific value or structure.
 *
 * @param {*} v - The initial value for the innermost array elements.
 * @param {...number} dimensions - The dimensions of the array (e.g., xArray("[]", 2, 3) for 2x3).
 * @returns {Array} The initialized multi-dimensional array.
 */
function xArray(v) {

    var a = arguments,
        l = a.length,
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Innermost array definition.

    // Build the string representation of nested Array.map calls.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create the actual array structure.
    return eval(r);
}


// Initialize a 6-element array, where each element is an empty array.
// This will be used to store min/max coordinates for different directions.
var move = xArray("[]", 6);

// Initialize a Set to store unique calculated 'i' values.
var set = new Set([0]);


// Call the main function and log its return value to the console.
console.log(main());


/**
 * The main logic function of the program.
 * Reads input, processes coordinates, performs calculations, and returns an answer.
 *
 * @returns {number} The calculated minimum area.
 */
function main() {

    // Read the number of input operations.
    var n = o.a();

    // Loop through each operation.
    for (var i = 0; i < n; i++) {
        // Read x, y coordinates and direction.
        var x = o.a();
        var y = o.a();
        var d = o.a(1); // '1' means read as string, not number.

        // Process based on direction.
        if (d === "U") { // Up
            solve(0, y); // Update y-bounds for vertical movement (up).
            solve(5, x); // Update x-bounds for diagonal movement.
        } else if (d === "R") { // Right
            solve(1, x); // Update x-bounds for horizontal movement (right).
            solve(4, y); // Update y-bounds for diagonal movement.
        } else if (d === "D") { // Down
            solve(2, y); // Update y-bounds for vertical movement (down).
            solve(5, x); // Update x-bounds for diagonal movement.
        } else { // Left
            solve(3, x); // Update x-bounds for horizontal movement (left).
            solve(4, y); // Update y-bounds for diagonal movement.
        }
    }

    /*
     * Perform initial calculations and add potential 'i' values to the set.
     * These 'calc' calls seem to derive critical points for the 'i' parameter
     * based on the accumulated min/max coordinates.
     */
    calc(move[0][1], move[4][1], move[2][1]);
    calc(-move[2][0], -move[4][0], -move[0][0]);
    calc(move[1][1], move[5][1], move[3][1]);
    calc(-move[3][0], -move[5][0], -move[1][0]);

    // Initialize 'ans' with a very large number to find the minimum area.
    var ans = 1e18; // Equivalent to 1 * 10^18.

    // Iterate through all unique 'i' values in the set.
    for (var i of set) {
        // Calculate effective upper, lower, right, and left bounds for the current 'i'.
        var u = max(move[0][1] + i, move[2][1] - i, move[4][1]);
        var d = min(move[0][0] + i, move[2][0] - i, move[4][0]);
        var r = max(move[1][1] + i, move[3][1] - i, move[5][1]);
        var l = min(move[1][0] + i, move[3][0] - i, move[5][0]);

        // Calculate the area for the current bounds.
        var s = (u - d) * (r - l);

        // Update the minimum answer if the current area is smaller.
        if (s < ans) {
            ans = s;
        }
    }

    // Return the final minimum area.
    return ans;
}


/**
 * Updates the min/max bounds for a given direction index.
 * `move` is a global array where each element `move[i]` is an array `[min_val, max_val]`.
 *
 * @param {number} i - The index representing a specific direction/dimension.
 * @param {number} z - The coordinate value to incorporate.
 */
function solve(i, z) {

    // Check if the bounds for this direction have been initialized.
    if (move[i].length) {
        // If 'z' is less than the current minimum, update the minimum.
        if (move[i][0] > z) {
            move[i][0] = z;
        }
        // Else if 'z' is greater than the current maximum, update the maximum.
        else if (move[i][1] < z) {
            move[i][1] = z;
        }
    } else {
        // If not initialized, set both min and max to 'z'.
        move[i][0] = move[i][1] = z;
    }
}


/**
 * Calculates potential critical 'i' values and adds them to the global `set`.
 * These calculations are derived from the min/max coordinates and involve finding
 * specific points where the area calculation might change its behavior.
 *
 * @param {number} u - An upper bound or related value.
 * @param {number} x - A cross-coordinate or related value.
 * @param {number} d - A lower bound or related value.
 */
function calc(u, x, d) {

    // Add a calculated 'i' value based on (d-x) or (d-u)/2, ensuring it's non-negative.
    set.add(Math.max(0, (d - x) || 0, ((d - u) / 2) || 0));

    // Add another calculated 'i' value based on (x-u) or (d-u)/2, ensuring it's non-negative.
    set.add(Math.max(0, (x - u) || 0, ((d - u) / 2) || 0));
}


/**
 * Finds the maximum value among its arguments.
 * Handles `NaN` by ignoring them.
 *
 * @param {...number} args - Numbers to compare.
 * @returns {number} The maximum value.
 */
function max() {

    var a = arguments; // Get all arguments as an array-like object.
    var r = a[0]; // Initialize result with the first argument.

    // Iterate through the rest of the arguments.
    for (var i = 1; i < a.length; i++) {
        // Skip NaN values.
        if (isNaN(a[i])) {
            continue;
        }
        // If current result is already greater, continue.
        if (r > a[i]) {
            continue;
        }
        // Otherwise, update result to the larger value.
        r = a[i];
    }

    return r; // Return the maximum value found.
}


/**
 * Finds the minimum value among its arguments.
 * Handles `NaN` by ignoring them.
 *
 * @param {...number} args - Numbers to compare.
 * @returns {number} The minimum value.
 */
function min() {

    var a = arguments; // Get all arguments.
    var r = a[0]; // Initialize result with the first argument.

    // Iterate through the rest of the arguments.
    for (var i = 1; i < a.length; i++) {
        // Skip NaN values.
        if (isNaN(a[i])) {
            continue;
        }
        // If current result is already smaller, continue.
        if (r < a[i]) {
            continue;
        }
        // Otherwise, update result to the smaller value.
        r = a[i];
    }

    return r; // Return the minimum value found.
}