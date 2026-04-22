/*
 * This module defines a utility for parsing input data, typically from standard input.
 * It provides methods to read various data types: single values, lines of values,
 * and matrices.
 */
var GET = (function () {
    /**
     * The main entry point for the GET parser.
     * It creates and returns a new parser instance for the given input string.
     *
     * @param {string} s - The raw input string to be parsed.
     * @returns {g} A new parser instance ready to read data.
     */
    function f (s) {
        return new g(s);
    }

    /**
     * Constructor for the internal parser object 'g'.
     * Initializes the parser's state with the provided input string.
     *
     * @param {string} s - The input string, which will be processed and stored.
     */
    function g (s) {
        // Trim leading/trailing whitespace from the entire input, then split into lines.
        // Each element of `_s` will initially be a string representing a line.
        this._s = s.trim().split("\n");
        // `_y` is the current line index, tracking which line is being processed.
        this._y = 0;
    }

    /**
     * Reads a single value from the current line.
     * This method processes the current line by splitting it into tokens
     * and then extracting the next token.
     *
     * @param {boolean} f - A flag indicating whether to return the value as a string (`true`)
     *                        or convert it to a number (`false` or `undefined`).
     * @returns {string|number} The next available value from the input.
     */
    g.prototype.a = function (f) {
        var s = this._s, // Reference to the array of input lines.
            y = this._y, // Current line index.
            r;           // Variable to store the read result.

        // If the current line is still a single string (not yet split into tokens).
        if (typeof s[y] === "string") {
            // Split the line by spaces and reverse the resulting array.
            // Reversing allows `pop()` to efficiently retrieve elements from the beginning
            // of the original line.
            s[y] = s[y].split(" ").reverse();
        }

        // Extract the next value from the current line.
        r = s[y].pop();

        // If the current line is now empty after popping, advance to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the value, either as a string or converted to a number using unary plus.
        return f ? r : +r;
    };

    /**
     * Reads an entire line of values.
     * This method advances the line pointer after reading.
     *
     * @param {boolean} f - A flag indicating whether to return elements as strings (`true`)
     *                        or convert them to numbers (`false` or `undefined`).
     * @returns {Array<string|number>} An array containing all values from the read line.
     */
    g.prototype.l = function (f) {
        // Get the current line, split it by spaces, and then increment the line index (`_y++`).
        var s = this._s[this._y++].split(" ");

        // Return the array, applying numeric conversion to each element if 'f' is false.
        return f ? s : s.map(a => +a);
    };

    /**
     * Reads a block of 'n' lines, treating each line as a row in a matrix.
     * Each row is split into individual values.
     *
     * @param {number} n - The number of lines (rows) to read for the matrix.
     * @param {boolean} f - A flag to return values as strings (`true`) or numbers (`false`).
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    g.prototype.m = function (n, f) {
        // Slice 'n' lines from the input starting from the current line,
        // and advance the line index by 'n'.
        // Then, map each line string to an array of its split values.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return the matrix, applying numeric conversion to all elements if 'f' is false.
        return f ? r : r.map(a => a.map(a => +a));
    };

    /**
     * Reads a block of 'n' lines, where each line is considered a single value.
     *
     * @param {number} n - The number of lines (values) to read.
     * @param {boolean} f - A flag to return values as strings (`true`) or numbers (`false`).
     * @returns {Array<string|number>} An array containing the values from the read lines.
     */
    g.prototype.r = function (n, f) {
        // Slice 'n' lines from the input starting from the current line,
        // and advance the line index by 'n'.
        var r = this._s.slice(this._y, this._y += n);

        // Return the list of values, applying numeric conversion to each element if 'f' is false.
        return f ? r : r.map(a => +a);
    };

    // The Immediately Invoked Function Expression (IIFE) returns the 'f' function,
    // which serves as the public interface for the GET parser.
    return f;
})();


/*
 * Initialize the input parser 'o'.
 * This line reads the entire content of '/dev/stdin' (standard input)
 * as a UTF-8 string and passes it to the GET parser.
 */
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


/**
 * Creates a multi-dimensional array initialized with a specified value.
 * The dimensions are provided as subsequent arguments.
 *
 * WARNING: This function uses `eval()`, which can be a security risk if the
 * input `v` is not trusted. It dynamically constructs and executes JavaScript code.
 *
 * @param {*} v - The initial value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension of the array, from outermost to innermost.
 * @returns {Array} A multi-dimensional array with the specified dimensions and initial value.
 */
function xArray (v) {
    var a = arguments, // `arguments` object contains `v` and all dimension arguments.
        l = a.length,  // Total number of arguments passed to xArray.
        // Start building the `eval` string for the innermost array.
        // `a[--l]` gets the last dimension argument.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

    // Loop backwards through the dimensions to build nested array creation calls.
    // Each iteration wraps the existing `r` string with another `Array().map()` call.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Execute the dynamically constructed string to create the multi-dimensional array.
    return eval(r);
}


// Declare global variables used in the main logic.
// `n` will typically store the number of input items or array length.
var n,
    // `x` is an array that will store processed data points.
    x = [];


// Execute the `main` function and print its return value to the console.
console.log(main());


/**
 * The main function that orchestrates the problem's solution.
 * It reads points, calculates their angles, sorts them, and then uses
 * a sliding window approach to find the maximum possible squared Euclidean
 * distance from the origin by summing a contiguous subsequence of vectors.
 *
 * @returns {number} The square root of the maximum squared distance found.
 */
function main () {
    // Read the initial number of points from input.
    n = o.a();

    // Loop `n` times to read each point's coordinates.
    for (var i = 0; i < n; i++) {
        var a = o.a(), // Read the x-coordinate of the current point.
            b = o.a(); // Read the y-coordinate of the current point.

        // If a point is at the origin (0,0), it does not contribute to direction
        // or magnitude for the angle calculation, so we skip it.
        if (a === 0 && b === 0) {
            continue;
        }

        // Store the point as an array [x, y, angle] in the global `x` array.
        // The angle `f(a, b)` is calculated to facilitate sorting.
        x.push([a, b, f(a, b)]);
    }

    // Update `n` to reflect the actual number of valid points after filtering (0,0).
    n = x.length;

    // Sort the `x` array based on the angle (the third element `a[2]`).
    // This arranges points in angular order, which is crucial for the sliding window approach.
    x.sort((a, b) => a[2] - b[2]);

    // Concatenate the `x` array with itself.
    // This creates a circular list of points, allowing the sliding window to
    // seamlessly wrap around from 359 degrees back to 0 degrees without special handling.
    x = x.concat(x);

    var ans = 0; // Variable to store the maximum squared distance found. Initialized to 0.
    var tx = 0,  // `tx` stores the current total x-component of the summed vectors in the window.
        ty = 0,  // `ty` stores the current total y-component of the summed vectors in the window.
        k = 0;   // `k` is the right pointer of the sliding window, indicating the next vector to add.

    // Iterate through all possible starting points `i` for the sliding window.
    // The loop runs `n` times (over the original set of points).
    for (var i = 0; i < n; i++) {
        // Expand the window from the right (`k`) as long as adding the next vector
        // increases the squared distance from the origin.
        // The condition `k < i + n` ensures the window does not exceed `n` original points,
        // effectively covering all contiguous subsequences in the circular arrangement.
        while (k < i + n) {
            var ux = tx + x[k][0]; // Calculate potential new total x if x[k] is added.
            var uy = ty + x[k][1]; // Calculate potential new total y if x[k] is added.

            // If adding the vector `x[k]` would not increase the squared distance,
            // then the current window (up to `k-1`) is optimal for this starting point.
            if (tx * tx + ty * ty >= ux * ux + uy * uy) {
                break; // Stop expanding the window.
            }

            // If adding `x[k]` increases the distance, update `tx` and `ty`.
            tx = ux;
            ty = uy;
            k++; // Move the right pointer `k` to include the new vector.
        }

        // Calculate the squared distance for the current optimal window.
        var u = tx * tx + ty * ty;

        // Update the overall maximum squared distance if the current one is greater.
        if (ans < u) {
            ans = u;
        }

        // Shrink the window from the left by removing the vector at index `i`.
        // This prepares `tx` and `ty` for the next iteration, where `i+1` will be the new start.
        tx -= x[i][0];
        ty -= x[i][1];
    }

    // The problem asks for the distance, which is the square root of the squared distance.
    return Math.sqrt(ans);
}


/**
 * Calculates the angle (in degrees) of a point (a, b) relative to the positive x-axis.
 * The angle is returned in the range [0, 360).
 *
 * @param {number} a - The x-coordinate of the point.
 * @param {number} b - The y-coordinate of the point.
 * @returns {number} The angle in degrees, rounded to a high precision.
 */
function f (a, b) {
    // Handle special cases where 'a' (x-coordinate) is zero to prevent division by zero in `Math.atan`.
    if (a === 0) {
        // If x is 0, the point is on the y-axis.
        // If y > 0, it's 90 degrees (positive y-axis).
        // If y < 0, it's 270 degrees (negative y-axis).
        return b > 0 ? 90 : 270;
    }
    // Handle special cases where 'b' (y-coordinate) is zero.
    if (b === 0) {
        // If y is 0, the point is on the x-axis.
        // If x > 0, it's 0 degrees (positive x-axis).
        // If x < 0, it's 180 degrees (negative x-axis).
        return a > 0 ? 0 : 180;
    }

    // Calculate the angle using `Math.atan(y/x)` and convert from radians to degrees.
    // `Math.atan` returns values in the range (-PI/2, PI/2) or (-90, 90) degrees.
    var r = Math.atan(b / a) / Math.PI * 180;

    // Adjust the angle based on the quadrant.
    // If 'a' (x-coordinate) is negative, the point is in the 2nd or 3rd quadrant.
    // `Math.atan` would have returned an angle for the 1st or 4th quadrant, so add 180 degrees.
    if (a < 0) {
        r += 180;
    }

    // Ensure the angle is positive (between 0 and 360).
    // If `r` is still negative (e.g., for Q4 angles like -45 degrees), add 360.
    if (r < 0) {
        r += 360;
    }

    // Round the result to 7 decimal places to handle potential floating-point inaccuracies.
    return Math.round(r * 1e7) / 1e7;
}