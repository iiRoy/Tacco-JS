/*
 * This file contains a solution to a programming problem.
 * It uses a custom input parsing utility and dynamic programming.
 */

// GET is an immediately invoked function expression (IIFE)
// that returns a function 'f' for parsing input.
var GET = (function() {
    /**
     * @param {string} s - The raw input string.
     * @returns {g} A new instance of the input parser.
     */
    function f(s) {
        return new g(s);
    }

    /**
     * Constructor for the input parser.
     * @param {string} s - The raw input string.
     */
    function g(s) {
        // Store lines of input, trimmed and split by newline.
        this._s = s.trim().split("\n");
        // Initialize line pointer.
        this._y = 0;
    }

    /**
     * Reads a single item from the current line.
     * Items are read from right to left (popped from a reversed array).
     * @param {boolean} f - If true, return as string; otherwise, parse as number.
     * @returns {string|number} The parsed item.
     */
    g.prototype.a = function(f) {
        var s = this._s, // Reference to the input lines array
            y = this._y, // Current line index
            r;           // Variable to hold the result

        // If the current line is still a string, process it.
        if (typeof s[y] === "string") {
            s[y] = s[y].split(" ").reverse(); // Split by space and reverse for right-to-left popping
        }

        r = s[y].pop(); // Get the last item (originally first due to reverse)

        // If the current line is exhausted, move to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return as string or number based on 'f' flag.
        return f ? r : +r;
    };

    /**
     * Reads an entire line of space-separated items.
     * @param {boolean} f - If true, return as array of strings; otherwise, parse items as numbers.
     * @returns {Array<string|number>} An array of parsed items.
     */
    g.prototype.l = function(f) {
        // Get the current line, increment pointer, split by space.
        var s = this._s[this._y++].split(" ");

        // Return as strings or numbers.
        return f ? s : s.map(a => +a);
    };

    /**
     * Reads 'n' lines, each split into space-separated items.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, return as 2D array of strings; otherwise, parse items as numbers.
     * @returns {Array<Array<string|number>>} A 2D array of parsed items.
     */
    g.prototype.m = function(n, f) {
        // Slice 'n' lines, update pointer, then map each line to an array of strings.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return as strings or numbers.
        return f ? r : r.map(a => a.map(a => +a));
    };

    /**
     * Reads 'n' lines as single items (not space-separated on the line).
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, return as array of strings; otherwise, parse items as numbers.
     * @returns {Array<string|number>} An array of parsed items.
     */
    g.prototype.r = function(n, f) {
        // Slice 'n' lines, update pointer.
        var r = this._s.slice(this._y, this._y += n);

        // Return as strings or numbers.
        return f ? r : r.map(a => +a);
    };

    // The IIFE returns the 'f' function, which is the main entry point for GET.
    return f;
})(); // End of GET IIFE definition

// Initialize the input parser 'o' by reading from standard input.
// This reads the entire file content, then the GET utility processes it.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


/*
 * Helper function to create multi-dimensional arrays initialized with a value.
 * This function dynamically constructs and evaluates a string expression
 * to create nested arrays.
 * @param {*} v - The initial value for the innermost array elements.
 * @param {...number} dimensions - The sizes of the dimensions.
 * @returns {Array} A multi-dimensional array.
 */
function xArray(v) {
    var a = arguments, // All arguments passed to xArray
        l = a.length,  // Number of arguments
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Innermost array creation

    // Loop backwards to build nested array creation expressions.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the dynamically constructed string to create the array.
    return eval(r);
}

// Define a modulo constant, commonly used in competitive programming for large results.
var mod = 1e9 + 7; // 1,000,000,007


// Execute the main logic and print the result to the console.
console.log(main());

/**
 * The main function containing the core logic of the problem solution.
 * This appears to be a dynamic programming problem related to subsequences or strings.
 * @returns {number} The final calculated answer.
 */
function main() {
    // Read input values for n and m using the custom parser 'o'.
    var n = o.a(); // First integer input
    var m = o.a(); // Second integer input

    // Read two lists/arrays of numbers (s and t).
    var s = o.l(); // List s
    var t = o.l(); // List t

    // Initialize a 2D DP array with dimensions (n+1) x (m+1), filled with 0.
    // This array will store intermediate results for the dynamic programming approach.
    var dp = xArray(0, n + 1, m + 1);

    // Initialize the answer variable.
    // In many DP problems, 1 is a common starting point for counts or sums.
    var ans = 1;

    // Outer loop iterates through elements of string/array 's'.
    for (var i = 0; i < n; i++) {
        // 'x' is a temporary variable used to accumulate sums within the inner loop.
        // It helps optimize calculations for the DP state.
        var x = 0;

        // Inner loop iterates through elements of string/array 't'.
        for (var j = 0; j < m; j++) {
            // Check if characters/elements at current positions match.
            if (s[i] === t[j]) {
                // If they match, update 'x' and 'ans'.
                // 'dp[i][j] + 1' represents the count of common subsequences ending at s[i-1] and t[j-1] plus the current match.
                x += dp[i][j] + 1;
                ans += dp[i][j] + 1;

                // Apply modulo operation to keep 'ans' within bounds.
                ans %= mod;

                // Update the DP state for a match.
                // This formula seems to be for counting common subsequences:
                // dp[i+1][j+1] = (subsequences ending at s[i] without t[j]) +
                //                (subsequences ending at t[j] without s[i]) +
                //                (subsequences ending at s[i-1] and t[j-1] + 1 for current match)
                dp[i + 1][j + 1] = dp[i + 1][j] + dp[i][j + 1] + 1;
            } else {
                // If characters/elements do not match, the DP state is based on 'x' and the previous column's value.
                // 'x' likely carries the sum of matching subsequences up to the current 'i' and previous 'j'.
                dp[i + 1][j + 1] = x + dp[i][j + 1];
            }

            // Always apply modulo to the DP state to prevent overflow.
            dp[i + 1][j + 1] %= mod;
        }
    }

    // Return the final calculated answer.
    return ans;
}