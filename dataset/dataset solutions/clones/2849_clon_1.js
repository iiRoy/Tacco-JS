var GET = ( /* This is an immediately invoked function expression (IIFE) */
    function () {

        /**
         * The main entry point for the GET module.
         * @param {string} s - The input string to parse.
         * @returns {g} An instance of the g class.
         */
        function f(s) {
            return new g(s);
        } // End of function f

        /**
         * Constructor for the g class.
         * This class handles parsing of input strings.
         * @param {string} s - The string data, usually read from an input file.
         */
        function g(s) {
            // Trim whitespace from each line and split into an array of lines.
            this._s = s.trim().split("\n");
            // Initialize the current line index.
            this._y = 0;
        } // End of constructor g

        /*
         * Prototype methods for the g class.
         * These methods provide various ways to read data from the input.
         */

        /**
         * Reads a single element from the current line, treating it as a stack (LIFO).
         * If the line has not been processed, it's reversed.
         * @param {boolean} f - If true, returns the string; otherwise, returns a number.
         * @returns {string|number} The next element.
         */
        g.prototype.a = function (f) {
            var s = this._s, // Reference to the array of lines
                y = this._y, // Current line index
                r; // Variable to hold the result

            // Check if the current line is a string (meaning it hasn't been split and reversed yet)
            if (typeof s[y] === "string") {
                s[y] = s[y].split(" ").reverse(); // Split by space and reverse to pop elements easily
            }

            r = s[y].pop(); // Get the last element (which is the first logically if reversed)

            // If the current line is empty after popping, advance to the next line.
            if (!s[y].length) {
                this._y++;
            }

            // Return as string if 'f' is true, otherwise convert to number.
            return f ? r : +r;
        }; // End of g.prototype.a

        /**
         * Reads an entire line and splits it into elements.
         * @param {boolean} f - If true, returns strings; otherwise, returns numbers.
         * @returns {string[]|number[]} An array of elements from the line.
         */
        g.prototype.l = function (f) {
            // Get the current line, increment the line index, and split by space.
            var s = this._s[this._y++].split(" ");

            // Return as strings if 'f' is true, otherwise map to numbers.
            return f ? s : s.map(a => +a);
        }; // End of g.prototype.l

        /**
         * Reads 'n' lines and treats each line as an array of elements (matrix).
         * @param {number} n - The number of lines to read.
         * @param {boolean} f - If true, returns string arrays; otherwise, returns number arrays.
         * @returns {string[][]|number[][]} A 2D array (matrix) of elements.
         */
        g.prototype.m = function (n, f) {
            // Slice 'n' lines, increment _y, and map each line to an array of elements.
            var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

            // Return as string matrix if 'f' is true, otherwise map inner arrays to numbers.
            return f ? r : r.map(a => a.map(a => +a));
        }; // End of g.prototype.m

        /**
         * Reads 'n' lines directly without splitting them into elements.
         * @param {number} n - The number of lines to read.
         * @param {boolean} f - If true, returns string lines; otherwise, returns numbers (assumes each line is a single number).
         * @returns {string[]|number[]} An array of lines.
         */
        g.prototype.r = function (n, f) {
            // Slice 'n' lines directly, increment _y.
            var r = this._s.slice(this._y, this._y += n);

            // Return as strings if 'f' is true, otherwise map to numbers.
            return f ? r : r.map(a => +a);
        }; // End of g.prototype.r

        // The IIFE returns the 'f' function, which is the public interface to GET.
        return f;

    })(); // End of GET IIFE

// Initialize the input object 'o' by reading from standard input.
// This uses Node.js 'fs' module to read the entire file synchronously.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array with initial values.
 * This function uses `eval` and is generally not recommended for security reasons
 * in untrusted environments, but is common in competitive programming.
 * @param {*} v - The initial value for all elements in the innermost array.
 * @param {...number} dimensions - The sizes of each dimension, from outermost to innermost.
 * @returns {Array} A multi-dimensional array.
 */
function xArray(v) {
    var a = arguments, // All arguments passed to the function.
        l = a.length, // Total number of arguments.
        // Start building the string for the innermost array.
        // 'l-1' because 'v' is the first argument, dimensions start from a[1].
        r = "Array(a[" + (--l) + "]).fill(0).map(x=>{return " + v + ";})";

    // Loop backwards through the dimensions to build the nested array creation string.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create the array.
    return eval(r);
} // End of xArray function

// Call the main function and print its result to the console.
console.log(main());

/**
 * The main function to solve the problem.
 * It reads input, performs calculations, and returns the final answer.
 */
function main() {

    // Read the initial integer 'n' from input.
    var n = o.a();

    // Read two arrays 'a' and 'b' from input.
    var a = o.l();
    var b = o.l();

    // Initialize empty arrays for storing filtered values.
    var x = [],
        y = [];

    // First filtering loop: collect elements where a[i] < b[i].
    for (var i = 0; i < 3; i++) {
        if (a[i] < b[i]) {
            x.push(a[i]); // Add a[i] to x
            y.push(b[i]); // Add b[i] to y
        }
    }

    // Call the 'solve' function with initial 'n' and the first set of filtered arrays.
    var ans = solve(n, x, y);

    // Reset x and y for the second filtering.
    x = [],
        y = [];

    // Second filtering loop: collect elements where b[i] < a[i].
    for (var i = 0; i < 3; i++) {
        if (b[i] < a[i]) {
            x.push(b[i]); // Add b[i] to x
            y.push(a[i]); // Add a[i] to y
        }
    }

    // Call 'solve' again with the result from the first call ('ans')
    // and the second set of filtered arrays. Return this final result.
    return solve(ans, x, y);
} // End of main function

/**
 * Solves a sub-problem, likely a variation of a knapsack or resource allocation problem.
 * It aims to maximize a value 'n' by applying transformations defined by 'a' and 'b'.
 * @param {number} n - The initial value.
 * @param {number[]} a - An array of costs or deductions.
 * @param {number[]} b - An array of gains or additions.
 * @returns {number} The maximized value.
 */
function solve(n, a, b) {

    var l = a.length; // Get the length of the input arrays.

    // Base case: If no transformations are available, return 'n' as is.
    if (l === 0)
        return n;

    // Special case: If only one transformation is available.
    if (l === 1) {
        var x = n / a[0] | 0; // Calculate how many times a[0] can be "bought" (integer division).
        n -= x * a[0]; // Deduct the total cost.
        n += x * b[0]; // Add the total gain.
        return n; // Return the updated 'n'.
    }

    // Dynamic Programming approach for multiple transformations.
    // dp[j] will store the maximum 'n' achievable when the "cost" is 'j'.
    var dp = Array(n + 1);
    dp[0] = n; // Base case: if cost is 0, 'n' remains 'n'.

    // Iterate through each transformation (a[i], b[i]).
    for (var i = 0; i < l; i++) {
        var x = a[i], // Current cost
            y = b[i]; // Current gain

        // Iterate through possible "costs" from 'x' up to 'n'.
        // This simulates applying the current transformation.
        for (var j = x; j <= n; j++) {
            // If dp[j-x] is undefined, it means this state is unreachable with the current transformations.
            if (dp[j - x] === undefined)
                continue;

            // Calculate the new value 'z' if we apply the transformation (x, y) to state dp[j-x].
            var z = dp[j - x] + y - x;

            // If dp[j] is undefined or the new value 'z' is greater, update dp[j].
            if (dp[j] === undefined || dp[j] < z)
                dp[j] = z;
        }
    }

    // Find the maximum value in the dp array, considering a window around 'n'.
    // The window (n-5000 to n) is an optimization, assuming optimal solutions
    // usually don't involve extremely high "costs" that lead to 'n' being much smaller.
    var r = n; // Initialize result with the initial 'n'.

    // Iterate from Math.max(0, n-5000) to 'n' to find the maximum dp[i].
    for (var i = Math.max(0, n - 5000); i <= n; i++) {
        // If dp[i] is greater than the current maximum 'r', update 'r'.
        if (r < dp[i])
            r = dp[i];
    }

    return r; // Return the maximum value found.
} // End of solve function