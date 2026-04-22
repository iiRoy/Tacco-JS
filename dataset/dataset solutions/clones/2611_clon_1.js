/*
 * This file contains a JavaScript program designed to solve a geometric problem.
 * It uses a custom input parser `GET` to read data from standard input.
 * The main logic calculates the maximum squared distance from the origin
 * to a point formed by summing vectors within a certain angular range.
 */

// Define a module for efficient input parsing.
// This IIFE (Immediately Invoked Function Expression) creates the GET object.
var GET = (function() {

    /**
     * Factory function to create a new input reader instance.
     * @param {string} s - The raw input string.
     * @returns {g} A new instance of the input reader.
     */
    function f(s) {
        return new g(s);
    }

    /**
     * Constructor for the input reader object.
     * It processes the raw input string into an array of lines.
     * @param {string} s - The raw input string.
     */
    function g(s) {
        // Store lines of input, trimmed and split by newline characters.
        this._s = s.trim().split("\n");
        // Initialize line pointer to the first line (index 0).
        this._y = 0;
    }

    // Prototype methods for the input reader.

    /**
     * Reads a single value from the current line.
     * If the current line is being read for the first time, it's split and reversed.
     * @param {boolean} f - If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number} The read value.
     */
    g.prototype.a = function(f) {
        var s = this._s, // Reference to the array of input lines.
            y = this._y, // Current line index.
            r;           // Variable to hold the result.

        // If the current line hasn't been processed into an array of tokens yet,
        // convert it from a string into an array of space-separated tokens, then reverse it.
        // Reversing allows efficient `pop()` operations from the end of the line.
        if ( typeof s[y] === "string" ) {
            s[y] = s[y].split(" ").reverse();
        }

        // Pop the last element (which was originally the first due to reversal)
        // from the current line's token array.
        r = s[y].pop();

        // If the current line is now empty, advance to the next line.
        if ( !s[y].length ) {
            this._y++;
        }

        // Return the result either as a string or as a number (unary plus operator).
        return f ? r : +r;
    };


    /**
     * Reads an entire line of space-separated values.
     * Advances the line pointer after reading.
     * @param {boolean} f - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of values from the line.
     */
    g.prototype.l = function(f) {
        // Get the current line, split it by spaces, and then increment the line pointer.
        var s = this._s[this._y++].split(" ");

        // Return the array of strings, or map them to numbers if 'f' is false.
        return f ? s : s.map( a => +a );
    };


    /**
     * Reads 'n' lines, each containing space-separated values, forming a matrix.
     * Advances the line pointer by 'n'.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of values.
     */
    g.prototype.m = function(n, f) {
        // Slice 'n' lines from the input, starting from the current line pointer.
        // For each line, split it by spaces.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return the matrix of string arrays, or map all inner values to numbers.
        return f ? r : r.map( a => a.map( a => +a ) );
    };


    /**
     * Reads 'n' lines, each representing a single value.
     * Advances the line pointer by 'n'.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of values.
     */
    g.prototype.r = function(n, f) {
        // Slice 'n' lines from the input.
        var r = this._s.slice(this._y, this._y += n);

        // Return the array of strings, or map them to numbers.
        return f ? r : r.map( a => +a );
    };

    // The IIFE returns the 'f' factory function, which becomes the 'GET' object.
    return f;
})();


/*
 * Main program execution starts here.
 * It reads input, processes data, and then prints the result.
 */

// Initialize the input parser 'o' by reading from standard input.
// The 'fs' module is used to read the file synchronously.
var o = GET( require("fs").readFileSync("/dev/stdin", "utf8") );

/**
 * Helper function to create multi-dimensional arrays initialized with a value.
 * This function is defined but not used in the provided main logic.
 * @param {*} v - The initial value for array elements.
 * @returns {Array} A multi-dimensional array.
 */
function xArray(v) {
    var a = arguments, // All arguments passed to the function.
        l = a.length,  // Number of arguments.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Innermost array creation string.

    // Loop backwards to build up the string for nested array creation.
    while ( --l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create the array.
    return eval(r);
}

// Global variables to store problem-specific data.
var n,    // Number of data points.
    x = [], // Array to store x-coordinates.
    y = [], // Array to store y-coordinates.
    c = []; // Array to store calculated angles for each point.

// Define a constant 'q' for the number of iterations in the main loop.
var q = 10000;


// Call the main function and print its return value to the console.
console.log( main() );


/**
 * The primary logic function.
 * It reads input points, calculates their angles, and then iterates through a range of angles
 * to find the maximum squared magnitude of a resultant vector.
 * @returns {number} The square root of the maximum squared magnitude found.
 */
function main() {

    // Read the initial number of points from input.
    n = o.a();

    // Loop to read 'n' pairs of coordinates (a, b).
    for ( var i = 0; i < n; i++ ) {
        var a = o.a(), // Read x-coordinate.
            b = o.a(); // Read y-coordinate.

        // If both coordinates are zero, skip this point (continue to next iteration).
        if ( a === 0 && b === 0 ) {
            continue;
        }

        // Store the coordinates.
        x.push(a);
        y.push(b);

        // Calculate and store the angle for the current point (a, b).
        c.push(f(a, b));
    }

    // Update 'n' to reflect the actual number of valid points processed.
    n = x.length;

    // Initialize the maximum squared magnitude found so far.
    var ans = 0;

    // Iterate 'q' times to simulate rotating a viewing window.
    for ( var i = 0; i < q; i++ ) {
        // Calculate the center angle 'v' for the current iteration.
        // This effectively sweeps through 360 degrees.
        var v = ( i + 0.5 ) / q * 360;

        // Initialize temporary sum for x and y components for the current window.
        var tx = 0,
            ty = 0;

        // Iterate through all processed points.
        for ( var j = 0; j < n; j++ ) {
            // Check if the point's angle 'c[j]' falls within the current 180-degree window.
            // The window is centered at 'v' and extends 90 degrees on either side.
            // The `v + 270 < c[j]` condition handles wrapping around 0/360 degrees for the window.
            if ( ( v - 90 < c[j] && c[j] < v + 90 ) || v + 270 < c[j] ) {
                // If the point is within the window, add its components to the temporary sums.
                tx += x[j],
                ty += y[j];
            }
        }

        // Calculate the squared magnitude of the resultant vector (tx, ty).
        var z = tx * tx + ty * ty;

        // Update 'ans' if the current squared magnitude 'z' is greater.
        if ( ans < z ) {
            ans = z;
        }
    }

    // Return the square root of the maximum squared magnitude found.
    // This gives the maximum possible magnitude of the resultant vector.
    return Math.sqrt(ans);
}


/**
 * Calculates the angle (in degrees) of a point (a, b) with respect to the positive x-axis.
 * The angle is in the range [0, 360).
 * Handles special cases for points on axes.
 * @param {number} a - The x-coordinate.
 * @param {number} b - The y-coordinate.
 * @returns {number} The angle in degrees.
 * @throws {number} Throws 1 if the calculated angle is out of expected range (should not happen with correct logic).
 */
function f(a, b) {

    // Handle case where x-coordinate is 0 (point on y-axis).
    if ( a === 0 ) {
        return b > 0 ? 90 : 270; // 90 degrees for positive y, 270 for negative y.
    }

    // Handle case where y-coordinate is 0 (point on x-axis).
    if ( b === 0 ) {
        return a > 0 ? 0 : 180;  // 0 degrees for positive x, 180 for negative x.
    }

    // Calculate the angle using Math.atan2 (implicitly what atan(b/a) needs to be careful about quadrants)
    // Convert radians to degrees.
    var r = Math.atan(b / a) / Math.PI * 180;

    // Adjust angle based on the quadrant.
    // If x-coordinate is negative, add 180 degrees (for quadrants II and III).
    if ( a < 0 ) {
        r += 180;
    }

    // Ensure angle is positive if it resulted in a negative value from atan.
    if ( r < 0 ) {
        r += 360;
    }

    // Final check for angle range. This should ideally not be triggered.
    if ( r < 0 || r >= 360 ) {
        throw ( 1 ); // Indicate an error if angle is out of bounds.
    }

    // Return the calculated angle in degrees.
    return r;
}