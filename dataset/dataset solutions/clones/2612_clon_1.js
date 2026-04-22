/*
 * This file contains utility functions for reading input
 * and solving a geometric problem.
 * It's a Type I clone, meaning only whitespace and comments
 * have been altered from the original source.
 */

// Define a module for input processing, encapsulated in an Immediately Invoked Function Expression (IIFE).
var GET = (function () {

    // Helper function 'f': Acts as a factory to create new input reader instances.
    function f(s) {
        return new g(s);
    }

    // Constructor function 'g': Initializes an input reader object.
    function g(s) {
        // Store the input string 's' after trimming whitespace and splitting it into lines.
        this._s = s.trim().split("\n");
        // Initialize '_y' as a line pointer, starting at the first line (index 0).
        this._y = 0;
    }

    // Prototype method 'a': Reads and processes a single value from the current line.
    // 'f' is a flag; if true, returns string, otherwise returns number.
    g.prototype.a = function (f) {
        var s = this._s, // Reference to the array of input lines.
            y = this._y, // Current line index.
            r;           // Variable to hold the extracted value.

        // Check if the current line 's[y]' is still a string (meaning it hasn't been split yet).
        if (typeof s[y] === "string") {
            // If it's a string, split it by spaces and reverse the order.
            // This allows 'pop()' to read values from left to right in the original string.
            s[y] = s[y].split(" ").reverse();
        }

        // Extract the last element from the (possibly reversed) current line array.
        r = s[y].pop();

        // If the current line array becomes empty after popping, advance to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the result: 'r' as a string if 'f' is truthy, otherwise convert 'r' to a number.
        return f ? r : +r;
    };

    // Prototype method 'l': Reads an entire line as an array of values.
    // 'f' is a flag; if true, returns array of strings, otherwise array of numbers.
    g.prototype.l = function (f) {
        // Get the current line, split it by spaces, and then increment the line pointer '_y'.
        var s = this._s[this._y++].split(" ");

        // Return 's' (array of strings) if 'f' is truthy, otherwise map each element to a number.
        return f ? s : s.map(a => +a);
    };

    // Prototype method 'm': Reads a matrix (2D array) of 'n' lines.
    // 'f' is a flag; if true, returns matrix of strings, otherwise matrix of numbers.
    g.prototype.m = function (n, f) {
        // Slice 'n' lines starting from the current position, then advance '_y' by 'n'.
        // For each sliced line, split it by spaces.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return 'r' (matrix of strings) if 'f' is truthy.
        // Otherwise, map each inner array's elements to numbers.
        return f ? r : r.map(a => a.map(a => +a));
    };

    // Prototype method 'r': Reads 'n' lines as an array of single values.
    // 'f' is a flag; if true, returns array of strings, otherwise array of numbers.
    g.prototype.r = function (n, f) {
        // Slice 'n' lines starting from the current position, then advance '_y' by 'n'.
        var r = this._s.slice(this._y, this._y += n);

        // Return 'r' (array of strings) if 'f' is truthy, otherwise map each element to a number.
        return f ? r : r.map(a => +a);
    };

    // The IIFE returns the 'f' function, which is the public interface for creating 'g' instances.
    return f;

})(); // End of the GET IIFE.


// Initialize the input reader 'o' by reading the content of '/dev/stdin' as UTF-8.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


// Function 'xArray': Dynamically creates multi-dimensional arrays.
// 'v' is the initial value for the innermost elements.
// Subsequent arguments are the dimensions of the array.
function xArray(v) {
    var a = arguments, // Access the arguments object.
        l = a.length,  // Get the total number of arguments.
        // Construct the string for the innermost array creation.
        // Decrement 'l' to get the index of the last dimension argument.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

    // Loop backwards through the remaining dimensions to build nested array creation strings.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create and return the multi-dimensional array.
    return eval(r);
}


// Declare global variables used in the main logic.
var n,  // Variable to store the number of data points.
    x = [], // Array to store x-coordinates of points.
    y = []; // Array to store y-coordinates of points.


// Execute the 'main' function and print its return value to the console.
console.log(main());


/**
 * main function: Orchestrates the problem-solving logic.
 * Reads input points, filters them, and then iterates through a range of
 * parameters to find a maximum squared distance using the 'solve' function.
 * @returns {number} The final calculated square root of the maximum squared distance.
 */
function main() {

    // Read the initial number of points from input.
    n = o.a();

    // Loop to read 'n' pairs of (x, y) coordinates.
    for (var i = 0; i < n; i++) {
        var a = o.a(), // Read the x-coordinate.
            b = o.a(); // Read the y-coordinate.

        // If both coordinates are 0, skip this point and continue to the next iteration.
        if (a === 0 && b === 0) {
            continue;
        }

        // Add valid x and y coordinates to their respective arrays.
        x.push(a);
        y.push(b);
    }

    // Update 'n' to reflect the actual number of points stored (after filtering).
    n = x.length;

    // Initialize 'ans' to store the maximum squared distance found.
    var ans = 0;

    // Iterate through a large range of values for 'i' with a step of 20.
    // This 'i' likely represents a parameter for a line or a direction vector.
    for (var i = -1000000; i <= 1000000; i += 20) {
        // Call the 'solve' function with various combinations of large/small fixed values
        // and the current 'i' to explore different orientations/lines.

        // Test case 1: h = -1,000,000, w = i
        var z = solve(-1000000, i);
        // Update 'ans' if the current result 'z' is greater.
        if (ans < z) {
            ans = z;
        }

        // Test case 2: h = 1,000,000, w = i
        var z = solve(1000000, i);
        // Update 'ans' if the current result 'z' is greater.
        if (ans < z) {
            ans = z;
        }

        // Test case 3: h = i, w = 1,000,000
        var z = solve(i, 1000000);
        // Update 'ans' if the current result 'z' is greater.
        if (ans < z) {
            ans = z;
        }

        // Test case 4: h = i, w = -1,000,000
        var z = solve(i, -1000000);
        // Update 'ans' if the current result 'z' is greater.
        if (ans < z) {
            ans = z;
        }
    }

    // The problem asks for the actual distance, so return the square root of the maximum squared distance.
    return Math.sqrt(ans);
}


/**
 * solve function: Calculates a value based on input points and two parameters 'h' and 'w'.
 * It sums up coordinates of points that satisfy a certain condition related to 'h' and 'w'.
 * @param {number} h - A parameter, possibly representing a y-component of a vector or a coefficient.
 * @param {number} w - A parameter, possibly representing an x-component of a vector or a coefficient.
 * @returns {number} The squared magnitude (tx*tx + ty*ty) of the resulting (tx, ty) vector.
 */
function solve(h, w) {
    var tx = 0, // Accumulator for selected x-coordinates.
        ty = 0; // Accumulator for selected y-coordinates.

    // Iterate through all the valid points stored in 'x' and 'y' arrays.
    for (var i = 0; i < n; i++) {
        // Check if the weighted sum (dot product) of the point (x[i], y[i]) with the vector (w, h) is positive.
        // This effectively filters points that lie on one side of a line defined by 'w' and 'h'.
        if (x[i] * w + y[i] * h > 0) {
            // If the condition is met, add the point's x and y coordinates to the accumulators.
            tx += x[i];
            ty += y[i];
        }
    }

    // Return the squared Euclidean distance (magnitude squared) of the resulting vector (tx, ty).
    return tx * tx + ty * ty;
}