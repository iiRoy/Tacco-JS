/*
 * This file contains a Type I clone of a JavaScript program.
 * Type I clones are exact copies of code fragments,
 * differing only in whitespace and comments.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged from the original source.
 * The purpose is to demonstrate visual difference while maintaining
 * logical and structural identity.
 */

// Define the GET utility function using an Immediately Invoked Function Expression (IIFE).
var GET = (function () {

    /*
     * Inner function 'f': Acts as the public interface for creating a new
     * instance of the 'g' class, which is responsible for parsing input.
     * @param {string} s - The raw input string.
     * @returns {g} A new instance of the 'g' class.
     */
    function f(s) {
        return new g(s);
    } // End of function f

    /*
     * Inner class 'g': Handles the parsing and retrieval of data
     * from the input string.
     * @param {string} s - The raw input string to be processed.
     */
    function g(s) {
        // Store the input string, trimmed and split into lines.
        this._s = s.trim().split("\n");
        // Initialize the current line index to 0.
        this._y = 0;
    } // End of constructor g

    /*
     * Prototype method 'a' for class 'g':
     * Retrieves a single token (number or string) from the current line.
     * If the line is exhausted, it moves to the next line.
     * @param {boolean} f - If true, return the token as a string; otherwise, as a number.
     * @returns {string|number} The retrieved token.
     */
    g.prototype.a = function (f) {
        var s = this._s, // Reference to the array of input lines.
            y = this._y, // Current line index.
            r;           // Variable to store the result.

        // If the current line hasn't been processed into tokens yet, do so.
        // It reverses the order so `pop()` can act like `shift()`.
        if (typeof s[y] === "string") {
            s[y] = s[y].split(" ").reverse();
        }

        // Pop the last element (which is the first token from the original order).
        r = s[y].pop();

        // If the current line is now empty, advance to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the token, converting to number if 'f' is false.
        return f ? r : +r;
    }; // End of g.prototype.a

    /*
     * Prototype method 'l' for class 'g':
     * Reads an entire line and splits it into tokens.
     * @param {boolean} f - If true, return tokens as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    g.prototype.l = function (f) {
        var s = this._s[this._y++].split(" "); // Get current line, split, then advance line index.
        return f ? s : s.map(a => +a);        // Map to numbers if 'f' is false.
    }; // End of g.prototype.l

    /*
     * Prototype method 'm' for class 'g':
     * Reads 'n' lines and treats each line as a row of space-separated tokens,
     * forming a 2D array (matrix).
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, return tokens as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array of tokens.
     */
    g.prototype.m = function (n, f) {
        // Slice 'n' lines, advance the line index, and split each line into tokens.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));
        // Map inner arrays to numbers if 'f' is false.
        return f ? r : r.map(a => a.map(a => +a));
    }; // End of g.prototype.m

    /*
     * Prototype method 'r' for class 'g':
     * Reads 'n' raw lines without splitting them by spaces.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, return lines as strings; otherwise, attempt conversion to number.
     * @returns {Array<string|number>} An array of raw lines.
     */
    g.prototype.r = function (n, f) {
        // Slice 'n' lines and advance the line index.
        var r = this._s.slice(this._y, this._y += n);
        // Map to numbers if 'f' is false.
        return f ? r : r.map(a => +a);
    }; // End of g.prototype.r

    return f; // Return the public interface function.

})(); // End of GET IIFE

// Initialize the input parser 'o' by reading from standard input.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * Function 'upper_bound':
 * Performs a binary search to find the first element in a sorted array 'd'
 * that is strictly greater than 'e'.
 * @param {Array<number>} d - The sorted array to search within.
 * @param {number} a - The starting index of the search range.
 * @param {number} b - The ending index (exclusive) of the search range.
 * @param {number} e - The value to search for.
 * @returns {number} The index of the first element strictly greater than 'e',
 *                   or 'b' if all elements are less than or equal to 'e'.
 */
function upper_bound(d, a, b, e) {
    for (var c; 1 < b - a;) { /* Loop until the search range is small (1 element or less). */
        c = 0 | (a + b) / 2;    // Calculate the middle index (integer division).
        // If the middle element is less than or equal to 'e', search in the upper half.
        // Otherwise, search in the lower half.
        d[c] <= e ? a = c : b = c;
    }
    // After the loop, 'a' and 'b' will be adjacent.
    // Check which one is the correct upper bound.
    return d[a] <= e ? b : a;
} // End of upper_bound function

// Execute the main logic and print its result to the console.
console.log(main());

/*
 * Function 'main':
 * This is the primary function containing the core logic of the program.
 * It reads input, processes it, and returns a result based on the problem's requirements.
 * The problem appears to involve graph properties, specifically degree parity.
 * @returns {string} "Yes" or "No" based on the conditions.
 */
function main() {
    // Read two integers: n (number of nodes) and m (number of edges).
    var n = o.a();
    var m = o.a();

    // Initialize an array 'a' of size n+1 with zeros to store node degrees.
    var a = Array(n + 1).fill(0);

    // Loop 'm' times to read 'm' edges.
    for (var i = 0; i < m; i++) {
        // Read an edge, which consists of two connected nodes.
        var t = o.l();
        // Increment the degree count for both nodes connected by the edge.
        a[t[0]]++;
        a[t[1]]++;
    }

    // Initialize a variable to accumulate a specific sum.
    var ans = 0;

    // Iterate through nodes from 1 to n to check their degrees.
    for (i = 1; i <= n; i++) {
        // If a node's degree is odd, it's impossible for the condition to be met.
        // In an undirected graph, the sum of degrees is always even,
        // and there must be an even number of odd-degree vertices.
        // If any single degree is odd, it implies a condition is not met.
        if (a[i] & 1) { // Bitwise AND with 1 checks for oddness.
            return "No";
        }
        // Accumulate (degree - 2) for each node.
        // This accumulation might relate to Euler paths/circuits or specific graph properties.
        ans += a[i] - 2;
    }

    // Final check: If the accumulated 'ans' is greater than or equal to 4, return "Yes"; otherwise, "No".
    // This condition (ans >= 4) is specific to the problem this code solves.
    return ans >= 4 ? "Yes" : "No";
} // End of main function